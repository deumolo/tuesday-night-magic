import { LibsqlError } from "@libsql/client";
import { ActionInputError } from "astro:actions";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, User } from "astro:db";
import bcrypt from "bcryptjs";
import { v4 as UUID } from "uuid";

export const registerUser = defineAction({
  accept: "form",

  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  }),

  handler: async ({ name, email, password, confirmPassword }, { cookies }) => {
    try {
      if (password !== confirmPassword) {
        return {
          success: false,
          error: "Password and confirm password do not match",
        };
      }

      const newUser = {
        id: UUID(),
        name,
        email,
        password: bcrypt.hashSync("1234"),
      };

      await db.insert(User).values(newUser);

      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      if (
        error instanceof LibsqlError &&
        (error as Error).message.includes(
          "UNIQUE constraint failed: User.email"
        )
      ) {
        return {
          success: false,
          error: "Email already exists. Please use a different email address.",
        };
      }
    }
  },
});
