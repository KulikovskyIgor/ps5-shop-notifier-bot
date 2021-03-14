const { Telegraf, Markup } = require('telegraf');
const { getUsers, addUser, removeUser } = require('./cloud-db');
const { checkStores } = require('./stores-checker');
const { formatStoresStats } = require('./stats-formatter');

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
  checkStores()
    .then((storesWithUpdatedStats) => {
      ctx.replyWithMarkdownV2(formatStoresStats(storesWithUpdatedStats, 'updatedStats'));
    }).catch(e => {
      console.log('Catched by me', e.message, e);
    })
});

function runTimer() {
  if (!users.length) {
    fetchUsers();
  }

  setTimeout(() => {
    checkStores()
      .then((storesWithUpdatedStats) => {
        if (storesWithUpdatedStats.length) {
          users.forEach(user => {
            const message = formatStoresStats(storesWithUpdatedStats, 'updatedStats');
            bot.telegram.sendMessage(user.chatId, message, { parse_mode: 'MarkdownV2' });
          });
        }
      }).catch(e => {
        console.log('Catched by me', e.message, e);
      });

      runTimer();
  }, 60_000);
}

bot.launch();
runTimer();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
