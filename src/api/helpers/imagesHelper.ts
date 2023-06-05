import { getBucket } from "../services/imagesStorage";
import { getDB } from "../services/sqlDatabase";
import { Image } from "../models/image";
import { dateFormater } from "./utils";
import { USERS_TABLE } from "../../config/const";

async function getImageURL(imageName: string) {
    const expireDate = Date.now() + 1 * 24 * 60 * 60 * 1000;
    const [url] = await getBucket()
        .file(imageName)
        .getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: expireDate
        });
    return { imageURL: url, expireDate: expireDate };
};

export async function regulatorImagesLinks(images: Image[], table: string) {
    const msInHour = 1000 * 60 * 60;
    for (let image of images) {
        if (image.imageLink == null || image.expireDate == null || (new Date(image.expireDate).getTime() - Date.now()) / msInHour <= 5) {

            let imageURLData = await getImageURL(image.imageName);
            const query = `UPDATE ${table}
                                SET 
                                    imageLink = '${imageURLData.imageURL}',
                                    expireDate = '${dateFormater(new Date(imageURLData.expireDate))}',
                                    imageName = '${image.imageName}'
                                WHERE
                                    ${table == 'Users' ? `username = "${image.imageName.replace('.jpg', '')}"` : `imageName = "${image.imageName}"`}`
            await getDB().query(query);
            image.imageLink = imageURLData.imageURL;
            image.expireDate = new Date(imageURLData.expireDate);
        }
    }
}

export async function uploadImage(image: Buffer, imageName: string) {
    await getBucket().file(imageName).save(image);

    const imageArray = [{ imageName, imageLink: null, expireDate: null }];

    await regulatorImagesLinks(imageArray, USERS_TABLE);

    return imageArray[0];
}