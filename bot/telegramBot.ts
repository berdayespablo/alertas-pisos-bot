import Telebot from 'telebot';
import { TELEGRAM_TOKEN } from '../constants';

const bot = new Telebot({
    token: TELEGRAM_TOKEN
});

bot.on(["/start", "/hola"], (msg) => {
    console.log(msg);
    bot.sendMessage(msg.chat.id, `Hola ${msg.chat.first_name} bienvenido al bot`);
});

export default bot;