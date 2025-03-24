import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, User } from "astro:db";

export const getUsers = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {
      const users = await db.select().from(User);

      return {
        success: true,
        users: users,
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
});
