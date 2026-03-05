SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;



DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

DROP SEQUENCE IF EXISTS public.clients_client_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.departments_dep_id_seq CASCADE;



CREATE SEQUENCE public.clients_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.departments_dep_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- clients table
CREATE TABLE public.clients (
    client_id     integer      NOT NULL DEFAULT nextval('public.clients_client_id_seq'::regclass),
    client_name   text         NOT NULL,
    client_email  text,
    client_dob    date,
    password_hash text         NOT NULL DEFAULT ''
);

ALTER SEQUENCE public.clients_client_id_seq OWNED BY public.clients.client_id;

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (client_id);



CREATE TABLE public.departments (
    dep_id    integer NOT NULL DEFAULT nextval('public.departments_dep_id_seq'::regclass),
    dep_name  text    NOT NULL
);

ALTER SEQUENCE public.departments_dep_id_seq OWNED BY public.departments.dep_id;

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (dep_id);



INSERT INTO public.clients (client_id, client_name, client_email, client_dob, password_hash) VALUES
(1, 'alice smith',  'alice.smith@balamand.com', '2000-01-01', '$2b$10$4B7xZOMXYURgWfMDUpR9iOny5ob5Z4w.pI71k1qtyGDyw.F3ugrmS'),
(2, 'john smith 1', 'john.smith@balamand.edu',  '2001-01-01', '$2b$10$xR3cc2rUT2g9XL7D/rZZf.B3CNzH4aFwRVNnfu95EOwwerDLq.cfq');



INSERT INTO public.departments (dep_id, dep_name) VALUES
(1, 'Information Technology'),
(2, 'SALE'),
(3, 'HR'),
(9, 'dfd');



SELECT pg_catalog.setval('public.clients_client_id_seq', 10, true);
SELECT pg_catalog.setval('public.departments_dep_id_seq', 9, true);


