import { staticMapUrl } from 'static-google-map';
import dotenv from "dotenv";
import axios from 'axios';
import { existImageController, getImageURL, uploadBase64Image } from './imagesHelper';

dotenv.config();

export async function generateLocationImage(lat, lng) {
    const url = staticMapUrl({
        key: process.env.STATIC_MAP_KEY,
        scale: 2,
        size: '600x600',
        format: 'png',
        zoom: 15,
        maptype: 'roadmap',
        markers: [
            {
                location: { lat: -34.88874198228909, lng: -56.15956568422894 },
                color: '0xD450E6',
                size: 'normal'
            }
        ]
    })

    //const locationMapURL = `${url}&map_id=dd44d28a312be6da`;
    const locationMapURL = `${url}&path=fillcolor:0x0000ff|weight:1|fillcolor:0x0000ff|enc:circle_radius:1000`;

    console.log(locationMapURL);
    const response = await axios.request({
        method: 'GET',
        url: locationMapURL,
        responseEncoding: 'base64'
    });

    await uploadBase64Image(response.data, `${lat},${lng}.jpg`);
}

export async function getLocationImage(lat, lng) {
    const imageName = `${lat},${lng}.jpg`;
    
    const existImage = await existImageController(imageName); //TODO preguntar si les parece bien esto
    if(existImage){
        return getImageURL(imageName);
    };
    await generateLocationImage(lat, lng);
    return getImageURL(imageName);
}