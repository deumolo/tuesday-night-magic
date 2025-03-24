import { LibsqlError } from "@libsql/client";
import { defineAction } from "astro:actions";
import { db, User, UserGroup, Group, Deck, inArray, eq } from "astro:db";
import { v4 as UUID } from "uuid";

export const getMatchInfo = defineAction({
  accept: "json",
  handler: async (input, { cookies }) => {
    try {

      // await createSampleData();
      // await addUserToMyGroup("0bc17adb-8adc-4f20-b340-46ff967fc7ee");
      // addMeToGroup("6951a942-2f6b-4dcf-a4ad-6bd63828fc77", "94f503b1-66d6-4f40-a216-8feec3711829");
      
      // Step 1: Get all groups the user is in
      const userGroups = await db
        .select()
        .from(UserGroup)
        .where(eq(UserGroup.userId, input.userId));

      const groupIds = userGroups.map((ug) => ug.groupId);

      if (groupIds.length === 0) return [];

      // Step 2: Get group details
      const groups = await db
        .select()
        .from(Group)
        .where(inArray(Group.id, groupIds));

      // Step 3: Get all user-group memberships for those groups
      const groupUsers = await db
        .select()
        .from(UserGroup)
        .where(inArray(UserGroup.groupId, groupIds));

      const userIds = [...new Set(groupUsers.map((gu) => gu.userId))];

      // Step 4: Get user info
      const users = await db
        .select()
        .from(User)
        .where(inArray(User.id, userIds));

      // Step 5: Get all decks for those users
      const decks = await db
        .select()
        .from(Deck)
        .where(inArray(Deck.userId, userIds));

      // Step 6: Shape the data
      const finalData = groups.map((group) => ({
        id: group.id,
        name: group.name,
        users: users
          .filter((user) =>
            groupUsers.some(
              (gu) => gu.groupId === group.id && gu.userId === user.id
            )
          )
          .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            decks: decks.filter((deck) => deck.userId === user.id),
          })),
      }));

      console.dir(finalData, { depth: null });


      return {
        success: true,
        groups: finalData,
      };
    } catch (error) {
      console.error("Error: ", error);
    }
  },
}); 

const createSampleData = async () => {
  const newUserId = UUID();
  const newGroupId = UUID();
  
  await createUser(newUserId, "User1", "user1@gmail.com","123");
  await createGroup(newGroupId, "Group1", newUserId);
  await createUserGroup(newUserId, newGroupId);
  await createDeck("DeckName1", "https://moxfield.com/decks/7gBoTtuLHUy2yM1VUs-2Vw", newUserId);  
  await createDeck("DeckName2", "https://moxfield.com/decks/7gBoTtuLHUy2yM1VUs-2Vw", newUserId);  
  await createDeck("DeckName3", "https://moxfield.com/decks/7gBoTtuLHUy2yM1VUs-2Vw", newUserId); 
  
  const newUserId2 = UUID();
  await createUser(newUserId2, "User2", "user2@gmail.com","123");
  await createUserGroup(newUserId2, newGroupId);
  await createDeck("DeckName2-1", "https://moxfield.com/decks/7gBoTtuLHUy2yM1VUs-2Vw", newUserId2);  
  await createDeck("DeckName2-2", "https://moxfield.com/decks/7gBoTtuLHUy2yM1VUs-2Vw", newUserId2);  
  await createDeck("DeckName2-3", "https://moxfield.com/decks/7gBoTtuLHUy2yM1VUs-2Vw", newUserId2); 


}

const addUserToMyGroup = async (groupId : string) => {
  const newUserId = UUID();
  await createUser(newUserId, "User4", "user4wdd@gmail.com","123");
  await createDeck("DeckName-user4", "https://moxfield.com/decks/7gBoTtuLHUy2yM1VUs-2Vw", newUserId);
  await createUserGroup(newUserId, groupId);
}

const addMeToGroup = async (groupId : string, userId : string) => {
  await createUserGroup(userId, groupId);
}

const createUser = async (id : string, name: any, email: any, password: any) => {
  await db.insert(User).values({
    id,
    name,
    email,
    password
  });    
}

const createGroup = async (id : string, name: any, password: any) => {
  await db.insert(Group).values({
    id,
    name,
    password
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