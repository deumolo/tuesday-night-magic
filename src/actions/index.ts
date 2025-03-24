import {
  getDecksUser,
  getMatchesUser,
  getDeckDetails,
  getUsers,
  getDecks,
  getGroupsUser,
  newUser,
  createGroup,
  createDeck,
  newMatch,
  editDeck,
  deleteDeck,
} from "./auth";

export const server = {
  newUser,
  createGroup,
  createDeck,
  getUsers,
  getDecks,
  getGroupsUser,
  newMatch,
  getDecksUser,
  getMatchesUser,
  getDeckDetails,
  editDeck,
  deleteDeck,
};
