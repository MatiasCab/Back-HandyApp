import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { getUserById, getUsers } from "../controllers/usersController";



export const usersRouter = Router();

usersRouter.get('/', authorizationMiddleware, getUsers);

usersRouter.get('/:id', authorizationMiddleware, getUserById);
