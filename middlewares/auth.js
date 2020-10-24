module.exports = (req, res, next) => {
  const { token } = req.headers;
  if (token == "secret") next();
  else
    res.status(401).json({
      success: false,
      error: "unauthorized",
    });
};