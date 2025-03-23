import { LibsqlError } from "@libsql/client";
import { ActionInputError } from "astro:actions";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Group } from "astro:db";
import bcrypt from "bcryptjs";
import { v4 as UUID } from "uuid";

const deckSchema = z.object({
  name: z.string().nonempty("Group name is required"),
  password: z.string().nonempty("Group password required"),
  userId: z.string().nonempty("User id is required"),
});

export const createGroup = defineAction({
  accept: "form",
  handler: async (input, { request, cookies }) => {
    try {
      const formData = await request.formData();

      const newGroup = {
        id: UUID(),
        name: formData.get("name") as string,
        password: formData.get("password") as string,
        userId: formData.get("userId") as string,
      };

      deckSchema.parse(newGroup);

      await db.insert(Group).values(newGroup);

      return {
        success: true,
        data: newGroup,
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
