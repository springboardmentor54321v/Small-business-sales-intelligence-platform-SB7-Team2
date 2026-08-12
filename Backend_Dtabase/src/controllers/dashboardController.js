// ==========================================
// MarketMind AI - Dashboard Controller
// Module: Dashboard & Analytics
// ==========================================

const { pool } = require("../config/db");

/**
 * * 
 * Get Main Dashboard Summary Data
 * @route GET /api/dashboard or GET /api/dashboard/summary
 * @access Private
 */
exports.getDashboardData = async (req, res) => {
  try {
    const [
      revenueRes,
      invoiceCountRes,
      paidInvoiceRes,
      unpaidInvoiceRes,
      partialInvoiceRes,
      customersRes,
      lowStockRes,
      recentInvoicesRes,
      topSellingRes
    ] = await Promise.all([
      // 1. Total Revenue from Completed Payments & Sales Transactions
      pool.query(`
        SELECT 
          COALESCE((SELECT SUM(amount_paid) FROM payments WHERE payment_status = 'Completed'), 0) +
          COALESCE((SELECT SUM(total_amount) FROM sales_transactions WHERE payment_status = 'Paid'), 0) AS total_revenue
      `),
      
      // 2. Total Invoices
      pool.query("SELECT COUNT(*) AS total_invoices FROM invoices"),
      
      // 3. Paid Invoices
      pool.query("SELECT COUNT(*) AS paid_invoices FROM invoices WHERE payment_status = 'Paid'"),

      // 4. Unpaid Invoices
      pool.query("SELECT COUNT(*) AS unpaid_invoices FROM invoices WHERE payment_status = 'Unpaid'"),

      // 5. Partial Invoices
      pool.query("SELECT COUNT(*) AS partial_invoices FROM invoices WHERE payment_status = 'Partial'"),
      
      // 6. Total Customers
      pool.query("SELECT COUNT(*) AS total_customers FROM customers"),
      
      // 7. Low Stock Count
      pool.query("SELECT COUNT(*) AS low_stock_count FROM inventory WHERE stock_quantity <= reorder_level"),
      
      // 8. Recent Invoices (Latest 5)
      pool.query(`
        SELECT 
          i.invoice_id,
          i.invoice_no,
          c.customer_name,
          i.total_amount,
          i.payment_status,
          i.invoice_date,
          i.due_date
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.customer_id
        ORDER BY i.invoice_id DESC
        LIMIT 5
      `),
      
      // 9. Top Selling Products (Top 5)
      pool.query(`
        SELECT 
          p.product_id,
          p.product_name,
          COALESCE(SUM(ii.quantity), 0) AS total_quantity_sold,
          COALESCE(SUM(ii.subtotal), 0) AS total_revenue
        FROM products p
        LEFT JOIN invoice_items ii ON p.product_id = ii.product_id
        GROUP BY p.product_id, p.product_name
        ORDER BY total_quantity_sold DESC, total_revenue DESC
        LIMIT 5
      `)
    ]);

    const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue);
    const totalInvoices = parseInt(invoiceCountRes.rows[0].total_invoices, 10);
    const paidInvoices = parseInt(paidInvoiceRes.rows[0].paid_invoices, 10);
    const unpaidInvoices = parseInt(unpaidInvoiceRes.rows[0].unpaid_invoices, 10);
    const partialInvoices = parseInt(partialInvoiceRes.rows[0].partial_invoices, 10);
    const totalCustomers = parseInt(customersRes.rows[0].total_customers, 10);
    const lowStockProducts = parseInt(lowStockRes.rows[0].low_stock_count, 10);

    const recentInvoices = recentInvoicesRes.rows.map(row => ({
      invoice_id: row.invoice_id,
      invoice_no: row.invoice_no,
      customer_name: row.customer_name,
      total_amount: parseFloat(row.total_amount),
      payment_status: row.payment_status,
      invoice_date: row.invoice_date,
      due_date: row.due_date
    }));

    const topSellingProducts = topSellingRes.rows.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      total_quantity_sold: parseInt(row.total_quantity_sold, 10),
      total_revenue: parseFloat(row.total_revenue)
    }));

    const recentSales = recentInvoices.map(row => ({
      sale_id: row.invoice_id,
      invoice_no: row.invoice_no,
      customer_name: row.customer_name,
      total_amount: row.total_amount,
      payment_status: row.payment_status,
      sale_date: row.invoice_date
    }));

    return res.status(200).json({
      success: true,
      message: "Dashboard analytics fetched successfully",
      dashboard: {
        totalRevenue,
        totalInvoices,
        totalSales: totalInvoices,
        paidInvoices,
        unpaidInvoices,
        partialInvoices,
        totalCustomers,
        lowStockProducts,
        recentInvoices,
        recentSales,
        topSellingProducts
      }
    });

  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics"
    });
  }
};

