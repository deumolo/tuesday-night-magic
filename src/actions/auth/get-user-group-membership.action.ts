import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, UserGroup } from "astro:db";
import { eq, and } from "drizzle-orm";

export const getUserGroupMembership = defineAction({
  input: z.object({
    groupId: z.string(),
    userId: z.string(),
  }),
  handler: async ({ groupId, userId }) => {
    try {
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

      return {
        isMember: !!membership,
        isAdmin: membership?.administrator === "true" || false,
        membership: membership || null,
      };
    } catch (error) {
      console.error("Error checking user group membership:", error);
      return {
        isMember: false,
        isAdmin: false,
        membership: null,
      };
    }
  },
});