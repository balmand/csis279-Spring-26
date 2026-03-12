



SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;





DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.stock_adjustments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;



CREATE TABLE public.clients (
    client_id     SERIAL PRIMARY KEY,
    client_name   TEXT         NOT NULL,
    client_email  TEXT         UNIQUE,
    client_dob    DATE,
    role          TEXT         NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'employee', 'customer')),
    password_hash TEXT         NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);



CREATE TABLE public.departments (
    dep_id    SERIAL PRIMARY KEY,
    dep_name  TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE public.products (
    product_id          SERIAL PRIMARY KEY,
    product_name        TEXT          NOT NULL,
    product_description TEXT,
    category            TEXT,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);



CREATE TABLE public.items (
    item_id        SERIAL PRIMARY KEY,
    product_id     INTEGER       REFERENCES public.products(product_id) ON DELETE SET NULL,
    item_name      TEXT          NOT NULL,
    item_sku       VARCHAR(100)  NOT NULL UNIQUE,
    unit_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER       NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);




CREATE TABLE public.orders (
    order_id     SERIAL PRIMARY KEY,
    client_id    INTEGER        NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
    employee_id  INTEGER        REFERENCES public.clients(client_id) ON DELETE SET NULL,
    order_date   DATE           NOT NULL DEFAULT CURRENT_DATE,
    order_total  NUMERIC(10,2)  NOT NULL DEFAULT 0,
    order_status TEXT           NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);





CREATE TABLE public.order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id      INTEGER        NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    item_id       INTEGER        NOT NULL REFERENCES public.items(item_id)   ON DELETE RESTRICT,
    quantity      INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price    NUMERIC(10,2)  NOT NULL,
    unit_cost     NUMERIC(10,2)  NOT NULL DEFAULT 0
);




CREATE TABLE public.stock_adjustments (
    adjustment_id  SERIAL PRIMARY KEY,
    item_id        INTEGER      NOT NULL REFERENCES public.items(item_id) ON DELETE CASCADE,
    quantity_change INTEGER     NOT NULL,
    reason         TEXT         NOT NULL,
    reference_type TEXT,
    reference_id   INTEGER,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);




CREATE TABLE public.transactions (
    transaction_id   SERIAL PRIMARY KEY,
    order_id         INTEGER        NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    amount           NUMERIC(10,2)  NOT NULL,
    transaction_type TEXT           NOT NULL DEFAULT 'payment',
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);





-----------loubna task 4-----------------
-- Order status/date indexes
CREATE INDEX idx_orders_status          ON public.orders(order_status);
CREATE INDEX idx_orders_order_date      ON public.orders(order_date);

-- Order item lookup index (Foreign Key)
CREATE INDEX idx_order_items_order_id   ON public.order_items(order_id);

-- Transaction lookup index (Foreign Key)
CREATE INDEX idx_transactions_order_id  ON public.transactions(order_id);
-----------loubna task 4-----------------


CREATE INDEX idx_clients_email              ON public.clients(client_email);
CREATE INDEX idx_orders_status              ON public.orders(order_status);
CREATE INDEX idx_orders_order_date          ON public.orders(order_date);
CREATE INDEX idx_orders_client_id           ON public.orders(client_id);
CREATE INDEX idx_orders_employee_id         ON public.orders(employee_id);
CREATE INDEX idx_order_items_order_id       ON public.order_items(order_id);
CREATE INDEX idx_order_items_item_id        ON public.order_items(item_id);
CREATE INDEX idx_items_product_id           ON public.items(product_id);
CREATE INDEX idx_products_category          ON public.products(category);
CREATE INDEX idx_stock_adj_item_id          ON public.stock_adjustments(item_id);
CREATE INDEX idx_transactions_order_id      ON public.transactions(order_id);
CREATE INDEX idx_transactions_created_at    ON public.transactions(created_at);






INSERT INTO public.clients (client_id, client_name, client_email, client_dob, role, password_hash) VALUES
(1, 'alice smith',     'alice.smith@balamand.com', '2000-01-01', 'admin',    '$2b$10$4B7xZOMXYURgWfMDUpR9iOny5ob5Z4w.pI71k1qtyGDyw.F3ugrmS'),
(2, 'john smith 1',    'john.smith@balamand.edu',  '2001-01-01', 'employee', '$2b$10$xR3cc2rUT2g9XL7D/rZZf.B3CNzH4aFwRVNnfu95EOwwerDLq.cfq'),
(3, 'maya nassar',     'maya.nassar@balamand.edu', '1999-06-12', 'employee', ''),
(4, 'karim saad',      'karim.saad@balamand.edu',  '1998-11-03', 'employee', ''),
(5, 'sara customer',   'sara.customer@mail.com',   '2002-04-22', 'customer', ''),
(6, 'fadi customer',   'fadi.customer@mail.com',   '2003-08-14', 'customer', '');


