import { db, Group, User, Deck, UserGroup } from "astro:db";
import { v4 as UUID } from "uuid";
import bcrypt from "bcryptjs";

export default async function () {
  // Create specific group and 2 additional random groups
  const specificGroupId = "7925041a-6723-41ce-94d0-3ee312630078";
  const group2Id = UUID();
  const group3Id = UUID();

  const groups = [
    {
      id: specificGroupId,
      name: "Admin Test Group",
      description: "Special group with admin user",
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

  // Create specific user and 3 additional players
  const specificUserId = "7925041a-6723-41ce-94d0-3ee312630078";
  const user2Id = UUID();
  const user3Id = UUID();
  const user4Id = UUID();

  const users = [
    {
      id: specificUserId,
      name: "Admin User",
      email: "admin@magic.com",
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
    // Admin user is admin of the specific group
    { 
      id: UUID(),
      userId: specificUserId, 
      groupId: specificGroupId,
      administrator: "true"
    },
    
    // Sarah is in Casual Planeswalkers and Commander Crew
    { 
      id: UUID(),
      userId: user2Id, 
      groupId: group2Id,
      administrator: null
    },
    { 
      id: UUID(),
      userId: user2Id, 
      groupId: group3Id,
      administrator: null
    },
    
    // Mike is only in Casual Planeswalkers and Commander Crew
    { 
      id: UUID(),
      userId: user3Id, 
      groupId: group2Id,
      administrator: null
    },
    { 
      id: UUID(),
      userId: user3Id, 
      groupId: group3Id,
      administrator: null
    },
    
    // Luna is only in Admin Test Group (new player)
    { 
      id: UUID(),
      userId: user4Id, 
      groupId: specificGroupId,
      administrator: null
    }
  ];

  // Insert all the data
  await db.insert(Group).values(groups);
  await db.insert(User).values(users);
  await db.insert(UserGroup).values(userGroups);

  console.log("✅ Seed data created successfully!");
  console.log(`📊 Created ${groups.length} groups, ${users.length} users, and ${userGroups.length} group memberships`);
}
