import bcrypt from "bcrypt";
const saltRounds = 10;
function hashPassword(password) {
  const hash = bcrypt.hashSync(password, saltRounds);
  return hash;
}
function hashCompare(password, hash) {
  const result = bcrypt.compareSync(password, hash);
  return result;
}
export default { hashPassword, hashCompare };
