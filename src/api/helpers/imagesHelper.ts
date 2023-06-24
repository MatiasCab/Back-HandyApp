import { getBucket } from "../services/imagesStorage";
//import { getDB } from "../services/sqlDatabase";
//import { dateFormater } from "./utils";

async function existImageController(imageName: string) {
    const [exist] = await getBucket()
        .file(imageName).exists();
    return exist;
};

async function generateImageURL(imageName: string){
    const expireDate = Date.now() + 1 * 24 * 60 * 60 * 1000;
    const [url] = await getBucket()
        .file(imageName)
        .getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: expireDate
        });
    return { imageURL: url, expireDate: expireDate };
}

export async function getImageURL(imageName: string) {
    if (!imageName) return undefined;
    const existImage = await existImageController(imageName);
    if(!existImage) return undefined;
    console.log("NOMBRE IMAGENNN",imageName);
    return await generateImageURL(imageName);
};

export async function uploadImage(image: Buffer, imageName: string) {
    await getBucket().file(imageName).save(image);
}

export async function uploadBase64Image(base64Image: string, imageName: string) {
    const buffer = Buffer.from(base64Image, 'base64');
    await uploadImage(buffer, imageName);
}