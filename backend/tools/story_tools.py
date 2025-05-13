from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from langchain.tools import StructuredTool
import pandas as pd
import os

class StoryFilter(BaseModel):
    """Model for story filtering parameters."""
    # Relationship status filters
    relationship_type: Optional[str] = Field(None, description="Type of relationship involved (e.g., 'dating', 'married', 'relationship')")
    relationship_status: Optional[str] = Field(None, description="Current status of the relationship (e.g., 'together', 'process of separation', 'separated')")
    was_breakup: Optional[str] = Field(None, description="Whether a breakup has occurred (e.g., 'yes', 'no')")
    living_with: Optional[str] = Field(None, description="Whether they live with the other person (e.g., 'yes', 'no')")
    
    # Abuse type filters
    emotional_violence: Optional[str] = Field(None, description="Presence of emotional abuse (e.g., 'yes', 'no', 'plausibly')")
    physical_violence: Optional[str] = Field(None, description="Presence of physical abuse (e.g., 'yes', 'no', 'plausibly')")
    sexual_violence: Optional[str] = Field(None, description="Presence of sexual abuse (e.g., 'yes', 'no', 'plausibly')")
    economic_violence: Optional[str] = Field(None, description="Presence of economic abuse (e.g., 'yes', 'no', 'plausibly')")
    fear_based_relationship: Optional[str] = Field(None, description="Whether relationship is based on fear (e.g., 'yes', 'no', 'plausibly')")
    
    # Behavior pattern filters
    humiliation: Optional[str] = Field(None, description="Experiences of humiliation (e.g., 'yes', 'no', 'plausibly')")
    gaslighting: Optional[str] = Field(None, description="Experiences of gaslighting (e.g., 'yes', 'no', 'plausibly')")
    outbursts: Optional[str] = Field(None, description="Presence of anger outbursts (e.g., 'yes', 'no', 'plausibly')")
    obsessiveness: Optional[str] = Field(None, description="Obsessive behavior from partner (e.g., 'yes', 'no', 'plausibly')")
    jealousy: Optional[str] = Field(None, description="Jealousy from partner (e.g., 'yes', 'no', 'plausibly')")
    narcissistic_traits: Optional[str] = Field(None, description="Partner exhibiting narcissistic traits (e.g., 'yes', 'no', 'plausibly')")
    aggressive_behavior: Optional[str] = Field(None, description="Partner exhibiting aggressive behavior (e.g., 'yes', 'no', 'plausibly')")
    
    # Life situation filters
    children: Optional[str] = Field(None, description="Presence of children in the relationship (e.g., 'yes', 'no', 'irrelevant')")
    
    # Action filters
    attempts_to_end_relationship: Optional[str] = Field(None, description="Attempts to end relationship (e.g., 'yes', 'no', 'plausibly')")
    refusal_to_end_relationship: Optional[str] = Field(None, description="Partner refusing to end relationship (e.g., 'yes', 'no', 'plausibly')")
    public_private_discrepancy: Optional[str] = Field(None, description="Different behavior in public vs private (e.g., 'yes', 'no', 'plausibly')")

