const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { signup, signin, refresh, signout, me } = require("../controllers/authController");
const protect = require("../middleware/auth");

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 10 minutes." }
});

router.post("/signup", signup);
router.post("/signin", loginLimiter, signin);
router.post("/refresh", refresh);
router.post("/signout", signout);
router.get("/me", protect, me);

module.exports = router;
