import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, User, UserGroup, Group, Deck, inArray, eq } from "astro:db";
import { v4 as UUID } from "uuid";

export const getMatchInfo = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {

      // Step 1: Get all groups the user is in
      const userGroups = await db
        .select()
        .from(UserGroup)
        .where(eq(UserGroup.userId, input.userId));

      const groupIds = userGroups.map((ug) => ug.groupId);

      if (groupIds.length === 0) return [];

      // Step 2: Get group details
      const groups = await db
        .select()
        .from(Group)
        .where(inArray(Group.id, groupIds));

      // Step 3: Get all user-group memberships for those groups
      const groupUsers = await db
        .select()
        .from(UserGroup)
        .where(inArray(UserGroup.groupId, groupIds));

      const userIds = [...new Set(groupUsers.map((gu) => gu.userId))];

      // Step 4: Get user info
      const users = await db
        .select()
        .from(User)
        .where(inArray(User.id, userIds));

      // Step 5: Get all decks for those users
      const decks = await db
        .select()
        .from(Deck)
        .where(inArray(Deck.userId, userIds));

      // Step 6: Shape the data
      const finalData = groups.map((group) => ({
        id: group.id,
        name: group.name,
        users: users
          .filter((user) =>
            groupUsers.some(
              (gu) => gu.groupId === group.id && gu.userId === user.id
            )
          )
          .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            decks: decks.filter((deck) => deck.userId === user.id),
          })),
      }));

      // console.dir(finalData, { depth: null });

      return {
        success: true,
        groups: finalData,
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
}); 