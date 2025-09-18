import Role from "../models/role.js";
const data = [
  {
    name: "admin",
    is_root: true,
  },
  {
    name: "clint",
    is_root: true,
  },
];
export default async function roleSeed() {
  await Role.bulkCreate(data);
}
