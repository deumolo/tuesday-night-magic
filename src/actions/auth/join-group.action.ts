import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, eq, and, Group, UserGroup } from "astro:db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const joinGroup = defineAction({
  accept: "form",
  handler: async (input, { cookies }) => {
    try {
      const groupId = input.get("groupId")?.toString();
      const password = input.get("password")?.toString();
      const userId = input.get("userId")?.toString();

      if (!groupId || !password || !userId) {
        return { 
          success: false, 
          error: ["Group ID, password, and user ID are required"] 
        };
      }

      // Step 1: Get the group and verify password
      const group = await db
        .select()
        .from(Group)
        .where(eq(Group.id, groupId))
        .get();

      if (!group) {
        return { 
          success: false, 
          error: ["Group not found"] 
        };
      }

      // Verify the password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, group.password || "");
      if (!isPasswordValid) {
        return { 
          success: false, 
          error: ["Invalid password"] 
        };
      }

      // Step 2: Check if user is already in the group
      const existingMembership = await db
        .select()
        .from(UserGroup)
        .where(
          and(
            eq(UserGroup.userId, userId),
            eq(UserGroup.groupId, groupId)
          )
        )
        .get();

      if (existingMembership) {
        return { 
          success: false, 
          error: ["You are already a member of this group"] 
        };
      }

      // Step 3: Add user to the group
      await db.insert(UserGroup).values({
        id: uuidv4(),
        userId: userId,
        groupId: groupId,
        administrator: "false",
        createdAt: new Date(),
      });

      return {
        success: true,
        message: "Successfully joined the group!"
      };
    } catch (error) {
      console.error("Error joining group: ", error);
      return { 
        success: false, 
        error: ["An error occurred while joining the group"] 
      };
    }
  },
});