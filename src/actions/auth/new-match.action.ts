import { defineAction } from "astro:actions";
import { z } from "astro:schema";

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

      interface Player {
        kills: Array<{ commanderDamage?: string; [key: string]: any }>;
        [key: string]: any;
      }

      // Initialize groupedData with the desired structure
      const groupedData: {
        group: string | null;
        turns: string | null;
        winner: string | null;
        players: Player[];
      } = {
        group: null, // Default value; can be updated later
        turns: null, // Default value; can be updated later
        winner: null, // Default value; can be updated later
        players: [] as Player[], // Array to hold player objects
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

          // Handle kill items
          let newKillItem = groupedData.players[playerIndex].kills.pop() || {};
          newKillItem = { ...newKillItem, [key]: value };

          if (key === "commanderDamage") {
            groupedData.players[playerIndex].kills.push(newKillItem);
          } else {
            groupedData.players[playerIndex].kills.push(newKillItem);
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
            groupedData.players[playerIndex][key] = value;
          }
        } else {
          // Handle global keys outside playerList
          if (name === "group" || name === "turns" || name === "winner") {
            groupedData[name] = value.toString();
          }
        }
      }

      console.log("Grouped data: ", groupedData);

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
