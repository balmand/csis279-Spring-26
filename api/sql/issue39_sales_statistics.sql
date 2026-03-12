-- Issue #39 migration: sales statistics foundation
-- Safe to run on existing databases.

BEGIN;

ALTER TABLE IF EXISTS public.clients
    ADD COLUMN IF NOT EXISTS role TEXT;

UPDATE public.clients
SET role = CASE
    WHEN client_email = 'alice.smith@balamand.com' THEN 'admin'
    WHEN client_email LIKE '%@balamand.edu' THEN 'employee'
    ELSE 'customer'
END
WHERE role IS NULL OR role NOT IN ('admin', 'employee', 'customer');

ALTER TABLE IF EXISTS public.clients
    ALTER COLUMN role SET DEFAULT 'customer';

ALTER TABLE IF EXISTS public.clients
    ALTER COLUMN role SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'clients_role_check'
          AND conrelid = 'public.clients'::regclass
    ) THEN
        ALTER TABLE public.clients
            ADD CONSTRAINT clients_role_check
            CHECK (role IN ('admin', 'employee', 'customer'));
    END IF;
END $$;

ALTER TABLE IF EXISTS public.items
    ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.orders
    ADD COLUMN IF NOT EXISTS employee_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_employee_id_fkey'
          AND conrelid = 'public.orders'::regclass
    ) THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_employee_id_fkey
            FOREIGN KEY (employee_id) REFERENCES public.clients(client_id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE IF EXISTS public.order_items
    ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0;

UPDATE public.order_items oi
SET unit_cost = COALESCE(i.unit_cost, 0)
FROM public.items i
WHERE oi.item_id = i.item_id
  AND COALESCE(oi.unit_cost, 0) = 0;

UPDATE public.orders
SET employee_id = client_id
WHERE employee_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON public.orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

COMMIT;
