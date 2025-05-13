from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from langchain.agents import AgentExecutor, create_openai_tools_agent
from uuid import uuid4

from backend.config.settings import get_settings
from backend.prompts.system_prompts import MirrorMePrompts
from backend.db.models.conversation import Conversation

from backend.tools.tool_registry import get_available_tools


class ChatbotService:
    """Service for handling MirrorMe chatbot interactions using LangChain."""

    def __init__(self):
        """Initialize the chatbot service."""
        self.settings = get_settings()
        self.prompts = MirrorMePrompts()
        self.llm = self._get_llm()
        # Get tools from registry
        self.tools = get_available_tools()

    def _get_llm(self):
        """Get the appropriate LLM based on settings."""
        if self.settings.DEFAULT_MODEL == "openai":
            return ChatOpenAI(
                model=self.settings.OPENAI_MODEL_NAME,
                openai_api_key=self.settings.OPENAI_API_KEY,
                temperature=0.7,
            )
        else:  # Gemini
            return ChatGoogleGenerativeAI(
                model=self.settings.GEMINI_MODEL_NAME,
                google_api_key=self.settings.GEMINI_API_KEY,
                temperature=0.7,
            )

    def create_or_continue_conversation(
        self, session_id=None, user=None, entry_source="direct", entry_statement=None
    ):
        """Create a new conversation or continue existing one."""
        if not session_id:
            session_id = str(uuid4())

        # Try to find existing conversation
        if session_id:
            existing = Conversation.objects(session_id=session_id).first()
            if existing:
                return existing, False

        # Create new conversation
        conversation = Conversation(
            session_id=session_id,
            user=user,
            entry_source=entry_source,
            entry_statement=entry_statement,
        )

        # Add system prompt as the first message
        conversation.add_message(self.prompts.BASE_SYSTEM_PROMPT, "system")

        # If from an ad, add specific entry prompt
        if entry_source == "ad" and entry_statement:
            entry_prompt = self.prompts.get_entry_prompt(entry_source, entry_statement)
            conversation.add_message(entry_prompt, "assistant")
        else:
            # For direct website visitors
            entry_prompt = self.prompts.get_entry_prompt("direct")
            conversation.add_message(entry_prompt, "assistant")

        conversation.save()
        return conversation, True

    def process_message(
        self,
        session_id,
        user_message,
        user=None,
        entry_source=None,
        entry_statement=None,
    ):
        """Process a user message and generate a response."""
        # Get or create conversation
        conversation, is_new = self.create_or_continue_conversation(
            session_id, user, entry_source, entry_statement
        )

        # Skip message processing if this is a brand new conversation (already has welcome message)
        if is_new and entry_source:
            # Return only the initial welcome message
            return {
                "session_id": conversation.session_id,
                "response": conversation.messages[-1].content,
                "is_new": is_new,
            }

        # Add user message to conversation
        conversation.add_message(user_message, "user")

        # Generate response using LangChain
        response = self._generate_response(conversation, user_message)

        # Save AI response to conversation
        conversation.add_message(response, "assistant")
        conversation.save()

        return {
            "session_id": conversation.session_id,
            "response": response,
            "is_new": is_new,
        }

    def _generate_response(self, conversation, user_message):
        """Generate a response using LangChain."""
        # Get conversation history for context
        messages = conversation.get_langchain_messages()

        # Convert to LangChain message format
        langchain_messages = []
        for msg in messages:
            if msg["role"] == "system":
                langchain_messages.append(SystemMessage(content=msg["content"]))
            elif msg["role"] == "user":
                langchain_messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                langchain_messages.append(AIMessage(content=msg["content"]))

        # Create the prompt template with system message and history
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                    self.prompts.BASE_SYSTEM_PROMPT
                ),
                MessagesPlaceholder(variable_name="chat_history"),
                HumanMessagePromptTemplate.from_template("{input}"),
            ]
        )

        # Create an agent with tools if we've accumulated enough context
        if len(langchain_messages) >= 2:  # System + intro + at least 2 user/assistant exchanges
            return self._generate_agent_response(langchain_messages, user_message)

        # For early conversations, use a simpler approach without tools
        chain = LLMChain(llm=self.llm, prompt=prompt)

        result = chain.invoke(
            {
                "chat_history": langchain_messages[
                    1:
                ],  # Skip system message as it's in the prompt
                "input": user_message,
            }
        )

        return result["text"]

    def _generate_agent_response(self, langchain_messages, user_message):
        """Generate a response using an agent with tools."""
        # Create the prompt template for the agent
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                    self.prompts.BASE_SYSTEM_PROMPT
                ),
                MessagesPlaceholder(variable_name="chat_history"),
                HumanMessagePromptTemplate.from_template("{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )

        # Create the agent
        agent = create_openai_tools_agent(llm=self.llm, tools=self.tools, prompt=prompt)

        # Create the agent executor
        agent_executor = AgentExecutor(
            agent=agent, tools=self.tools, verbose=True, handle_parsing_errors=True
        )

        # Run the agent
        result = agent_executor.invoke(
            {
                "chat_history": langchain_messages[
                    1:
                ],  # Skip system message as it's in the prompt
                "input": user_message,
            }
        )

        return result["output"]

    def get_recent_conversations(self, user=None, limit=10):
        """Get recent conversations for a user."""
        query = {}
        if user:
            query["user"] = user

        conversations = (
            Conversation.objects(**query).order_by("-updated_at").limit(limit)
        )
        return conversations
