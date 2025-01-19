import { LibsqlError } from "@libsql/client";
import { ActionInputError } from "astro:actions";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, User, Deck } from "astro:db";
import bcrypt from "bcryptjs";
import { v4 as UUID } from "uuid";

const deckSchema = z.object({
  name: z.string().nonempty("Deck name is required"),
  privateDeck: z.boolean(),
  moxfieldLink: z.string().nonempty("Moxfield link is required"),
  userId: z.string().nonempty("User id is required"),
});

export const createDeck = defineAction({
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

      await db.insert(Deck).values(newDeck);

      return {
        success: true,
        data: newDeck,
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
