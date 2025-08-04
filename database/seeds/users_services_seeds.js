import UserServices from "../models/onlyToSeed_users_services.js";
const data = [
  { UserId: 1, ServiceId: 3, type: "requested" },
  { UserId: 1, ServiceId: 3, type: "favourite" },
  { UserId: 1, ServiceId: 4, type: "favourite" },
  { UserId: 1, ServiceId: 5, type: "requested" },
  { UserId: 1, ServiceId: 1, type: "requested" },
  { UserId: 2, ServiceId: 4, type: "favourite" },
  { UserId: 3, ServiceId: 3, type: "favourite" },
  { UserId: 2, ServiceId: 2, type: "favourite" },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function userServicesSeed() {
  await UserServices.bulkCreate(data);
}
