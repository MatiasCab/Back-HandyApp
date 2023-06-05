import { getDB } from "../services/sqlDatabase";

import { favoriteInfoRegulator } from "../helpers/favoriteInfoRegulatorHelper";
import { regulatorImagesLinks } from "../helpers/imagesHelper";
import { transformSearchInfo } from '../helpers/utils';

import { ENTERTAINMENTS_IMAGES_TABLE } from "../../config/const";


function reguleTypeParam(reqTypeParam) {
    if (!reqTypeParam) return true;
    switch (reqTypeParam) {
        case 'bar':
            return true;
        case 'pub':
            return true;
        case 'dancingParty':
            return true;
        case 'event':
            return true;
        default:
            return false;
    }
}

export const getAllSearchResults = async (req, res) => {
    const database = getDB();
    const amountOfSearchResults = 10;
    const startIndexSearch = req.query.startIndex ? Number(req.query.startIndex) : 0;
    const searchInfo = transformSearchInfo(req.query.searchInfo);
    const typeParam = req.query.type;
    let onlyFavorites = req.query.onlyFavorites;
    const userCredentials = req.user;

    if (!reguleTypeParam(typeParam)) {
        res.status(400).send({ error: true, message: `'${typeParam}' is a wrong value in param 'type'`, name: 'WrongTypeParam' });
        return;
    }

    if (onlyFavorites && (onlyFavorites == false || onlyFavorites == true)) {
        res.status(400).send({ error: true, message: `'${onlyFavorites}' is a wrong value in param 'onlyFavorites'`, name: 'WrongOnlyFavoritesParam' });
        return;
    } else if (onlyFavorites) {
        onlyFavorites = onlyFavorites == 'true';
    }

    const queryStatement = `call spGetEntertainmentRemastered(
        ${typeParam ? "'" + `${typeParam}` + "'" : null}, 
        ${startIndexSearch}, 
        ${amountOfSearchResults}, 
        ${searchInfo ? "'" + `${searchInfo}` + "'" : null}, 
        ${onlyFavorites ? userCredentials.userId : null}
        )`;

    try {
        const [rows] = await database.query(queryStatement);
        const entertainmentsInfo = rows[0];
        
        await regulatorImagesLinks(entertainmentsInfo, ENTERTAINMENTS_IMAGES_TABLE);
        await favoriteInfoRegulator(userCredentials.userId, entertainmentsInfo);

        const response = {
            searchIndex: startIndexSearch + amountOfSearchResults,
            entertainments: entertainmentsInfo
        };
        res.status(200).send(response);

    } catch (e) {
        res.status(500).send({ error: true, message: "Internal server error getting search results", name: 'ServerError' });
    }
};

