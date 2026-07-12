const { pool } = require("../config/db");

/**
 * Get Dashboard Data
 * @route GET /api/dashboard
 * @access Private
 */
exports.getDashboardData = async (req, res) => {
  try {
    // Run all database queries in parallel
    const [
      revenueRes,
      salesRes,
      productsRes,
      customersRes,
      lowStockRes,
      recentSalesRes,
      topSellingRes
    ] = await Promise.all([
      // 1. Total Revenue
      pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM sales_transactions"),
      
      // 2. Total Sales
      pool.query("SELECT COUNT(*) AS total_sales FROM sales_transactions"),
      
      // 3. Total Products
      pool.query("SELECT COUNT(*) AS total_products FROM products"),
      
      // 4. Total Customers
      pool.query("SELECT COUNT(*) AS total_customers FROM customers"),
      
      // 5. Low Stock Products
      pool.query("SELECT COUNT(*) AS low_stock_count FROM inventory WHERE stock_quantity <= reorder_level"),
      
      // 6. Recent Sales
      pool.query(`
        SELECT 
          st.sale_id,
          st.invoice_no,
          c.customer_name,
          st.total_amount,
          st.payment_method,
          st.payment_status,
          st.sale_date
        FROM sales_transactions st
        JOIN customers c ON st.customer_id = c.customer_id
        ORDER BY st.sale_date DESC
        LIMIT 5
      `),
      
      // 7. Top Selling Products
      pool.query(`
        SELECT 
          p.product_name,
          COALESCE(SUM(si.quantity), 0) AS total_quantity_sold
        FROM sales_items si
        JOIN products p ON si.product_id = p.product_id
        GROUP BY p.product_id, p.product_name
        ORDER BY total_quantity_sold DESC
        LIMIT 5
      `)
    ]);

    // Format metrics into numeric types
    const totalRevenue = Number(revenueRes.rows[0].total_revenue);
    const totalSales = parseInt(salesRes.rows[0].total_sales, 10);
    const totalProducts = parseInt(productsRes.rows[0].total_products, 10);
    const totalCustomers = parseInt(customersRes.rows[0].total_customers, 10);
    const lowStockProducts = parseInt(lowStockRes.rows[0].low_stock_count, 10);

    // Format recent sales
    const recentSales = recentSalesRes.rows.map(row => {
      let formattedDate = row.sale_date;
      if (row.sale_date instanceof Date) {
        const year = row.sale_date.getFullYear();
        const month = String(row.sale_date.getMonth() + 1).padStart(2, '0');
        const day = String(row.sale_date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } else if (typeof row.sale_date === 'string') {
        formattedDate = row.sale_date.split('T')[0];
      }
      return {
        sale_id: row.sale_id,
        invoice_no: row.invoice_no,
        customer_name: row.customer_name,
        total_amount: Number(row.total_amount),
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        sale_date: formattedDate
      };
    });

    // Format top selling products
    const topSellingProducts = topSellingRes.rows.map(row => ({
      product_name: row.product_name,
      total_quantity_sold: parseInt(row.total_quantity_sold, 10)
    }));

    return res.status(200).json({
      success: true,
      dashboard: {
        totalRevenue,
        totalSales,
        totalProducts,
        totalCustomers,
        lowStockProducts,
        recentSales,
        topSellingProducts
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics"
    });
  }
};
