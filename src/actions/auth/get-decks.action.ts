import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, Deck, User, UserGroup, Group, eq } from "astro:db";

export const getDecks = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {
      const firstGroup = await db.select({
        id: Group.id,
      }).from(Group).limit(1).execute();

      const groupId = firstGroup[0].id;

      console.log("groupId: ", groupId);

      const decks = await db
        .select({
          deckId: Deck.id,
          name: User.name,
          deckName: Deck.name,
          private: Deck.privateDeck,
          moxfieldLink: Deck.moxfieldLink,
          createdAt: Deck.createdAt,
          userId: Deck.userId,
        })
        .from(Deck)
        .innerJoin(User, eq(User.id, Deck.userId))
        .innerJoin(UserGroup, eq(UserGroup.userId, User.id))
        .innerJoin(Group, eq(Group.id, UserGroup.groupId))
        .where(eq(UserGroup.groupId, groupId));

      return {
        success: true,
        decks
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
