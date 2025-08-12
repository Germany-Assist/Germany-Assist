import Role from "../models/role.js";
const data = [
  {
    name: "admin",
    is_root: true,
    // representing_id:,
    // representing_type
  },
  {
    name: "clint",
    is_root: true,
    // representing_id:,
    // representing_type
  },
];
export default async function roleSeed() {
  await Role.bulkCreate(data);
}
