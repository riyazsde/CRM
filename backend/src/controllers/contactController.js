const Contact = require("../models/Contact");
const ActivityLog = require("../models/ActivityLog");
const { contactsToCsv } = require("../utils/csv");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function createContact(req, res, next) {
  try {
    const contact = await Contact.create({ ...req.body, owner: req.user._id });

    await ActivityLog.create({
      owner: req.user._id,
      action: "CREATE",
      contactId: contact._id,
      contactName: contact.name,
      message: `Added contact ${contact.name}`
    });

    res.status(201).json({ contact });
  } catch (error) {
    next(error);
  }
}

async function listContacts(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const filter = { owner: req.user._id };

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (status) filter.status = status;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Contact.countDocuments(filter)
    ]);

    res.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getContact(req, res, next) {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json({ contact });
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    await ActivityLog.create({
      owner: req.user._id,
      action: "UPDATE",
      contactId: contact._id,
      contactName: contact.name,
      message: `Updated contact ${contact.name}`
    });

    res.json({ contact });
  } catch (error) {
    next(error);
  }
}

async function deleteContact(req, res, next) {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    await ActivityLog.create({
      owner: req.user._id,
      action: "DELETE",
      contactId: contact._id,
      contactName: contact.name,
      message: `Deleted contact ${contact.name}`
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function exportContacts(req, res, next) {
  try {
    const contacts = await Contact.find({ owner: req.user._id }).sort({ createdAt: -1 });
    const csv = contactsToCsv(contacts);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="riyazcrm-contacts.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createContact,
  listContacts,
  getContact,
  updateContact,
  deleteContact,
  exportContacts
};
