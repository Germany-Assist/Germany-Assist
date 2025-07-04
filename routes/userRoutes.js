import { Router } from "express";
import { createNewUser, fetchUsers } from "../controllers/userController.js";

export const userRouter = Router();

userRouter.post("/", async (req, res) => {
  const user = await createNewUser();
  if (user) {
    res.send("done");
  } else {
    res.send("opps");
  }
});
userRouter.get("/", async (req, res) => {
  const users = await fetchUsers();
  if (users) {
    res.send(users);
  } else {
    res.send("opps");
  }
});
