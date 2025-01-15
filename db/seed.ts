import { db, Group, User, Deck, UserGroup } from "astro:db";
import { v4 as UUID } from "uuid";

const group1id = UUID();
const group2id = UUID();
const group3id = UUID();
const group4id = UUID();

const user1id = UUID();
const user2id = UUID();
const user3id = UUID();
const user4id = UUID();

export default async function () {
  await db.insert(Group).values([
    { id: group1id, name: "Kasim", private: false, password: "1234" },
    { id: group2id, name: "Tarkin", private: false, password: "1234" },
    { id: group3id, name: "Innistrad", private: false, password: "1234" },
    { id: group4id, name: "Starwars", private: false, password: "1234" },
  ]);

  await db.insert(User).values([
    {
      id: user1id,
      name: "Daniel Moreno",
      email: "dmoreno@gmail.com",
      password: "1234",
    },
    {
      id: user2id,
      name: "Ricardo Luna",
      email: "rluna@gmail.com",
      password: "1234",
    },
    {
      id: user3id,
      name: "Guillermo Silva",
      email: "gsilva@gmail.com",
      password: "1234",
    },
    {
      id: user4id,
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
      userId: user1id,
    },
    {
      id: UUID(),
      name: "Dogmeat",
      private: false,
      moxfieldLink: "https://www.moxfield.com/decks/uWMGmVENH0C23PgHZxIQ0Q",
      userId: user1id,
    },
    {
      id: UUID(),
      name: "Jinnie Faye",
      private: false,
      moxfieldLink: "https://www.moxfield.com/decks/uWMGmVENH0C23PgHZxIQ0Q",
      userId: user2id,
    },
  ]);

  await db.insert(UserGroup).values([
    { userId: user1id, groupId: group1id },
    { userId: user2id, groupId: group1id },
    { userId: user3id, groupId: group1id },
    { userId: user4id, groupId: group1id },
  ]);
}
