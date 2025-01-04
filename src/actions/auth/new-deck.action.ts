import { LibsqlError } from "@libsql/client";
import { ActionInputError } from "astro:actions";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, User, Deck } from "astro:db";
import bcrypt from "bcryptjs";
import { v4 as UUID } from "uuid";

export const createDeck = defineAction({
  accept: "form",

  input: z.object({
    name: z.string(),
    privateDeck: z.string(),
    moxfieldLink: z.string(),
    userId: z.string(),
  }),

  handler: async ({ name, privateDeck, moxfieldLink, userId }, { cookies }) => {
    try {
      const newDeck = {
        id: UUID(),
        name,
        private: privateDeck === "true",
        moxfieldLink,
        userId: userId,
      };

      console.log(newDeck);

      await db.insert(Deck).values(newDeck);

      return {
        success: true,
        data: newDeck,
      };
    } catch (error) {
      console.log("server error: ", error);
      return {
        success: false,
        error: "Email already exists. Please use a different email address.",
      };
    }
  },
});
