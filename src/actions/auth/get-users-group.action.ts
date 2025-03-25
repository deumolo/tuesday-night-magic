import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, User, UserGroup, Group, Deck, inArray, eq } from "astro:db";

export const getUsersGroup = defineAction({
  accept: "json",
  handler: async (input) => {
    try {

      if (!input.groupId) {
        return { success: false, message: "Invalid or missing groupIds" };
      }

      // Step 1: Get all user-group memberships for the specified groups
      const groupUsers = await db
        .select()
        .from(UserGroup)
        .where(eq(UserGroup.groupId, input.groupId));

      if (groupUsers.length === 0) return { success: true, users: [] };

      const userIds = [...new Set(groupUsers.map((gu) => gu.userId))];

      // Step 2: Get user info for those users
      const users = await db
        .select()
        .from(User)
        .where(inArray(User.id, userIds));

      return {
        success: true,
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
        })),
      };
    } catch (error) {
      console.error("Error: ", error);
      return { success: false, message: "An error occurred." };
    }
  },
});