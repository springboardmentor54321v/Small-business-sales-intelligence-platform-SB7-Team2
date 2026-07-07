module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    next();
  };
};
