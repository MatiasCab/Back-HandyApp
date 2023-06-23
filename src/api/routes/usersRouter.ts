import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { acceptFriendRequest, deleteFriendship, getUserById, getUsers, sendFriendRequest, updateUserInfo } from "../controllers/usersController";
import { getUserReviews } from "../controllers/reviewsController";
import { getUserProblems } from "../controllers/problemsController";



export const usersRouter = Router();

usersRouter.get('/', authorizationMiddleware, getUsers);

usersRouter.get('/:id', authorizationMiddleware, getUserById);

usersRouter.put('/', authorizationMiddleware, updateUserInfo);

usersRouter.get('/:id/reviews', authorizationMiddleware, getUserReviews);

usersRouter.put('/:id/friend-requests/accept', authorizationMiddleware, acceptFriendRequest);

usersRouter.post('/:id/friend-requests', authorizationMiddleware, sendFriendRequest);

usersRouter.delete('/:id/friends', authorizationMiddleware, deleteFriendship);

usersRouter.get('/:id/problems', authorizationMiddleware, getUserProblems);
