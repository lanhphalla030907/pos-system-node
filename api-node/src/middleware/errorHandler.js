const isMulterError = (err) => err?.name === "MulterError";

const getMulterMessage = (err) => {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return "Image must be 3 MB or smaller";
    case "LIMIT_FILE_COUNT":
    case "LIMIT_UNEXPECTED_FILE":
      return "Only one image file can be uploaded in the 'image' field";
    default:
      return "Invalid image upload request";
  }
};

const isDuplicateEntryError = (err) =>
  err?.code === "ER_DUP_ENTRY" || err?.errno === 1062;

const errorHandler = (err, req, res, next) => {
  const isDup = isDuplicateEntryError(err);
  const statusCode = err.statusCode || (isMulterError(err) || isDup ? 400 : 500);

  if (statusCode >= 500) {
    console.error(err.stack);
  }

  let message = err.message;
  if (isMulterError(err)) {
    message = getMulterMessage(err);
  } else if (isDup) {
    message = "This barcode already belongs to another product";
  } else if (statusCode === 500) {
    message = "Internal Server Error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
