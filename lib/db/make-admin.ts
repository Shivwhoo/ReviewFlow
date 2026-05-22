import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/reviewflow";

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("❌ Please provide an email address. Example: npx tsx lib/db/make-admin.ts your-email@gmail.com");
    process.exit(1);
  }

  console.log(`🔌 Connecting to database...`);
  await mongoose.connect(MONGODB_URI);
  
  const db = mongoose.connection.db!;
  const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
  
  if (!user) {
    console.error(`❌ User not found with email: ${email}. Make sure you sign in at least once via Google first.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { role: "admin", subscriptionTier: "multi-location" } }
  );

  console.log(`✅ Success! User ${email} is now an ADMIN with Multi-Location limits.`);
  console.log(`👉 Please sign out and sign back in on the website to apply the changes.`);

  await mongoose.disconnect();
  process.exit(0);
}

makeAdmin().catch(console.error);
