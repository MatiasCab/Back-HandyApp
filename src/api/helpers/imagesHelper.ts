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

// export async function regulatorImagesLinks(images: Image[], table: string) {
//     const msInHour = 1000 * 60 * 60;
//     for (let image of images) {
//         if (image.imageLink == null || image.expireDate == null || (new Date(image.expireDate).getTime() - Date.now()) / msInHour <= 5) {

//             let imageURLData = await getImageURL(image.imageName);
//             const query = `UPDATE ${table}
//                                 SET 
//                                     imageLink = '${imageURLData.imageURL}',
//                                     expireDate = '${dateFormater(new Date(imageURLData.expireDate))}',
//                                     imageName = '${image.imageName}'
//                                 WHERE
//                                     ${table == 'Users' ? `username = "${image.imageName.replace('.jpg', '')}"` : `imageName = "${image.imageName}"`}`
//             await getDB().query(query);
//             image.imageLink = imageURLData.imageURL;
//             image.expireDate = new Date(imageURLData.expireDate);
//         }
//     }
// }

export async function getImageURL(imageName: string) {
    const existImage = await existImageController(imageName);
    if(!existImage) return undefined;
    return await generateImageURL(imageName);
};

export async function uploadImage(image: Buffer, imageName: string) {
    await getBucket().file(imageName).save(image);
}

export async function uploadBase64Image(base64Image: string, imageName: string) {
    const buffer = Buffer.from(base64Image, 'base64');
    await uploadImage(buffer, imageName);
}