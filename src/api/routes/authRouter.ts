import { Router } from "express";

import { addUserToVerify, userLogin, userVerification } from "../controllers/authController";

export const authRouter = Router();

authRouter.post('/signup', addUserToVerify);

authRouter.post('/verify', userVerification);

authRouter.post('/login', userLogin);
