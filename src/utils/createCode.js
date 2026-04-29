// מחולל קודים ייחודיים עם קידומת לטובת מזהים עסקיים.
function createCode(prefix = "R") {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${now}${rand}`;
}

module.exports = createCode;
