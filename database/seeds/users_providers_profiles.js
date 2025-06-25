import UserProvidersProfiles from "../models/onlyToSeed_users_providers_profiles.js";
const data = [
  { userId: 1, providersProfileId: 3 },
  { userId: 1, providersProfileId: 4 },
  { userId: 1, providersProfileId: 5 },
  { userId: 1, providersProfileId: 1 },
  { userId: 2, providersProfileId: 4 },
  { userId: 3, providersProfileId: 3 },
  { userId: 2, providersProfileId: 2 },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function UserProvidersProfilesSeed() {
  await UserProvidersProfiles.bulkCreate(data);
}
