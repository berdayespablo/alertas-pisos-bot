export interface Apartment {
    description: string;
    numRooms: number;
    price: number;
    publishDate: string;
    space: number;
    title: string;
    url: string;
}

export interface SentMessage {
    messageId: number;
    apartment: Apartment;
}