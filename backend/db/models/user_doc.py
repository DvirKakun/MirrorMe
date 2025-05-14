from mongoengine import Document, StringField, DateTimeField, BooleanField, EmailField, ListField
from datetime import datetime, timezone

class User(Document):
    """Registered user schema for authentication and tracking."""
    name = StringField(required=True)
    email = EmailField(required=True, unique=True)
    hashed_password = StringField(required=True)
    
    # Optional fields
    is_verified = BooleanField(default=False)
    roles = ListField(StringField(), default=["user"])  # e.g., ["user"], ["admin"]
    created_at = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    updated_at = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))

    meta = {
        'collection': 'users',
        'indexes': [
            'email',
            'roles'
        ]
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.now(tz=timezone.utc)
        return super(User, self).save(*args, **kwargs)

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "is_verified": self.is_verified,
            "roles": self.roles,
            "created_at": self.created_at.isoformat()
        }
