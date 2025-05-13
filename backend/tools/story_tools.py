from pydantic import BaseModel, Field
from typing import Dict, List, Any
from langchain.tools import Tool

class StoryFilterInput(BaseModel):
    """Input for story filter tool."""
    filters: Dict[str, str] = Field(
        ..., 
        description="Filters to apply when searching for stories."
    )
    limit: int = Field(40, description="Maximum number of stories to return")

class StoryFilterTool:
    """Tool for fetching stories based on filters."""
    
    name = "fetch_filtered_stories"
    description = """Fetches stories from the database that match the given filters. 
    Use this tool when you have enough information from the conversation to identify 
    attributes that might match the user's situation.
    
    Common filters to consider:
    - relationship_type: type of relationship (romantic, familial, etc.)
    - emotional_violence: presence of emotional abuse
    - physical_violence: presence of physical abuse
    - social_isolation: attempts to isolate from friends/family
    - daily_activity_control: controlling behavior over daily activities
    - jealousy: excessive jealousy or possessiveness
    - gaslighting: manipulation to question reality
    - fear_based_relationship: relationship based on fear
    - humiliation: regular feelings of humiliation
    """
    
    def run(self, filters: Dict[str, str], limit: int = 5) -> Dict[str, Any]:
        """Execute the story fetching process (placeholder)."""
        # This will be implemented later
        filter_str = ", ".join([f"{k}: {v}" for k, v in filters.items()])
        return {
            "success": True,
            "message": f"Story fetching will be implemented later. Requested stories with filters: {filter_str}, limit: {limit}",
            "stories": []  # This will contain stories in the actual implementation
        }
    
    def get_langchain_tool(self):
        """Return this tool in a format compatible with LangChain."""
        return Tool(
            name=self.name,
            description=self.description,
            func=self.run
        )