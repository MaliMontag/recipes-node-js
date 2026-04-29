// מחלקת שגיאה מותאמת עם קוד סטטוס להחזרה ללקוח.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
