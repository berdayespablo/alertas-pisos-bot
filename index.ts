import bot from './bot/telegramBot';
import cron from 'node-cron';
import { getPublications } from './services/idealistaService';
import { sendNewMessages, deleteOldMessages } from './utils/messageUtils';
import { SentMessage } from './models/apartment';

let lastPublication: string = "";
let sentMessages: SentMessage[] = [];

const filters = {
    priceMin: 400,
    priceMax: 550,
    metersMin: 40,
    metersMax: 100
};

const checkNewPublications = async () => {
    console.log('Revisando nuevas publicaciones...');
    const apartments = await getPublications(filters);

    let newApartments: SentMessage[] = [];
    let currentPublications: string[] = apartments.map(apartment => apartment.url);

    for (const apartment of apartments) {
        if (!lastPublication || new Date(apartment.publishDate) > new Date(lastPublication)) {
            newApartments.push({ messageId: 0, apartment });
        }
    }

    if (newApartments.length) {
        lastPublication = newApartments[0].apartment.publishDate;
        sentMessages = await sendNewMessages(bot, newApartments);
    } else {
        console.log('No hay nuevas publicaciones.');
    }

    sentMessages = await deleteOldMessages(bot, sentMessages, currentPublications);
};

cron.schedule('* * * * *', checkNewPublications);

bot.start();