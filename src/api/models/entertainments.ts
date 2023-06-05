export interface EntertainmentsPreview {
    entertainmentID: number;
    description: string;
    expireDate?: Date;
    imageLink?: string;
    imageName?: string;
    lat: number;
    lon: number;
    name: string;
    type: 'bar' | 'pub' | 'dancingParty' | 'event';
    isFavorite?: boolean;
    imagesLinks?: string[];
    locationImage?: string;
}