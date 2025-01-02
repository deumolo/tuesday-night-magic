import { LibsqlError } from "@libsql/client";
import { ActionInputError } from "astro:actions";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Group, User } from "astro:db";
import bcrypt from "bcryptjs";
import { v4 as UUID } from "uuid";

export const createGroup = defineAction({
  accept: "form",
  input: z.discriminatedUnion("privateGroup", [
    z.object({
      // Matches when the `private` field has the value `false`
      privateGroup: z.literal("false"),
      name: z.string(),
    }),
    z.object({
      // Matches when the `private` field has the value `true`
      privateGroup: z.literal("true"),
      name: z.string(),
      password: z.string().min(4),
    }),
  ]),

  handler: async (input, { cookies }) => {
    try {
      const newGroup = {
        id: UUID(),
        name: input.name,
        private: input.privateGroup === "true",
        password: input.privateGroup === "true" ? input.password : null,
      };

      await db.insert(Group).values(newGroup);
    } catch (error) {
      return {
        success: false,
        error: "Email already exists. Please use a different email address.",
      };
    }
  },
});
