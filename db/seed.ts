import { db, Group, User, Deck, UserGroup } from "astro:db";
import { v4 as UUID } from "uuid";
import bcrypt from "bcryptjs";

export default async function () {
  // Create 3 random groups
  const group1Id = UUID();
  const group2Id = UUID();
  const group3Id = UUID();

  const groups = [
    {
      id: group1Id,
      name: "Tuesday Night Legends",
      description: "Weekly Magic gathering for competitive players",
      password: bcrypt.hashSync("123"),
    },
    {
      id: group2Id,
      name: "Casual Planeswalkers",
      description: "Friendly games and deck testing every weekend",
      password: bcrypt.hashSync("123"),
    },
    {
      id: group3Id,
      name: "Commander Crew",
      description: "EDH enthusiasts meeting for multiplayer mayhem",
      password: bcrypt.hashSync("123"),
    }
  ];

  // Create 4 players
  const user1Id = UUID();
  const user2Id = UUID();
  const user3Id = UUID();
  const user4Id = UUID();

  const users = [
    {
      id: user1Id,
      name: "Alex Thunder",
      email: "alex.thunder@magic.com",
      password: "$2b$10$hashedpassword1" // placeholder hashed password
    },
    {
      id: user2Id,
      name: "Sarah Lightning",
      email: "sarah.lightning@magic.com", 
      password: "$2b$10$hashedpassword2"
    },
    {
      id: user3Id,
      name: "Mike Flamestrike",
      email: "mike.flamestrike@magic.com",
      password: "$2b$10$hashedpassword3"
    },
    {
      id: user4Id,
      name: "Luna Moonbeam",
      email: "luna.moonbeam@magic.com",
      password: "$2b$10$hashedpassword4"
    }
  ];

  // Create user-group relationships (some users in multiple groups)
  const userGroups = [
    // Alex is in all three groups (very active player)
    { userId: user1Id, groupId: group1Id },
    { userId: user1Id, groupId: group2Id },
    { userId: user1Id, groupId: group3Id },
    
    // Sarah is in Tuesday Night Legends and Commander Crew
    { userId: user2Id, groupId: group1Id },
    { userId: user2Id, groupId: group3Id },
    
    // Mike is only in Casual Planeswalkers and Commander Crew
    { userId: user3Id, groupId: group2Id },
    { userId: user3Id, groupId: group3Id },
    
    // Luna is only in Tuesday Night Legends (new player)
    { userId: user4Id, groupId: group1Id }
  ];

  // Insert all the data
  await db.insert(Group).values(groups);
  await db.insert(User).values(users);
  await db.insert(UserGroup).values(userGroups);

  console.log("✅ Seed data created successfully!");
  console.log(`📊 Created ${groups.length} groups, ${users.length} users, and ${userGroups.length} group memberships`);
}
