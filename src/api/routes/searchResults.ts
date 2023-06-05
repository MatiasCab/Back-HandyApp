import { Router } from "express";

import { getAllSearchResults } from '../controllers/searchController';

import { Middelwares } from "../middleware/regulatorMiddlewares";


export const searchRouter = Router();

searchRouter.get("/", Middelwares, getAllSearchResults);


