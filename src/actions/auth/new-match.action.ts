import { LibsqlError } from "@libsql/client";
import { ActionInputError } from "astro:actions";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, User, UserGroup } from "astro:db";
import bcrypt from "bcryptjs";
import { v4 as UUID } from "uuid";

const playerSchema = z.object({
  playerId: z.string().nonempty("Player ID is required"),
  deckId: z.string().optional(),
});

const matchSchema = z.object({
  turns: z.number().int().positive(),
  winner: z.string().nonempty("Winner is required"),
  // players: z.array(playerSchema).min(1, "At least one player is required"),
});

export const newMatch = defineAction({
  accept: "form",
  handler: async (input, { request, cookies }) => {
    try {
      const formData = await request.formData();
      console.log(formData);

      const groupedData: { [key: string]: any } = {};
      let newKillItem = {};
      let killItems = [];

      // Iterate over the FormData entries
      for (let [name, value] of formData.entries()) {
        const match = name.match(/^playerList\[(\d+)](?:\[(.*?)])?$/); // Regex to match player data
        const matchkill = name.match(/playerList\[(\d+)\]\[(\d+)\]\[(.+)\]/);

        if (matchkill) {
          const playerIndex = matchkill[1];
          const key = matchkill[3];

          if (!groupedData[playerIndex]) {
            groupedData[playerIndex] = {};
          }

          if (!groupedData[playerIndex]["kills"]) {
            groupedData[playerIndex]["kills"] = [];
          }

          newKillItem = {
            ...newKillItem,
            [key]: formData.get(name),
          };

          if (key === "commanderDamage") {
            // Push the kill to the player's kills array
            groupedData[playerIndex]["kills"].push(newKillItem);

            newKillItem = {}; // Reset newKillItem for the next kill
          }
        } else if (match) {
          const playerIndex = match[1]; // Extract player index
          const key = match[2]; // Extract key if available (e.g., playerId, deckId, etc.)

          if (!groupedData[playerIndex]) {
            groupedData[playerIndex] = {};
          }

          groupedData[playerIndex][key] = value;
        } else {
          // Handle non-player data
          groupedData[name] = value;
        }
      }

      console.log("groupedData: ", groupedData);
      console.log("groupedData kills: ", groupedData.kills);

      const turnsParsedNunber = Number(input.get("turns"));

      matchSchema.parse({
        turns: turnsParsedNunber,
        winner: input.get("winner"),
      });

      return { success: true, message: "Validation passed!" };
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
