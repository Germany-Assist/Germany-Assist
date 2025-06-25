import UserServices from "../models/onlyToSeed_users_services.js";
const data = [
  { userId: 1, serviceId: 3 },
  { userId: 1, serviceId: 4 },
  { userId: 1, serviceId: 5 },
  { userId: 1, serviceId: 1 },
  { userId: 2, serviceId: 4 },
  { userId: 3, serviceId: 3 },
  { userId: 2, serviceId: 2 },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function userServicesSeed() {
  await UserServices.bulkCreate(data);
}
