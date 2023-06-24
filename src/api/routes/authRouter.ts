import { Router } from "express";

import { addUserToVerify, changePassword, userLogin, userVerification } from "../controllers/authController";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";

export const authRouter = Router();

authRouter.post('/signup', addUserToVerify);

authRouter.post('/verify', userVerification);

authRouter.post('/login', userLogin);

authRouter.put('/passwords', authorizationMiddleware, changePassword);
