const { pool } = require("../config/db");

// Helper function to format timestamp/date to YYYY-MM-DD
const formatDate = (dateVal) => {
  if (dateVal instanceof Date) {
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const day = String(dateVal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  return dateVal;
};

/**
 * Get Sales Report
 * @route GET /api/reports/sales
 * @access Private
 */
exports.getSalesReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        st.sale_id,
        st.invoice_no,
        c.customer_name,
        st.payment_method,
        st.payment_status,
        st.total_amount,
        st.sale_date
      FROM sales_transactions st
      JOIN customers c ON st.customer_id = c.customer_id
      ORDER BY st.sale_date DESC, st.sale_id DESC
    `);

    const sales = result.rows.map(row => ({
      sale_id: row.sale_id,
      invoice_no: row.invoice_no,
      customer_name: row.customer_name,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      total_amount: Number(row.total_amount),
      sale_date: formatDate(row.sale_date)
    }));

    return res.status(200).json({
      success: true,
      sales
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales report"
    });
  }
};

/**
 * Get Inventory Report
 * @route GET /api/reports/inventory
 * @access Private
 */
exports.getInventoryReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.inventory_id,
        p.product_name,
        i.stock_quantity,
        i.reorder_level,
        i.warehouse_location,
        i.last_updated
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      ORDER BY p.product_name ASC
    `);

    const inventory = result.rows.map(row => ({
      inventory_id: row.inventory_id,
      product_name: row.product_name,
      stock_quantity: parseInt(row.stock_quantity, 10),
      reorder_level: parseInt(row.reorder_level, 10),
      warehouse_location: row.warehouse_location,
      last_updated: formatDate(row.last_updated)
    }));

    return res.status(200).json({
      success: true,
      inventory
    });
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory report"
    });
  }
};

/**
 * Get Customers Report
 * @route GET /api/reports/customers
 * @access Private
 */
exports.getCustomersReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        customer_id,
        customer_name,
        email,
        phone,
        address,
        created_at
      FROM customers
      ORDER BY customer_name ASC
    `);

    const customers = result.rows.map(row => ({
      customer_id: row.customer_id,
      customer_name: row.customer_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      created_at: formatDate(row.created_at)
    }));

    return res.status(200).json({
      success: true,
      customers
    });
  } catch (error) {
    console.error("Error fetching customers report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers report"
    });
  }
};

/**
 * Get Revenue Report
 * @route GET /api/reports/revenue
 * @access Private
 */
exports.getRevenueReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(AVG(total_amount), 0) AS average_sale,
        COALESCE(MAX(total_amount), 0) AS highest_sale,
        COALESCE(MIN(total_amount), 0) AS lowest_sale
      FROM sales_transactions
    `);

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      report: {
        totalRevenue: Number(row.total_revenue),
        averageSale: Number(row.average_sale),
        highestSale: Number(row.highest_sale),
        lowestSale: Number(row.lowest_sale)
      }
    });
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch revenue report"
    });
  }
};
