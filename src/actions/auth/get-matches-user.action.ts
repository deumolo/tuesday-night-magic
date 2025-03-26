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
  exists,
  and,
} from "astro:db";

interface MatchData {
  matchId: string;
  groupId: string;
  turns: number;
  createdAt: Date;
  participants: { playerId: string; name: string; email: string }[];
  winnerId: string;
}

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
          winnerId: Match.winnerId,
        })
        .from(Match)
        .innerJoin(PlayerMatches, eq(PlayerMatches.matchId, Match.id))
        .innerJoin(User, eq(PlayerMatches.playerId, User.id))
        .where(
          exists(
            db
              .select()
              .from(PlayerMatches)
              .where(
                and(
                  eq(PlayerMatches.matchId, Match.id),
                  eq(PlayerMatches.playerId, input.userId)
                )
              )
          )
        );

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
            winnerId: match.winnerId,
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

      const formattedMatchesV2 = formattedMatches.map((match) => {
        const { winnerId, ...rest } = match; 
        return {
          ...rest,
          winner: {
            winnerId: match.winnerId,
            winnerName: match.participants.find(
              (p) => p.playerId === match.winnerId
            )?.name,
          },
        };
      });

      return {
        success: true,
        matches: formattedMatchesV2,
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
