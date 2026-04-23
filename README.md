# Recipes RESTful API (Node.js + Express + MongoDB Atlas)

פרויקט צד שרת לניהול משתמשים, מתכונים וקטגוריות עם הרשאות משתמשים, JWT, ולידציות Joi ופורמט שגיאות אחיד.

## התקנה והרצה

1. התקנת תלויות:
   ```bash
   npm install
   ```
2. יצירת קובץ `.env` לפי `.env.example`
3. הרצה:
   ```bash
   npm run dev
   ```

## מבנה הפרויקט

- `src/config` - חיבור DB ומשתני סביבה
- `src/models` - סכמות Mongoose
- `src/routes` - נתיבי API
- `src/middlewares` - אימות, הרשאות, ולידציות, טיפול שגיאות
- `src/services` - לוגיקה עסקית (סנכרון קטגוריות)
- `src/validators` - סכמות Joi

## הרשאות

- `guest`: יכול לצפות רק במתכונים ציבוריים.
- `registered`: התחברות/הוספה/עדכון/מחיקת המתכונים שלו.
- `admin`: גישה מלאה (כולל כל המשתמשים).

## פורמט שגיאות

כל שגיאה מוחזרת כך:

```json
{
  "error": {
    "message": "..."
  }
}
```

## API Endpoints

### Auth
- `POST /api/auth/register` - הרשמה
- `POST /api/auth/login` - התחברות

### Users
- `GET /api/users` - כל המשתמשים (admin)
- `PUT /api/users/:id/password` - עדכון סיסמה (עצמי או admin)
- `DELETE /api/users/:id` - מחיקת משתמש (עצמי או admin)

### Recipes
- `GET /api/recipes?search=aaa&limit=5&page=2` - רשימת מתכונים + חיפוש + paging
- `GET /api/recipes/:code` - מתכון לפי קוד
- `GET /api/recipes/prep-time/:minutes` - מתכונים עד זמן הכנה
- `POST /api/recipes` - הוספת מתכון
- `PUT /api/recipes/:code` - עדכון מתכון
- `DELETE /api/recipes/:code` - מחיקת מתכון

### Categories
- `GET /api/categories` - כל הקטגוריות
- `GET /api/categories/with-recipes` - קטגוריות עם מתכונים
- `GET /api/categories/:identifier` - קטגוריה לפי קוד או תיאור

## דרישות שהוטמעו

- Express + MongoDB Atlas
- JWT authentication
- Role-based authorization
- Joi validations
- Not found middleware
- Global error middleware
- Pagination + Regex text search
- Public/private recipes לפי טוקן
- סנכרון אוטומטי של קטגוריות בעת יצירה/עדכון/מחיקה של מתכונים
