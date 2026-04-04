require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const FinancialRecord = require("./src/models/FinancialRecord");

const categories = [
  "Salary",
  "Rent",
  "Food",
  "Transport",
  "Utilities",
  "Freelance",
  "Investment",
];

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  // Clean slate
  await Promise.all([User.deleteMany(), FinancialRecord.deleteMany()]);
  console.log("Cleared existing data");

  // Create users
  const [admin, analyst, viewer] = await User.create([
    {
      name: "Admin User",
      email: "admin@finance.com",
      password: "password123",
      role: "admin",
    },
    {
      name: "Analyst User",
      email: "analyst@finance.com",
      password: "password123",
      role: "analyst",
    },
    {
      name: "Viewer User",
      email: "viewer@finance.com",
      password: "password123",
      role: "viewer",
    },
  ]);
  console.log("Users created");

  // Create 60 financial records
  const records = Array.from({ length: 60 }, (_, i) => ({
    amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
    type: i % 3 === 0 ? "expense" : "income",
    category: categories[Math.floor(Math.random() * categories.length)],
    date: randomDate(new Date("2024-01-01"), new Date()),
    description: `Sample record ${i + 1}`,
    createdBy: i % 2 === 0 ? admin._id : analyst._id,
  }));

  await FinancialRecord.insertMany(records);
  console.log("60 financial records created");

  console.log("\n--- SEED COMPLETE ---");
  console.log("admin@finance.com    / password123  (admin)");
  console.log("analyst@finance.com  / password123  (analyst)");
  console.log("viewer@finance.com   / password123  (viewer)");

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
