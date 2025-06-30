import UserBusinessProfiles from "../models/onlyToSeed_users_business_profiles.js";
const data = [
  { userId: 1, businessProfileId: 3 },
  { userId: 1, businessProfileId: 4 },
  { userId: 1, businessProfileId: 5 },
  { userId: 1, businessProfileId: 1 },
  { userId: 2, businessProfileId: 4 },
  { userId: 3, businessProfileId: 3 },
  { userId: 2, businessProfileId: 2 },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function UserBusinessProfilesSeed() {
  await UserBusinessProfiles.bulkCreate(data);
}
