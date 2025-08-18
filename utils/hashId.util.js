import Hashids from "hashids";
import { HASH_ID_SALT } from "../configs/serverConfig.js";
const hashids = new Hashids(HASH_ID_SALT);

export const hashIdEncode = (id) => hashids.encode(id, 10);
export const hashIdDecode = (id) => hashids.decode(id)[0];
export default { hashIdEncode, hashIdDecode };
