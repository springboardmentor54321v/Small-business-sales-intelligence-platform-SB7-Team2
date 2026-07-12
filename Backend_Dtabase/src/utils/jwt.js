const jwt = require('jsonwebtoken');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'change_me_in_production');
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'change_me_in_production');
}

module.exports = { signToken, verifyToken };
