import { getDB } from "../services/sqlDatabase";

import { regulatorImagesLinks, uploadImage } from "../helpers/imagesHelper";

import { USERS_TABLE } from "../../config/const";

export const getUserById = async (req, res) => {
    const database = getDB()
    const userCredentials = req.user;
    const queryStatement = `call spGetUser('${userCredentials.username}')`;

    try {
        const [queryResult] = await database.query(queryStatement);

        await regulatorImagesLinks(queryResult[0], USERS_TABLE);

        const user = queryResult[0][0];

        if (!user) {
            res.status(400).send({ error: true, message: `User with username: ${userCredentials.username} does not exist` })
        } else {
            res.status(200).send(user);
        }

    } catch (e) {
        res.status(500).send({ error: true, message: 'Internal server error getting user.', name: 'ServerError' });
    }

}

async function favoriteData(entertainmentId: number, userId: number, res, action: 'add' | 'quit') {
    const database = getDB();
    if (!entertainmentId || Number.isNaN(entertainmentId)) {

        res.status(400).send({ error: true, message: 'A entertainment is necessary.', name: 'NoEntertainmentId' });
        return;
    }

    const checkEntertainmentQuery = `CALL spCheckEntertainment(${entertainmentId})`;
    const [entertaiment] = await database.query(checkEntertainmentQuery);

    if (!entertaiment[0][0]) {

        res.status(400).send({ error: true, message: 'A valid entertainment is necessary.', name: 'InvalidEntertainmentId' });
        return;
    }

    if (action == 'add') {

        const checkFavoriteInfoQuery = `CALL spCheckFavoriteInfo(${userId}, ${entertainmentId})`;
        const [favoriteInfo] = await database.query(checkFavoriteInfoQuery);

        if (favoriteInfo[0][0]) {

            res.status(400).send({ error: true, message: 'Favorite data already exists', name: 'AlreadyExistsData' });
        } else {
            const query = `CALL spAddFavoriteEntertainment(${userId}, ${entertainmentId})`;

            await database.query(query);

            res.status(200).send({ message: 'Entertainment added to favorites.' });
        }
    } else {

        const query = `CALL spQuitFavoriteData(${userId}, ${entertainmentId})`

        await database.query(query);

        res.status(200).send({ message: 'Entertainment quited of favorites.' })
    }
}

export const addFavoriteInfo = async (req, res) => {
    const userCredentials = req.user;
    const entertainmentId = req.body.entertainmentId

    try {

        await favoriteData(entertainmentId, userCredentials.userId, res, 'add');

    } catch (e: any) {
        res.status(500).send({ error: true, message: 'Internal server error adding favorite entertainments.', name: 'ServerError' });
    }
}

export const quitFavoriteInfo = async (req, res) => {
    const userCredentials = req.user;
    const entertainmentId = req.params.entertainmentId;

    try {

        await favoriteData(entertainmentId, userCredentials.userId, res, 'quit');

    } catch (e: any) {
        res.status(500).send({ error: true, message: 'Internal server error quiting favorite entertainment.', name: 'ServerError' });
    }
}

export const uploaProfileImage = async (req, res) => {
    const image = req.body.base64Img;
    const userCredentials = req.user;
    const imageName = `${userCredentials.username}.jpg`;

    try {
        if (!image) {
            res.status(400).send({ error: true, message: "Not image detected.", name: "NonImage" })
        } else {
            const buffer = Buffer.from(image, 'base64');
            const { imageLink } = await uploadImage(buffer, imageName);

            res.status(201).send({ imageLink });
        }
    } catch (e) {
        res.status(500).send({ error: true, message: "Image can not be uploaded.", name: 'ServerError' });
    }
}