class StoryFilterTool:
    """Tool for fetching stories based on conversation context."""
    
    name = "fetch_relatable_story"
    description = """כלי לאחזור סיפורים רלוונטיים שניתן להזדהות איתם מהמאגר עבור המשתמשת.
    
    שימוש נכון בכלי:
    1. אסוף מידע באופן טבעי דרך שיחה אמפתית וזורמת - אל תשאל שאלות ישירות כדי למלא את הפילטרים.
    2. כאשר המשתמשת כבר חלקה באופן טבעי מידע מספיק (3-5 פרטים שיכולים לשמש כפילטרים), הצע בעדינות לשתף סיפור דומה.
    3. במידה והמשתמש מסכימה - קרא במיידית לכלי ללא ווידוא המידע או הודעה נוספת
        
    חשוב מאוד: 
    - לעולם אל תשאל שאלות ישירות במטרה לאסוף מידע לפילטרים
    - הקשב למה שהמשתמשת מספרת באופן טבעי והשתמש במידע זה
    - אל תנהל "תחקיר" או "ראיון" כדי לאסוף מידע לפילטרים
    - תן למידע לצוף באופן טבעי בשיחה והתמקד באמפתיה וקשב
    - אין לוודא מידע בנוגע לפילטרים, תבין מהקשר השיחה בביטחון וקרא לטול עם מה שהבנת
    - אל תתן למשתמשת הרגשה שאתה אוסף פרטים כדי למצוא סיפור
    לאחר שיתוף הסיפור, שאל אם הסיפור מהדהד אצל המשתמשת או אם היא מזדהה עם חלקים ממנו.
    """
    
    def __init__(self, story_database_path=None):
        """Initialize with path to story database."""
        # Use absolute path based on the current file's location
        if story_database_path is None:
            # Get the directory of the current script
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Go up one directory to backend and then to db/stories.csv
            self.story_database_path = os.path.join(os.path.dirname(current_dir), "db", "stories.csv")
        else:
            self.story_database_path = story_database_path
        self.stories_df = None
    
    def fetch_stories_from_csv(self):
        """Load stories from the CSV file."""
        try:
            if not os.path.exists(self.story_database_path):
                raise FileNotFoundError(f"Story database file not found: {self.story_database_path}")
            
            # Changed from read_excel to read_csv and removed sheet_name parameter
            self.stories_df = pd.read_csv(self.story_database_path)
            
            # Keep the filtering logic the same
            self.stories_df = self.stories_df[self.stories_df['abusive_relationship'].isin(['yes', 'plausibly', 'cannot be inferred'])]
            return self.stories_df
            
        except Exception as e:
            raise Exception(f"Error loading stories from CSV database: {str(e)}")
    
    def filter_stories(self, filters: Dict[str, str]) -> pd.DataFrame:
        """Filter stories based on provided filters."""
        if self.stories_df is None:
            self.fetch_stories_from_csv()
        
        filtered_df = self.stories_df.copy()
        applied_filters = {}
        
        for column, value in filters.items():
            if value is not None and column in filtered_df.columns:
                if value in ["yes", "no", "plausibly"]:
                    if value == "yes":
                        mask = filtered_df[column].isin(["yes", "plausibly"])
                    elif value == "no":
                        mask = filtered_df[column] == "no"
                    else:  # value == "plausibly"
                        mask = filtered_df[column].isin(["yes", "plausibly"])
                else:
                    mask = filtered_df[column] == value
                
                filtered_df = filtered_df[mask]
                applied_filters[column] = value
                
                if len(filtered_df) < 5 and len(applied_filters) > 2:
                    del applied_filters[column]
                    filtered_df = self.stories_df.copy()
                    for col, val in applied_filters.items():
                        if val == "yes":
                            filtered_df = filtered_df[filtered_df[col].isin(["yes", "plausibly"])]
                        elif val == "no":
                            filtered_df = filtered_df[filtered_df[col] == "no"]
                        elif val == "plausibly":
                            filtered_df = filtered_df[filtered_df[col].isin(["yes", "plausibly"])]
                        else:
                            filtered_df = filtered_df[filtered_df[col] == val]
                    break
        
        return filtered_df, applied_filters
    
    # The key change is here - making run accept keyword arguments
    def run(self, **kwargs) -> Dict[str, Any]:
        """
        Execute the story fetching process based on provided filters.
        
        Args:
            **kwargs: Keyword arguments that will be converted to a StoryFilter
            
        Returns:
            Dictionary containing matching stories
        """
        try:
            # Convert keyword arguments to a StoryFilter
            filters = StoryFilter(**kwargs)
            
            # Convert to dict and remove None values
            filters_dict = {k: v for k, v in filters.dict().items() if v is not None}
            
            # Make sure we have at least some filters
            if not filters_dict:
                return {
                    "error": "No filters provided. Need at least 3 filters to find relevant stories.",
                    "matching_stories": [],
                    "total_matches": 0
                }
                
            # Make sure we have enough filters (at least 3)
            if len(filters_dict) < 3:
                return {
                    "error": f"Not enough filters provided. Provided: {len(filters_dict)}, needed: at least 3.",
                    "matching_stories": [],
                    "total_matches": 0
                }
                
            # Fetch stories if not already loaded
            if self.stories_df is None:
                self.fetch_stories_from_csv()
                
            # Filter stories
            filtered_df, applied_filters = self.filter_stories(filters_dict)
            
            # If no stories match, relax constraints
            if len(filtered_df) == 0:
                # Try with just the most critical filters (first 2)
                critical_filters = dict(list(filters_dict.items())[:2])
                filtered_df, applied_filters = self.filter_stories(critical_filters)
            
            # Get the matching stories
            if len(filtered_df) > 0:
                # Format results
                matching_stories = []
                for idx, story in filtered_df.iterrows():
                    # Create a story dict with essential information
                    story_dict = {
                        "content": story["body"],
                        "matching_factors": list(applied_filters.keys())
                    }
                    matching_stories.append(story_dict)
                
                # Limit to top 5 stories
                matching_stories = matching_stories[:5]
                
                return {
                    "matching_stories": matching_stories,
                    "filters_applied": applied_filters,
                    "total_matches": len(filtered_df)
                }
            else:
                return {
                    "matching_stories": [],
                    "filters_applied": applied_filters,
                    "total_matches": 0,
                    "error": "No stories match the provided filters."
                }
                
        except Exception as e:
            return {
                "error": f"Error processing filter input: {str(e)}",
                "matching_stories": [],
                "total_matches": 0
            }
    
    def get_langchain_tool(self):
        """Return this tool in a format compatible with LangChain."""
        return StructuredTool.from_function(
            func=self.run,
            name=self.name,
            description=self.description,
            args_schema=StoryFilter
        )