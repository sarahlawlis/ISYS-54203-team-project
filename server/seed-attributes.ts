
import { db } from "./db";
import { attributes } from "@shared/schema";

const builtInAttributes = [
  { name: "Customer Name", type: "text", icon: "FileText", description: null },
  { name: "Due Date", type: "date", icon: "Calendar", description: null },
  { name: "Retailer", type: "text", icon: "FileText", description: null },
  { name: "General Notes", type: "text", icon: "AlignLeft", description: null },
  { name: "Structural Design Needed", type: "Y/N", icon: "CheckSquare", description: null },
  { name: "Quotes", type: "file", icon: "Upload", description: null },
  { name: "Purchase Orders", type: "file", icon: "Upload", description: null },
  { name: "Structure Files", type: "file", icon: "Upload", description: null },
  { name: "Email", type: "email", icon: "Mail", description: null },
  { name: "Phone Number", type: "phone", icon: "Phone", description: null },
  { name: "Number", type: "number", icon: "Hash", description: null },
  { name: "URL", type: "url", icon: "LinkIcon", description: null },
  { name: "Long Text", type: "textarea", icon: "AlignLeft", description: null },
  { name: "Customer Contact", type: "text", icon: "FileText", description: "Main point of contact for a customer" },
  { name: "Quote Direction", type: "text", icon: "FileText", description: null },
  { name: "Project Description", type: "text", icon: "FileText", description: null },
];

async function seedAttributes() {
  console.log("Seeding built-in attributes...");
  
  for (const attr of builtInAttributes) {
    const existing = await db.select().from(attributes).where(attributes.name === attr.name);
    
    if (existing.length === 0) {
      await db.insert(attributes).values(attr);
      console.log(`Added attribute: ${attr.name}`);
    } else {
      console.log(`Skipped existing attribute: ${attr.name}`);
    }
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seedAttributes().catch((error) => {
  console.error("Error seeding attributes:", error);
  process.exit(1);
});
