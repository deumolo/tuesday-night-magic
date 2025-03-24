import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Deck, eq } from "astro:db";

const deckSchema = z.object({
  deckId: z.string().nonempty("Deck id is required"),
});

export const deleteDeck = defineAction({
  accept: "json",
  handler: async (input, { request, cookies }) => {
    try {
      const deckToDelete = {
        deckId: input.deckId,
      };

      deckSchema.parse(deckToDelete);

      await db.delete(Deck).where(eq(Deck.id, input.deckId));

      return {
        success: true,
      };
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
