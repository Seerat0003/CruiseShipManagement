--
-- PostgreSQL database dump
--

\restrict PYxfGs8K4zl0x6fGjZxt5tDHKeceZsIBKh4CazZ1SvDzni1lfUjeLkvbRigfEdI

-- Dumped from database version 14.21 (Homebrew)
-- Dumped by pg_dump version 18.0

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: chehak
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO chehak;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: chehak
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer,
    service_id integer,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    status character varying(255),
    cruise_id integer
);


ALTER TABLE public.bookings OWNER TO chehak;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO chehak;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: cruises; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.cruises (
    id integer NOT NULL,
    name character varying(255),
    route character varying(255),
    start_date timestamp with time zone,
    duration_days integer,
    total_seats integer,
    available_seats integer,
    price numeric,
    image_url character varying(255)
);


ALTER TABLE public.cruises OWNER TO chehak;

--
-- Name: cruises_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.cruises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cruises_id_seq OWNER TO chehak;

--
-- Name: cruises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.cruises_id_seq OWNED BY public.cruises.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO chehak;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO chehak;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    total numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO chehak;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO chehak;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255),
    category character varying(255),
    price numeric,
    stock integer
);


ALTER TABLE public.products OWNER TO chehak;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO chehak;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(255),
    category character varying(255),
    price numeric
);


ALTER TABLE public.services OWNER TO chehak;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO chehak;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255),
    password text,
    role character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('voyager'::character varying)::text, ('manager'::character varying)::text, ('staff'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO chehak;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO chehak;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: voyagers; Type: TABLE; Schema: public; Owner: chehak
--

CREATE TABLE public.voyagers (
    id integer NOT NULL,
    user_id integer,
    passport_number character varying(255),
    room_number character varying(255)
);


ALTER TABLE public.voyagers OWNER TO chehak;

--
-- Name: voyagers_id_seq; Type: SEQUENCE; Schema: public; Owner: chehak
--

CREATE SEQUENCE public.voyagers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voyagers_id_seq OWNER TO chehak;

--
-- Name: voyagers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chehak
--

ALTER SEQUENCE public.voyagers_id_seq OWNED BY public.voyagers.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: cruises id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.cruises ALTER COLUMN id SET DEFAULT nextval('public.cruises_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: voyagers id; Type: DEFAULT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.voyagers ALTER COLUMN id SET DEFAULT nextval('public.voyagers_id_seq'::regclass);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cruises cruises_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.cruises
    ADD CONSTRAINT cruises_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voyagers voyagers_pkey; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.voyagers
    ADD CONSTRAINT voyagers_pkey PRIMARY KEY (id);


--
-- Name: voyagers voyagers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.voyagers
    ADD CONSTRAINT voyagers_user_id_key UNIQUE (user_id);


--
-- Name: bookings bookings_cruise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_cruise_id_fkey FOREIGN KEY (cruise_id) REFERENCES public.cruises(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: voyagers voyagers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chehak
--

ALTER TABLE ONLY public.voyagers
    ADD CONSTRAINT voyagers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: chehak
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict PYxfGs8K4zl0x6fGjZxt5tDHKeceZsIBKh4CazZ1SvDzni1lfUjeLkvbRigfEdI

