const cron = require("node-cron");

const stockService = require("../services/stock.service");

let isRunning = false;

cron.schedule("*/30 * * * *", async () => {
  if (isRunning) {
    console.log("[STOCK-CRON] Previous check still running, skipping...");
    return;
  }

  isRunning = true;
  const start = Date.now();
  console.log("[STOCK-CRON] Checking stock...");

  try {
    await stockService.checkLowStock();
    console.log(`[STOCK-CRON] Done in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("[STOCK-CRON] Error:", err.message);
  } finally {
    isRunning = false;
  }
});
