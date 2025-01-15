import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Match, MatchPlayerStats, PlayerMatches } from "astro:db";
import { v4 as UUID } from "uuid";
import type { BatchItem } from "drizzle-orm/batch";

const killSchema = z.object({
  opponentId: z.string().nonempty("Opponent id is required"),
  commanderDamage: z.boolean(),
});

const playerSchema = z.object({
  kills: z.array(killSchema).optional(),
  playerId: z.string().nonempty("Player id is required"),
  deckId: z.string().optional(),
  commanderTax: z.number().optional(),
});

const matchSchema = z.object({
  groupId: z.string().nonempty("Group id is required"),
  turns: z.union([
    z.null(),
    z.number().min(1, { message: "Turns must be greater than 1" }),
  ]),
  winnerId: z.string().nonempty("Winner id is required"),
  players: z.array(playerSchema).min(1, "At least one player is required"),
});

export const newMatch = defineAction({
  accept: "form",
  handler: async (input, { request, cookies }) => {
    try {
      const formData = await request.formData();

      console.log(input);

      interface Player {
        kills: Array<{ commanderDamage: boolean; opponentId: string }>;
        [key: string]: any;
      }

      // Initialize groupedData with the desired structure
      const groupedData: {
        groupId: string | null;
        turns: number | null;
        winnerId: string | null;
        players: Player[];
      } = {
        groupId: null,
        turns: null,
        winnerId: null,
        players: [] as Player[],
      };

      for (let [name, value] of formData.entries()) {
        const match = name.match(/^playerList\[(\d+)](?:\[(.*?)])?$/);
        const matchkill = name.match(/playerList\[(\d+)\]\[(\d+)\]\[(.+)\]/);

        if (matchkill) {
          const playerIndex = parseInt(matchkill[1], 10); // Convert index to a number
          const key = matchkill[3];

          // Ensure players array has an object at playerIndex
          if (!groupedData.players[playerIndex]) {
            groupedData.players[playerIndex] = { kills: [] };
          }

          // Add a new kill item or update the last one based on the key
          const killItemIndex = parseInt(matchkill[2], 10); // Get the kill index
          if (!groupedData.players[playerIndex].kills[killItemIndex]) {
            groupedData.players[playerIndex].kills[killItemIndex] = {};
          }

          if (key === "commanderDamage") {
            groupedData.players[playerIndex].kills[killItemIndex][key] =
              value === "true";
          } else {
            groupedData.players[playerIndex].kills[killItemIndex][key] = value;
          }
        } else if (match) {
          const playerIndex = parseInt(match[1], 10); // Convert index to a number
          const key = match[2];

          // Ensure players array has an object at playerIndex
          if (!groupedData.players[playerIndex]) {
            groupedData.players[playerIndex] = { kills: [] };
          }

          // Assign other properties to the player object
          if (key) {
            if (key == "commanderTax") {
              groupedData.players[playerIndex][key] = +value;
            } else {
              groupedData.players[playerIndex][key] = value;
            }
          }
        } else {
          if (name === "turns") {
            if (value === "") {
              groupedData[name] = null;
            } else {
              groupedData[name] = +value;
            }
          } else {
            // Handle global keys outside playerList
            groupedData[name] = value;
          }
        }
      }

      console.log(groupedData);
      console.log(JSON.stringify(groupedData));
      matchSchema.parse(groupedData);

      const queries: BatchItem<"sqlite">[] = [];
      const newMatchId = UUID();

      const newMatch = await db.insert(Match).values({
        id: newMatchId,
        groupId: groupedData.groupId ?? "",
        turns: groupedData.turns,
        winnerId: groupedData.winnerId ?? "",
      });

      console.log(JSON.stringify(newMatch));

      for (const player of groupedData.players) {
        queries.push(
          db.insert(PlayerMatches).values({
            id: UUID(),
            playerId: player.playerId ?? "",
            matchId: newMatchId,
          })
        );
      }

      if (queries.length > 0) {
        await db.batch([queries[0], ...queries.slice(1)]);
      }

      return { success: true, message: groupedData };
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log(err);
        return { success: false, error: err.errors };
      }

      console.log(err);

      return { success: false, error: ["Unknown error occurred"] };
    }
  },
});
