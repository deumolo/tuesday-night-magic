import { defineDb, defineTable, column } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    password: column.text(),
    createdAt: column.date({ default: new Date() }),
  },
});

const Group = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    name: column.text(),
    public: column.boolean({ default: true }),
    password: column.text({ optional: true }),
    createdAt: column.date({ default: new Date() }),
  },
});

const Deck = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    name: column.text(),
    moxfieldLink: column.text(),
    player: column.text({ references: () => User.columns.id }),
    createdAt: column.date({ default: new Date() }),
  },
});

const Match = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    group: column.text({ references: () => Group.columns.id }),
    winner: column.text({ references: () => User.columns.id }),
    createdAt: column.date({ default: new Date() }),
  },
});

const UserGroup = defineTable({
  columns: {
    userId: column.text({ references: () => User.columns.id }),
    groupId: column.text({ references: () => Group.columns.id }),
    role: column.text({ optional: true }),
    createdAt: column.date({ default: new Date() }),
  },
});

const MatchPlayerStats = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    matchId: column.text({ references: () => Match.columns.id }),
    playerId: column.text({ references: () => User.columns.id }),
    opponentId: column.text({ references: () => User.columns.id }),
    killed: column.boolean({ default: false }),
    killedWithCommanderDamage: column.boolean({ default: false }),
    createdAt: column.date({ default: new Date() }),
  },
});

export default defineDb({
  tables: {
    User,
    Group,
    Deck,
    Match,
    UserGroup,
    MatchPlayerStats,
  },
});
