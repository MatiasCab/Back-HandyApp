import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { createProblems, getProblembyId, getProblems, updateProblems } from "../controllers/problemsController";


export const problemsRouter = Router();

problemsRouter.post('/', authorizationMiddleware, createProblems);

problemsRouter.put('/:id', authorizationMiddleware, updateProblems);

problemsRouter.get('/', authorizationMiddleware, getProblems);

problemsRouter.get('/:id', authorizationMiddleware, getProblembyId);