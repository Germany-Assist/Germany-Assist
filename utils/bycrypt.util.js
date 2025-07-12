import bcrypt from "bcrypt";
const saltRounds = 10;

export function hashPassword(password) {
  const hash = bcrypt.hashSync(password, saltRounds);
  return hash;
}

export function hashCompare(password, hash) {
  const result = bcrypt.compareSync(password, hash);
  return result;
}
