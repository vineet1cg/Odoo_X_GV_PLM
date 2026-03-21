const { query, getDBStatus } = require('../config/database');

module.exports = function dbMiddleware(req, res, next) {
  req.db = query;
  req.dbStatus = getDBStatus;
  next();
};
