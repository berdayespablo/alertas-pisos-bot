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

const interval = parseInt(process.argv[2], 10);

if (isNaN(interval) || interval <= 0) {
    console.error('Por favor, proporciona un intervalo válido en minutos.');
    process.exit(1);
}

console.log(`Programado para revisar publicaciones cada ${interval} minuto(s).`);
cron.schedule(`*/${interval} * * * *`, checkNewPublications);

bot.start();
