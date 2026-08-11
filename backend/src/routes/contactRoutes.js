const router = require("express").Router();
const protect = require("../middleware/auth");
const { validateContact } = require("../middleware/validate");
const {
  createContact,
  listContacts,
  getContact,
  updateContact,
  deleteContact,
  exportContacts
} = require("../controllers/contactController");

router.use(protect);

router.get("/", listContacts);
router.get("/export", exportContacts);
router.post("/", validateContact, createContact);
router.get("/:id", getContact);
router.patch("/:id", validateContact, updateContact);
router.delete("/:id", deleteContact);

module.exports = router;
