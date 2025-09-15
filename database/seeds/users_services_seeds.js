import UserServices from "../models/user_service.js";
const data = [
  { user_id: 1, service_id: 3, type: "requested" },
  { user_id: 1, service_id: 3, type: "favorite" },
  { user_id: 1, service_id: 4, type: "favorite" },
  { user_id: 1, service_id: 5, type: "requested" },
  { user_id: 1, service_id: 1, type: "requested" },
  { user_id: 2, service_id: 4, type: "favorite" },
  { user_id: 3, service_id: 3, type: "favorite" },
  { user_id: 2, service_id: 2, type: "favorite" },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function userServicesSeed() {
  await UserServices.bulkCreate(data);
}
