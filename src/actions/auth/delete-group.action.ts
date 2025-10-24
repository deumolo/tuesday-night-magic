import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, eq, and, Group, UserGroup, Match, PlayerMatches, MatchPlayerStats } from "astro:db";

export const deleteGroup = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {
      if (!input.groupId || !input.userId) {
        return { 
          success: false, 
          error: ["Group ID and user ID are required"] 
        };
      }

      // Step 1: Verify the group exists
      const group = await db
        .select()
        .from(Group)
        .where(eq(Group.id, input.groupId))
        .get();

      if (!group) {
        return { 
          success: false, 
          error: ["Group not found"] 
        };
      }

      // Step 2: Check if the user is an administrator of this group
      const userGroupMembership = await db
        .select()
        .from(UserGroup)
        .where(
          and(
            eq(UserGroup.userId, input.userId),
            eq(UserGroup.groupId, input.groupId)
          )
        )
        .get();

      if (!userGroupMembership || userGroupMembership.administrator !== "true") {
        return { 
          success: false, 
          error: ["Only group administrators can delete the group"] 
        };
      }

      // Step 3: Get all matches in this group for cleanup
      const groupMatches = await db
        .select({ id: Match.id })
        .from(Match)
        .where(eq(Match.groupId, input.groupId));

      const matchIds = groupMatches.map(match => match.id);

      // Step 4: Delete all related data (in correct order to respect foreign key constraints)
      
      // Delete match player stats for all matches in this group
      if (matchIds.length > 0) {
        for (const matchId of matchIds) {
          await db.delete(MatchPlayerStats).where(eq(MatchPlayerStats.matchId, matchId));
        }

        // Delete player matches for all matches in this group
        for (const matchId of matchIds) {
          await db.delete(PlayerMatches).where(eq(PlayerMatches.matchId, matchId));
        }

        // Delete all matches in this group
        await db.delete(Match).where(eq(Match.groupId, input.groupId));
      }

      // Delete all user-group relationships
      await db.delete(UserGroup).where(eq(UserGroup.groupId, input.groupId));

      // Step 5: Finally, delete the group itself
      await db.delete(Group).where(eq(Group.id, input.groupId));

      return {
        success: true,
        message: "Group and all related data successfully deleted!"
      };
    } catch (error) {
      console.error("Error deleting group: ", error);
      return { 
        success: false, 
        error: ["An error occurred while deleting the group"] 
      };
    }
  },
});