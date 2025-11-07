
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function createAdmin() {
  const username = "twburns";
  const password = "form1234";
  
  // Check if user already exists
  const existing = await storage.getUserByUsername(username);
  if (existing) {
    console.log("Admin user already exists");
    process.exit(0);
  }

  const hashedPassword = await hashPassword(password);
  
  const admin = await storage.createUser({
    username,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin user created successfully:");
  console.log("Username:", admin.username);
  console.log("Role:", admin.role);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("Error creating admin user:", error);
  process.exit(1);
});
