import { getDB } from '../services/sqlDatabase';

import { favoriteInfoRegulator } from "../helpers/favoriteInfoRegulatorHelper";
import { generateLocationImage } from "../helpers/getLocationImage";
import { regulatorImagesLinks } from "../helpers/imagesHelper";

import { Local } from "../models/local";
import { ENTERTAINMENTS_IMAGES_TABLE } from '../../config/const';


export const getLocalById = async (req, res) => {
    const database = getDB();
    const id = req.params.id;
    const userCredentials = req.user;
    const queryLocalStatement = `call spGetLocals(${id})`;
    const queryEventsStatement = `call spGetLocalEvents(${id})`;

    try {
        if (isNaN(id)) {
            res.status(400).send({ error: true, message: `'${id}' is not a valid local id.`, name: 'InvalidId' })
        } else {
            const [rowsLocals] = await database.query(queryLocalStatement);
            const [rowsLocalsEvent] = await database.query(queryEventsStatement);
            const images = [...rowsLocals[0], ...rowsLocalsEvent[0]]

            await regulatorImagesLinks(images, ENTERTAINMENTS_IMAGES_TABLE);

            if (rowsLocals[0][0]) {

                const { localID, name, description, localType, qualification, lat, lon } = rowsLocals[0][0];
                const events: any = [];
                const localImages: string[] = []

                rowsLocals[0].forEach(element => {
                    localImages.push(element.imageLink);
                });

                rowsLocalsEvent[0].forEach(element => {

                    let event = {
                        entertainmentID: element.eventID,
                        name: element.name,
                        description: element.description,
                        schedule: element.schedule,
                        lat: element.lat,
                        lon: element.lon,
                        imageLink: element.imageLink,
                        type: 'event'
                    };

                    events.push(event);
                });

                const localInfo: Local = {
                    entertainmentID: localID,
                    name: name,
                    description: description,
                    type: localType,
                    qualification: qualification,
                    lat: lat,
                    lon: lon,
                    imagesLinks: localImages,
                    localEvents: events,
                    locationImage: await generateLocationImage({ lat, lon })
                };

                await favoriteInfoRegulator(userCredentials.userId, [localInfo, ...events])

                res.status(200).send(localInfo);
            } else {
                res.status(404).send({ error: true, message: `The local with id='${id}' does not exist.` });
            }
        }
    } catch (e) {
        res.status(500).send({ error: true, message: "Internal server error getting local by id." });
    }
};