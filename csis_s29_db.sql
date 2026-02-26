--
-- PostgreSQL database dump
--

\restrict fFmwZyx9ySQe5qrQJB0qGEZYileiEwOhwLLJIY8N93nuc6R4Y9HPhBvOwkdqB4V

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-02-26 10:25:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 24868)
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    client_id integer NOT NULL,
    client_name text NOT NULL,
    client_email text,
    client_dob date
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24867)
-- Name: clients_client_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_client_id_seq OWNER TO postgres;

--
-- TOC entry 4806 (class 0 OID 0)
-- Dependencies: 217
-- Name: clients_client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_client_id_seq OWNED BY public.clients.client_id;


--
-- TOC entry 220 (class 1259 OID 24916)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    dep_id integer NOT NULL,
    dep_name text NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24915)
-- Name: departments_dep_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_dep_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_dep_id_seq OWNER TO postgres;

--
-- TOC entry 4807 (class 0 OID 0)
-- Dependencies: 219
-- Name: departments_dep_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_dep_id_seq OWNED BY public.departments.dep_id;


--
-- TOC entry 4646 (class 2604 OID 24871)
-- Name: clients client_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN client_id SET DEFAULT nextval('public.clients_client_id_seq'::regclass);


--
-- TOC entry 4647 (class 2604 OID 24919)
-- Name: departments dep_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN dep_id SET DEFAULT nextval('public.departments_dep_id_seq'::regclass);


--
-- TOC entry 4798 (class 0 OID 24868)
-- Dependencies: 218
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (client_id, client_name, client_email, client_dob) FROM stdin;
1	alice smith	alice.smith@balamand.com	2000-01-01
2	john smith 1	john.smith@balamand.edu	2001-01-01
\.


--
-- TOC entry 4800 (class 0 OID 24916)
-- Dependencies: 220
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (dep_id, dep_name) FROM stdin;
2	SALE
3	HR
1	Information Technology
9	dfd
\.


--
-- TOC entry 4808 (class 0 OID 0)
-- Dependencies: 217
-- Name: clients_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_client_id_seq', 6, true);


--
-- TOC entry 4809 (class 0 OID 0)
-- Dependencies: 219
-- Name: departments_dep_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_dep_id_seq', 9, true);


--
-- TOC entry 4649 (class 2606 OID 24875)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (client_id);


--
-- TOC entry 4651 (class 2606 OID 24923)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (dep_id);


-- Completed on 2026-02-26 10:25:00

--
-- PostgreSQL database dump complete
--

\unrestrict fFmwZyx9ySQe5qrQJB0qGEZYileiEwOhwLLJIY8N93nuc6R4Y9HPhBvOwkdqB4V

