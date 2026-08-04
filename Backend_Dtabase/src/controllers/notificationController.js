const { pool } = require("../config/db");

/**
 * Get Alerts and Reminders
 * @route GET /api/notifications
 * @access Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const { type } = req.query;
    let alerts = [];

    // Query user role name
    const userRoleId = req.user?.role || req.user?.role_id;
    const roleResult = await pool.query("SELECT role_name FROM roles WHERE role_id = $1", [userRoleId]);
    const roleName = roleResult.rows.length > 0 ? roleResult.rows[0].role_name : "";

    const hasInventoryAccess = ["System Administrator", "Business Owner", "Store Manager"].includes(roleName) || userRoleId === 1;
    const hasInvoiceAccess = ["System Administrator", "Business Owner", "Sales Executive"].includes(roleName) || userRoleId === 1;

    // 1. Fetch low stock alerts if type is not specified or specifically low_stock AND user has access
    const fetchLowStock = (!type || type === "low_stock") && hasInventoryAccess;
    // 2. Fetch overdue invoices if type is not specified or specifically overdue_invoice AND user has access
    const fetchOverdue = (!type || type === "overdue_invoice") && hasInvoiceAccess;

    const queries = [];

    if (fetchLowStock) {
      queries.push(
        pool.query(`
          SELECT 
            i.inventory_id,
            i.product_id,
            i.stock_quantity,
            i.reorder_level,
            i.warehouse_location,
            i.last_updated,
            p.product_name,
            p.price
          FROM inventory i
          JOIN products p ON i.product_id = p.product_id
          WHERE i.stock_quantity <= i.reorder_level
          ORDER BY i.last_updated DESC, i.inventory_id DESC
        `)
      );
    } else {
      queries.push(Promise.resolve(null));
    }

    if (fetchOverdue) {
      queries.push(
        pool.query(`
          SELECT 
            i.invoice_id,
            i.invoice_no,
            i.due_date,
            i.total_amount,
            i.payment_status,
            i.invoice_date,
            c.customer_name
          FROM invoices i
          LEFT JOIN customers c ON i.customer_id = c.customer_id
          WHERE i.payment_status != 'Paid' AND i.due_date < CURRENT_DATE
          ORDER BY i.due_date ASC, i.invoice_id DESC
        `)
      );
    } else {
      queries.push(Promise.resolve(null));
    }

    const [lowStockRes, overdueRes] = await Promise.all(queries);

    if (lowStockRes && lowStockRes.rows.length > 0) {
      const lowStockAlerts = lowStockRes.rows.map((row) => ({
        id: `low_stock_${row.product_id}`,
        type: "low_stock",
        title: `Low Stock Alert: ${row.product_name}`,
        message: `Product "${row.product_name}" is running low on stock. Current quantity: ${row.stock_quantity}, Reorder level: ${row.reorder_level}.`,
        date: row.last_updated,
        metadata: {
          product_id: row.product_id,
          product_name: row.product_name,
          stock_quantity: row.stock_quantity,
          reorder_level: row.reorder_level,
          warehouse_location: row.warehouse_location,
          price: parseFloat(row.price)
        }
      }));
      alerts = alerts.concat(lowStockAlerts);
    }

    if (overdueRes && overdueRes.rows.length > 0) {
      const overdueAlerts = overdueRes.rows.map((row) => {
        const formattedDate = row.due_date instanceof Date 
          ? row.due_date.toISOString().split("T")[0] 
          : String(row.due_date).split("T")[0];
        return {
          id: `overdue_invoice_${row.invoice_id}`,
          type: "overdue_invoice",
          title: `Overdue Invoice: ${row.invoice_no}`,
          message: `Invoice ${row.invoice_no} for customer "${row.customer_name}" is overdue since ${formattedDate}. Total outstanding: $${parseFloat(row.total_amount).toFixed(2)}.`,
          date: row.due_date,
          metadata: {
            invoice_id: row.invoice_id,
            invoice_no: row.invoice_no,
            due_date: row.due_date,
            total_amount: parseFloat(row.total_amount),
            payment_status: row.payment_status,
            customer_name: row.customer_name,
            invoice_date: row.invoice_date
          }
        };
      });
      alerts = alerts.concat(overdueAlerts);
    }

    // Sort combined notifications by date descending
    alerts.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      count: alerts.length,
      notifications: alerts
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};
