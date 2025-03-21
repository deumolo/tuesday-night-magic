import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, Deck, eq } from "astro:db";

export const getDeckDetails = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {

      const deckId = input.deckId;

      const deck = await db
        .select({
          id: Deck.id,
          name: Deck.name,
          moxfieldLink: Deck.moxfieldLink,
          userId: Deck.userId,
          createdAt: Deck.createdAt,
        })
        .from(Deck)
        .where(eq(Deck.id, deckId));

      return {
        success: true,
        deck: deck[0],
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
