import React from 'react';
import { Container, Paper, Typography, Box, Divider, Chip } from '@mui/material';
import { Shield as ShieldIcon } from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

const PrivacyPolicy = () => {
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
                        <ShieldIcon sx={{ color: '#fff', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h4" sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        מדיניות פרטיות
                    </Typography>
                    <Chip label="עדכון אחרון: מרץ 2026" size="small" sx={{ mt: 1.5 }} />
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* 1. מבוא */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>1. מבוא</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        חברת Hoist & Crane (להלן: "החברה", "אנחנו") מכבדת את פרטיותם של משתמשי המערכת ומחויבת להגנה על המידע האישי הנאסף במסגרת השימוש בה. מדיניות פרטיות זו מפרטת את סוגי המידע הנאסף, המטרות לשמן נאסף המידע, אופן השימוש בו, אמצעי ההגנה עליו וזכויותיך בנוגע למידע האישי שלך. מדיניות זו חלה על כל המשתמשים במערכת, לרבות עובדים, קבלנים, בודקים מוסמכים ומנהלי ציוד.
                    </Typography>
                </Box>

                {/* 2. סוגי המידע הנאסף */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>2. סוגי המידע הנאסף</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        במסגרת השימוש במערכת, אנו עשויים לאסוף את סוגי המידע הבאים:
                    </Typography>
                    <Box sx={{ mt: 1.5, pr: 3 }}>
                        <Typography variant="body1" sx={bodyStyle}>
                            <strong>מידע מזהה אישי:</strong> שם מלא, כתובת דואר אלקטרוני, מספר טלפון, שם משתמש, תפקיד ושיוך ארגוני.
                        </Typography>
                        <Typography variant="body1" sx={bodyStyle}>
                            <strong>מידע מקצועי:</strong> נתוני ציוד הרמה, דוחות בדיקה, ממצאים, תמונות ומסמכים הנוגעים לפעילות המקצועית של המשתמש במערכת.
                        </Typography>
                        <Typography variant="body1" sx={bodyStyle}>
                            <strong>מידע טכני:</strong> כתובת IP, סוג הדפדפן ומערכת ההפעלה, מזהה מכשיר, מועדי גישה ודפוסי שימוש במערכת.
                        </Typography>
                        <Typography variant="body1" sx={bodyStyle}>
                            <strong>קובצי Cookie ונתוני אימות:</strong> טוקני הזדהות (JWT), העדפות משתמש ונתוני סשן.
                        </Typography>
                    </Box>
                </Box>

                {/* 3. מטרות איסוף המידע */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>3. מטרות איסוף המידע ושימוש בו</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        המידע הנאסף משמש למטרות הבאות בלבד: (א) הפעלה תקינה של המערכת ומתן שירותיה, לרבות ניהול ציוד הרמה, מעקב אחר בדיקות תקופתיות ומילוי דרישות רגולטוריות; (ב) אימות זהות המשתמש וניהול הרשאות גישה; (ג) שיפור חוויית המשתמש, ניתוח דפוסי שימוש ושדרוג המערכת; (ד) יצירת קשר עם המשתמש לצרכי תמיכה טכנית, עדכונים ותקשורת שוטפת; (ה) עמידה בדרישות החוק והרגולציה החלים.
                    </Typography>
                </Box>

                {/* 4. אבטחת מידע */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>4. אבטחת מידע</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        החברה נוקטת באמצעי אבטחה מתקדמים, פיזיים, טכנולוגיים וארגוניים, לשם הגנה על המידע האישי מפני גישה בלתי מורשית, שימוש לרעה, שינוי, חשיפה, השמדה או אובדן. אמצעים אלה כוללים, בין היתר: הצפנת תקשורת באמצעות פרוטוקול SSL/TLS, הצפנת סיסמאות בשיטות חד-כיווניות (hashing), בקרת גישה מבוססת תפקידים (RBAC), גיבוי תקופתי של מסדי הנתונים, וניטור רציף של פעילות חשודה. יחד עם זאת, אין באפשרותנו להבטיח הגנה מוחלטת מפני כל איום סייבר, והמשתמש מאשר כי הוא מודע לכך.
                    </Typography>
                </Box>

                {/* 5. שיתוף מידע עם צדדים שלישיים */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>5. שיתוף מידע עם צדדים שלישיים</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        החברה לא תעביר, לא תמכור ולא תשכיר את המידע האישי של המשתמשים לצדדים שלישיים, אלא במקרים הבאים: (א) בהתאם לדרישת חוק, צו שיפוטי או הוראה של רשות מוסמכת; (ב) לצורך אספקת שירותים חיוניים להפעלת המערכת על ידי ספקי שירות (כגון שירותי אחסון ענן), הכפופים להתחייבויות סודיות מחמירות; (ג) במקרה של מיזוג, רכישה, מכירה או העברת נכסים של החברה; (ד) לשם הגנה על זכויות החברה, רכושה ובטיחותה, או על בטיחות המשתמשים.
                    </Typography>
                </Box>

                {/* 6. שמירת מידע */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>6. תקופת שמירת המידע</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        החברה תשמור את המידע האישי למשך התקופה הנדרשת לצורך מילוי המטרות שלשמן נאסף, או למשך התקופה הנדרשת על פי דין, המאוחר מביניהם. מידע הנוגע לבדיקות ציוד הרמה ולדוחות בדיקה יישמר בהתאם להוראות תקנות הבטיחות בעבודה (עגורנאים, מפעילי עגורנים ואתתים) ותקנות הבטיחות בעבודה (מכירה, הפעלה ובדיקה של מכונות הרמה), לפחות למשך תקופת חובת השמירה הקבועה בחוק. בתום תקופת השמירה הנדרשת, המידע יימחק או יעבור אנונימיזציה באופן בלתי-הפיך.
                    </Typography>
                </Box>

                {/* 7. זכויות המשתמש */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>7. זכויות המשתמש</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, וכן בהתאם לכל דין רלוונטי אחר, למשתמש עומדות הזכויות הבאות: (א) הזכות לעיין במידע האישי המוחזק אודותיו במאגרי החברה; (ב) הזכות לדרוש תיקון או מחיקה של מידע שגוי, לא מדויק או מיותר; (ג) הזכות להתנגד לעיבוד מידע אישי בנסיבות מסוימות; (ד) הזכות לבקש הגבלת עיבוד המידע האישי. לצורך מימוש זכויות אלה, ניתן לפנות אלינו באמצעות פרטי הקשר שלהלן.
                    </Typography>
                </Box>

                {/* 8. שינויים במדיניות */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>8. שינויים במדיניות הפרטיות</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        החברה שומרת לעצמה את הזכות לעדכן ולשנות מדיניות פרטיות זו מעת לעת, בהתאם לשינויים בחוק, בטכנולוגיה או בפעילות העסקית. מדיניות מעודכנת תפורסם במערכת, ותחול על כל שימוש שייעשה בה לאחר מועד הפרסום. מומלץ לעיין במדיניות זו באופן תקופתי.
                    </Typography>
                </Box>

                {/* 9. יצירת קשר */}
                <Box sx={sectionStyle}>
                    <Typography variant="h6" sx={headingStyle}>9. יצירת קשר בנושא פרטיות</Typography>
                    <Typography variant="body1" sx={bodyStyle}>
                        לכל שאלה, בירור, בקשה או תלונה בנוגע למדיניות פרטיות זו או לטיפול במידע האישי שלך, ניתן לפנות אלינו:
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

export default PrivacyPolicy;
