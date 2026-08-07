const { db } = require("../util/helper");
exports.getLowStockProducts = async () => {
    const sql = `
        SELECT
            id,
            name,
            barcode,
            qty,
            min_stock
        FROM product
        WHERE qty <= min_stock
        ORDER BY qty ASC
    `;

    const [rows] = await db.query(sql);
    return rows;
};
exports.getStockMovement = async (year) => {

    const sql = `
        SELECT
            MONTH(o.create_at) AS month,
            SUM(od.qty) AS stock_out
        FROM orders o
        INNER JOIN order_detail od
            ON o.id = od.order_id
        WHERE YEAR(o.create_at) = ?
        GROUP BY MONTH(o.create_at)
        ORDER BY MONTH(o.create_at)
    `;

    const [rows] = await db.query(sql, [year]);

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const result = months.map((monthName, index) => {
        const found = rows.find(r => r.month === index + 1);

        return {
            month: monthName,
            stock_in: 0,
            stock_out: found ? Number(found.stock_out) : 0
        };
    });

    return result;
};