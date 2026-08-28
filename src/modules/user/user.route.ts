import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { createUser, getAllUsers } from "./controllers/user.controller.js";

import { createUserSchema } from "./validations/user.validation.js";

const router = Router();

router.get("/", getAllUsers);

router.post("/", validate(createUserSchema), createUser);

export default router;
