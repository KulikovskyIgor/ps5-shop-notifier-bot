// Require all env variables before executing the main server run script
process.env.NODE_ENV !== 'production' && require('dotenv').config();

// require('./src/telegram-bot');
const { startPingSession } = require('./src/pinger');

const PORT = process.env.PORT || 5000;
const express = require('express');
const app = express();

app.get('/', function(req, res){
  res.send('Bot is running');
});

app.listen(PORT, () => {
  console.log(`Listening on ${ PORT }`);
  startPingSession();
});