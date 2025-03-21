import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, Deck, User, UserGroup, Group, eq } from "astro:db";

export const getDecksUser = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {

      const firstGroup = await db.select({
        id: Group.id,
      }).from(Group).limit(1).execute();

      const groupId = firstGroup[0].id;

      const decks = await db
        .select({
          deckId: Deck.id,
          deckName: Deck.name,
          moxfieldLink: Deck.moxfieldLink,
          createdAt: Deck.createdAt,
        })
        .from(Deck)
        .innerJoin(User, eq(User.id, Deck.userId))
        .where(eq(User.id, input.userId))

      return {
        success: true,
        decks
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
