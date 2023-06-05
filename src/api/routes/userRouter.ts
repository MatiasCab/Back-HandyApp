import { Router } from "express";

import { addFavoriteInfo, getUserById, quitFavoriteInfo, uploaProfileImage } from "../controllers/userController";

import { Middelwares } from "../middleware/regulatorMiddlewares";

export const userRouter = Router();

userRouter.get("/", Middelwares, getUserById);

userRouter.post("/favoriteEntertainments", Middelwares, addFavoriteInfo);

userRouter.delete("/favoriteEntertainments/:entertainmentId", Middelwares, quitFavoriteInfo);

userRouter.put("/uploadImage", Middelwares, uploaProfileImage);


