const router = require("express").Router();
const protect = require("../middleware/auth");
const { listActivities } = require("../controllers/activityController");

router.get("/", protect, listActivities);

module.exports = router;
