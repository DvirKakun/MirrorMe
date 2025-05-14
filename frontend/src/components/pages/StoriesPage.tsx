import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ArrowUpDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { Story } from "../../types"; // Adjust the import path as necessary

// Interface for story data

const StoriesPage = () => {
  // State for stories data
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLatest, setShowLatest] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { token } = useAuth();

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddForm && !token) {
      setShowAddForm(false);
    }
  }, [showAddForm, token]);

  // Initial dummy data
  useEffect(() => {
    const dummyStories: Story[] = [
      {
        id: "1",
        title: "המסע שלי להחלמה",
        body: "לפני שנתיים חוויתי משבר אישי שהשאיר אותי מרוסקת. בתחילת הדרך לא ידעתי אם אצליח להתרומם שוב. הימים הפכו לשבועות, והשבועות לחודשים. התחלתי לחפש עזרה - טיפול, קבוצות תמיכה, ספרים, כל דבר שיכול היה לעזור.\n\nלאט לאט, צעד אחר צעד, התחלתי למצוא את הכוח מחדש. גיליתי שאני חזקה יותר ממה שחשבתי. היום, כשאני מסתכלת לאחור, אני מבינה כמה דרך עברתי ואיך כל הכאב הפך לחלק מהצמיחה שלי.\n\nאם את עוברת משבר דומה, תדעי שיש תקווה. יש חיים אחרי המשבר, לפעמים אפילו טובים יותר מקודם. כל יום קטן של התקדמות הוא ניצחון.\n\nאני כותבת את זה כי רציתי שתדעו - את לא לבד. אנחנו כאן ביחד.",
        date: new Date(2023, 5, 15),
      },
      {
        id: "2",
        title: "הרגע שהחלטתי לעשות שינוי",
        body: "זה היה יום רגיל לחלוטין. קמתי לעבודה, הכנתי קפה, ישבתי מול המחשב כמו בכל יום. אבל משהו היה שונה. הרגשתי כאילו אני חיה בסרט שמישהו אחר ביים. פתאום הבנתי שאני לא מאושרת, שאני חיה חיים שלא באמת רציתי.\n\nבאותו רגע החלטתי שמשהו חייב להשתנות. לא ידעתי בדיוק מה או איך, אבל ידעתי שאני לא יכולה להמשיך ככה. זה לא היה קל. נדרש אומץ לעזוב את אזור הנוחות, לשנות קריירה, להתחיל מחדש.\n\nשנה אחרי, אני יכולה להגיד שזו הייתה ההחלטה הכי טובה שעשיתי. אני עדיין בדרך, עדיין לומדת, אבל הפעם אני חיה חיים שאני בחרתי. אם גם את מרגישה תקועה - דעי שתמיד אפשר להתחיל שוב.",
        date: new Date(2023, 6, 20),
      },
      {
        id: "3",
        title: "איך למדתי לקבל את עצמי",
        body: "כל החיים הרגשתי שאני צריכה להיות מושלמת. בבית, בעבודה, עם חברים, עם בן הזוג. תמיד להיראות טוב, תמיד להגיד את הדבר הנכון, תמיד להצליח. כל טעות קטנה גרמה לי להרגיש כישלון.\n\nלפני כמה חודשים, אחרי התמוטטות קטנה של סוף שבוע שלם של בכי, החלטתי שאני חייבת לשנות משהו. התחלתי לעבוד עם מטפלת שלימדה אותי על חמלה עצמית. בהתחלה זה הרגיש כמו שפה זרה - איך אני יכולה להיות נחמדה לעצמי כשאני טועה? מה פתאום?\n\nלאט לאט התחלתי להבין שהמושלמות היא אשליה, ושכולנו פגומים וזה בסדר. התחלתי לדבר אל עצמי כפי שהייתי מדברת לחברה טובה. כשאני טועה, אני לומדת לומר לעצמי 'זה בסדר, את אנושית'.\n\nהדרך עוד ארוכה, אבל אני כבר מרגישה יותר קלות. פחות שיפוטית כלפי עצמי, יותר מקבלת. אולי זו המתנה הכי גדולה שאי פעם נתתי לעצמי.",
        date: new Date(2022, 11, 5),
      },
      {
        id: "4",
        title: "חיבוק ראשון אחרי הלידה",
        body: "אחרי 36 שעות של צירים, היא סוף סוף הגיעה לעולם. התינוקת שלי. הרגע שהניחו אותה על החזה שלי היה הרגע המטלטל ביותר בחיי. הסתכלתי עליה, כל כך קטנה וחסרת ישע, ופתאום הרגשתי אהבה שלא ידעתי שאני מסוגלת לה.\n\nבאותו רגע הבנתי שהחיים שלי השתנו לנצח. הפכתי לאמא, ועם התפקיד הזה באה אחריות עצומה אבל גם אושר שאי אפשר לתאר במילים. הבטחתי לה שאהיה שם בשבילה תמיד, שאגן עליה בכל מחיר.\n\nהימים והלילות הראשונים היו מטורפים - חוסר שינה, התמודדות עם הנקה, חרדות אינסופיות. אבל גם רגעי אושר צרופים כשהיא הסתכלה עליי בעיניים הכחולות הגדולות שלה.\n\nהיום, כשהיא כבר בת שנתיים, אני מסתכלת עליה ולא מאמינה איך הזמן עובר מהר. איך הרך הקטן והפגיע הזה הפך לילדה עצמאית, סקרנית וחכמה. כל יום איתה הוא הרפתקה חדשה.",
        date: new Date(2023, 2, 18),
      },
      {
        id: "5",
        title: "השיחה שהצילה את הנישואים שלנו",
        body: "אחרי 12 שנים של נישואים, הרגשנו שאנחנו מתרחקים זה מזו. השגרה, הילדים, העבודה - כל אלה גרמו לנו לשכוח מה בכלל חיבר בינינו בהתחלה. השיחות שלנו התמקדו בעיקר בלוגיסטיקה - מי לוקח את הילדים לחוג, מה קונים בסופר, ומתי מתקנים את הברז הדולף.\n\nערב אחד, כשהילדים כבר ישנו, ישבנו במרפסת עם כוס יין והתחלנו לדבר. באמת לדבר. על החלומות שלנו, על הפחדים, על התקוות והאכזבות. גילינו מחדש את האנשים שהתאהבנו בהם לפני שנים.\n\nהשיחה הזאת הייתה נקודת מפנה עבורנו. החלטנו להקדיש זמן אחד לשני, גם כשהחיים עמוסים. לצאת לדייטים, לטייל לבד, לחזור להיות לא רק הורים אלא גם זוג.\n\nמאז אנחנו עובדים על הזוגיות שלנו כל יום מחדש. לא תמיד קל, אבל שווה את המאמץ. כי בסופו של דבר, החיבור בינינו הוא הבסיס למשפחה שלנו.",
        date: new Date(2023, 1, 7),
      },
      {
        id: "6",
        title: "המפגש עם האישה המבוגרת ברכבת",
        body: "לפני כמה חודשים נסעתי ברכבת מתל אביב לחיפה. הייתי עסוקה בטלפון כרגיל, גוללת אינסטגרם בלי סוף, כשלידי התיישבה אישה מבוגרת. היא חייכה אליי ואני חייכתי בנימוס בחזרה, מקווה שהיא לא תתחיל בשיחה. אבל היא התחילה.\n\nהיא שאלה אותי על הלימודים, על המשפחה, ומהר מאוד מצאתי את עצמי מספרת לה דברים שאני בקושי מספרת לחברים קרובים. היה בה משהו כל כך מזמין, כל כך חכם.\n\nלא השתתקתי לרגע עד שהיא התחילה לספר על עצמה. על החיים שחייתה, על אהבות שאיבדה, על הילדים שגידלה, על מדינה שראתה קמה מול עיניה. נדהמתי מהחוכמה וניסיון החיים שלה.\n\nכשירדתי בחיפה, היא לחצה את ידי ואמרה: 'תחיי כל יום כאילו הוא האחרון, אבל תתכנני כאילו תחיי לנצח'. לא החלפנו מספרי טלפון, לא ידעתי אפילו את שמה, אבל המפגש הקצר הזה נשאר איתי. לפעמים אנשים זרים משאירים את החותם העמוק ביותר.",
        date: new Date(2023, 4, 29),
      },
      {
        id: "7",
        title: "היום שבו החלטתי להפסיק לפחד",
        body: "כל החיים פחדתי. פחדתי לדבר מול קהל, פחדתי לטוס, פחדתי לקחת סיכונים. הפחד הזה הגביל אותי, מנע ממני הזדמנויות, סגר אותי בקופסה קטנה ונוחה.\n\nלפני שנה, אחרי שקראתי ספר על חרדות, החלטתי לעשות ניסוי קטן. החלטתי להגיד 'כן' לכל דבר שהייתי אומרת לו 'לא' בגלל פחד, למשך שבוע אחד. זה התחיל בקטן - להרים יד בישיבה, לדבר עם זרים, לנסות מאכל חדש.\n\nלהפתעתי, גיליתי שרוב הדברים שפחדתי מהם לא היו כל כך נוראים. חלקם אפילו היו מהנים! השבוע הזה נמשך והפך לחודש, והחודש הפך לדרך חיים.\n\nהיום, אני עדיין מפחדת לפעמים. אבל הפחד כבר לא שולט בי. למדתי שהפחד וההתרגשות מרגישים כמעט אותו דבר בגוף - פרפרים בבטן, דופק מואץ. התחלתי לפרש מחדש את התחושות האלה: 'אני לא מפחדת, אני מתרגשת!'\n\nהחיים שלי היום מלאים ועשירים יותר ממה שיכולתי לדמיין. אם גם אתם חיים בצל הפחד - אולי זה הזמן להתחיל ניסוי משלכם.",
        date: new Date(2022, 8, 12),
      },
      {
        id: "8",
        title: "המפגש עם אבא אחרי 20 שנה",
        body: "אבא שלי עזב כשהייתי בת 7. פשוט נעלם. אמא גידלה אותי לבד, ובמשך שנים לא שמעתי ממנו דבר. היו לי המון שאלות, המון כעס, המון כאב.\n\nלפני חצי שנה, מצאתי הודעה בפייסבוק. זה היה הוא. הוא כתב שהוא מצטער, שהוא היה במקום חשוך בחייו, שהוא רוצה לפגוש אותי.\n\nלקח לי חודש להחליט אם אני רוצה לענות. בסוף הסכמתי לפגישה אחת, במקום ציבורי, עם חברה שמחכה בשולחן ליד למקרה שארגיש לא בנוח.\n\nהמפגש היה מוזר, עצוב, מרגש. הוא היה מבוגר ממה שדמיינתי, חלש. דיברנו שעות. הוא סיפר לי על ההתמכרות שהרסה את חייו, על השנים בכלא, על התהליך השיקומי. אני סיפרתי לו על החיים שלי, על הישגיי, על החלומות.\n\nאני לא יודעת אם נמשיך להיפגש. כרגע אנחנו בקשר ספורדי. אני עדיין מעכלת הכל. אבל הפגישה הזאת נתנה לי סגירה מסוימת. אולי הרגשת שלמות שלא ידעתי שחסרה לי. אולי הבנה שאפשר לסלוח, גם אם אי אפשר לשכוח.",
        date: new Date(2023, 9, 25),
      },
      {
        id: "9",
        title: "הדבר החשוב שלמדתי מהילדים שלי",
        body: "לפני שהפכתי לאמא, חשבתי שאני זו שתלמד את הילדים שלי על החיים. אבל עכשיו, כשהם בני 5 ו-7, אני מבינה שהם המורים האמיתיים שלי.\n\nהילדים שלי מלמדים אותי להתפעל מהדברים הקטנים - עלה שנופל מהעץ, נמלה שסוחבת פירור, שלולית שמשקפת את השמיים. הם מלמדים אותי על אהבה ללא תנאי, על מחילה מיידית, על שמחה טהורה.\n\nהם גם המראה הכי אמיתית שלי. כשאני רואה את הבת שלי מדברת בכעס לבובה, אני שומעת את עצמי. כשאני רואה את הבן שלי מחבק ילד שנפל בגן, אני רואה את הטוב שהצלחתי להעביר הלאה.\n\nהם מזכירים לי כל יום מה באמת חשוב בחיים. לא הקריירה, לא הכסף, לא מה אחרים חושבים. אלא החיבור, הנוכחות, האהבה. שווה לעצור לפעמים ולהסתכל על העולם דרך עיניים של ילד. אני מבטיחה שתראו אותו אחרת לגמרי.",
        date: new Date(2023, 7, 3),
      },
      {
        id: "10",
        title: "איך המחלה שינתה את חיי לטובה",
        body: "לפני שלוש שנים התאשפזתי בבית חולים עם כאבים חזקים. אחרי בדיקות רבות, קיבלתי אבחנה של מחלה כרונית. זה היה הלם. הייתי בת 32, אקטיבית, עם קריירה מצליחה, ופתאום הגוף שלי בגד בי.\n\nהחודשים הראשונים היו קשים. כעס, הכחשה, פחד, דיכאון - עברתי את כל השלבים. היו ימים שלא יכולתי לקום מהמיטה. חשבתי שהחיים שלי נגמרו.\n\nאבל אז, באיטיות, התחלתי להסתגל. למדתי להקשיב לגוף שלי, לנהל את האנרגיה שלי, לבקש עזרה כשאני צריכה. שיניתי את התזונה שלי, את שגרת האימונים, את סדרי העדיפויות.\n\nוהדבר המפתיע קרה - גיליתי שאני שמחה יותר. כן, המחלה מגבילה אותי. יש דברים שאני לא יכולה לעשות. אבל היא גם לימדה אותי לחיות בהווה, להעריך כל יום טוב, להתמקד במה שבאמת חשוב.\n\nהיום אני מקדישה יותר זמן למשפחה, לחברים, לתחביבים. אני עובדת פחות שעות אבל עושה עבודה משמעותית יותר. אני יותר נדיבה, יותר סבלנית, יותר אמפתית. המחלה לא הייתה מתנה שביקשתי, אבל היא לימדה אותי שיעורים שלא הייתי לומדת בשום דרך אחרת.",
        date: new Date(2022, 10, 14),
      },
    ];
    setStories(dummyStories);
    setFilteredStories(dummyStories);
  }, []);

  // Filter stories based on search term and sort order
  useEffect(() => {
    let filtered = [...stories];

    if (searchTerm) {
      filtered = filtered.filter((story) => story.title.includes(searchTerm));
    }

    if (showLatest) {
      filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else {
      // Default sort (could be by ID or another field)
      filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    setFilteredStories(filtered);
  }, [stories, searchTerm, showLatest]);

  // Handle search
  const handleSearch = () => {
    if (searchInputRef.current) {
      setSearchTerm(searchInputRef.current.value);
    }
  };

  // Handle add new story
  const handleAddStory = () => {
    if (!token) return;

    if (newTitle.trim() && newBody.trim()) {
      const newStory: Story = {
        id: Date.now().toString(),
        title: newTitle,
        body: newBody,
        date: new Date(),
      };

      setStories([...stories, newStory]);
      setNewTitle("");
      setNewBody("");
      setShowAddForm(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 rtl" dir="rtl">
      {/* Header with title and add button */}
      <div className="flex flex-col items-start mb-8 gap-[16px]">
        <motion.h1
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          סיפורים אישיים
        </motion.h1>

        <div className="flex items-center justify-end gap-3">
          <div className="relative group">
            <motion.button
              onClick={() => token && setShowAddForm(true)}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-white transition-all ${
                !token ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: "hsl(var(--main-color))" }}
              whileHover={{ scale: token ? 1.03 : 1 }}
              whileTap={{ scale: token ? 0.97 : 1 }}
              disabled={!token}
            >
              <Plus size={20} />
            </motion.button>

            {/* Tooltip that appears on hover when not authenticated */}
            {!token && (
              <div className="absolute top-1/2 right-full -translate-y-1/2 mr-3 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-right">
                עלייך להתחבר דרך הצ'אט כדי לשתף סיפור
                <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
              </div>
            )}
          </div>

          <span className="text-xl font-medium text-gray-800">
            שתפי <span style={{ color: "hsl(var(--main-color))" }}>מה</span> שעל{" "}
            <span style={{ color: "hsl(var(--main-color))" }}>ליבך</span>
          </span>
        </div>
      </div>
      {/* Search and filter controls - Updated to match the image */}
      {/* Search and filter controls - Two separate rounded buttons */}
      <div className="flex justify-start items-center gap-3 mb-6">
        {/* Recent toggle button */}
        <button
          onClick={() => setShowLatest(!showLatest)}
          className="flex items-center gap-2 py-[12px] pr-[16px] pl-[24px] bg-[#F4F6FA] rounded-full transition-colors"
          aria-label="הצג לפי סדר עדכניות"
        >
          {" "}
          <span
            className={`transition-transform ${showLatest ? "rotate-180" : ""}`}
          >
            <ArrowUpDown size={16} className="text-gray-600" />
          </span>
          <span className="text-gray-700 text-sm">אחרונים</span>
        </button>

        {/* Search button */}
        <div className="relative">
          {searchExpanded ? (
            <div className="flex items-center bg-[#F4F6FA] rounded-full overflow-hidden">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="חיפוש סיפורים..."
                className="pr-10 pl-12 py-2 w-64 focus:outline-none text-sm bg-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoFocus
                onBlur={() => {
                  if (!searchInputRef.current?.value) {
                    setSearchExpanded(false);
                  }
                }}
              />
              <button
                onClick={handleSearch}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full flex items-center justify-center"
              >
                <Search size={18} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchExpanded(true)}
              className="bg-[#F4F6FA] p-3 rounded-full flex items-center justify-center"
              aria-label="פתח חיפוש"
            >
              <Search size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>
      {/* Stories grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredStories.map((story) => (
          <motion.div
            key={story.id}
            className="bg-[#F4F6FA] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedStory(story)}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold mb-2">{story.title}</h3>
            <p className="text-gray-600 line-clamp-3">{story.body}</p>
            <div className="mt-4 text-sm text-gray-500">
              {new Date(story.date).toLocaleDateString("he-IL")}
            </div>
          </motion.div>
        ))}
      </motion.div>
      {/* Empty state */}
      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">לא נמצאו סיפורים</p>
          <button
            onClick={() => {
              setSearchTerm("");
              if (searchInputRef.current) searchInputRef.current.value = "";
            }}
            className="text-blue-500 underline"
          >
            נקה חיפוש
          </button>
        </div>
      )}
      {/* Story detail modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              className="bg-[#F4F6FA] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-2xl font-bold">{selectedStory.title}</h2>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 whitespace-pre-wrap">
                {selectedStory.body}
              </div>

              <div className="text-sm text-gray-500 mt-6">
                פורסם בתאריך{" "}
                {new Date(selectedStory.date).toLocaleDateString("he-IL")}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add story modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full p-6"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">שיתוף סיפור חדש</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">כותרת</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="הוסיפי כותרת לסיפור שלך"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">תוכן</label>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="כתבי את הסיפור שלך כאן..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddStory}
                  disabled={!newTitle.trim() || !newBody.trim()}
                  className="px-4 py-2 bg-[#4762FF] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  פרסום
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesPage;
