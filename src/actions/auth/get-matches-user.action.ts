import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import {
  db,
  Deck,
  User,
  UserGroup,
  Group,
  PlayerMatches,
  Match,
  eq,
  or,
} from "astro:db";

export const getMatchesUser = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {
      const matches = await db
        .select({
          matchId: Match.id,
          groupId: Match.groupId,
          turns: Match.turns,
          createdAt: Match.createdAt,
          playerId: PlayerMatches.playerId,
          userName: User.name,
          userEmail: User.email,
        })
        .from(Match)
        .innerJoin(PlayerMatches, eq(PlayerMatches.matchId, Match.id))
        .innerJoin(User, eq(PlayerMatches.playerId, User.id))
        .where(
          or(
            eq(PlayerMatches.playerId, input.userId),
            eq(Match.winnerId, input.userId)
          )
        );

        console.log("matches: ", matches);

      interface MatchData {
        matchId: string;
        groupId: string;
        turns: number;
        createdAt: Date;
        participants: { playerId: string; name: string; email: string }[];
      }

      const formattedMatches = matches.reduce<MatchData[]>((acc, match) => {
        // Check if match already exists in the accumulator
        let matchData = acc.find((m) => m.matchId === match.matchId);

        if (!matchData) {
          // If not, create a new entry for the match
          matchData = {
            matchId: match.matchId,
            groupId: match.groupId,
            turns: match.turns ?? 0,
            createdAt: match.createdAt,
            participants: [],
          };
          acc.push(matchData);
        }

        // Add player to the participants array
        matchData.participants.push({
          playerId: match.playerId,
          name: match.userName,
          email: match.userEmail,
        });

        return acc;
      }, []);

      console.log("formattedMatches: ", formattedMatches);

      return {
        success: true,
        matches: formattedMatches,
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
