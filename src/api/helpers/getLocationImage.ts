import { staticMapUrl } from 'static-google-map';
import dotenv from "dotenv";
import axios from 'axios';

import { Coordinates } from '../models/coordinates';

dotenv.config();

export async function generateLocationImage(locationInfo: Coordinates) {
    const url = staticMapUrl({
        key: process.env.STATIC_MAP_KEY,
        scale: 2,
        size: '600x600',
        format: 'png',
        zoom: 18,
        maptype: 'roadmap',
        markers: [
            {
                location: { lat: locationInfo.lat, lng: locationInfo.lon },
                color: '0xD450E6',
                size: 'normal'
            }
        ]
    })

    const locationMapURL = `${url}&map_id=dd44d28a312be6da`;

    const response = await axios.request({
        method: 'GET',
        url: locationMapURL,
        responseEncoding: 'base64'
    });

    return response.data;
}