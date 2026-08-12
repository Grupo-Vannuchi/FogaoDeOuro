--
-- PostgreSQL database dump
--

\restrict wVlINq8F2WWjUAXQxhgO9C8aQiYqL5TYrcsmoP61gmbxcUXwsN06Kcj6qlC43YT

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

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

ALTER TABLE IF EXISTS ONLY public.menu_items DROP CONSTRAINT IF EXISTS "menu_items_categoryId_fkey";
DROP INDEX IF EXISTS public.menu_items_slug_key;
DROP INDEX IF EXISTS public."menu_items_categoryId_order_idx";
DROP INDEX IF EXISTS public.menu_items_available_order_idx;
DROP INDEX IF EXISTS public.menu_categories_slug_key;
DROP INDEX IF EXISTS public.menu_categories_published_order_idx;
DROP INDEX IF EXISTS public."leads_type_status_createdAt_idx";
DROP INDEX IF EXISTS public.informations_slug_key;
DROP INDEX IF EXISTS public.informations_published_featured_order_idx;
DROP INDEX IF EXISTS public.gallery_photos_published_order_idx;
DROP INDEX IF EXISTS public.admin_users_email_key;
ALTER TABLE IF EXISTS ONLY public.testimonials DROP CONSTRAINT IF EXISTS testimonials_pkey;
ALTER TABLE IF EXISTS ONLY public.menu_items DROP CONSTRAINT IF EXISTS menu_items_pkey;
ALTER TABLE IF EXISTS ONLY public.menu_categories DROP CONSTRAINT IF EXISTS menu_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.leads DROP CONSTRAINT IF EXISTS leads_pkey;
ALTER TABLE IF EXISTS ONLY public.lead_notification_config DROP CONSTRAINT IF EXISTS lead_notification_config_pkey;
ALTER TABLE IF EXISTS ONLY public.informations DROP CONSTRAINT IF EXISTS informations_pkey;
ALTER TABLE IF EXISTS ONLY public.gallery_photos DROP CONSTRAINT IF EXISTS gallery_photos_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.testimonials;
DROP TABLE IF EXISTS public.menu_items;
DROP TABLE IF EXISTS public.menu_categories;
DROP TABLE IF EXISTS public.leads;
DROP TABLE IF EXISTS public.lead_notification_config;
DROP TABLE IF EXISTS public.informations;
DROP TABLE IF EXISTS public.gallery_photos;
DROP TABLE IF EXISTS public.admin_users;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."LeadType";
DROP TYPE IF EXISTS public."LeadStatus";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'ARCHIVED'
);


--
-- Name: LeadType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadType" AS ENUM (
    'CONTACT'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'EDITOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'EDITOR'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: gallery_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_photos (
    id text NOT NULL,
    image text NOT NULL,
    caption jsonb DEFAULT '{}'::jsonb NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: informations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.informations (
    id text NOT NULL,
    slug text NOT NULL,
    icon text NOT NULL,
    title jsonb NOT NULL,
    description jsonb NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    image text DEFAULT ''::text NOT NULL
);


--
-- Name: lead_notification_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_notification_config (
    id text NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    instance text,
    "groupId" text,
    "groupName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id text NOT NULL,
    type public."LeadType" DEFAULT 'CONTACT'::public."LeadType" NOT NULL,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    message text NOT NULL,
    locale text DEFAULT 'pt'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    "whatsappNotifiedAt" timestamp(3) without time zone,
    "landingPage" text,
    referrer text,
    "utmCampaign" text,
    "utmMedium" text,
    "utmSource" text,
    "landingLabel" text
);


