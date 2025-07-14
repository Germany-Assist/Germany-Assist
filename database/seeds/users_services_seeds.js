import UserServices from "../models/onlyToSeed_users_services.js";
const data = [
  { userId: 1, serviceId: 3, type: "requested" },
  { userId: 1, serviceId: 3, type: "favourite" },
  { userId: 1, serviceId: 4, type: "favourite" },
  { userId: 1, serviceId: 5, type: "requested" },
  { userId: 1, serviceId: 1, type: "requested" },
  { userId: 2, serviceId: 4, type: "favourite" },
  { userId: 3, serviceId: 3, type: "favourite" },
  { userId: 2, serviceId: 2, type: "favourite" },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function userServicesSeed() {
  await UserServices.bulkCreate(data);
}
