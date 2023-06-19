import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { acceptFriendRequest, getUserById, getUsers, sendFriendRequest } from "../controllers/usersController";
import { getUserReviews } from "../controllers/reviewsController";



export const usersRouter = Router();

usersRouter.get('/', authorizationMiddleware, getUsers);

usersRouter.get('/:id', authorizationMiddleware, getUserById);

usersRouter.get('/:id/reviews', authorizationMiddleware, getUserReviews);

usersRouter.put('/:id/friend-requests/accept', authorizationMiddleware, acceptFriendRequest);

usersRouter.post('/:id/friend-requests', authorizationMiddleware, sendFriendRequest);
