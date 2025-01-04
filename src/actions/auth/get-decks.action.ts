import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, Deck, User, UserGroup, Group, eq } from "astro:db";

export const getDecks = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {
      const groupId = "234234234234";
      const decks = await db
        .select({
          deckId: Deck.id,
          name: User.name,
          deckName: Deck.name,
          private: Deck.private,
          moxfieldLink: Deck.moxfieldLink,
          createdAt: Deck.createdAt,
          userId: Deck.userId,
        })
        .from(Deck)
        .innerJoin(User, eq(User.id, Deck.userId))
        .innerJoin(UserGroup, eq(UserGroup.userId, User.id))
        .innerJoin(Group, eq(Group.id, UserGroup.groupId))
        .where(eq(UserGroup.groupId, groupId));

        console.log(decks);

      return {
        success: true,
        decks
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
