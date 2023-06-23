import { staticMapUrl } from 'static-google-map';
import dotenv from "dotenv";
import axios from 'axios';

dotenv.config();

export async function generateLocationImage(_locationInfo) {
    const url = staticMapUrl({
        key: process.env.STATIC_MAP_KEY,
        scale: 2,
        size: '600x600',
        format: 'png',
        zoom: 18,
        maptype: 'roadmap',
        markers: [
            {
                location: { lat: 90, lng: 90 },
                color: '0xD450E6',
                size: 'normal'
            }
        ]
    })

    //const locationMapURL = `${url}&map_id=dd44d28a312be6da`;
    const locationMapURL = `${url}`;

    const response = await axios.request({
        method: 'GET',
        url: locationMapURL,
        responseEncoding: 'base64'
    });

    console.log(response.data)
    return response.data;
}