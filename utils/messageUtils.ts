import Telebot from 'telebot';
import { SentMessage } from '../models/apartment';
import { CHAT_ID } from '../constants';

export const sendNewMessages = async (bot: Telebot, newApartments: SentMessage[]): Promise<SentMessage[]> => {
    let sentMessages: SentMessage[] = [];
    for (const apartment of newApartments) {
        console.log("Apartamento -> ", apartment);
        const message = await bot.sendMessage(CHAT_ID, `
        🏠 _Nuevo piso encontrado_:
            *Título:* ${apartment.apartment.title}
            *Descripción*: ${apartment.apartment.description}
            *Precio*: ${apartment.apartment.price} €/mes
            *Espacio*: ${apartment.apartment.space} m²
            *Número de habitaciones*: ${apartment.apartment.numRooms}
            *Fecha de publicación*: ${apartment.apartment.publishDate}
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