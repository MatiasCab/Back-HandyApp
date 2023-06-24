import { Router } from "express";
import { authorizationMiddleware } from "../middleware/checkIfAuthenticatedMiddleware";
import { getSkills } from "../controllers/skillsController";



export const skillsRouter = Router();

skillsRouter.get('/', authorizationMiddleware, getSkills);
