function escapeCsv(value = "") {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function contactsToCsv(contacts) {
  const headers = ["Name", "Email", "Phone", "Company", "Status", "Notes", "CreatedAt", "UpdatedAt"];
  const rows = contacts.map((c) => [
    c.name,
    c.email,
    c.phone,
    c.company,
    c.status,
    c.notes,
    c.createdAt?.toISOString?.() || "",
    c.updatedAt?.toISOString?.() || ""
  ]);

  return [headers, ...rows].map(row => row.map(escapeCsv).join(",")).join("\n");
}

module.exports = { contactsToCsv };
