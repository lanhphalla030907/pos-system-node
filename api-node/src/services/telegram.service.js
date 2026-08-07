const TelegramBot = require("node-telegram-bot-api").default;

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.sendLowStockAlert = async (products) => {
  if (!products || products.length === 0) {
    return;
  }

  let message = `
🚨 LOW STOCK ALERT 🚨

`;

  products.forEach((product) => {
    message += `
📦 Product: ${product.name}
🔖 Barcode: ${product.barcode}
📊 Stock: ${product.qty}
⚠️ Minimum: ${product.min_stock}

----------------------
`;
  });

  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
};
