



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
    stock_quantity INTEGER       NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);




CREATE TABLE public.orders (
    order_id     SERIAL PRIMARY KEY,
    client_id    INTEGER        NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
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
    unit_price    NUMERIC(10,2)  NOT NULL
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





CREATE INDEX idx_clients_email              ON public.clients(client_email);
CREATE INDEX idx_orders_status              ON public.orders(order_status);
CREATE INDEX idx_orders_order_date          ON public.orders(order_date);
CREATE INDEX idx_orders_client_id           ON public.orders(client_id);
CREATE INDEX idx_order_items_order_id       ON public.order_items(order_id);
CREATE INDEX idx_order_items_item_id        ON public.order_items(item_id);
CREATE INDEX idx_items_product_id           ON public.items(product_id);
CREATE INDEX idx_stock_adj_item_id          ON public.stock_adjustments(item_id);
CREATE INDEX idx_transactions_order_id      ON public.transactions(order_id);
CREATE INDEX idx_transactions_created_at    ON public.transactions(created_at);






INSERT INTO public.clients (client_id, client_name, client_email, client_dob, password_hash) VALUES
(1, 'alice smith',  'alice.smith@balamand.com', '2000-01-01', '$2b$10$4B7xZOMXYURgWfMDUpR9iOny5ob5Z4w.pI71k1qtyGDyw.F3ugrmS'),
(2, 'john smith 1', 'john.smith@balamand.edu',  '2001-01-01', '$2b$10$xR3cc2rUT2g9XL7D/rZZf.B3CNzH4aFwRVNnfu95EOwwerDLq.cfq');


INSERT INTO public.departments (dep_id, dep_name) VALUES
(1, 'Information Technology'),
(2, 'SALE'),
(3, 'HR'),
(9, 'dfd');


INSERT INTO public.products (product_id, product_name, product_description, category, is_active) VALUES
(1, 'Wireless Mouse',    'Ergonomic wireless mouse',       'Electronics', TRUE),
(2, 'Mechanical Keyboard','RGB mechanical keyboard',        'Electronics', TRUE),
(3, 'USB-C Hub',         '7-in-1 USB-C docking station',   'Accessories', TRUE);


INSERT INTO public.items (item_id, product_id, item_name, item_sku, unit_price, stock_quantity) VALUES
(1, 1, 'Wireless Mouse - Black',     'WM-BLK-001', 29.99, 150),
(2, 1, 'Wireless Mouse - White',     'WM-WHT-002', 29.99, 80),
(3, 2, 'Mech Keyboard - Red Switch', 'KB-RED-001', 89.99, 45),
(4, 3, 'USB-C Hub 7-in-1',           'HUB-7IN1-001', 49.99, 200);


INSERT INTO public.orders (order_id, client_id, order_date, order_total, order_status) VALUES
(1, 1, '2026-01-15', 149.97, 'completed'),
(2, 1, '2026-02-10', 59.98,  'pending'),
(3, 2, '2026-02-20', 89.99,  'completed');


INSERT INTO public.order_items (order_item_id, order_id, item_id, quantity, unit_price) VALUES
(1, 1, 1, 2, 29.99),
(2, 1, 3, 1, 89.99),
(3, 2, 2, 2, 29.99),
(4, 3, 3, 1, 89.99);


INSERT INTO public.stock_adjustments (adjustment_id, item_id, quantity_change, reason, reference_type, reference_id) VALUES
(1, 1, -2, 'Order completed', 'order', 1),
(2, 3, -1, 'Order completed', 'order', 1),
(3, 3, -1, 'Order completed', 'order', 3);


INSERT INTO public.transactions (transaction_id, order_id, amount, transaction_type) VALUES
(1, 1, 149.97, 'payment'),
(2, 3, 89.99,  'payment');



SELECT setval('public.clients_client_id_seq',        10, true);
SELECT setval('public.departments_dep_id_seq',        9, true);
SELECT setval('public.products_product_id_seq',      10, true);
SELECT setval('public.items_item_id_seq',            10, true);
SELECT setval('public.orders_order_id_seq',          10, true);
SELECT setval('public.order_items_order_item_id_seq',10, true);
SELECT setval('public.stock_adjustments_adjustment_id_seq', 10, true);
SELECT setval('public.transactions_transaction_id_seq',     10, true);
cd



