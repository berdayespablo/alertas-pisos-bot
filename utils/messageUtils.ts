import Telebot from 'telebot';
import { SentMessage } from '../models/apartment';
import { getEnvVariable } from './secretsUtils';

const CHAT_ID = getEnvVariable('CHAT_ID');

export const sendNewMessages = async (bot: Telebot, newApartments: SentMessage[]): Promise<SentMessage[]> => {
    let sentMessages: SentMessage[] = [];
    for (const apartment of newApartments) {
        console.log("Apartamento -> ", apartment);
        const petsEmoji = checkPets(apartment.apartment.description);
        const message = await bot.sendMessage(CHAT_ID, `
        🏠 _Nuevo piso encontrado_:
            *Título:* ${apartment.apartment.title}
            *Ubicación:* ${apartment.apartment.location}
            *Planta*: ${apartment.apartment.floor}
            *Precio*: ${apartment.apartment.price} €/mes
            *Espacio*: ${apartment.apartment.space} m²
            *Número de habitaciones*: ${apartment.apartment.numRooms}
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
        "no mascotas",
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