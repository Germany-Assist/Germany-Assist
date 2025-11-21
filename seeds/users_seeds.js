import { sequelize } from "../connection.js";
import User from "../models/user.js";
import UserRole from "../models/user_role.js";

const data = {
  first_name: "root",
  last_name: "root",
  email: "root@root.com",
  password: "$2b$10$YcCsWPYPnrHtcHeGycyvXuhpvjcTZg85aOnstJFBIXQdw6JfN2tXS",
  dob: new Date("2010-01-01"),
  is_verified: true,
  is_root: true,
};
export default async function seedUsers() {
  const t = await sequelize.transaction();
  const user = await User.create(data, { transaction: t });
  await UserRole.create(
    {
      user_id: user.id,
      role: "super_admin",
    },
    { transaction: t }
  );
  await t.commit();
}
