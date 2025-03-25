import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, User, Deck, Group, UserGroup, eq } from "astro:db";
import { v4 as UUID } from "uuid";

const testSchema = z.object({
  groupId: z.string().nonempty("Deck name is required"),
});

export const newSampleData = defineAction({
  accept: "json",
  handler: async (input, { request, cookies }) => {
    try {
      
      const newSchema = {
        groupId: input.groupId, 
      };

      testSchema.parse(newSchema);

      await createSampleData();
            
      console.log("Success");
    } catch (err) {
      console.log("Error: ", err);
    }
  },
});

const createSampleData = async () => {
  const createUserWithDecks = async (name: any, email: any, groupId: string, deckPrefix: any) => {
    const userId = UUID();
    await createUser(userId, name, email, "");
    await createUserGroup(userId, groupId);
    await Promise.all([1, 2, 3].map(num => createDeck(`${deckPrefix}-${num}`, `https://moxfield.com/decks/${UUID()}`, userId)));
    return userId;
  };

  const createGroupWithUsers = async (groupName: string, users: any[]) => {
    const groupId = UUID();
    await createGroup(groupId, groupName);
    await Promise.all(users.map(user => createUserWithDecks(user.name, user.email, groupId, user.deckPrefix)));
    return groupId;
  };

  const newGroupId = await createGroupWithUsers("Thursday group", [
    { name: "User1", email: "user1@gmail.com", deckPrefix: `Deck-${UUID().slice(0, 5)}` },
    { name: "User2", email: "user2@gmail.com", deckPrefix: `Deck-${UUID().slice(0, 5)}` }
  ]);

  const adminInfo = await db.select({ id: User.id }).from(User).where(eq(User.email, "deumolo@gmail.com"));
  await createUserGroup(adminInfo[0].id, newGroupId);

  const newGroupId2 = await createGroupWithUsers("Tuesday Group", [
    { name: "User3", email: "user3@gmail.com", deckPrefix: `Deck-${UUID().slice(0, 5)}` },
    { name: "User4", email: "user4@gmail.com", deckPrefix: `Deck-${UUID().slice(0, 5)}` }
  ]);

  await createUserGroup(adminInfo[0].id, newGroupId2);

  await Promise.all([
    1, 2, 3
  ].map(num => createDeck(`MyDeck-${num}`, `https://moxfield.com/decks/${UUID()}`, adminInfo[0].id)));
};


const createUser = async (id : string, name: any, email: any, password: any) => {
  await db.insert(User).values({
    id,
    name,
    email,
    password
  });    
}

const createGroup = async (id : string, name: any) => {
  await db.insert(Group).values({
    id,
    name,
    password: "password"
  });    
}

const createDeck = async (name: string, moxfieldLink: string, userId: string) => {
  await db.insert(Deck).values({
    id: UUID(),
    name,
    moxfieldLink,
    userId,
  });      
}

const createUserGroup = async (userId : string, groupId : string) => {
  await db.insert(UserGroup).values({
    id: UUID(),
    userId,
    groupId,
    administrator: "false",
  });    
}