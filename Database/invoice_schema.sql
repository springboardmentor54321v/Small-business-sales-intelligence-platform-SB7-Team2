-- ==========================================
-- MarketMind AI Database Schema - Milestone 2
-- Version: 1.0
-- Module: Invoice & Payment
-- ==========================================

-- ==========================================
-- INVOICES TABLE
-- ==========================================
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER,
    user_id INTEGER,
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10,2) DEFAULT 0 CHECK (tax >= 0),
    discount NUMERIC(10,2) DEFAULT 0 CHECK (discount >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_status VARCHAR(20)
CHECK
(
payment_status IN
(
'Paid',
'Unpaid',
'Partial'
)
),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoice_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_invoice_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ==========================================
-- INVOICE ITEMS TABLE
-- ==========================================
CREATE TABLE invoice_items (
    invoice_item_id SERIAL PRIMARY KEY,
    invoice_id INTEGER,
    product_id INTEGER,
    quantity INTEGER CHECK (quantity > 0),
    unit_price NUMERIC(10,2) CHECK (unit_price >= 0),
    subtotal NUMERIC(10,2) CHECK (subtotal >= 0),

    CONSTRAINT fk_invoiceitem_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(invoice_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_invoiceitem_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ==========================================
-- PAYMENTS TABLE
-- ==========================================
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    invoice_id INTEGER,
    amount_paid NUMERIC(10,2) CHECK (amount_paid >= 0),
    payment_method VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20)
CHECK (
    payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')
),
    transaction_reference VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(invoice_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
