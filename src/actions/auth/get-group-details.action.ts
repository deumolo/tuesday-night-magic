import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, eq, Group } from "astro:db";

export const getGroupDetails = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {
      if (!input.groupId) {
        return { success: false, message: "Group ID is required" };
      }

      const group = await db
        .select()
        .from(Group)
        .where(eq(Group.id, input.groupId))
        .get();

      if (!group) {
        return { success: false, message: "Group not found" };
      }

      return {
        success: true,
        group: {
          id: group.id,
          name: group.name,
          password: group.password,
          createdAt: group.createdAt,
        }
      };
    } catch (error) {
      console.error("Error: ", error);
      return { success: false, message: "An error occurred while fetching group details." };
    }
  },
});