INSERT INTO public.departments (dep_id, dep_name) VALUES
(1, 'Information Technology'),
(2, 'SALE'),
(3, 'HR'),
(9, 'dfd');


INSERT INTO public.products (product_id, product_name, product_description, category, is_active) VALUES
(1, 'Wireless Mouse',    'Ergonomic wireless mouse',       'Electronics', TRUE),
(2, 'Mechanical Keyboard','RGB mechanical keyboard',        'Electronics', TRUE),
(3, 'USB-C Hub',         '7-in-1 USB-C docking station',   'Accessories', TRUE),
(4, 'Laptop Stand',      'Adjustable aluminum stand',      'Accessories', TRUE);


INSERT INTO public.items (item_id, product_id, item_name, item_sku, unit_price, unit_cost, stock_quantity) VALUES
(1, 1, 'Wireless Mouse - Black',     'WM-BLK-001',   29.99, 18.00, 150),
(2, 1, 'Wireless Mouse - White',     'WM-WHT-002',   29.99, 19.00, 80),
(3, 2, 'Mech Keyboard - Red Switch', 'KB-RED-001',   89.99, 60.00, 45),
(4, 3, 'USB-C Hub 7-in-1',           'HUB-7IN1-001', 49.99, 34.00, 200),
(5, 4, 'Laptop Stand - Silver',      'LPS-SLV-001',  39.99, 22.00, 120);


INSERT INTO public.orders (order_id, client_id, employee_id, order_date, order_total, order_status) VALUES
(1, 5, 2, '2026-01-15', 149.97, 'completed'),
(2, 5, 3, '2026-02-10', 59.98,  'pending'),
(3, 6, 3, '2026-02-20', 89.99,  'completed'),
(4, 5, 2, '2026-02-25', 179.96, 'completed'),
(5, 6, 4, '2026-03-01', 79.98,  'completed'),
(6, 5, 4, '2026-03-05', 49.99,  'completed'),
(7, 6, 3, '2026-03-08', 239.96, 'completed'),
(8, 5, 2, '2026-03-09', 29.99,  'cancelled');


INSERT INTO public.order_items (order_item_id, order_id, item_id, quantity, unit_price, unit_cost) VALUES
(1, 1, 1, 2, 29.99, 18.00),
(2, 1, 3, 1, 89.99, 60.00),
(3, 2, 2, 2, 29.99, 19.00),
(4, 3, 3, 1, 89.99, 95.00),
(5, 4, 1, 1, 29.99, 18.00),
(6, 4, 4, 3, 49.99, 34.00),
(7, 5, 2, 1, 29.99, 19.00),
(8, 5, 4, 1, 49.99, 34.00),
(9, 6, 4, 1, 49.99, 55.00),
(10, 7, 3, 2, 89.99, 60.00),
(11, 7, 1, 2, 29.99, 18.00),
(12, 8, 2, 1, 29.99, 19.00);


INSERT INTO public.stock_adjustments (adjustment_id, item_id, quantity_change, reason, reference_type, reference_id) VALUES
(1, 1, -2, 'Order completed', 'order', 1),
(2, 3, -1, 'Order completed', 'order', 1),
(3, 3, -1, 'Order completed', 'order', 3),
(4, 1, -1, 'Order completed', 'order', 4),
(5, 4, -3, 'Order completed', 'order', 4),
(6, 2, -1, 'Order completed', 'order', 5),
(7, 4, -1, 'Order completed', 'order', 5),
(8, 4, -1, 'Order completed', 'order', 6),
(9, 3, -2, 'Order completed', 'order', 7),
(10, 1, -2, 'Order completed', 'order', 7);


INSERT INTO public.transactions (transaction_id, order_id, amount, transaction_type) VALUES
(1, 1, 149.97, 'payment'),
(2, 3, 89.99,  'payment'),
(3, 4, 179.96, 'payment'),
(4, 5, 79.98,  'payment'),
(5, 6, 49.99,  'payment'),
(6, 7, 239.96, 'payment');



SELECT setval('public.clients_client_id_seq',        10, true);
SELECT setval('public.departments_dep_id_seq',        9, true);
SELECT setval('public.products_product_id_seq',      10, true);
SELECT setval('public.items_item_id_seq',            10, true);
SELECT setval('public.orders_order_id_seq',          10, true);
SELECT setval('public.order_items_order_item_id_seq',10, true);
SELECT setval('public.stock_adjustments_adjustment_id_seq', 10, true);
SELECT setval('public.transactions_transaction_id_seq',     10, true);
cd



