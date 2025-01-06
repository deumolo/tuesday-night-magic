import { db, Group, User, Deck, UserGroup } from "astro:db";
import { v4 as UUID } from "uuid";

export default async function () {
  await db.insert(Group).values([
    { id: "123123123123", name: "Kasim", private: false, password: "1234" },
    { id: "234234234234", name: "Tarkin", private: false, password: "1234" },
    { id: "345345345345", name: "Innistrad", private: false, password: "1234" },
    { id: "456456456456", name: "Starwars", private: false, password: "1234" },
  ]);

  await db.insert(User).values([
    {
      id: "123123123123",
      name: "Daniel Moreno",
      email: "dmoreno@gmail.com",
      password: "1234",
    },
    {
      id: "234234234234",
      name: "Ricardo Luna",
      email: "rluna@gmail.com",
      password: "1234",
    },
    {
      id: "345345345345",
      name: "Guillermo Silva",
      email: "gsilva@gmail.com",
      password: "1234",
    },
    {
      id: "456456456456",
      name: "Alejandro Silva",
      email: "asilva@gmail.com",
      password: "1234",
    },
  ]);

  await db.insert(Deck).values([
    {
      id: UUID(),
      name: "Spirit Squadron",
      private: false,
      moxfieldLink: "https://www.moxfield.com/decks/uWMGmVENH0C23PgHZxIQ0Q",
      userId: "123123123123",
    },
    {
      id: UUID(),
      name: "Dogmeat",
      private: false,
      moxfieldLink: "https://www.moxfield.com/decks/uWMGmVENH0C23PgHZxIQ0Q",
      userId: "123123123123",
    },
    {
      id: UUID(),
      name: "Jinnie Faye",
      private: false,
      moxfieldLink: "https://www.moxfield.com/decks/uWMGmVENH0C23PgHZxIQ0Q",
      userId: "234234234234",
    },
  ]);

  await db.insert(UserGroup).values([
    { userId: "123123123123", groupId: "234234234234" },
    { userId: "234234234234", groupId: "234234234234" },
    { userId: "345345345345", groupId: "234234234234" },
    { userId: "456456456456", groupId: "234234234234" },
  ]);
}
