// Require all env variables before executing the main server run script
require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const { getUsers, addUser, removeUser } = require('./src/users-db');
const { test } = require('./src/stores-checker');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

let users = [];
const fetchUsers = () => {
  getUsers().then(list => users = list);
};

bot.start((ctx) => {
  fetchUsers();
  ctx.reply('Welcome PS5 notifier', Markup.keyboard(['Subscribe', 'Unsubscribe', 'Test']));
});

bot.hears('Subscribe', (ctx) => {
  const { id, first_name, last_name } = ctx.update.message.from;
  addUser(id, first_name, last_name).then(() => fetchUsers());
});

bot.hears('Unsubscribe', (ctx) => {
  removeUser(ctx.update.message.from.id).then(() => fetchUsers());
});

bot.hears('Test', async (ctx) => {
  test().then((hasContent) => {
    ctx.reply('hasContent - ' + hasContent);
  });
});

// setInterval(() => {
//   users.forEach(user => {
//     bot.telegram.sendMessage(user.chatId, 'test')
//   });
// }, 3000)

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
