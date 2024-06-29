import bot from './bot/telegramBot';
import cron from 'node-cron';
import { getPublications } from './services/idealistaService';
import { sendNewMessages, deleteOldMessages } from './utils/messageUtils';
import { SentMessage } from './models/apartment';

let sentMessages: SentMessage[] = [];

const filters = {
    priceMin: 400,
    priceMax: 550,
    metersMin: 40,
    metersMax: 100
};

const checkNewPublications = async () => {
    console.log('Revisando nuevas publicaciones...');
    const { newApartments, currentPublications } = await getPublications(filters);

    if (newApartments.length) {
        const newSentMessages = newApartments.map(apartment => ({ messageId: 0, apartment }));
        sentMessages = sentMessages.concat(await sendNewMessages(bot, newSentMessages));
    } else {
        console.log('No hay nuevas publicaciones.');
    }

    sentMessages = await deleteOldMessages(bot, sentMessages, currentPublications);
};

cron.schedule('* * * * *', checkNewPublications);

bot.start();
