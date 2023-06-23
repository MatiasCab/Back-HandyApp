import { staticMapUrl } from 'static-google-map';
import dotenv from "dotenv";
import axios from 'axios';
import * as fs from 'fs';
import { getImageURL, uploadImage } from './imagesHelper';

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

    const buffer = Buffer.from(response.data, 'base64');
    fs.writeFileSync('imagen.jpg', response.data);
    return await uploadImage(buffer, `${lat},${lng}.jpg`)
    //console.log(response.data)
    //return response.data;
}

export async function getLocationImage(lat, lng) {
    const imageName = `${lat},${lng}.jpg`;
    let imageInfo = await getImageURL(imageName);
    if(imageInfo){
        return imageInfo.imageURL;
    };
    imageInfo = await generateLocationImage(lat, lng);
    return imageInfo?.imageURL;
}