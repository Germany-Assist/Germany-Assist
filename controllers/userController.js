import db from "../database/dbIndex.js";
export const createNewUser = async () => {
  const tempUser = {
    firstName: "test",
  };
  const x = await db.User.create(tempUser);
  return x ? true : null;
};
export const fetchUsers = async () => {
  const x = await db.User.findAll();
  return x ? x : null;
};
