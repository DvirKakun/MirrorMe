from typing import List
from langchain.tools import BaseTool
from .auth_tools import LoginTool, RegisterTool
from .story_tools import StoryFilterTool

def get_available_tools() -> List[BaseTool]:
    """Return list of all available tools in LangChain format."""
    return [
        LoginTool().get_langchain_tool(),
        RegisterTool().get_langchain_tool(),
        StoryFilterTool().get_langchain_tool()
    ]