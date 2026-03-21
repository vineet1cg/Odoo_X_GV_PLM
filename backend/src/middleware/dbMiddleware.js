const { dbQuery, getDBStatus, getCurrentDB } = require('../config/database');

module.exports = function dbMiddleware(req, res, next) {
  req.db       = dbQuery;
  req.dbStatus = getDBStatus;
  req.currentDB = getCurrentDB;
  next();
};
