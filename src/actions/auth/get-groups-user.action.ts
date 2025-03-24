import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, eq, Group, User, UserGroup } from "astro:db";

export const getGroupsUser = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {

    const groups = await db
      .select({
        groupId: Group.id,
        groupName: Group.name,
        createdAt : Group.createdAt,
      })
      .from(Group)
      .innerJoin(UserGroup, eq(UserGroup.groupId, Group.id))
      .where(eq(UserGroup.userId, input.userId))

      return {
        success: true,
        groups
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
