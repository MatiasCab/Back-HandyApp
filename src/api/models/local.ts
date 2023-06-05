import { EntertainmentsPreview } from "./entertainments";

export interface Local extends EntertainmentsPreview {
    qualification: number;
    localEvents?: any;
}
