import Hashids from "hashids";
import { HASH_ID_SALT } from "../configs/serverConfig.js";
const hashids = new Hashids(HASH_ID_SALT);
const hashIdEncode = (id) => hashids.encode(id, 10);
const hashIdDecode = (id) => hashids.decode(id)[0];
const hashIdUtil = { hashIdEncode, hashIdDecode };
export default hashIdUtil;
