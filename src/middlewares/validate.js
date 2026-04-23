const AppError = require("../utils/appError");

function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new AppError(message, 400));
    }

    req[source] = value;
    return next();
  };
}

module.exports = validate;
