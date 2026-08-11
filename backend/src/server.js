require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`RiyazCRM API running on port ${PORT}`);
  });
}

start().catch(error => {
  console.error("Server startup failed", error);
  process.exit(1);
});