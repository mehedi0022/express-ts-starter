import { Router } from "express";

import userRoutes from "../modules/user/user.route.js";

const router = Router();

router.use("/users", userRoutes);

export default router;
