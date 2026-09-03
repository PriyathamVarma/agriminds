// Bootstraps (or promotes) the platform's first super_admin.
//
// Usage:
//   node --env-file=.env scripts/seedSuperAdmin.mjs
//
// Reads SUPER_ADMIN_EMAIL from .env (see .env.example). If a user with that email already
// exists, it's promoted to super_admin in place. Otherwise a new account is created with a
// freshly generated password, printed once below — save it, it is never shown again and is
// never stored anywhere in plaintext (only its bcrypt hash is written to the database).
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const uri = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, "");
const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

if (!uri) {
  console.error("Missing MONGODB_URI — set it in .env first.");
  process.exit(1);
}
if (!email) {
  console.error("Missing SUPER_ADMIN_EMAIL — set it in .env first (see .env.example).");
  process.exit(1);
}

// Minimal inline schema — deliberately not importing the TS model (this script runs with plain
// Node, no TypeScript loader configured), so it only touches the handful of fields it needs.
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, default: "registered_user" },
    status: { type: String, default: "active" },
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

await mongoose.connect(uri);

const existing = await User.findOne({ email });
if (existing) {
  existing.role = "super_admin";
  existing.status = "active";
  await existing.save();
  console.log(`✓ Promoted existing account to super_admin: ${email}`);
} else {
  const password = randomBytes(9).toString("base64url"); // 12-char, URL-safe
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name: "AgriMinds Admin",
    email,
    passwordHash,
    role: "super_admin",
    status: "active",
    emailVerified: true,
  });
  console.log(`✓ Created super_admin account: ${email}`);
  console.log(`  Password: ${password}`);
  console.log("  Save this now — it will not be shown again. Sign in at /login and change it if you add a change-password flow.");
}

await mongoose.disconnect();
