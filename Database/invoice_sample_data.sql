-- ==========================================
-- MarketMind AI Database Sample Data - Milestone 2
-- Module: Invoice & Payment
-- ==========================================

-- 1. Ensure a role exists for users
INSERT INTO roles (role_id, role_name, description)
VALUES (1, 'Admin', 'Administrator access')
ON CONFLICT (role_id) DO NOTHING;

-- 2. Ensure an admin user exists
INSERT INTO users (user_id, full_name, email, password, phone, role_id)
VALUES (1, 'Admin User', 'admin@marketmind.com', '$2b$10$wK1WwLh/W/oX2X7n3wD5/.H5c7QO9cO6u30z3L.DlhC3J9O31O8m.', '1112223333', 1)
ON CONFLICT (email) DO NOTHING;

-- 3. Ensure a product category exists
INSERT INTO categories (category_id, category_name, description)
VALUES (1, 'Electronics', 'Electronic gadgets and devices')
ON CONFLICT (category_name) DO NOTHING;

-- 4. Ensure some products exist for the invoice items to reference
INSERT INTO products (product_id, product_name, category_id, price, description)
VALUES 
(1, 'Wireless Mouse', 1, 25.00, 'Ergonomic 2.4GHz wireless mouse'),
(2, 'Mechanical Keyboard', 1, 75.00, 'RGB mechanical keyboard with blue switches')
ON CONFLICT (product_id) DO NOTHING;

-- 5. Insert 2 Customers
INSERT INTO customers (customer_name, email, phone, address)
VALUES 
('Alice Smith', 'alice.smith@example.com', '5551234567', '789 Pine Rd, Sunnyvale'),
('Bob Jones', 'bob.jones@example.com', '5559876543', '101 Maple Ave, Mountain View')
ON CONFLICT (email) DO NOTHING;

-- 6. Insert 2 Invoices
-- Invoice 1: Linked to Alice Smith and Admin User
INSERT INTO invoices (invoice_no, customer_id, user_id, due_date, subtotal, tax, discount, total_amount, payment_status, notes)
SELECT 
    'INV-2026-001', 
    (SELECT customer_id FROM customers WHERE email = 'alice.smith@example.com' LIMIT 1),
    (SELECT user_id FROM users WHERE email = 'admin@marketmind.com' LIMIT 1),
    CURRENT_DATE + INTERVAL '15 days',
    100.00,
    10.00,
    5.00,
    105.00,
    'Partial',
    'First test invoice'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_no = 'INV-2026-001');

-- Invoice 2: Linked to Bob Jones and Admin User
INSERT INTO invoices (invoice_no, customer_id, user_id, due_date, subtotal, tax, discount, total_amount, payment_status, notes)
SELECT 
    'INV-2026-002', 
    (SELECT customer_id FROM customers WHERE email = 'bob.jones@example.com' LIMIT 1),
    (SELECT user_id FROM users WHERE email = 'admin@marketmind.com' LIMIT 1),
    CURRENT_DATE + INTERVAL '30 days',
    150.00,
    15.00,
    0.00,
    165.00,
    'Paid',
    'Second test invoice'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_no = 'INV-2026-002');

-- 7. Insert 2 Invoice Items
-- Item 1 for Invoice 1 (Wireless Mouse)
INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal)
SELECT 
    (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-001' LIMIT 1),
    (SELECT product_id FROM products WHERE product_name = 'Wireless Mouse' LIMIT 1),
    4,
    25.00,
    100.00
WHERE EXISTS (SELECT 1 FROM invoices WHERE invoice_no = 'INV-2026-001')
  AND NOT EXISTS (
      SELECT 1 FROM invoice_items WHERE invoice_id = (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-001' LIMIT 1)
  );

-- Item 2 for Invoice 2 (Mechanical Keyboard)
INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal)
SELECT 
    (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-002' LIMIT 1),
    (SELECT product_id FROM products WHERE product_name = 'Mechanical Keyboard' LIMIT 1),
    2,
    75.00,
    150.00
WHERE EXISTS (SELECT 1 FROM invoices WHERE invoice_no = 'INV-2026-002')
  AND NOT EXISTS (
      SELECT 1 FROM invoice_items WHERE invoice_id = (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-002' LIMIT 1)
  );

-- 8. Insert 2 Payments
-- Payment 1 for Invoice 1: Partial payment received of 50.00
INSERT INTO payments (invoice_id, amount_paid, payment_method, payment_status, transaction_reference, remarks)
SELECT 
    (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-001' LIMIT 1),
    50.00,
    'Credit Card',
    'Completed',
    'TXN-998877',
    'Partial payment received online'
WHERE EXISTS (SELECT 1 FROM invoices WHERE invoice_no = 'INV-2026-001')
  AND NOT EXISTS (
      SELECT 1 FROM payments WHERE invoice_id = (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-001' LIMIT 1)
  );

-- Payment 2 for Invoice 2: Full payment of 165.00
INSERT INTO payments (invoice_id, amount_paid, payment_method, payment_status, transaction_reference, remarks)
SELECT 
    (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-002' LIMIT 1),
    165.00,
    'Bank Transfer',
    'Completed',
    'TXN-665544',
    'Full payment received'
WHERE EXISTS (SELECT 1 FROM invoices WHERE invoice_no = 'INV-2026-002')
  AND NOT EXISTS (
      SELECT 1 FROM payments WHERE invoice_id = (SELECT invoice_id FROM invoices WHERE invoice_no = 'INV-2026-002' LIMIT 1)
  );
