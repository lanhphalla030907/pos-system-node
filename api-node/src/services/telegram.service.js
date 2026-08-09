const TelegramBot = require("node-telegram-bot-api").default;
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)
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

---
`;
  });
  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
};
exports.sendLoginAlert = async ({
  user,
  status,
  ip_address,
  user_agent,
  message,
}) => {
  const isSuccess = status === "success";

  const title = isSuccess ? "🔐 LOGIN SUCCESS" : "🚨 FAILED LOGIN ATTEMPT";

  const statusText = isSuccess ? "✅ SUCCESS" : "❌ FAILED";

  const telegramMessage = `
${title}

Status: ${statusText}

👤 User: ${user?.name || "Unknown"}
🆔 User ID: ${user?.id || "Unknown"}
📛 Username: ${user?.username || "Unknown"}

🌐 IP Address:
${ip_address || "Unknown"}

💻 Device:
${user_agent || "Unknown"}

📝 Message:
${message || "No message"}

⏰ Time:
${new Date().toLocaleString("en-US", {
  timeZone: "Asia/Phnom_Penh",
})}
`;

  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, telegramMessage);
};
