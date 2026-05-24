import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/reviewflow";

async function removeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("❌ Please provide an email address. Example: npx tsx lib/db/remove-admin.ts your-email@gmail.com");
    process.exit(1);
  }

  console.log(`🔌 Connecting to database...`);
  await mongoose.connect(MONGODB_URI);
  
  const db = mongoose.connection.db!;
  const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
  
  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { role: "business", subscriptionTier: "free" } }
  );

  console.log(`✅ Success! User ${email} has been demoted back to a standard BUSINESS user with a Free tier.`);
  console.log(`👉 Please sign out and sign back in on the website to apply the changes.`);

  await mongoose.disconnect();
  process.exit(0);
}

removeAdmin().catch(console.error);
