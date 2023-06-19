import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { createProblems, getProblembyId, getProblems, updateProblems } from "../controllers/problemsController";
import { getProblemReviews } from "../controllers/reviewsController";


export const problemsRouter = Router();

problemsRouter.post('/', authorizationMiddleware, createProblems);

problemsRouter.put('/:id', authorizationMiddleware, updateProblems);

problemsRouter.get('/', authorizationMiddleware, getProblems);

problemsRouter.get('/:id', authorizationMiddleware, getProblembyId);

problemsRouter.get('/:id/reviews', authorizationMiddleware, getProblemReviews);