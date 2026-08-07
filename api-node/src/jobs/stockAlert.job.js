const cron = require("node-cron");

const stockService = require("../services/stock.service");

cron.schedule("*/30 * * * *", async () => {
  console.log("Checking stock...");

  await stockService.checkLowStock();
});
