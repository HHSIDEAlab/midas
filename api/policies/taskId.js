/**
* Get the task referenced in projectId of the request body
* and check if access is allowed
*/
var util = require('../services/utils/task')

module.exports = function taskId (req, res, next) {
  if (req.body && req.body.taskId) {
    var userId = null;
    if (req.user) {
      userId = req.user[0].id;
    }
    util.authorized(req.body.taskId, userId, function (err, task) {
      if (err) { return res.send({ message: err }); }
      if (!err && !task) { return res.send(403, { message: 'Not authorized.'}); }
      req.task = task;
      req.taskId = task.id;
      req.isOwner = task.isOwner;
      next();
    });
  // no :id is specified, so continue
  } else {
    next();
  }
};