function validateContact(req, res, next) {
  const { name, email, phone, company, status, notes } = req.body;
  const errors = [];

  if (!name || String(name).trim().length < 2) errors.push("Name must contain at least 2 characters");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Valid email is required");
  if (!phone || String(phone).trim().length < 7) errors.push("Valid phone is required");
  if (!company || String(company).trim().length < 2) errors.push("Company is required");
  if (status && !["Lead", "Prospect", "Customer"].includes(status)) errors.push("Invalid status");
  if (notes && String(notes).length > 1000) errors.push("Notes cannot exceed 1000 characters");

  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
}

module.exports = { validateContact };
