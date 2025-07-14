import Policy from "../models/policy.js";
import {
  userPolicyTemplate,
  businessPolicyTemplate,
  providerPolicyTemplate,
} from "../templates.js";
const data = [
  { userId: 1, policy: userPolicyTemplate },
  { businessProfileId: 2, policy: businessPolicyTemplate },
  { providersProfileId: 3, policy: providerPolicyTemplate },
];
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default async function policySeed() {
  await Policy.bulkCreate(data);
}
