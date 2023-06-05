import { getDB } from "../services/sqlDatabase"

import { regulatorImagesLinks } from "../helpers/imagesHelper";
import { transformSearchInfo } from "../helpers/utils";

import { ENTERTAINMENTS_IMAGES_TABLE } from "../../config/const";


export const getAllChatsPreview = async (req, res) => {
    const database = getDB();
    const userCredentials = req.user;
    const searchInfo = transformSearchInfo(req.query.searchInfo);
    const query = `CALL spGetChatsPreview(null, 
        ${userCredentials.userId},
        ${searchInfo ? "'" + `${searchInfo}` + "'" : null})`;

    try {
        const [result] = await database.query(query);

        await regulatorImagesLinks(result[0], ENTERTAINMENTS_IMAGES_TABLE);

        res.status(200).send(result[0]);
    } catch (e) {
        res.status(500).send({ error: true, mesage: 'Internal server error gettin chats.', name: 'ServerError' });
    }
}

export const getEspecificChat = async (req, res) => {
    const database = getDB();
    const userCredentials = req.user;
    const entertainmentId = req.params.entertainmentId;
    const createChat = `CALL spCreateChat(${entertainmentId}, ${userCredentials.userId})`;
    const getChat = `CALL spGetChatsPreview(${entertainmentId}, 
                                            ${userCredentials.userId},
                                            null)`;

    try {
        let [result] = await database.query(getChat);

        if (!result[0][0]) {
            [result] = await database.query(createChat);
        }

        await regulatorImagesLinks(result[0], ENTERTAINMENTS_IMAGES_TABLE);

        res.status(200).send(result[0][0]);
    } catch (e) {
        res.status(500).send({ error: true, mesage: 'Internal server error gettin chats.', name: 'ServerError' });
    }
}

export const sendMessage = async (req, res) => {
    const database = getDB();
    const userCredentials = req.user;
    const chatId = req.params.chatId;
    const messageContent = req.body.messageContent
    const createMessage = `CALL spCreateMessage(${chatId}, ${userCredentials.userId}, '${messageContent ? messageContent : ''}')`;

    try {
        const [message] = await database.query(createMessage);

        res.status(200).send(message[0][0]);
    } catch (e) {
        res.status(500).send({ error: true, mesage: 'Internal server error sending messages.', name: 'ServerError' });
    }
}

export const getMessages = async (req, res) => {
    const database = getDB();
    const chatId = req.params.chatId;
    const getMessages = `CALL spGetMessages(${chatId})`;

    try {
        const [messages] = await database.query(getMessages);

        res.status(200).send(messages[0]);
    } catch (e) {
        res.status(500).send({ error: true, mesage: 'Internal server error sending messages.', name: 'ServerError' });
    }
}