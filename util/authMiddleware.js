// util/authMiddleware.js
exports.requireAuth = (req, res, next) => {
  if (!req.session || !req.session.username) {
    return res.redirect('/auth/login');
  }
  next();
};
