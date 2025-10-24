// Quick verification script to check admin status
import { db, UserGroup } from "astro:db";
import { eq, and } from "drizzle-orm";

const userId = "7925041a-6723-41ce-94d0-3ee312630078";
const groupId = "7925041a-6723-41ce-94d0-3ee312630078";

console.log("Checking admin status for:");
console.log("User ID:", userId);
console.log("Group ID:", groupId);

// Find the user's membership in the group
const membership = await db
  .select()
  .from(UserGroup)
  .where(
    and(
      eq(UserGroup.groupId, groupId),
      eq(UserGroup.userId, userId)
    )
  )
  .get();

console.log("Membership found:", membership);
console.log("Is Admin:", membership?.administrator === "true");

if (membership) {
  console.log("✅ SUCCESS: User is a member of the group");
  if (membership.administrator === "true") {
    console.log("✅ SUCCESS: User has admin privileges");
  } else {
    console.log("❌ ISSUE: User does not have admin privileges");
  }
} else {
  console.log("❌ ISSUE: User is not a member of the group");
}