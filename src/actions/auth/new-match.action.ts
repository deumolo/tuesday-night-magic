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

      const groupedData: { [key: string]: any } = {};

      for (let [name, value] of formData.entries()) {
        const match = name.match(/^playerList\[(\d+)](?:\[(.*?)])?$/);
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
      
          let newKillItem = groupedData[playerIndex]["kills"].pop() || {};
          newKillItem = { ...newKillItem, [key]: value };
      
          if (key === "commanderDamage") {
            groupedData[playerIndex]["kills"].push(newKillItem);
            newKillItem = {};
          } else {
            groupedData[playerIndex]["kills"].push(newKillItem);
          }
        } else if (match) {
          const playerIndex = match[1];
          const key = match[2];
      
          if (!groupedData[playerIndex]) {
            groupedData[playerIndex] = {};
          }
      
          groupedData[playerIndex][key] = value;
        } else {
          groupedData[name] = value;
        }
      }

      console.log("Grouped data: ", groupedData)

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
