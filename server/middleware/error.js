exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
exports.errorHandler = (e, req, res, next) => {
  let code = e.status || 500, message = e.message;
  if (e.code === 11000) { code = 409; message = 'That value is already in use'; }
  if (e.name === 'ValidationError') { code = 400; message = Object.values(e.errors).map(x => x.message).join(', '); }
  if (e.name === 'CastError') { code = 400; message = 'Invalid id'; }
  if (code === 500) console.error(e);
  res.status(code).json({ message: code === 500 ? 'Something went wrong on our side' : message });
};
