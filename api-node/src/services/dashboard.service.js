const dashboardRepository = require("../repositories/dashboard.repository");
const loginHistoryService = require("./loginHistory.service");
exports.getSummary = async () => {
  const [
    sales,
    costOfGoods,
    expense,
    orders,
    purchase,
    products,
    lowStock,
    outOfStock,
    customers,
  ] = await Promise.all([
    dashboardRepository.getSales(),
    dashboardRepository.getCostOfGoods(),
    dashboardRepository.getExpense(),
    dashboardRepository.getOrders(),
    dashboardRepository.getPurchase(),
    dashboardRepository.getProducts(),
    dashboardRepository.getLowStock(),
    dashboardRepository.getOutOfStock(),
    dashboardRepository.getCustomers(),
  ]);

  const grossProfit = sales - costOfGoods;
  const netProfit = grossProfit - expense;

  return {
    sales,
    cost_of_goods: costOfGoods,
    gross_profit: grossProfit,
    expense,
    net_profit: netProfit,

    orders,
    purchase,

    products,
    low_stock: lowStock,
    out_of_stock: outOfStock,
    customers,
  };
};
exports.getSalesChart = async () => {
  const rows = await dashboardRepository.getSalesChart();
  return rows.map((item) => {
    const sales = Number(item.sales || 0);
    const costOfGoods = Number(item.cost_of_goods || 0);
    return {
      month: item.month,
      sales,
      cost_of_goods: costOfGoods,
      gross_profit: sales - costOfGoods,
    };
  });
};
exports.getProfitChart = async () => {
  const rows = await dashboardRepository.getProfitChart();

  return rows.map((item) => {
    const sales = Number(item.sales || 0);
    const costOfGoods = Number(item.cost_of_goods || 0);
    const expense = Number(item.expense || 0);

    const grossProfit = sales - costOfGoods;
    const netProfit = grossProfit - expense;

    return {
      month: item.month,
      sales,
      cost_of_goods: costOfGoods,
      expense,
      gross_profit: grossProfit,
      net_profit: netProfit,
    };
  });
};
exports.getRecentLoginActivity = async (limit = 10) => {
  return await loginHistoryService.getRecent(limit);
};