/**
 * Get Monthly Revenue Analytics
 * @route GET /api/dashboard/monthly-revenue
 * @access Private
 */
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date_series.month_date, 'Mon YYYY') AS month_name,
        TO_CHAR(date_series.month_date, 'YYYY-MM') AS month_key,
        COALESCE(SUM(p.amount_paid), 0) AS total_revenue
      FROM (
        SELECT generate_series(
          DATE_TRUNC('month', NOW() - INTERVAL '11 months'),
          DATE_TRUNC('month', NOW()),
          INTERVAL '1 month'
        ) AS month_date
      ) date_series
      LEFT JOIN payments p 
        ON DATE_TRUNC('month', p.payment_date) = date_series.month_date
       AND p.payment_status = 'Completed'
      GROUP BY date_series.month_date
      ORDER BY date_series.month_date ASC
    `);

    const monthlyRevenue = result.rows.map(row => ({
      month_name: row.month_name,
      month_key: row.month_key,
      total_revenue: parseFloat(row.total_revenue)
    }));

    return res.status(200).json({
      success: true,
      message: "Monthly revenue analytics fetched successfully",
      monthlyRevenue
    });
  } catch (error) {
    console.error("Error in getMonthlyRevenue:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly revenue analytics"
    });
  }
};

/**
 * Get Top Selling Products
 * @route GET /api/dashboard/top-selling
 * @access Private
 */
exports.getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const result = await pool.query(
      `SELECT 
        p.product_id,
        p.product_name,
        c.category_name,
        p.price,
        COALESCE(SUM(ii.quantity), 0) AS total_quantity_sold,
        COALESCE(SUM(ii.subtotal), 0) AS total_revenue
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN invoice_items ii ON p.product_id = ii.product_id
       GROUP BY p.product_id, p.product_name, c.category_name, p.price
       ORDER BY total_quantity_sold DESC, total_revenue DESC
       LIMIT $1`,
      [limit]
    );

    const topSellingProducts = result.rows.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      category_name: row.category_name,
      price: parseFloat(row.price),
      total_quantity_sold: parseInt(row.total_quantity_sold, 10),
      total_revenue: parseFloat(row.total_revenue)
    }));

    return res.status(200).json({
      success: true,
      message: "Top selling products fetched successfully",
      count: topSellingProducts.length,
      topSellingProducts
    });
  } catch (error) {
    console.error("Error in getTopSellingProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top selling products"
    });
  }
};

/**
 * Get Low Stock Products Alerts
 * @route GET /api/dashboard/low-stock
 * @access Private
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.inventory_id,
        p.product_id,
        p.product_name,
        c.category_name,
        i.stock_quantity,
        i.reorder_level,
        i.warehouse_location,
        i.last_updated
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE i.stock_quantity <= i.reorder_level
      ORDER BY i.stock_quantity ASC
    `);

    const lowStockProducts = result.rows.map(row => ({
      inventory_id: row.inventory_id,
      product_id: row.product_id,
      product_name: row.product_name,
      category_name: row.category_name,
      stock_quantity: parseInt(row.stock_quantity, 10),
      reorder_level: parseInt(row.reorder_level, 10),
      warehouse_location: row.warehouse_location,
      last_updated: row.last_updated
    }));

    return res.status(200).json({
      success: true,
      message: "Low stock products fetched successfully",
      count: lowStockProducts.length,
      lowStockProducts
    });
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch low stock products"
    });
  }
};

/**
 * Get Recent Invoices
 * @route GET /api/dashboard/recent-invoices
 * @access Private
 */
exports.getRecentInvoices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const result = await pool.query(
      `SELECT 
        i.invoice_id,
        i.invoice_no,
        i.customer_id,
        c.customer_name,
        c.email as customer_email,
        i.total_amount,
        i.payment_status,
        i.invoice_date,
        i.due_date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       ORDER BY i.invoice_id DESC
       LIMIT $1`,
      [limit]
    );

    const recentInvoices = result.rows.map(row => ({
      invoice_id: row.invoice_id,
      invoice_no: row.invoice_no,
      customer_id: row.customer_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      total_amount: parseFloat(row.total_amount),
      payment_status: row.payment_status,
      invoice_date: row.invoice_date,
      due_date: row.due_date
    }));

    return res.status(200).json({
      success: true,
      message: "Recent invoices fetched successfully",
      count: recentInvoices.length,
      recentInvoices
    });
  } catch (error) {
    console.error("Error in getRecentInvoices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent invoices"
    });
  }
};

/**
 * Get Customer Statistics
 * @route GET /api/dashboard/customer-stats
 * @access Private
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const [statsRes, topCustomerRes] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE((SELECT COUNT(*) FROM customers), 0) AS total_customers,
          COALESCE((SELECT COUNT(*) FROM customers WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)), 0) AS new_customers_this_month,
          COALESCE((SELECT COUNT(DISTINCT customer_id) FROM invoices), 0) AS active_customers
      `),
      pool.query(`
        SELECT 
          c.customer_id,
          c.customer_name,
          c.email,
          COALESCE(SUM(i.total_amount), 0) AS total_spent,
          COUNT(i.invoice_id) AS total_invoices
        FROM customers c
        JOIN invoices i ON c.customer_id = i.customer_id
        GROUP BY c.customer_id, c.customer_name, c.email
        ORDER BY total_spent DESC
        LIMIT 1
      `)
    ]);

    const stats = statsRes.rows[0];
    const topCustomerRow = topCustomerRes.rows[0] || null;

    const topCustomer = topCustomerRow ? {
      customer_id: topCustomerRow.customer_id,
      customer_name: topCustomerRow.customer_name,
      email: topCustomerRow.email,
      total_spent: parseFloat(topCustomerRow.total_spent),
      total_invoices: parseInt(topCustomerRow.total_invoices, 10)
    } : null;

    return res.status(200).json({
      success: true,
      message: "Customer statistics fetched successfully",
      customerStats: {
        totalCustomers: parseInt(stats.total_customers, 10),
        newCustomersThisMonth: parseInt(stats.new_customers_this_month, 10),
        activeCustomers: parseInt(stats.active_customers, 10),
        topCustomer
      }
    });
  } catch (error) {
    console.error("Error in getCustomerStats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer statistics"
    });
  }
};
