import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { createReview } from "../controllers/reviewsController";



export const reviewsRouter = Router();

reviewsRouter.post('/', authorizationMiddleware, createReview);

//SE BORRA Y SE PONE EN PROBLEM