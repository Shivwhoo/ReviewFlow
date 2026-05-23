/**
 * Seed script to populate the database with initial data.
 *
 * Run with: npx tsx lib/db/seed.ts
 *
 * Creates:
 * - An admin user
 * - A demo business
 * - A demo location
 * - A test QR code (test123)
 */

import mongoose from "mongoose";
// import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/reviewflow";

async function seed() {
  console.log("🌱 Seeding database...");
  console.log(`   Connecting to: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}`);

  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db!;

  // 1. Create admin users
  const adminEmails = ["admin@reviewflow.app", "shivamkeshri009@gmail.com"];
  let adminId: mongoose.Types.ObjectId | undefined;

  for (const email of adminEmails) {
    const existingAdmin = await db.collection("users").findOne({ email });
    if (existingAdmin) {
      console.log(`   ✓ Admin user already exists: ${email}`);
      if (email === "admin@reviewflow.app" || !adminId) {
        adminId = existingAdmin._id as mongoose.Types.ObjectId;
      }
    } else {
      const result = await db.collection("users").insertOne({
        email,
        name: email === "admin@reviewflow.app" ? "Admin User" : "Shivam Keshri",
        role: "admin",
        subscriptionTier: "multi-location",
        creditsUsedThisMonth: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("   ✓ Created admin user:", email);
      if (email === "admin@reviewflow.app" || !adminId) {
        adminId = result.insertedId as unknown as mongoose.Types.ObjectId;
      }
    }
  }

  // 2. Create demo business
  const existingBusiness = await db
    .collection("businesses")
    .findOne({ name: "Demo Restaurant" });

  let businessId: mongoose.Types.ObjectId;

  const demoAnswers = {
    uniqueFeatures: "traditional wood-fired sourdough pizzas, cozy outdoor garden seating, and family-secret marinara sauce",
    targetCustomer: "families, couples looking for a romantic date spot, and pizza lovers",
    popularProducts: "Margherita Extra Pizza, Truffle Cacio e Pepe, Pistachio Cannoli",
    compliments: "extremely friendly servers who treat you like family, warm ambiance, and lightning-fast pizza serving times",
    reviewTone: "warm",
    keywords: "authentic naples pizza, wood-fired, sourdough, cozy garden",
  };
  const demoContext = "This business is unique because: traditional wood-fired sourdough pizzas, cozy outdoor garden seating, and family-secret marinara sauce. Their typical customers are: families, couples looking for a romantic date spot, and pizza lovers. Their top products/services are: Margherita Extra Pizza, Truffle Cacio e Pepe, Pistachio Cannoli. Customers frequently compliment them on: extremely friendly servers who treat you like family, warm ambiance, and lightning-fast pizza serving times. The preferred review style/tone is: Warm & Personal. Optionally, try to naturally include these keywords/phrases: authentic naples pizza, wood-fired, sourdough, cozy garden.";

  if (existingBusiness) {
    console.log("   ✓ Demo business already exists (updating onboarding details)");
    businessId = existingBusiness._id as mongoose.Types.ObjectId;
    await db.collection("businesses").updateOne(
      { _id: businessId },
      { 
        $set: { 
          onboardingCompleted: true, 
          onboardingAnswers: demoAnswers, 
          aiContextPrompt: demoContext 
        } 
      }
    );
  } else {
    const result = await db.collection("businesses").insertOne({
      userId: adminId,
      name: "Demo Restaurant",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      reviewUrl:
        "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      defaultLanguage: "en",
      isActive: true,
      onboardingCompleted: true,
      onboardingAnswers: demoAnswers,
      aiContextPrompt: demoContext,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    businessId = result.insertedId as unknown as mongoose.Types.ObjectId;
    console.log("   ✓ Created demo business with onboarding details");
  }

  // 3. Create demo location
  const existingLocation = await db
    .collection("locations")
    .findOne({ businessId, name: "Main Branch" });

  let locationId: mongoose.Types.ObjectId;

  if (existingLocation) {
    console.log("   ✓ Demo location already exists");
    locationId = existingLocation._id as mongoose.Types.ObjectId;
  } else {
    const result = await db.collection("locations").insertOne({
      businessId,
      name: "Main Branch",
      address: "123 Demo Street, Food City",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    locationId = result.insertedId as unknown as mongoose.Types.ObjectId;
    console.log("   ✓ Created demo location");
  }

  // 4. Create test QR code
  const existingQR = await db
    .collection("qrcodes")
    .findOne({ qrId: "test123" });

  if (existingQR) {
    console.log("   ✓ Test QR code already exists");
  } else {
    await db.collection("qrcodes").insertOne({
      qrId: "test123",
      assignedToBusinessId: businessId,
      assignedToLocationId: locationId,
      isActive: true,
      activatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✓ Created test QR code: test123");
  }

  // 5. Create a few more unassigned QR codes for the pool
  const unassignedQRs = ["pool001abc", "pool002def", "pool003ghi", "pool004jkl", "pool005mno"];
  for (const qrId of unassignedQRs) {
    const exists = await db.collection("qrcodes").findOne({ qrId });
    if (!exists) {
      await db.collection("qrcodes").insertOne({
        qrId,
        assignedToBusinessId: null,
        assignedToLocationId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  console.log("   ✓ Created unassigned QR codes for pool");

  console.log("\n✅ Seed complete!");
  console.log("\n   You can now:");
  console.log("   • Visit /r/test123 to test the review flow");
  console.log("   • Sign in with Google to access the dashboard");
  console.log("   • The admin user (admin@reviewflow.app) has full admin access");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
