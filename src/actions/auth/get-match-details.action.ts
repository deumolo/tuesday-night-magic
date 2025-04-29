import { defineAction } from "astro:actions";
import {
  db,
  eq,
  Group,
  Match,
  MatchPlayerStats,
  PlayerMatches,
  User,
  and,
  alias,
} from "astro:db";

interface PlayerData {
  player: string;
  commanderTax: number;
  opponents: Array<{ opponent: string; commanderDamage: boolean }>;
}

interface MatchData {
  group: string;
  turns: number;
  winner: string;
  players: PlayerData[];
}

export const getMatchDetails = defineAction({
  accept: "json",
  handler: async (input) => {
    try {
      // Define aliases to prevent duplicate "User" references
      const Winner = alias(User, "Winner");
      const Player = alias(User, "Player");
      const Opponent = alias(User, "Opponent");

      const results = await db
        .select({
          matchId: Match.id,
          groupName: Group.name,
          turns: Match.turns,
          winnerName: Winner.name,
          playerId: PlayerMatches.playerId,
          playerName: Player.name,
          commanderTax: MatchPlayerStats.killedWithCommanderDamage,
          opponentId: MatchPlayerStats.opponentId,
          opponentName: Opponent.name,
          commanderDamage: MatchPlayerStats.killedWithCommanderDamage,
        })
        .from(Match)
        .innerJoin(Group, eq(Match.groupId, Group.id)) // Get Group Name
        .innerJoin(Winner, eq(Match.winnerId, Winner.id)) // Get Winner Name
        .innerJoin(PlayerMatches, eq(Match.id, PlayerMatches.matchId)) // Get Players in Match
        .innerJoin(Player, eq(PlayerMatches.playerId, Player.id)) // Get Player Names
        .leftJoin(
          MatchPlayerStats,
          and(
            eq(MatchPlayerStats.matchId, Match.id),
            eq(MatchPlayerStats.playerId, PlayerMatches.playerId)
          )
        ) // Get Match Stats (Commander Damage, Opponent ID)
        .leftJoin(Opponent, eq(MatchPlayerStats.opponentId, Opponent.id)) // Get Opponent Names
        .where(eq(Match.id, input.matchId));

      if (results.length === 0) {
        return { success: false, error: "Match not found" };
      }

      // 🛠 Transform Data to Match the Expected Format
      const matchData: MatchData = {
        group: results[0].groupName,
        turns: results[0].turns ?? 0,
        winner: results[0].winnerName,
        players: [],
      };

      const playersMap = new Map();

      for (const row of results) {
        if (!playersMap.has(row.playerId)) {
          playersMap.set(row.playerId, {
            player: row.playerName,
            commanderTax: row.commanderTax || 0,
            opponents: [],
          });
        }

        const playerData = playersMap.get(row.playerId);

        // Ensure opponents are unique using a Set
        const opponentKey = `${row.opponentId}-${row.commanderDamage}`;
        const existingOpponents = new Set(
          playerData.opponents.map(
            (o: { opponent: any; commanderDamage: any }) =>
              `${o.opponent}-${o.commanderDamage}`
          )
        );

        if (row.opponentId && !existingOpponents.has(opponentKey)) {
          playerData.opponents.push({
            opponent: row.opponentName,
            commanderDamage: Boolean(row.commanderDamage),
          });
        }
      }

      matchData.players = Array.from(playersMap.values());
      console.dir(matchData, { depth: null });

      return { success: true, match: matchData };
    } catch (error) {
      console.error("Error fetching match details:", error);
      return { success: false, error: "Database query failed" };
    }
  },
});
