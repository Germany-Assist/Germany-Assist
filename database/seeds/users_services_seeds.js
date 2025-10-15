import UserServices from "../models/favorite.js";
const data = [
  { user_id: 1, service_id: 3 },
  { user_id: 1, service_id: 3 },
  { user_id: 1, service_id: 4 },
  { user_id: 1, service_id: 5 },
  { user_id: 1, service_id: 1 },
  { user_id: 2, service_id: 4 },
  { user_id: 3, service_id: 3 },
  { user_id: 2, service_id: 2 },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function userServicesSeed() {
  await UserServices.bulkCreate(data);
}
