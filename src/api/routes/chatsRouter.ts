import { Router } from "express";

import { sendMessage, getAllChatsPreview, getEspecificChat, getMessages } from "../controllers/chatsController";

import { Middelwares } from "../middleware/regulatorMiddlewares";

export const chatsRouter = Router();

chatsRouter.get("/", Middelwares, getAllChatsPreview);

chatsRouter.get("/:entertainmentId", Middelwares, getEspecificChat);

chatsRouter.get("/:chatId/messages", Middelwares, getMessages);

chatsRouter.post("/:chatId/messages", Middelwares, sendMessage);