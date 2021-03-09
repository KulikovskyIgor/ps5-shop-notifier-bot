const { Telegraf, Markup } = require('telegraf');
const { getUsers, addUser, removeUser } = require('./users-db');
const { test } = require('./stores-checker');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

let users = [];
const fetchUsers = () => {
  getUsers()
  .then(list => users = list)
  .catch(e => {
    console.log('Catched by me', e.message, e);
  });
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

let counter = 0;
setInterval(() => {
  counter += 10;
  users.forEach(user => {
    const min = counter / 60;
    bot.telegram.sendMessage(user.chatId, 'alive - ' + min + ' minutes');
  });
}, 10_000);

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
