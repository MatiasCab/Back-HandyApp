import { getBucket, getBucketName } from "../services/imagesStorage";

export async function existImageController(imageName: string) {
    const [exist] = await getBucket()
        .file(imageName).exists();
    return exist;
};


//Sirve para cuando se quiere restringir el periodo de acceso que tiene un usuario a la imagen.
async function generateSignedImageURL(imageName: string){
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

function generatePublicImageUrl(imageName: string) {
    const bucketName = getBucketName();
    const url = `https://storage.googleapis.com/${bucketName}/${imageName}`;
    return url;
}

export function getImageURL(imageName: string) {
    if (!imageName) return undefined;

    return generatePublicImageUrl(imageName);
};

export async function getSignetImageURL(imageName: string) {
    if (!imageName) return undefined;
    const existImage = await existImageController(imageName);
    if(!existImage) return undefined;
    return generateSignedImageURL(imageName);
};

export async function uploadImage(image: Buffer, imageName: string) {
    await getBucket().file(imageName).save(image);
}

export async function uploadBase64Image(base64Image: string, imageName: string) {
    const buffer = Buffer.from(base64Image, 'base64');
    await uploadImage(buffer, imageName);
}