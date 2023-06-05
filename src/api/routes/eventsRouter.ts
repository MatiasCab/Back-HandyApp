import { Router } from "express";

import { getEventById } from '../controllers/eventsController';

import { Middelwares } from "../middleware/regulatorMiddlewares";


export const eventsRouter = Router();

eventsRouter.get('/:id', Middelwares, getEventById);
