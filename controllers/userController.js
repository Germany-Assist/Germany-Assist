import User from "../database/models/users.js";
export const createNewUser = async () => {
  const tempUser = {
    firstName: "test",
  };
  const x = await dbUser.create(tempUser);
  return x ? true : null;
};
export const fetchUsers = async () => {
  const x = await User.findAll();
  return x ? x : null;
};
