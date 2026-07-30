// ==========================================
// MarketMind AI - Validation Middleware
// Module: Request Validation (Joi)
// ==========================================

const Joi = require("joi");

/**
 * Reusable Body Validator Middleware
 * @param {Joi.ObjectSchema} schema Joi Schema object
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    
    if (error) {
      const errorDetails = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message.replace(/['"]/g, "")
      }));

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errorDetails
      });
    }
    
    next();
  };
};

/**
 * Reusable Query Validator Middleware
 * @param {Joi.ObjectSchema} schema Joi Schema object
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, allowUnknown: true });

    if (error) {
      const errorDetails = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message.replace(/['"]/g, "")
      }));

      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: errorDetails
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Reusable Parameter Validator Middleware
 * @param {Joi.ObjectSchema} schema Joi Schema object
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid route parameter",
        details: error.details[0].message.replace(/['"]/g, "")
      });
    }

    next();
  };
};

// ----------------------------------------------------
// 1. INVOICE SCHEMAS
// ----------------------------------------------------

const getInvoicesQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  payment_status: Joi.string().valid("Paid", "Unpaid", "Partial", "Overdue").allow("").optional(),
  status: Joi.string().valid("Paid", "Unpaid", "Partial", "Overdue").allow("").optional(),
  customer_id: Joi.number().integer().positive().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  overdue: Joi.boolean().optional(),
  page: Joi.number().integer().positive().default(1).optional(),
  limit: Joi.number().integer().positive().default(10).optional()
});

const createInvoiceSchema = Joi.object({
  customer_id: Joi.number().integer().positive().required().messages({
    "number.base": "customer_id must be a number",
    "number.integer": "customer_id must be an integer",
    "number.positive": "customer_id must be a positive integer",
    "any.required": "customer_id is a required field"
  }),
  user_id: Joi.number().integer().positive().required().messages({
    "number.base": "user_id must be a number",
    "number.integer": "user_id must be an integer",
    "number.positive": "user_id must be a positive integer",
    "any.required": "user_id is a required field"
  }),
  due_date: Joi.date().iso().required().messages({
    "date.base": "due_date must be a valid date",
    "date.format": "due_date must be in ISO format (YYYY-MM-DD)",
    "any.required": "due_date is a required field"
  }),
  tax: Joi.number().min(0).optional().messages({
    "number.base": "tax must be a number",
    "number.min": "tax cannot be negative"
  }),
  discount: Joi.number().min(0).optional().messages({
    "number.base": "discount must be a number",
    "number.min": "discount cannot be negative"
  }),
  notes: Joi.string().allow("").optional(),
  payment_status: Joi.string().valid("Paid", "Unpaid", "Partial").optional().messages({
    "any.only": "payment_status must be one of: Paid, Unpaid, Partial"
  }),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().positive().required().messages({
          "number.base": "product_id must be a number",
          "number.integer": "product_id must be an integer",
          "number.positive": "product_id must be a positive integer",
          "any.required": "product_id is required for each item"
        }),
        quantity: Joi.number().integer().positive().required().messages({
          "number.base": "quantity must be a number",
          "number.integer": "quantity must be an integer",
          "number.positive": "quantity must be a positive integer greater than 0",
          "any.required": "quantity is required for each item"
        })
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "items must be an array",
      "array.min": "items array must contain at least one item",
      "any.required": "items is a required field"
    })
});

const updateInvoiceSchema = Joi.object({
  due_date: Joi.date().iso().optional().messages({
    "date.base": "due_date must be a valid date",
    "date.format": "due_date must be in ISO format (YYYY-MM-DD)"
  }),
  tax: Joi.number().min(0).optional().messages({
    "number.base": "tax must be a number",
    "number.min": "tax cannot be negative"
  }),
  discount: Joi.number().min(0).optional().messages({
    "number.base": "discount must be a number",
    "number.min": "discount cannot be negative"
  }),
  notes: Joi.string().allow("").optional(),
  payment_status: Joi.string().valid("Paid", "Unpaid", "Partial").optional().messages({
    "any.only": "payment_status must be one of: Paid, Unpaid, Partial"
  })
});

// ----------------------------------------------------
// 2. PAYMENT SCHEMAS
// ----------------------------------------------------

const createPaymentSchema = Joi.object({
  invoice_id: Joi.number().integer().positive().required().messages({
    "number.base": "invoice_id must be a number",
    "number.integer": "invoice_id must be an integer",
    "number.positive": "invoice_id must be a positive integer",
    "any.required": "invoice_id is a required field"
  }),
  amount_paid: Joi.number().positive().required().messages({
    "number.base": "amount_paid must be a number",
    "number.positive": "amount_paid must be a positive number greater than 0",
    "any.required": "amount_paid is a required field"
  }),
  payment_method: Joi.string().max(50).allow("").optional().messages({
    "string.max": "payment_method length must not exceed 50 characters"
  }),
  payment_status: Joi.string().valid("Pending", "Completed", "Failed", "Refunded").optional().messages({
    "any.only": "payment_status must be one of: Pending, Completed, Failed, Refunded"
  }),
  transaction_reference: Joi.string().max(100).allow("").optional().messages({
    "string.max": "transaction_reference length must not exceed 100 characters"
  }),
  remarks: Joi.string().allow("").optional()
});

const updatePaymentSchema = Joi.object({
  amount_paid: Joi.number().positive().optional().messages({
    "number.base": "amount_paid must be a number",
    "number.positive": "amount_paid must be a positive number greater than 0"
  }),
  payment_method: Joi.string().max(50).allow("").optional().messages({
    "string.max": "payment_method length must not exceed 50 characters"
  }),
  payment_status: Joi.string().valid("Pending", "Completed", "Failed", "Refunded").optional().messages({
    "any.only": "payment_status must be one of: Pending, Completed, Failed, Refunded"
  }),
  transaction_reference: Joi.string().max(100).allow("").optional().messages({
    "string.max": "transaction_reference length must not exceed 100 characters"
  }),
  remarks: Joi.string().allow("").optional()
});

// ----------------------------------------------------
// 3. PARAMETER SCHEMAS
// ----------------------------------------------------

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "id parameter must be a number",
    "number.integer": "id parameter must be an integer",
    "number.positive": "id parameter must be a positive integer"
  })
});

// ----------------------------------------------------
// 4. INVENTORY QUERY SCHEMAS
// ----------------------------------------------------
const getInventoryQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  category_id: Joi.number().integer().positive().optional(),
  stock_status: Joi.string().valid("low", "normal").optional(),
  page: Joi.number().integer().positive().default(1).optional(),
  limit: Joi.number().integer().positive().default(10).optional()
});

const bulkUpdateInventorySchema = Joi.object({
  updates: Joi.array().items(
    Joi.object({
      product_id: Joi.number().integer().positive().required().messages({
        "number.base": "product_id must be a number",
        "number.integer": "product_id must be an integer",
        "number.positive": "product_id must be a positive integer",
        "any.required": "product_id is required for bulk update"
      }),
      stock_quantity: Joi.number().integer().min(0).optional().messages({
        "number.base": "stock_quantity must be a number",
        "number.min": "stock_quantity cannot be negative"
      }),
      reorder_level: Joi.number().integer().min(0).optional().messages({
        "number.base": "reorder_level must be a number",
        "number.min": "reorder_level cannot be negative"
      })
    }).or("stock_quantity", "reorder_level").required()
  ).min(1).required().messages({
    "array.base": "updates must be an array",
    "array.min": "updates must contain at least one item",
    "any.required": "updates is required for bulk update"
  })
});

// ----------------------------------------------------
// 5. SALES QUERY SCHEMAS
// ----------------------------------------------------
const getSalesQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  payment_method: Joi.string().allow("").optional(),
  page: Joi.number().integer().positive().default(1).optional(),
  limit: Joi.number().integer().positive().default(10).optional()
});

// ----------------------------------------------------
// 6. NOTIFICATION QUERY SCHEMAS
// ----------------------------------------------------
const getNotificationsQuerySchema = Joi.object({
  type: Joi.string().valid("low_stock", "overdue_invoice").allow("").optional()
});

// ----------------------------------------------------
// 7. BULK INVOICE SCHEMAS
// ----------------------------------------------------
const bulkUpdateInvoicesSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive().required()).min(1).required().messages({
    "array.base": "ids must be an array of positive integers",
    "array.min": "ids must contain at least one invoice ID",
    "any.required": "ids is required for bulk update"
  }),
  payment_status: Joi.string().valid("Paid", "Unpaid", "Partial").required().messages({
    "any.only": "payment_status must be one of: Paid, Unpaid, Partial",
    "any.required": "payment_status is required for bulk update"
  })
});

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  getInvoicesQuerySchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  createPaymentSchema,
  updatePaymentSchema,
  idParamSchema,
  getInventoryQuerySchema,
  bulkUpdateInventorySchema,
  getSalesQuerySchema,
  getNotificationsQuerySchema,
  bulkUpdateInvoicesSchema
};
