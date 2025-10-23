// auth.config.ts
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { db, eq, User, UserGroup, Group } from "astro:db";
import { defineConfig } from "auth-astro";
import bcrypt from "bcryptjs";

declare module "@auth/core/types" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

export default defineConfig({
  secret: import.meta.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Add user info to Astro DB when they log in
      try {
        const newUserId = UUID();
        const newUser = {
          id: newUserId,
          name: user.name ?? "Anonymous User",
          email: user.email ?? "no-email",
          password: bcrypt.hashSync("adyvgre0g"),
        };

        const [dbUser] = await db
          .select()
          .from(User)
          .where(eq(User.email, user.email ?? ""))
          .limit(1);

        if (!dbUser) {
          // Insert the new user
          await db.insert(User).values(newUser);
          console.log(`✅ User added to Astro DB: ${user.email}`);
        } else {
          console.log(`👋 Existing user signed in: ${user.email}`);
        }
      } catch (error) {
        console.error("Error saving user:", error);
        return false; // Reject sign-in if DB insert fails
      }

      return true; // Allow sign-in
    },

    async jwt({ token, user }) {
      // If user just signed in, attach database ID to the token
      if (user) {
        const [dbUser] = await db
          .select()
          .from(User)
          .where(eq(User.email, user.email ?? ""))
          .limit(1);

        if (dbUser) {
          token.id = dbUser.id; // Store database user ID in the JWT
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Attach the database user ID from the JWT to the session
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});

function UUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
