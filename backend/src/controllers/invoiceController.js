const { pool } = require("../config/db");

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoices");

    res.status(200).json({
      success: true,
      invoices: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const {
      invoice_number,
      customer_id,
      sale_id,
      total_amount,
      status,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO invoices
      (invoice_number, customer_id, sale_id, total_amount, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [invoice_number, customer_id, sale_id, total_amount, status]
    );

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM invoices WHERE invoice_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      invoice_number,
      customer_id,
      sale_id,
      total_amount,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE invoices
       SET invoice_number=$1,
           customer_id=$2,
           sale_id=$3,
           total_amount=$4,
           status=$5
       WHERE invoice_id=$6
       RETURNING *`,
      [
        invoice_number,
        customer_id,
        sale_id,
        total_amount,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM invoices WHERE invoice_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



module.exports = {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};