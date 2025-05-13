import type { BlogPost } from "../types/index";

export const mockPosts: BlogPost[] = [
  {
    id: 1,
    author: "אנונימית",
    content: "סוף סוף עזבתי בחודש שעבר. הדבר הכי קשה היה להאמין שמגיע לי שקט.",
    likes: 14,
    date: "2024-04-01",
    category: "anonymous",
  },
  {
    id: 2,
    author: "חברה תומכת",
    content: "לתמוך בה היה מתיש, אבל שווה כל רגע. את לא לבד.",
    likes: 5,
    date: "2024-05-01",
    category: "supporting_friend",
  },
  {
    id: 3,
    author: "אנונימית",
    content: "הוא אמר סליחה כל פעם... עד שהבנתי שסליחה לא מספיקה.",
    likes: 23,
    date: "2024-05-10",
    category: "anonymous",
  },
  {
    id: 4,
    author: "אנונימית",
    content:
      "כשהוא הרים את הקול בפעם הראשונה, רעדתי. כשהוא הרים את היד בפעם האחרונה, ידעתי שזה הזמן ללכת.",
    likes: 31,
    date: "2024-05-15",
    category: "anonymous",
  },
  {
    id: 5,
    author: "חברה קרובה",
    content:
      "צפיתי בחברה שלי הופכת למישהי אחרת עם השנים. אחרי שהיא עזבה, ראיתי איך האור חוזר לעיניים שלה.",
    likes: 18,
    date: "2024-05-08",
    category: "close_friend",
  },
  {
    id: 6,
    author: "אנונימית",
    content:
      "למדתי שאהבה אמיתית לא כואבת. היום אני אוהבת את עצמי מספיק כדי לדעת את זה.",
    likes: 27,
    date: "2024-05-12",
    category: "anonymous",
  },
];
