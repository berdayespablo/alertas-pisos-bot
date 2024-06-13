import Telebot from 'telebot';
import { getEnvVariable } from '../utils/secretsUtils'

const TELEGRAM_TOKEN = getEnvVariable('TELEGRAM_TOKEN');

const bot = new Telebot({
    token: TELEGRAM_TOKEN
});

bot.on(["/start", "/hola"], (msg) => {
    console.log(msg);
    bot.sendMessage(msg.chat.id, `Hola ${msg.chat.first_name} bienvenido al bot`);
});

export default bot;