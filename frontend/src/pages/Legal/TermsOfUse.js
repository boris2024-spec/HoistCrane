import React from 'react';
import { Container, Paper, Typography, Box, Divider, Chip } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

const TermsOfUse = () => {
    const { mode } = useThemeMode();

    const sectionStyle = {
        mb: 4,
    };

    const headingStyle = {
        fontWeight: 700,
        mb: 1.5,
        color: 'text.primary',
    };

    const bodyStyle = {
        color: 'text.secondary',
        lineHeight: 2,
        textAlign: 'justify',
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
                elevation={mode === 'dark' ? 4 : 2}
                sx={{
                    p: { xs: 3, sm: 5, md: 6 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
                        background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(74, 222, 128, 0.3)',
                    }}>
                        <GavelIcon sx={{ color: '#fff', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h4" sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        תנאי שימוש
                    </Typography>
                    <Chip label="עדכון אחרון: מרץ 2026" size="small" sx={{ mt: 1.5 }} />
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* 1. כללי */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>1. כללי</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        ברוכים הבאים למערכת Hoist & Crane (להלן: "המערכת"). השימוש במערכת זו מותנה בקבלת תנאי שימוש אלה במלואם וללא סייג. המערכת מופעלת ומנוהלת על ידי Hoist & Crane (להלן: "החברה"). הגלישה במערכת ו/או השימוש בה, לרבות הרישום אליה, מהווים הסכמה מפורשת ובלתי חוזרת מצדך לכל התנאים המפורטים להלן. לחברה שמורה הזכות הבלעדית לעדכן, לשנות או לתקן תנאים אלה מעת לעת, לפי שיקול דעתה הבלעדי, וללא מתן הודעה מוקדמת. מומלץ לעיין בתנאים אלה מדי פעם בפעם על מנת להתעדכן בשינויים.
                    </Typography>
                </Box>

                {/* 2. הגדרות */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>2. הגדרות</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        "המערכת" — פלטפורמה מקוונת לניהול ציוד הרמה, לרבות עגורנים, מנופים, מלגזות, פיגומים וכלי הרמה נוספים, הכוללת מעקב אחר בדיקות תקופתיות, ניהול מסמכים, דיווח על תקלות וליקויים, והפקת דוחות בדיקה.
                        "המשתמש" — כל אדם, ישות משפטית או גורם מורשה אשר ניגש למערכת, גולש בה או משתמש בשירותיה.
                        "תוכן" — כל מידע, נתון, מסמך, תמונה, קובץ או חומר אחר המועלה, נשמר או מוצג במערכת.
                    </Typography>
                </Box>

                {/* 3. הרשאות ואחריות המשתמש */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>3. הרשאות ואחריות המשתמש</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        המשתמש מתחייב כי השימוש במערכת ייעשה אך ורק למטרות חוקיות ובהתאם להוראות כל דין. המשתמש מצהיר ומאשר כי הוא בן 18 ומעלה, וכי הוא בעל הסמכות החוקית להתקשר בתנאי שימוש אלה. המשתמש אחראי באופן בלעדי לשמירה על סודיות פרטי הגישה שלו (שם משתמש וסיסמה) ולכל פעולה המתבצעת באמצעות חשבונו. כל שימוש לרעה, גישה בלתי מורשית, העתקה, הפצה או שינוי של תכני המערכת ללא אישור מפורש בכתב מהחברה — אסורים בהחלט ועלולים להוביל לחסימת הגישה למערכת ולנקיטת הליכים משפטיים.
                    </Typography>
                </Box>

                {/* 4. קניין רוחני */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>4. קניין רוחני</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        כל הזכויות במערכת, לרבות זכויות יוצרים, סימני מסחר, עיצובים, קוד מקור, אלגוריתמים, בסיסי נתונים ותכנים, שייכים לחברה ו/או לצדדים שלישיים שהעניקו לה רישיון שימוש. אין בשימוש במערכת כדי להקנות למשתמש כל זכות קניין רוחני, מפורשת או משתמעת, במערכת או בתכניה. חל איסור מוחלט על שכפול, העתקה, הפצה, שידור, הצגה פומבית, יצירת יצירות נגזרות או ניצול מסחרי של כל חלק מהמערכת ללא קבלת הסכמה מראש ובכתב מהחברה.
                    </Typography>
                </Box>

                {/* 5. הגבלת אחריות */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>5. הגבלת אחריות</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        המערכת מסופקת על בסיס "כמות שהיא" (AS IS) וללא כל מצג או אחריות מכל סוג שהוא, מפורשת או משתמעת, לרבות אחריות לסחירות, התאמה למטרה מסוימת או אי-הפרה. החברה אינה מתחייבת כי המערכת תפעל ללא הפרעות, תקלות או שגיאות, וכי המידע המוצג בה יהיה מדויק, עדכני או מלא. החברה לא תישא באחריות לכל נזק ישיר, עקיף, תוצאתי, מיוחד, עונשי או מקרי, לרבות אובדן רווחים, אובדן מידע, פגיעה במוניטין, הפסדים כלכליים או כל נזק אחר הנובע מהשימוש במערכת או מחוסר היכולת להשתמש בה. המשתמש מאשר כי האחריות לבדיקות בטיחות, תחזוקה ותיקון ציוד מוטלת על בעל הציוד ועל בודק מוסמך בהתאם לדין, וכי המערכת משמשת ככלי ניהולי בלבד ואינה מהווה תחליף לבדיקה פיזית.
                    </Typography>
                </Box>

                {/* 6. זמינות המערכת */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>6. זמינות ותחזוקה</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        החברה שואפת לספק שירות רציף ואמין, אולם אינה מתחייבת לזמינות בלתי מופרעת של המערכת. החברה רשאית להפסיק, להשעות או להגביל את הגישה למערכת, באופן זמני או קבוע, לצורך תחזוקה, שדרוגים, תיקונים, או מכל סיבה אחרת, ללא מתן הודעה מוקדמת ומבלי שתחול עליה אחריות כלשהי כלפי המשתמש.
                    </Typography>
                </Box>

                {/* 7. שיפוי */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>7. שיפוי</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        המשתמש מתחייב לשפות ולפצות את החברה, מנהליה, עובדיה ונציגיה, בגין כל תביעה, דרישה, נזק, הוצאה, הפסד או חבות, לרבות שכר טרחת עורכי דין, הנובעים או הקשורים לשימוש במערכת בניגוד לתנאי שימוש אלה או בניגוד לכל דין.
                    </Typography>
                </Box>

                {/* 8. דין חל וסמכות שיפוט */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>8. דין חל וסמכות שיפוט</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        תנאי שימוש אלה כפופים לדיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית בכל הנוגע לפרשנות תנאים אלה ו/או לכל סכסוך הנובע מהם או מהשימוש במערכת נתונה לבתי המשפט המוסמכים במחוז תל אביב-יפו בלבד.
                    </Typography>
                </Box>

                {/* 9. יצירת קשר */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>9. יצירת קשר</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        לכל שאלה, בירור או פנייה בנוגע לתנאי שימוש אלה, ניתן לפנות אלינו:
                    </Typography>
                    <Box sx={{ mt: 2, p: 2.5, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.06)' : 'rgba(34,197,94,0.06)', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>📞 טלפון: <strong>054-2663030</strong></Typography>
                        <Typography variant="body2">📧 דוא"ל: <strong>boriaa85@gmail.com</strong></Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default TermsOfUse;
