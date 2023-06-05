import { Router } from "express";

import { getLocalById } from '../controllers/localsController';

import { Middelwares } from "../middleware/regulatorMiddlewares";


export const localsRouter = Router();

localsRouter.get('/:id', Middelwares, getLocalById);
