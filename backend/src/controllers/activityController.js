const ActivityLog = require("../models/ActivityLog");

async function listActivities(req, res, next) {
  try {
    const activities = await ActivityLog.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ activities });
  } catch (error) {
    next(error);
  }
}

module.exports = { listActivities };
