import { getDB } from "../services/sqlDatabase";

import { EntertainmentFavoriteInfo } from "../models/EntertainmentFavorite";


export async function favoriteInfoRegulator(userId: number, entertainments: EntertainmentFavoriteInfo[]) {
    const database = getDB();
    for (const entertainment of entertainments) {
        const checkFavoriteInfoQuery = `CALL spCheckFavoriteInfo(${userId}, ${entertainment.entertainmentID})`;
        const [favoriteInfo] = await database.query(checkFavoriteInfoQuery);

        if (favoriteInfo[0][0]) {
            entertainment.isFavorite = true;
        } else {
            entertainment.isFavorite = false;
        }
    }
}