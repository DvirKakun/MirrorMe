from pydantic import BaseModel, Field
from typing import Dict, List, Any
from langchain.tools import Tool

from pydantic import BaseModel, Field
from typing import Dict, List, Any
from langchain.tools import Tool

from typing import Dict, Any
from langchain.tools import Tool

class StoryFilterTool:
    """Tool for fetching stories based on conversation context."""
    
    name = "fetch_relatable_story"
    description = """כלי לאחזור סיפורים רלוונטיים שניתן להזדהות איתם מהמאגר עבור המשתמשת.

    תנאים הכרחיים לשימוש בכלי:
    1. המשתמשת שלחה לפחות 4 הודעות בשיחה הנוכחית
    2. הצעת למשתמשת באופן מפורש לשמוע סיפור של מישהי אחרת (למשל: "רוצה לשמוע איך זה היה אצל מישהי אחרת?" או "אני יכולה לשתף אותך בסיפור שאולי תתחברי אליו?")
    3. המשתמשת הסכימה במפורש לקבל את הסיפור

    לאחר הקריאה לכלי, המערכת תשלח לך את כל האופציות הזמינות ואתה תבחר את הסיפור המתאים ביותר למצב של המשתמשת בהתבסס על השיחה.

    לאחר שיתוף הסיפור, תמיד שאל אם הסיפור מהדהד אצל המשתמשת או אם היא מזדהה עם חלקים ממנו.
    """
    
    def run(self, *args, **kwargs) -> Dict[str, Any]:
        """
        Execute the story fetching process (placeholder).
        
        Note: This method ignores any parameters passed to it and always
        returns the same sample stories.
        """
        # Mock implementation that returns a simple structure with sample stories
        return {
            "Find the best maching stories to the user ": "Story fetching will be implemented later. Here are some sample stories:",
            "stories": [
                {
                    "id": "story1",
                    "title": "Finding My Voice",
                    "content": "I was always asked to check in throughout the day. At first, I thought it was sweet that he wanted to know I was safe. But over time, I noticed I'd feel anxious if I couldn't respond right away. I started planning my day around when I could text back, and eventually realized I was missing out on being present in my own life.",
                    "reflection_question": "Have you ever adjusted your schedule or activities to avoid someone's disappointment or anger?"
                },
                {
                    "id": "story2",
                    "title": "The Invisible Boundary",
                    "content": "Whenever we had disagreements about what was said, somehow my memory was always wrong. I started recording conversations just to make sure I wasn't losing my mind. When I played back a conversation that proved my point, he got angry and said I was manipulative for recording him without consent.",
                    "reflection_question": "Have you ever doubted your own memories or perceptions after a conversation?"
                },
                {
                    "id": "story3",
                    "title": "Gradual Distance",
                    "content": "I didn't notice at first, but my circle got smaller every month. There was always a reason: 'Your friend is flirting with me.' 'Your mom is too critical of us.' Eventually, it was just us. When I finally reconnected with my best friend, she said she'd been trying to reach me for months but I never responded to her messages.",
                    "reflection_question": "Has your social circle changed significantly since being in your relationship?"
                }
            ]
        }
    
    def get_langchain_tool(self):
        """Return this tool in a format compatible with LangChain."""
        return Tool(
            name=self.name,
            description=self.description,
            func=self.run
        )