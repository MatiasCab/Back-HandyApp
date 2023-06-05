import { Storage } from '@google-cloud/storage';
import dotenv from "dotenv";
import * as fs from 'fs';

dotenv.config();

fs.writeFileSync('service-account-new.json', process.env.SERVICE_ACCOUNT!)

const STORAGE = new Storage({
    keyFilename: "service-account-new.json",
    projectId: process.env.GC_STORAGE
});

const IMAGE_BUCKET = STORAGE.bucket(process.env.GCS_BUCKET!);

export function getBucket() {
    return IMAGE_BUCKET;
};