--
-- Name: menu_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_categories (
    id text NOT NULL,
    slug text NOT NULL,
    name jsonb NOT NULL,
    description jsonb DEFAULT '{}'::jsonb NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    id text NOT NULL,
    slug text NOT NULL,
    "categoryId" text NOT NULL,
    name jsonb NOT NULL,
    description jsonb DEFAULT '{}'::jsonb NOT NULL,
    image text DEFAULT ''::text NOT NULL,
    available boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    weekday integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id text NOT NULL,
    "authorName" text NOT NULL,
    "avatarUrl" text,
    rating integer DEFAULT 5 NOT NULL,
    quote jsonb NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    source text DEFAULT 'Google'::text NOT NULL,
    "sourceUrl" text
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
48f8cbfb-ec2c-4566-87fc-f7cbbb4b3043	39f49ee679595d6805638243e7036d8045c188ef3250d7dc7574c7a70b487bb7	2026-08-12 18:21:43.989406+00	20260811190000_remove_career_lead	\N	\N	2026-08-12 18:21:43.961865+00	1
64fbdaf8-63c0-492e-b8c1-f2afb9025ab3	6967b09f4d5bfd1c78d0a3e613110824a5510febd9ef220f13e605561de1c98a	2026-08-12 18:21:43.468272+00	20260602163736_init	\N	\N	2026-08-12 18:21:43.378808+00	1
7505b41f-85a0-4ffd-a171-d26632f910dd	d417e568e72420bd1a2f9f12d97560c270805159f65176f209460b1eed59919e	2026-08-12 18:21:43.753108+00	20260727143106_lead_whatsapp_notification	\N	\N	2026-08-12 18:21:43.740831+00	1
4f6ad5d9-8f5a-4266-a037-a8c951e53e0d	691309de4a364119b2f544242176452e45dfd71ddf7e81da308ffa3550a64966	2026-08-12 18:21:43.510809+00	20260603124358_add_lead_tags	\N	\N	2026-08-12 18:21:43.476824+00	1
9be0f873-b67b-482b-aac4-a80216f4aea2	4381c879cf0431c53b827491d38e493c5cf58819985961bf42026505ed7ce904	2026-08-12 18:21:43.533067+00	20260605170250_add_service_content	\N	\N	2026-08-12 18:21:43.51871+00	1
81d62bfd-2b92-4f6c-9455-192b4ad4850d	41a85c8b647f6639cc0ca6af99cee558ba24492469846ac66218c95b9f5f54be	2026-08-12 18:21:43.554491+00	20260605171259_add_service_featured	\N	\N	2026-08-12 18:21:43.536775+00	1
dc64d955-a796-4987-959b-d68653e47629	14bbe38d7745a19647ebd51558521cadfb123e1fdce8ac044d45af977e0e9482	2026-08-12 18:21:43.765538+00	20260727154225_lead_attribution	\N	\N	2026-08-12 18:21:43.755719+00	1
4633c1ac-2476-4f7f-a79c-37f945e80766	826f0a28433fa7394563cf8b5a812edc3f70c17be2ff7835b64cba14eca10df7	2026-08-12 18:21:43.580431+00	20260609134757_add_information	\N	\N	2026-08-12 18:21:43.558619+00	1
e004fe71-091e-4b6f-a9d2-7a1eccef748e	09d8dda93ba6d2975a75c5745045d15c0843388111b13d9ff6c2d4a88b9f4045	2026-08-12 18:21:43.591973+00	20260609153633_add_information_image	\N	\N	2026-08-12 18:21:43.583789+00	1
9d534387-1ed3-454a-8667-bfc8bdecf023	5741f94faf8780745beef80075cf8ce4eb4b09e8cc3cd1592a601305711f482e	2026-08-12 18:21:43.649498+00	20260615152224_add_funnels	\N	\N	2026-08-12 18:21:43.595485+00	1
6555632b-e257-421a-b577-5f09230d0c5d	cafc569d19f5e8eda4d42810e60b972b2e778bcc82efb9ddafb9b02fa0dd7556	2026-08-12 18:21:43.775518+00	20260727160704_lead_landing_label	\N	\N	2026-08-12 18:21:43.768049+00	1
a63abbf4-10b1-42c3-98b8-7d006d6d7ade	bc13cc798eceebc094ccf75254fdd97c852adb493fc24628aa8d408efec7f809	2026-08-12 18:21:43.660873+00	20260617123711_funnel_question_branching	\N	\N	2026-08-12 18:21:43.651808+00	1
7eabe03e-4598-4566-a128-1f95c7b395e3	bd0e7e0e6327b61ab226b48c99af02de28874f534663a448f416c1fffa643baa	2026-08-12 18:21:43.690643+00	20260617130341_funnel_endings	\N	\N	2026-08-12 18:21:43.664567+00	1
04958143-3dbe-4395-b723-fd9b4cab7f6e	685281384b3a98fc31f117f296f50b0063508308c82772b65786a3904bb5725a	2026-08-12 18:21:43.703435+00	20260619175721_funnel_redirect_ending	\N	\N	2026-08-12 18:21:43.693033+00	1
cd460ade-f597-4a55-92c0-e983e952b32e	a4a9bdff4edf117bf9c3c339a78f0c3fd59ff99de2523bb13242ef4dbfe8b073	2026-08-12 18:21:43.834993+00	20260810161444_remove_funnels	\N	\N	2026-08-12 18:21:43.778229+00	1
3007c0a1-f686-411e-a392-6725a5ddbb07	d49de3b4bd004caeabdaf3d00bdb33bd898480874a677c1fa3a53bbf0bf83734	2026-08-12 18:21:43.715553+00	20260619184006_funnel_whatsapp_instance	\N	\N	2026-08-12 18:21:43.706672+00	1
bed0d1aa-f33f-4a4a-a354-1a0204a6a3ea	61d156f4ffd669edc11a5bfb816099a8b25f8e286126383f57964b06565e1e9c	2026-08-12 18:21:43.724951+00	20260623140909_google_account_invalidated_at	\N	\N	2026-08-12 18:21:43.71814+00	1
46c0ca47-5342-472f-a7c8-6d78cec49335	15ab90e8f6c1873d25ad6fd158ffa1107e99334d53fe2063325a781e42ab19b6	2026-08-12 18:21:43.738147+00	20260720132129_funnel_question_text_answer	\N	\N	2026-08-12 18:21:43.727283+00	1
54a331ef-b207-49ed-a93b-f16b2243ad59	a580ea2ae608ec81541c970f47562679416e5d4b339c2ecea5f6a00e9a896a9a	2026-08-12 18:21:43.871136+00	20260810173615_add_menu	\N	\N	2026-08-12 18:21:43.838488+00	1
62ef715d-e5fb-43a4-beae-ca092cc67827	d1afed3691a8cc44be9472469597e74af7d5c1493a751b8b2a9c6db43bec9922	2026-08-12 18:21:43.890757+00	20260811144000_add_gallery	\N	\N	2026-08-12 18:21:43.873968+00	1
9a8cad06-cae4-41bc-b53b-28407f857bef	8a2eb032f34822ec761580f7bb46af10858f9199bbea58d73f63de7511dc0b12	2026-08-12 18:21:43.944687+00	20260811163134_remove_agency_models	\N	\N	2026-08-12 18:21:43.894757+00	1
ea13d8a2-e143-4ee6-8674-73425c3fb175	51534572d882a978f664f79d6cbc1f1a3cda263272b2054751d02d6e6399a3fd	2026-08-12 18:21:43.959247+00	20260811180147_reform_testimonial	\N	\N	2026-08-12 18:21:43.949639+00	1
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, name, "passwordHash", role, "createdAt", "updatedAt") FROM stdin;
cmsqf1vw40000iopg8ljetb59	admin@example.com	Admin	$2b$12$i6xC.ETuXvbtv1A5Lu41SOzzNn18VRCKo.8eNpBuWT3VdwfMl7req	ADMIN	2026-08-12 18:21:58.324	2026-08-12 18:21:58.324
\.


