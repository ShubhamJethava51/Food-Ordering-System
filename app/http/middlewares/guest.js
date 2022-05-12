//guest middleware for checking if user is logged in or not
function guest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/");
}

module.exports = guest;
