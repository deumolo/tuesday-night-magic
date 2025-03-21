import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Deck, eq } from "astro:db";
import { v4 as UUID } from "uuid";

const deckSchema = z.object({
  name: z.string().nonempty("Deck name is required"),
  privateDeck: z.boolean(),
  moxfieldLink: z.string().nonempty("Moxfield link is required"),
  userId: z.string().nonempty("User id is required"),
});

export const editDeck = defineAction({
  accept: "form",
  handler: async (input, { request, cookies }) => {
    try {
      const formData = await request.formData();

      const newDeck = {
        id: UUID(),
        name: formData.get("name") as string,
        privateDeck: formData.get("privateDeck") === "true",
        moxfieldLink: formData.get("moxfieldLink") as string,
        userId: formData.get("userId") as string,
      };

      deckSchema.parse(newDeck);

      const deckId = formData.get("deckId") as string;

      const test = await db
        .update(Deck)
        .set({
          name: newDeck.name,
          moxfieldLink: newDeck.moxfieldLink,
        })
        .where(eq(Deck.id, deckId));

      return {
        success: true,
        // data: newDeck,
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
