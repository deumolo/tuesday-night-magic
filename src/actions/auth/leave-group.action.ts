import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, eq, and, UserGroup } from "astro:db";

export const leaveGroup = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {
      if (!input.groupId || !input.userId) {
        return { 
          success: false, 
          error: ["Group ID and user ID are required"] 
        };
      }

      // Step 1: Check if user is actually in the group
      const existingMembership = await db
        .select()
        .from(UserGroup)
        .where(
          and(
            eq(UserGroup.userId, input.userId),
            eq(UserGroup.groupId, input.groupId)
          )
        )
        .get();

      if (!existingMembership) {
        return { 
          success: false, 
          error: ["You are not a member of this group"] 
        };
      }

      // Step 2: Remove user from the group
      const result = await db
        .delete(UserGroup)
        .where(
          and(
            eq(UserGroup.userId, input.userId),
            eq(UserGroup.groupId, input.groupId)
          )
        );

      return {
        success: true,
        message: "Successfully left the group!"
      };
    } catch (error) {
      console.error("Error leaving group: ", error);
      return { 
        success: false, 
        error: ["An error occurred while leaving the group"] 
      };
    }
  },
});