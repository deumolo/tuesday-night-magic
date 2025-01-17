import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Match, MatchPlayerStats, PlayerMatches } from "astro:db";
import { v4 as UUID } from "uuid";
import type { BatchItem } from "drizzle-orm/batch";

const killSchema = z.object({
  opponentId: z
    .string()
    .nullable()
    .refine((val) => val !== null, {
      message: "Opponent id is required",
    }),
  commanderDamage: z.boolean(),
});

const playerSchema = z
  .object({
    kills: z.array(killSchema).optional(),
    playerId: z
      .string()
      .nullable()
      .refine((val) => val !== null, {
        message: "Player id is required",
      }),
    deckId: z.string().nullable().optional(),
    commanderTax: z.number().nullable(),
  })
  .refine(
    (player) => {
      if (!player.kills) return true; // If kills array is undefined, skip validation

      return player.kills.every((kill) => kill.opponentId !== player.playerId);
    },
    {
      message: "Player cannot kill themselves",
      path: ["kills"], // Point to the kills array for the error
    }
  );

const matchSchema = z.object({
  groupId: z
    .string()
    .nullable()
    .refine((val) => val !== null, {
      message: "Group id is required",
    }),
  turns: z.union([
    z.null(),
    z.number().min(1, { message: "Turns must be greater than 1" }),
  ]),
  winnerId: z
    .string()
    .nullable()
    .refine((val) => val !== null, {
      message: "Winner id is required",
    }),
  players: z.array(playerSchema).min(1, "At least one player is required"),
});

interface Player {
  id: string;
  [key: string | number]: any;
}

function transformFormData(formData: FormData) {
  let groupedData: {
    turns: number | null;
    winnerId: string | null;
    groupId: string | null;
    players: Player[];
  } = {
    turns: null,
    winnerId: null,
    groupId: null,
    players: [],
  };

  let playersMap: { [key: string]: any } = {};

  for (let [key, value] of formData.entries()) {
    let match = key.match(/^playerList\[([0-9a-fA-F-]+)](?:\[(.*?)])?$/);
    const matchkill = key.match(
      /playerList\[([0-9a-fA-F-]{36})]\[([0-9a-fA-F-]{36})]\[(.+)]/
    );

    if (matchkill) {
      let playerRowId = matchkill[1];
      let killRowId = matchkill[2];
      let property = matchkill[3];

      if (!playersMap[playerRowId].kills) {
        playersMap[playerRowId].kills = {};
      }

      if (!playersMap[playerRowId].kills[killRowId]) {
        playersMap[playerRowId].kills[killRowId] = {};
      }

      if (property === "commanderDamage") {
        playersMap[playerRowId].kills[killRowId][property] = "true" === value;
      } else {
        playersMap[playerRowId].kills[killRowId][property] =
          value === "" ? null : value;
      }
    } else if (match) {
      let playerRowId = match[1];
      let property = match[2];

      if (!playersMap[playerRowId]) {
        playersMap[playerRowId] = { id: playerRowId };
      }

      if (property === "commanderTax") {
        playersMap[playerRowId][property] = value == "" ? null : Number(value);
      } else {
        playersMap[playerRowId][property] = value === "" ? null : value;
      }
    } else {
      if (key === "winnerId") {
        groupedData.winnerId = value === "" ? null : (value as string);
      } else {
        if (key === "turns") {
          groupedData.turns = value === "" ? null : Number(value);
        } else if (key === "groupId") {
          groupedData.groupId = value === "" ? null : (value as string);
        }
      }
    }
  }

  // Convert kills object to an array for each player
  for (let playerId in playersMap) {
    if (playersMap[playerId].kills) {
      // Convert the kills object to an array
      playersMap[playerId].kills = Object.values(playersMap[playerId].kills);
    }
  }

  // Convert playersMap to an array
  groupedData.players = Object.values(playersMap);

  return groupedData;
}

export const newMatch = defineAction({
  accept: "form",
  handler: async (input, { request, cookies }) => {
    try {
      const formData = await request.formData();

      console.log(formData);
      // console.log(transformFormData(formData));
      // console.log(JSON.stringify(transformFormData(formData)));

      const groupedData = transformFormData(formData);
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

        if (player.kills) {
          for (const kill of player.kills) {
            queries.push(
              db.insert(MatchPlayerStats).values({
                id: UUID(),
                matchId: newMatchId,
                playerId: player.playerId,
                opponentId: kill.opponentId,
                killedWithCommanderDamage: kill.commanderDamage,
              })
            );
          }
        }
      }

      if (queries.length > 0) {
        await db.batch([queries[0], ...queries.slice(1)]);
      }

      return { success: true, data: groupedData };
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
