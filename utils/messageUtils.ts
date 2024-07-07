import Telebot from 'telebot';
import { SentMessage } from '../models/apartment';
import { getEnvVariable } from './secretsUtils';

const CHAT_ID = getEnvVariable('CHAT_ID');

export const sendNewMessages = async (bot: Telebot, newApartments: SentMessage[]): Promise<SentMessage[]> => {
    let sentMessages: SentMessage[] = [];
    for (const apartment of newApartments) {
        console.log("Apartamento -> ", apartment);
        const petsEmoji = checkPets(apartment.apartment.description);
        const highlightedLocation = highlightLocation(apartment.apartment.location);
        const hasStorageRoom = apartment.apartment.hasStorageRoom ? 'Sí' : 'No';
        const message = await bot.sendMessage(CHAT_ID, `
        🏠 _Nuevo piso encontrado_:
            *Título:* ${apartment.apartment.title}
            *Ubicación:* ${highlightedLocation}
            *Planta*: ${apartment.apartment.floor}
            *Precio*: ${apartment.apartment.price} €/mes
            *Espacio*: ${apartment.apartment.space} m²
            *Número de habitaciones*: ${apartment.apartment.numRooms}
            *Trastero*: ${hasStorageRoom} 
            *🐈 Mascotas:* ${petsEmoji}
            URL: ${apartment.apartment.url}`, { parseMode: 'Markdown' }
        );
        sentMessages.push({ messageId: message.message_id, apartment: apartment.apartment });
    }
    return sentMessages;
};

export const deleteOldMessages = async (bot: Telebot, sentMessages: SentMessage[], currentPublications: string[]): Promise<SentMessage[]> => {
    return sentMessages.filter(message => {
        if (!currentPublications.includes(message.apartment.url)) {
            bot.deleteMessage(CHAT_ID, message.messageId);
            return false;
        }
        return true;
    });
};

const checkPets = (description: string): string => {
    const descriptionLowerCase = description.toLowerCase();

    const positivePhrases = [
        "se admiten mascotas",
        "se permiten mascotas",
        "permitidas mascotas",
        "mascotas admitidas"
    ];

    const negativePhrases = [
        "no se admiten mascotas",
        "no se permiten mascotas",
        "no admite mascotas",
        "no admite mascota",
        "no mascotas",
        "no animales",
        "nada de animales",
        "no aptas mascotas",
        "no se aceptan mascotas"
    ];

    for (const phrase of negativePhrases) {
        if (descriptionLowerCase.includes(phrase)) {
            return "❌";
        }
    }

    for (const phrase of positivePhrases) {
        if (descriptionLowerCase.includes(phrase)) {
            return "✅";
        }
    }

    return "❓";
};

const locationEmojis: { [place: string]: string } = {
    oviedo: '🔵',
    corredoria: '🟣',
    lugones: '🟢',
    gijón: '🔴',
    gijon: '🔴'
};

const highlightLocation = (location: string): string => {
    const lowerCaseLocation = location.toLowerCase();
    for (const place in locationEmojis) {
        if (lowerCaseLocation.includes(place)) {
            return `${location} ${locationEmojis[place]}`;
        }
    }
    return `${location} ⚪`;
};