--
-- Data for Name: gallery_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gallery_photos (id, image, caption, "order", published, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: informations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.informations (id, slug, icon, title, description, content, featured, "order", published, "createdAt", "updatedAt", image) FROM stdin;
\.


--
-- Data for Name: lead_notification_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lead_notification_config (id, enabled, instance, "groupId", "groupName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, type, status, name, email, phone, company, message, locale, "createdAt", "updatedAt", tags, "whatsappNotifiedAt", "landingPage", referrer, "utmCampaign", "utmMedium", "utmSource", "landingLabel") FROM stdin;
\.


--
-- Data for Name: menu_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_categories (id, slug, name, description, "order", published, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_items (id, slug, "categoryId", name, description, image, available, "order", tags, weekday, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, "authorName", "avatarUrl", rating, quote, "order", published, "createdAt", "updatedAt", source, "sourceUrl") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: gallery_photos gallery_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_photos
    ADD CONSTRAINT gallery_photos_pkey PRIMARY KEY (id);


--
-- Name: informations informations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.informations
    ADD CONSTRAINT informations_pkey PRIMARY KEY (id);


--
-- Name: lead_notification_config lead_notification_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_notification_config
    ADD CONSTRAINT lead_notification_config_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: gallery_photos_published_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_photos_published_order_idx ON public.gallery_photos USING btree (published, "order");


--
-- Name: informations_published_featured_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX informations_published_featured_order_idx ON public.informations USING btree (published, featured, "order");


--
-- Name: informations_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX informations_slug_key ON public.informations USING btree (slug);


--
-- Name: leads_type_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "leads_type_status_createdAt_idx" ON public.leads USING btree (type, status, "createdAt");


--
-- Name: menu_categories_published_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX menu_categories_published_order_idx ON public.menu_categories USING btree (published, "order");


--
-- Name: menu_categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX menu_categories_slug_key ON public.menu_categories USING btree (slug);


--
-- Name: menu_items_available_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX menu_items_available_order_idx ON public.menu_items USING btree (available, "order");


--
-- Name: menu_items_categoryId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "menu_items_categoryId_order_idx" ON public.menu_items USING btree ("categoryId", "order");


--
-- Name: menu_items_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX menu_items_slug_key ON public.menu_items USING btree (slug);


--
-- Name: menu_items menu_items_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT "menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.menu_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wVlINq8F2WWjUAXQxhgO9C8aQiYqL5TYrcsmoP61gmbxcUXwsN06Kcj6qlC43YT

