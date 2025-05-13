from datetime import datetime, timezone
from mongoengine import Document, EmbeddedDocument, StringField, DateTimeField, ListField, DictField, ReferenceField, EmbeddedDocumentListField

class Message(EmbeddedDocument):
    """Individual message in a conversation."""
    
    content = StringField(required=True)
    role = StringField(choices=["user", "assistant", "system"], required=True)
    timestamp = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    
    # For tracking specific intents or states
    metadata = DictField(default={})
    
    def to_dict(self):
        """Convert to a format suitable for LLM context."""
        return {
            "content": self.content,
            "role": self.role
        }

class Conversation(Document):
    """Document representing a user's conversation with the bot."""
    
    # User identification
    user = ReferenceField('User')  # For registered users
    session_id = StringField()     # For anonymous users
    
    # Entry point tracking
    entry_source = StringField(choices=["ad", "direct"], default="direct")
    entry_statement = StringField()  # The statement that led them here (for ad entries)
    
    # Conversation
    messages = EmbeddedDocumentListField(Message)
    
    # Story recommendations
    recommended_story_ids = ListField(StringField())
    
    # Metadata
    created_at = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    updated_at = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    
    meta = {
        'indexes': [
            'user',
            'session_id',
            'created_at'
        ]
    }
    
    def add_message(self, content, role):
        """Add a new message to the conversation."""
        message = Message(content=content, role=role)
        self.messages.append(message)
        self.updated_at = datetime.now(tz=timezone.utc)
        return message
    
    def get_langchain_messages(self):
        """Return messages in a format suitable for Langchain."""
        return [msg.to_dict() for msg in self.messages]
    
    def save(self, *args, **kwargs):
        """Override save to update the updated_at timestamp."""
        self.updated_at = datetime.now(tz=timezone.utc)
        return super(Conversation, self).save(*args, **kwargs)