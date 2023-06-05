import { getDB } from '../services/sqlDatabase';

import { generateLocationImage } from "../helpers/getLocationImage";
import { regulatorImagesLinks } from "../helpers/imagesHelper";

import { ENTERTAINMENTS_IMAGES_TABLE } from "../../config/const";
import { favoriteInfoRegulator } from "../helpers/favoriteInfoRegulatorHelper";

export const getEventById = async (req, res) => {
    const database = getDB();
    const id = req.params.id;
    const userCredentials = req.user;
    const queryStatement = `call spGetEvents(${id})`;

    try {
        if (isNaN(id)) {
            res.status(400).send({ error: true, message: `'${id}' is not a valid event id.`, name: 'InvalidId' })
        } else {
            const [rows] = await database.query(queryStatement);
            await regulatorImagesLinks(rows[0], ENTERTAINMENTS_IMAGES_TABLE);

            if (rows[0][0]) {
                const { eventID, name, description, schedule, sponsorName, lat, lon } = rows[0][0]
                const localImages: string[] = []

                rows[0].forEach(element => {
                    localImages.push(element.imageLink);
                });

                const eventInfo = {
                    entertainmentID: eventID,
                    name: name,
                    description: description,
                    schedule: schedule,
                    sponsorName: sponsorName,
                    lat: lat,
                    lon: lon,
                    imagesLinks: localImages,
                    locationImage: await generateLocationImage({ lat, lon })
                };

                await favoriteInfoRegulator(userCredentials.userId, [eventInfo])

                res.status(200).send(eventInfo);
            } else {
                res.status(404).send({ error: true, message: `The event with id='${id}' does not exist.`, name: 'EventDontExist' });
            }
        }

    } catch (e) {
        res.status(500).send({ error: true, message: "Internal server error getting event by id.", name: 'ServerError' });
    }
};