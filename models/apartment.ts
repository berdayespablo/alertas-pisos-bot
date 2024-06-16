export interface Apartment {
    agency: string;
    agencyLocation: string;
    building: string[];
    dateUpdated: string;
    description: string;
    energyConsumption: string;
    energyEmissions: string;
    features: string[];
    floor: string;
    numRooms: number;
    price: number;
    publishDate: string;
    refNumber: string;
    space: number;
    title: string;
    url: string;
}

export interface SentMessage {
    messageId: number;
    apartment: Apartment;
}