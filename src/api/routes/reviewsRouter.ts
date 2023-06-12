import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { getUserById, getUsers } from "../controllers/usersController";



export const reviewsRouter = Router();

reviewsRouter.post('/', authorizationMiddleware, getUsers);

reviewsRouter.get('/:id', authorizationMiddleware, getUserById);

