import { Storage } from '@google-cloud/storage';
import dotenv from "dotenv";

dotenv.config();

const STORAGE = new Storage({
    keyFilename: "service-account-new.json",
    projectId: process.env.GC_STORAGE
});

const IMAGE_BUCKET = STORAGE.bucket(process.env.GCS_BUCKET!);

export function getBucket() {
    return IMAGE_BUCKET;
};

export function getBucketName() {
    return process.env.GCS_BUCKET!;
};
