require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
