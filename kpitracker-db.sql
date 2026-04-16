--
-- PostgreSQL database dump
--

\restrict 6ZeIzqyj8O4fnNjgxx7IiueU5MYcOpsHCTkJHYpPQE1b6jTpK5ubn8FzIih5T0f

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActivityType" AS ENUM (
    'CALL',
    'EMAIL',
    'MEETING',
    'NOTE',
    'WHATSAPP'
);


ALTER TYPE public."ActivityType" OWNER TO postgres;

--
-- Name: AgendaStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AgendaStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'DONE'
);


ALTER TYPE public."AgendaStatus" OWNER TO postgres;

--
-- Name: CompanyKind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CompanyKind" AS ENUM (
    'GROUP',
    'CLIENT'
);


ALTER TYPE public."CompanyKind" OWNER TO postgres;

--
-- Name: GoalPeriodType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GoalPeriodType" AS ENUM (
    'MONTH',
    'QUARTER',
    'SEMESTER',
    'YEAR'
);


ALTER TYPE public."GoalPeriodType" OWNER TO postgres;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'LOST',
    'CONVERTED'
);


ALTER TYPE public."LeadStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'MANAGER',
    'AGENT',
    'DIRECTRICE_COMMERCIALE'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Activity" (
    id text NOT NULL,
    type public."ActivityType" NOT NULL,
    "relatedTo" text NOT NULL,
    "leadId" text,
    "userId" text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    content text NOT NULL
);


ALTER TABLE public."Activity" OWNER TO postgres;

--
-- Name: AgendaItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AgendaItem" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    title text NOT NULL,
    description text,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status public."AgendaStatus" DEFAULT 'TODO'::public."AgendaStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text
);


ALTER TABLE public."AgendaItem" OWNER TO postgres;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    name text NOT NULL,
    contact text,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "companyId" text NOT NULL,
    "activityDomain" text,
    civility text,
    "companyName" text,
    email text,
    location text,
    notes text,
    phone text,
    source text,
    "convertedAt" timestamp(3) without time zone,
    "convertedById" text
);


ALTER TABLE public."Client" OWNER TO postgres;

--
-- Name: ClientProductInterest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClientProductInterest" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "productId" text NOT NULL,
    "estimatedValue" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ClientProductInterest" OWNER TO postgres;

--
-- Name: ClientServiceInterest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClientServiceInterest" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "serviceId" text NOT NULL,
    "estimatedValue" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ClientServiceInterest" OWNER TO postgres;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    kind public."CompanyKind" DEFAULT 'CLIENT'::public."CompanyKind" NOT NULL
);


ALTER TABLE public."Company" OWNER TO postgres;

--
-- Name: Deal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Deal" (
    id text NOT NULL,
    title text NOT NULL,
    amount double precision NOT NULL,
    stage text NOT NULL,
    probability integer,
    "expectedCloseDate" timestamp(3) without time zone,
    "assignedTo" text,
    "companyId" text NOT NULL
);


ALTER TABLE public."Deal" OWNER TO postgres;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    email text,
    source text,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    "assignedTo" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "companyName" text,
    location text,
    "activityDomain" text,
    notes text,
    civility text,
    "jobTitle" text
);


ALTER TABLE public."Lead" OWNER TO postgres;

--
-- Name: LeadAttachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LeadAttachment" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "fileName" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    "storagePath" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LeadAttachment" OWNER TO postgres;

--
-- Name: LeadProductInterest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LeadProductInterest" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "productId" text NOT NULL,
    "estimatedValue" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LeadProductInterest" OWNER TO postgres;

--
-- Name: LeadServiceInterest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LeadServiceInterest" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "serviceId" text NOT NULL,
    "estimatedValue" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LeadServiceInterest" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sale" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "userId" text NOT NULL,
    "companyId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    amount double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Sale" OWNER TO postgres;

--
-- Name: SaleItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SaleItem" (
    id text NOT NULL,
    "saleId" text NOT NULL,
    "productId" text,
    "serviceId" text,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    "lineTotal" double precision NOT NULL
);


ALTER TABLE public."SaleItem" OWNER TO postgres;

--
-- Name: SalesGoal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SalesGoal" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "companyId" text NOT NULL,
    "periodType" public."GoalPeriodType" NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "targetConversions" integer DEFAULT 0 NOT NULL,
    "targetRevenue" double precision DEFAULT 0 NOT NULL,
    "setById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SalesGoal" OWNER TO postgres;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Service" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'AGENT'::public."Role" NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "mfaSecret" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _LeadProducts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_LeadProducts" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_LeadProducts" OWNER TO postgres;

--
-- Name: _LeadServices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_LeadServices" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_LeadServices" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Activity" (id, type, "relatedTo", "leadId", "userId", date, content) FROM stdin;
cmnyb1ngg00056ovjqxin9sch	NOTE	cmnyb1nfs00046ovjg3f6kdxq	cmnyb1nfs00046ovjg3f6kdxq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:26.656	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb1zyu00076ovjahmlqcp7	NOTE	cmnyb1zym00066ovjsc2b6i0o	cmnyb1zym00066ovjsc2b6i0o	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.87	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb1zz800096ovjd4pnxer0	NOTE	cmnyb1zz300086ovjp3fi2k90	cmnyb1zz300086ovjp3fi2k90	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.884	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb1zzk000b6ovjxpzwhkwi	NOTE	cmnyb1zze000a6ovjk2qp8zkb	cmnyb1zze000a6ovjk2qp8zkb	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.896	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb1zzw000d6ovj2dib4m34	NOTE	cmnyb1zzp000c6ovjrhui7up9	cmnyb1zzp000c6ovjrhui7up9	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.908	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2006000f6ovj9vz6oord	NOTE	cmnyb2002000e6ovjuaasar1d	cmnyb2002000e6ovjuaasar1d	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.918	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb200i000h6ovjnna0116s	NOTE	cmnyb200b000g6ovjp6qj6gud	cmnyb200b000g6ovjp6qj6gud	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.93	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb200y000j6ovj73mngdy2	NOTE	cmnyb200s000i6ovjr8z5f3s8	cmnyb200s000i6ovjr8z5f3s8	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.946	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2017000l6ovj0hazef8k	NOTE	cmnyb2013000k6ovj8fz8xnrr	cmnyb2013000k6ovj8fz8xnrr	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.955	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb201e000n6ovjmkucscn4	NOTE	cmnyb201b000m6ovj8mwcw3li	cmnyb201b000m6ovj8mwcw3li	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.962	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb201k000p6ovjkcfo1o2p	NOTE	cmnyb201h000o6ovja2ndmdxn	cmnyb201h000o6ovja2ndmdxn	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.968	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb201r000r6ovjri6vuu19	NOTE	cmnyb201p000q6ovjiajzaeym	cmnyb201p000q6ovjiajzaeym	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.975	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb201x000t6ovjuqyadvxk	NOTE	cmnyb201u000s6ovjxmrbizm1	cmnyb201u000s6ovjxmrbizm1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.981	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2026000v6ovjm96cg4t7	NOTE	cmnyb2021000u6ovj0du1f6pc	cmnyb2021000u6ovj0du1f6pc	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.99	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb202f000x6ovjv3bv0pkl	NOTE	cmnyb202b000w6ovjadjx4thb	cmnyb202b000w6ovjadjx4thb	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:42.999	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb202p000z6ovjfukvyucp	NOTE	cmnyb202k000y6ovjc6pnupir	cmnyb202k000y6ovjc6pnupir	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.009	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb202x00116ovjksf1hz12	NOTE	cmnyb202t00106ovjhxieedra	cmnyb202t00106ovjhxieedra	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.017	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb203d00136ovjs28fkrg3	NOTE	cmnyb203200126ovjgv9cmlso	cmnyb203200126ovjgv9cmlso	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.033	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb203l00156ovjhdmhp06k	NOTE	cmnyb203h00146ovjuucaqbvo	cmnyb203h00146ovjuucaqbvo	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.041	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb203y00176ovj0luj1wus	NOTE	cmnyb203q00166ovj3vxgf54j	cmnyb203q00166ovj3vxgf54j	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.054	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb204700196ovj97pp6lzl	NOTE	cmnyb204300186ovjk9e8pwej	cmnyb204300186ovjk9e8pwej	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.063	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb204j001b6ovjpj7rzrrz	NOTE	cmnyb204c001a6ovjxgsr7agc	cmnyb204c001a6ovjxgsr7agc	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.075	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb204s001d6ovj0tn7banf	NOTE	cmnyb204o001c6ovj8ngcq9hi	cmnyb204o001c6ovj8ngcq9hi	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.084	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2051001f6ovjhsqbvokb	NOTE	cmnyb204x001e6ovjs1pplh12	cmnyb204x001e6ovjs1pplh12	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.093	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb205a001h6ovj1e2gxcgr	NOTE	cmnyb2056001g6ovjolzf4pa8	cmnyb2056001g6ovjolzf4pa8	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.102	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb205l001j6ovjkn0uobr6	NOTE	cmnyb205f001i6ovj3h5b1fzj	cmnyb205f001i6ovj3h5b1fzj	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.113	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb205u001l6ovjzg11dm00	NOTE	cmnyb205q001k6ovj5joptyh3	cmnyb205q001k6ovj5joptyh3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.122	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2062001n6ovj22zlax3j	NOTE	cmnyb205y001m6ovj675xg15c	cmnyb205y001m6ovj675xg15c	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.13	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb206a001p6ovjwh7g2qyc	NOTE	cmnyb2066001o6ovjsz4n7sww	cmnyb2066001o6ovjsz4n7sww	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.138	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb206j001r6ovj0tymnzfp	NOTE	cmnyb206f001q6ovja3ks2zmk	cmnyb206f001q6ovja3ks2zmk	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.147	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb206u001t6ovj9r7vjfeg	NOTE	cmnyb206q001s6ovj16ryt4hm	cmnyb206q001s6ovj16ryt4hm	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.157	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2071001v6ovj96mk2rly	NOTE	cmnyb206x001u6ovjfqq2e5wm	cmnyb206x001u6ovjfqq2e5wm	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.165	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2078001x6ovj1qxufdpn	NOTE	cmnyb2075001w6ovjrxpes3n6	cmnyb2075001w6ovjrxpes3n6	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.172	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb207g001z6ovjmwpwx2ug	NOTE	cmnyb207d001y6ovjhkxww7lw	cmnyb207d001y6ovjhkxww7lw	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.18	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb207o00216ovjbkw43f3h	NOTE	cmnyb207k00206ovjcfvx6kun	cmnyb207k00206ovjcfvx6kun	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.188	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb207v00236ovjamtt3mm7	NOTE	cmnyb207s00226ovjr8uxdhpy	cmnyb207s00226ovjr8uxdhpy	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.195	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb208300256ovjrwp1z7um	NOTE	cmnyb207z00246ovjd41rhhfs	cmnyb207z00246ovjd41rhhfs	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.203	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb208b00276ovj16gtc0nk	NOTE	cmnyb208700266ovjqdwn0aet	cmnyb208700266ovjqdwn0aet	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.211	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb208k00296ovj7phqrlcz	NOTE	cmnyb208f00286ovjbp62czg3	cmnyb208f00286ovjbp62czg3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.219	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb208t002b6ovjwxb61z38	NOTE	cmnyb208o002a6ovjrdy2u0p9	cmnyb208o002a6ovjrdy2u0p9	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.229	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2091002d6ovjd904av5a	NOTE	cmnyb208x002c6ovjejnr3qze	cmnyb208x002c6ovjejnr3qze	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.237	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb209a002f6ovjlxflmdck	NOTE	cmnyb2096002e6ovjs4ql1x89	cmnyb2096002e6ovjs4ql1x89	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.246	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb209i002h6ovj142jzcke	NOTE	cmnyb209f002g6ovj1jaafzgd	cmnyb209f002g6ovj1jaafzgd	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.254	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb209q002j6ovjboxii5ei	NOTE	cmnyb209m002i6ovjeidy81mp	cmnyb209m002i6ovjeidy81mp	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.262	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb209y002l6ovj89d6eh6u	NOTE	cmnyb209v002k6ovjdktrowvo	cmnyb209v002k6ovjdktrowvo	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.27	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20a6002n6ovj1ir7ioj5	NOTE	cmnyb20a3002m6ovjc2p7wnib	cmnyb20a3002m6ovjc2p7wnib	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.278	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ae002p6ovjw5lbj9zc	NOTE	cmnyb20ab002o6ovjyd0szku0	cmnyb20ab002o6ovjyd0szku0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.286	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20am002r6ovj1ox5wmi0	NOTE	cmnyb20ai002q6ovj1w70vsr7	cmnyb20ai002q6ovj1w70vsr7	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.294	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20as002t6ovj1j9pr5yx	NOTE	cmnyb20ap002s6ovjs9lmu771	cmnyb20ap002s6ovjs9lmu771	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.3	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20az002v6ovjib2d7c82	NOTE	cmnyb20aw002u6ovj1qaq832h	cmnyb20aw002u6ovj1qaq832h	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.307	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20b6002x6ovjma23nvx0	NOTE	cmnyb20b2002w6ovjoqfi42ef	cmnyb20b2002w6ovjoqfi42ef	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.314	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20be002z6ovjm1ndvt6d	NOTE	cmnyb20ba002y6ovjwtstycww	cmnyb20ba002y6ovjwtstycww	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.322	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20bm00316ovjy0vdrl3w	NOTE	cmnyb20bi00306ovjtqqdx4vh	cmnyb20bi00306ovjtqqdx4vh	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.33	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20bv00336ovjvqnhvahw	NOTE	cmnyb20br00326ovjkx7zf4dk	cmnyb20br00326ovjkx7zf4dk	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.338	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20c300356ovjzfwzbyyz	NOTE	cmnyb20bz00346ovjn5hugyh0	cmnyb20bz00346ovjn5hugyh0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.347	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20c900376ovjc3x9ixk3	NOTE	cmnyb20c600366ovjofx6sncq	cmnyb20c600366ovjofx6sncq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.353	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ce00396ovjavjdbh1y	NOTE	cmnyb20cc00386ovjlol5u2yr	cmnyb20cc00386ovjlol5u2yr	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.358	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20cm003b6ovjqhqu0ffq	NOTE	cmnyb20ci003a6ovjdpn8vlt3	cmnyb20ci003a6ovjdpn8vlt3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.366	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20cr003d6ovjvzpyjkl9	NOTE	cmnyb20cp003c6ovjnamvs9av	cmnyb20cp003c6ovjnamvs9av	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.371	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20cy003f6ovjc3pjqemu	NOTE	cmnyb20cv003e6ovjv5rucbnb	cmnyb20cv003e6ovjv5rucbnb	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.378	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20d6003h6ovji0luigmr	NOTE	cmnyb20d3003g6ovjagptz848	cmnyb20d3003g6ovjagptz848	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.386	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20dc003j6ovj8zova70u	NOTE	cmnyb20d9003i6ovjbzrvwgc8	cmnyb20d9003i6ovjbzrvwgc8	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.392	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20di003l6ovjr4laek1t	NOTE	cmnyb20de003k6ovjy39xlihw	cmnyb20de003k6ovjy39xlihw	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.398	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20do003n6ovjcln8ptzv	NOTE	cmnyb20dl003m6ovjbe9qa5fo	cmnyb20dl003m6ovjbe9qa5fo	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.403	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20dt003p6ovjspmvrybl	NOTE	cmnyb20dq003o6ovjn0xwbpzm	cmnyb20dq003o6ovjn0xwbpzm	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.409	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20dy003r6ovjty1uiggz	NOTE	cmnyb20dw003q6ovjchnhrooa	cmnyb20dw003q6ovjchnhrooa	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.414	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20e4003t6ovj8r77q7te	NOTE	cmnyb20e1003s6ovj7nv23ggu	cmnyb20e1003s6ovj7nv23ggu	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.42	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ec003v6ovj9zitjy1c	NOTE	cmnyb20e8003u6ovjhy2sb8mf	cmnyb20e8003u6ovjhy2sb8mf	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.428	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ek003x6ovjimolzwe1	NOTE	cmnyb20eg003w6ovjbhfemq0c	cmnyb20eg003w6ovjbhfemq0c	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.436	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20eu003z6ovjo9gyj5m9	NOTE	cmnyb20eo003y6ovj1fe8hi2a	cmnyb20eo003y6ovj1fe8hi2a	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.446	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20f200416ovj5b0v51wi	NOTE	cmnyb20ey00406ovjzv3kppej	cmnyb20ey00406ovjzv3kppej	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.454	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20fa00436ovjqhui25t6	NOTE	cmnyb20f600426ovjkmkfu4b2	cmnyb20f600426ovjkmkfu4b2	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.462	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20fh00456ovjddm9idsl	NOTE	cmnyb20fe00446ovjzqfzw8qs	cmnyb20fe00446ovjzqfzw8qs	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.469	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20fn00476ovjx5ptowkc	NOTE	cmnyb20fk00466ovjo6rahiro	cmnyb20fk00466ovjo6rahiro	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.475	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20fs00496ovj88w3ug4n	NOTE	cmnyb20fq00486ovj2bszhwa6	cmnyb20fq00486ovj2bszhwa6	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.48	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20fy004b6ovjqzof6lfj	NOTE	cmnyb20fv004a6ovje11c5gcm	cmnyb20fv004a6ovje11c5gcm	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.486	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20g5004d6ovjreznuon4	NOTE	cmnyb20g1004c6ovjifh3gd4n	cmnyb20g1004c6ovjifh3gd4n	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.492	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20gc004f6ovjh0jiigni	NOTE	cmnyb20g8004e6ovjumqm8i8m	cmnyb20g8004e6ovjumqm8i8m	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.5	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20gj004h6ovjycnq83l0	NOTE	cmnyb20gf004g6ovjgdz8g1gl	cmnyb20gf004g6ovjgdz8g1gl	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.507	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20go004j6ovjmfveuj3x	NOTE	cmnyb20gl004i6ovj4s7s7blp	cmnyb20gl004i6ovj4s7s7blp	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.512	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20gw004l6ovj3xzo5wtw	NOTE	cmnyb20gs004k6ovjl7ywletj	cmnyb20gs004k6ovjl7ywletj	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.52	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20h3004n6ovjp464ub5l	NOTE	cmnyb20h0004m6ovji2bssddc	cmnyb20h0004m6ovji2bssddc	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.527	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20he004p6ovjdfj1qtpw	NOTE	cmnyb20h9004o6ovjht827glp	cmnyb20h9004o6ovjht827glp	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.538	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20hn004r6ovjleo51swb	NOTE	cmnyb20hj004q6ovjjc60oovb	cmnyb20hj004q6ovjjc60oovb	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.547	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20hv004t6ovjpjuhs1fb	NOTE	cmnyb20hr004s6ovjep9s817q	cmnyb20hr004s6ovjep9s817q	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.555	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20i4004v6ovj33fct8c8	NOTE	cmnyb20i0004u6ovjke5pfnww	cmnyb20i0004u6ovjke5pfnww	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.564	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ir004x6ovjj14tzsip	NOTE	cmnyb20in004w6ovjsh7im7ey	cmnyb20in004w6ovjsh7im7ey	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.587	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20iy004z6ovjfpm4fqzr	NOTE	cmnyb20iv004y6ovjx0wdekk1	cmnyb20iv004y6ovjx0wdekk1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.594	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20j600516ovjeuezmtbb	NOTE	cmnyb20j200506ovjbh3tb3le	cmnyb20j200506ovjbh3tb3le	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.602	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20je00536ovj25ifj2p7	NOTE	cmnyb20jb00526ovjyfsncjmf	cmnyb20jb00526ovjyfsncjmf	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.61	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20jw00556ovjio3w45dr	NOTE	cmnyb20ji00546ovj3owg72in	cmnyb20ji00546ovj3owg72in	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.628	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20kl00576ovj67pvowye	NOTE	cmnyb20kh00566ovj4nlamu7z	cmnyb20kh00566ovj4nlamu7z	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.653	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20kt00596ovjcx4v65kx	NOTE	cmnyb20kp00586ovjcrkh4b9k	cmnyb20kp00586ovjcrkh4b9k	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.661	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20l1005b6ovjxhpshl1b	NOTE	cmnyb20kx005a6ovjgkip61zz	cmnyb20kx005a6ovjgkip61zz	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.669	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20l9005d6ovjw2z3te03	NOTE	cmnyb20l5005c6ovjys1y2dei	cmnyb20l5005c6ovjys1y2dei	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.677	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20lh005f6ovj3qw1omub	NOTE	cmnyb20le005e6ovjk92lseki	cmnyb20le005e6ovjk92lseki	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.685	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20lq005h6ovjuncnpjsm	NOTE	cmnyb20lm005g6ovjmyyga5vd	cmnyb20lm005g6ovjmyyga5vd	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.694	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20lx005j6ovj2cyfmd7q	NOTE	cmnyb20lu005i6ovjrvdv73xi	cmnyb20lu005i6ovjrvdv73xi	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.701	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20m3005l6ovjyt2c3he2	NOTE	cmnyb20m0005k6ovjzi3usowt	cmnyb20m0005k6ovjzi3usowt	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.707	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ma005n6ovjhkxvluru	NOTE	cmnyb20m7005m6ovjuf8kuof0	cmnyb20m7005m6ovjuf8kuof0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.714	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20mf005p6ovjse7s9wku	NOTE	cmnyb20mc005o6ovjax9v8kri	cmnyb20mc005o6ovjax9v8kri	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.719	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20mk005r6ovjvs0edxuu	NOTE	cmnyb20mh005q6ovjscb7z3cq	cmnyb20mh005q6ovjscb7z3cq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.724	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20mp005t6ovjeba806ju	NOTE	cmnyb20mn005s6ovjgmerfybu	cmnyb20mn005s6ovjgmerfybu	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.729	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20mv005v6ovjenml1p4w	NOTE	cmnyb20ms005u6ovj0eivptnd	cmnyb20ms005u6ovj0eivptnd	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.735	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20n1005x6ovjff99t386	NOTE	cmnyb20my005w6ovj4lrgzo5s	cmnyb20my005w6ovj4lrgzo5s	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.741	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20n6005z6ovjet9x5rvk	NOTE	cmnyb20n4005y6ovjardxq2yv	cmnyb20n4005y6ovjardxq2yv	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.746	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20nm00616ovj4vy3gjm4	NOTE	cmnyb20ni00606ovjswalas5z	cmnyb20ni00606ovjswalas5z	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.762	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20nt00636ovj818t4is5	NOTE	cmnyb20nq00626ovj6fol7a6d	cmnyb20nq00626ovj6fol7a6d	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.769	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20o200656ovj5hcxgzq8	NOTE	cmnyb20ny00646ovjpldg3lww	cmnyb20ny00646ovjpldg3lww	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.777	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20oa00676ovjkc0qx4v9	NOTE	cmnyb20o600666ovjmo4lzlf9	cmnyb20o600666ovjmo4lzlf9	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.786	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20oi00696ovj08e0xfz1	NOTE	cmnyb20of00686ovjyrbw3fwi	cmnyb20of00686ovjyrbw3fwi	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.794	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20or006b6ovjxgi1ioj5	NOTE	cmnyb20on006a6ovjrd91ffuv	cmnyb20on006a6ovjrd91ffuv	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.802	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20oz006d6ovjo8t2zkef	NOTE	cmnyb20ov006c6ovjq52w85yi	cmnyb20ov006c6ovjq52w85yi	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.811	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20p8006f6ovjn6loymj5	NOTE	cmnyb20p4006e6ovjuehmhax7	cmnyb20p4006e6ovjuehmhax7	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.82	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20pg006h6ovjhfsul9ez	NOTE	cmnyb20pc006g6ovjeltbmm2h	cmnyb20pc006g6ovjeltbmm2h	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.828	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20pn006j6ovj3qscwp7c	NOTE	cmnyb20pk006i6ovjsi2m6dew	cmnyb20pk006i6ovjsi2m6dew	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.835	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20pt006l6ovjpxzozpps	NOTE	cmnyb20pq006k6ovjlfjz5z9b	cmnyb20pq006k6ovjlfjz5z9b	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.841	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20py006n6ovjcqs0sqsx	NOTE	cmnyb20pv006m6ovjnpdt55e2	cmnyb20pv006m6ovjnpdt55e2	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.846	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20q4006p6ovj7d3k9p14	NOTE	cmnyb20q1006o6ovjr0569y1k	cmnyb20q1006o6ovjr0569y1k	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.852	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20q9006r6ovjrz55yk62	NOTE	cmnyb20q6006q6ovjybca4e2a	cmnyb20q6006q6ovjybca4e2a	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.857	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20qf006t6ovjsyul5qkf	NOTE	cmnyb20qb006s6ovjb7ezvriu	cmnyb20qb006s6ovjb7ezvriu	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.863	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ql006v6ovj6y3mfvzz	NOTE	cmnyb20qh006u6ovj7rnpvaj6	cmnyb20qh006u6ovj7rnpvaj6	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.869	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20qs006x6ovjswf1ho6c	NOTE	cmnyb20qp006w6ovjp4bxr8w4	cmnyb20qp006w6ovjp4bxr8w4	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.876	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20r0006z6ovjbuen50uw	NOTE	cmnyb20qx006y6ovjt81peiaw	cmnyb20qx006y6ovjt81peiaw	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.884	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20r800716ovjncawsqdw	NOTE	cmnyb20r500706ovjpz5sgdpx	cmnyb20r500706ovjpz5sgdpx	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.892	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20rg00736ovjsbukinw9	NOTE	cmnyb20rc00726ovji2bf0w1t	cmnyb20rc00726ovji2bf0w1t	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.9	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20rn00756ovjnoudkue4	NOTE	cmnyb20rk00746ovjkoxr2zwu	cmnyb20rk00746ovjkoxr2zwu	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.907	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20rs00776ovj0tss4ps7	NOTE	cmnyb20rq00766ovjug9i07r2	cmnyb20rq00766ovjug9i07r2	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.912	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20rx00796ovj5gp9ilof	NOTE	cmnyb20rv00786ovjrxfd03y5	cmnyb20rv00786ovjrxfd03y5	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.917	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20s2007b6ovj23u5fehr	NOTE	cmnyb20s0007a6ovja8lrg229	cmnyb20s0007a6ovja8lrg229	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.922	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20s7007d6ovj2eo22405	NOTE	cmnyb20s4007c6ovj0laalx72	cmnyb20s4007c6ovj0laalx72	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.927	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20sc007f6ovjd63r7zy8	NOTE	cmnyb20sa007e6ovjxtwlkb02	cmnyb20sa007e6ovjxtwlkb02	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.932	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20sh007h6ovjua086abr	NOTE	cmnyb20sf007g6ovj53slktri	cmnyb20sf007g6ovj53slktri	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.937	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20sm007j6ovjhlx2j5iy	NOTE	cmnyb20sj007i6ovj54e59ndo	cmnyb20sj007i6ovj54e59ndo	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.941	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ss007l6ovjbrfnvhmu	NOTE	cmnyb20so007k6ovjbinhp2qq	cmnyb20so007k6ovjbinhp2qq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.948	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20sy007n6ovjmwwxwpkr	NOTE	cmnyb20sv007m6ovjcejtdbcz	cmnyb20sv007m6ovjcejtdbcz	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.954	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20t3007p6ovj6crdfc8s	NOTE	cmnyb20t0007o6ovj0bbotbnf	cmnyb20t0007o6ovj0bbotbnf	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.958	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20t7007r6ovjnvv1fh2b	NOTE	cmnyb20t5007q6ovjjnkk22xb	cmnyb20t5007q6ovjjnkk22xb	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.963	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20tc007t6ovj1qd7kpju	NOTE	cmnyb20ta007s6ovjh0qbootg	cmnyb20ta007s6ovjh0qbootg	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.968	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ti007v6ovj2p94z9dd	NOTE	cmnyb20tf007u6ovjpnpt38y1	cmnyb20tf007u6ovjpnpt38y1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.974	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20tp007x6ovjhi0d1pp0	NOTE	cmnyb20tl007w6ovj5uqw2rku	cmnyb20tl007w6ovj5uqw2rku	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.981	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20tx007z6ovj4n86aor8	NOTE	cmnyb20tt007y6ovj6fib8kf4	cmnyb20tt007y6ovj6fib8kf4	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.989	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20u500816ovjcyhefusf	NOTE	cmnyb20u100806ovjdydbri04	cmnyb20u100806ovjdydbri04	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:43.997	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ud00836ovj1spaxhb8	NOTE	cmnyb20u900826ovjtgpxptfd	cmnyb20u900826ovjtgpxptfd	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.005	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20uq00856ovj0qq2yedc	NOTE	cmnyb20uh00846ovjzsin8it2	cmnyb20uh00846ovjzsin8it2	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.018	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20uw00876ovj92nue4fy	NOTE	cmnyb20ut00866ovj0e4bhel0	cmnyb20ut00866ovj0e4bhel0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.024	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20v100896ovji84mm1y7	NOTE	cmnyb20uy00886ovjs77g4glq	cmnyb20uy00886ovjs77g4glq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.029	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20v5008b6ovj88x6gpku	NOTE	cmnyb20v3008a6ovjl97jghvw	cmnyb20v3008a6ovjl97jghvw	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.033	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20va008d6ovjqel6i1i4	NOTE	cmnyb20v8008c6ovj1768n9po	cmnyb20v8008c6ovj1768n9po	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.038	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20vg008f6ovjocisziqy	NOTE	cmnyb20ve008e6ovjhq6eh3hm	cmnyb20ve008e6ovjhq6eh3hm	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.044	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20vl008h6ovj1r98e85d	NOTE	cmnyb20vi008g6ovj40cy19t7	cmnyb20vi008g6ovj40cy19t7	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.049	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20vp008j6ovjh5rx5rdb	NOTE	cmnyb20vn008i6ovjlguysthr	cmnyb20vn008i6ovjlguysthr	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.053	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20vx008l6ovj6fggvv1x	NOTE	cmnyb20vt008k6ovj30vaktvv	cmnyb20vt008k6ovj30vaktvv	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.061	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20w5008n6ovjmp6ea9tn	NOTE	cmnyb20w1008m6ovjtup8kd8c	cmnyb20w1008m6ovjtup8kd8c	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.069	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20wd008p6ovjpwlgnxk5	NOTE	cmnyb20w9008o6ovjn7o7fdce	cmnyb20w9008o6ovjn7o7fdce	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.077	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20wl008r6ovjz2wrhcrn	NOTE	cmnyb20wh008q6ovjqhaohnye	cmnyb20wh008q6ovjqhaohnye	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.085	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ws008t6ovjlkscrost	NOTE	cmnyb20wp008s6ovj76thsld1	cmnyb20wp008s6ovj76thsld1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.092	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20x2008v6ovj7kbl7suv	NOTE	cmnyb20wx008u6ovj08zzj63y	cmnyb20wx008u6ovj08zzj63y	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.102	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20xa008x6ovjtd7n49ga	NOTE	cmnyb20x6008w6ovjovd7aom2	cmnyb20x6008w6ovjovd7aom2	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.11	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20xi008z6ovjuc7vgmt2	NOTE	cmnyb20xe008y6ovjb7r3c6xn	cmnyb20xe008y6ovjb7r3c6xn	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.118	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20xr00916ovjv0anmiyf	NOTE	cmnyb20xn00906ovj6d2k45m1	cmnyb20xn00906ovj6d2k45m1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.127	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20xz00936ovjypfer8ws	NOTE	cmnyb20xv00926ovjt9c4vnm3	cmnyb20xv00926ovjt9c4vnm3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.135	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20y800956ovj5g1urmlh	NOTE	cmnyb20y400946ovjtuketalk	cmnyb20y400946ovjtuketalk	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.144	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20yg00976ovj3v79lweq	NOTE	cmnyb20yd00966ovj2t212bjo	cmnyb20yd00966ovj2t212bjo	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.152	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20yp00996ovj42zbbq2s	NOTE	cmnyb20yl00986ovjvo5l2anz	cmnyb20yl00986ovjvo5l2anz	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.161	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20yx009b6ovj36f139he	NOTE	cmnyb20yt009a6ovjsktbefy8	cmnyb20yt009a6ovjsktbefy8	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.169	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20z6009d6ovjyx9p3lry	NOTE	cmnyb20z2009c6ovjgkvkpkkg	cmnyb20z2009c6ovjgkvkpkkg	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.178	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20ze009f6ovjl7b6npcw	NOTE	cmnyb20za009e6ovjpxrl0u5c	cmnyb20za009e6ovjpxrl0u5c	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.186	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20zm009h6ovjmcn4o1aw	NOTE	cmnyb20zi009g6ovj5jenmhas	cmnyb20zi009g6ovj5jenmhas	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.194	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb20zv009j6ovjejcj2sg4	NOTE	cmnyb20zr009i6ovjjcpoeo98	cmnyb20zr009i6ovjjcpoeo98	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.203	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb210a009l6ovjwoffzn3h	NOTE	cmnyb2106009k6ovjfh7mdgy0	cmnyb2106009k6ovjfh7mdgy0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.218	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb210j009n6ovj6mhdis0c	NOTE	cmnyb210f009m6ovjhoskk68l	cmnyb210f009m6ovjhoskk68l	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.227	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb210r009p6ovjug6gduum	NOTE	cmnyb210n009o6ovja648lnba	cmnyb210n009o6ovja648lnba	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.235	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb210z009r6ovjanaa25z4	NOTE	cmnyb210v009q6ovjsj6zvj8i	cmnyb210v009q6ovjsj6zvj8i	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.243	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb2117009t6ovj8chfib4j	NOTE	cmnyb2114009s6ovj9b99gro5	cmnyb2114009s6ovj9b99gro5	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.251	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb211h009v6ovj6e4fl1si	NOTE	cmnyb211d009u6ovji9qwmgd7	cmnyb211d009u6ovji9qwmgd7	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.261	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb211q009x6ovjx4orkkv3	NOTE	cmnyb211m009w6ovjsaa4u80b	cmnyb211m009w6ovjsaa4u80b	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.27	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb211z009z6ovjyyhn6anz	NOTE	cmnyb211u009y6ovjj6qxlfb1	cmnyb211u009y6ovjj6qxlfb1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.279	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb212700a16ovj9qhz5984	NOTE	cmnyb212300a06ovjvbp4uijp	cmnyb212300a06ovjvbp4uijp	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.287	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb212g00a36ovjc39r0ntp	NOTE	cmnyb212c00a26ovjxcy705do	cmnyb212c00a26ovjxcy705do	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.296	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb212o00a56ovj2mdytews	NOTE	cmnyb212k00a46ovjdstr383m	cmnyb212k00a46ovjdstr383m	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.304	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb212w00a76ovjbs3wxlqa	NOTE	cmnyb212t00a66ovjuedl9qw0	cmnyb212t00a66ovjuedl9qw0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.312	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb213600a96ovjqpsgwy5m	NOTE	cmnyb213300a86ovjedpdr5wv	cmnyb213300a86ovjedpdr5wv	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.322	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb213e00ab6ovjv5scyx73	NOTE	cmnyb213a00aa6ovj1onu5w1s	cmnyb213a00aa6ovj1onu5w1s	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.33	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb213m00ad6ovjebhwcs06	NOTE	cmnyb213j00ac6ovjnt6q3acb	cmnyb213j00ac6ovjnt6q3acb	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.338	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb214b00af6ovjey1oo0nr	NOTE	cmnyb213r00ae6ovjqqkqzhnj	cmnyb213r00ae6ovjqqkqzhnj	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.363	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb214j00ah6ovj0j2lb5a4	NOTE	cmnyb214f00ag6ovj11y1hbrh	cmnyb214f00ag6ovj11y1hbrh	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.371	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb214s00aj6ovjjreficfs	NOTE	cmnyb214o00ai6ovjkye4afyz	cmnyb214o00ai6ovjkye4afyz	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.38	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb215000al6ovjwkb1vgx1	NOTE	cmnyb214w00ak6ovjgvmh9cmu	cmnyb214w00ak6ovjgvmh9cmu	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.388	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb215800an6ovj3dqqkkvr	NOTE	cmnyb215500am6ovjaarzh5xy	cmnyb215500am6ovjaarzh5xy	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.396	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb215g00ap6ovj68id0uh0	NOTE	cmnyb215c00ao6ovjk63az1xi	cmnyb215c00ao6ovjk63az1xi	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.404	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb215p00ar6ovjq6k9lpfh	NOTE	cmnyb215l00aq6ovj897c4cee	cmnyb215l00aq6ovj897c4cee	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.412	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb215x00at6ovjngc0m28l	NOTE	cmnyb215t00as6ovjdhk5k8if	cmnyb215t00as6ovjdhk5k8if	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.421	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb216500av6ovju3rt9hsn	NOTE	cmnyb216200au6ovjlk10484s	cmnyb216200au6ovjlk10484s	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.429	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb216d00ax6ovjeyl1icg8	NOTE	cmnyb216a00aw6ovj9h2p9guk	cmnyb216a00aw6ovj9h2p9guk	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.437	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb216q00az6ovj4l4fdlio	NOTE	cmnyb216i00ay6ovj1kw21nbg	cmnyb216i00ay6ovj1kw21nbg	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.45	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb216y00b16ovjq3b0m84o	NOTE	cmnyb216u00b06ovjinau7g1t	cmnyb216u00b06ovjinau7g1t	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.458	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb217600b36ovjqxyk4dd1	NOTE	cmnyb217200b26ovjda0yyjec	cmnyb217200b26ovjda0yyjec	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.466	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb217e00b56ovjroynestn	NOTE	cmnyb217a00b46ovj1hq8lnd5	cmnyb217a00b46ovj1hq8lnd5	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.474	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb217m00b76ovj8erz3o17	NOTE	cmnyb217i00b66ovjeamyj4aq	cmnyb217i00b66ovjeamyj4aq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.482	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb217u00b96ovjq3piszdt	NOTE	cmnyb217q00b86ovjo8dmqgq3	cmnyb217q00b86ovjo8dmqgq3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.49	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb218200bb6ovj4kqn3na5	NOTE	cmnyb217y00ba6ovjo27mx9o8	cmnyb217y00ba6ovjo27mx9o8	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.498	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb218a00bd6ovj539pvgdk	NOTE	cmnyb218600bc6ovjb4cngdia	cmnyb218600bc6ovjb4cngdia	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.506	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb218i00bf6ovjuy12k71r	NOTE	cmnyb218e00be6ovjk0a1v1kd	cmnyb218e00be6ovjk0a1v1kd	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.514	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb218q00bh6ovj3i7rbkn2	NOTE	cmnyb218m00bg6ovji6x0fmql	cmnyb218m00bg6ovji6x0fmql	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.522	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb218z00bj6ovjyiz4iwkc	NOTE	cmnyb218v00bi6ovjbp8m0rty	cmnyb218v00bi6ovjbp8m0rty	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.531	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb219700bl6ovj4vgvktmu	NOTE	cmnyb219400bk6ovjhvtspo7q	cmnyb219400bk6ovjhvtspo7q	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.539	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb219f00bn6ovjil1vc3dj	NOTE	cmnyb219c00bm6ovjtm1e8pl8	cmnyb219c00bm6ovjtm1e8pl8	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.547	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb219o00bp6ovj5un1to6o	NOTE	cmnyb219k00bo6ovj9bq60f6d	cmnyb219k00bo6ovj9bq60f6d	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.556	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb219v00br6ovjknsf3bj7	NOTE	cmnyb219s00bq6ovjpnbenfn0	cmnyb219s00bq6ovjpnbenfn0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.563	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21a300bt6ovjm5u5zgaf	NOTE	cmnyb219z00bs6ovjrswybpvi	cmnyb219z00bs6ovjrswybpvi	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.571	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21ab00bv6ovjop2hjsgt	NOTE	cmnyb21a700bu6ovj73t51264	cmnyb21a700bu6ovj73t51264	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.579	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21aj00bx6ovj9lww260q	NOTE	cmnyb21ag00bw6ovj2um5v0s2	cmnyb21ag00bw6ovj2um5v0s2	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.587	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21at00bz6ovj63bkmctd	NOTE	cmnyb21ao00by6ovj4ansaxde	cmnyb21ao00by6ovj4ansaxde	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.596	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21b100c16ovj69mx47sa	NOTE	cmnyb21ax00c06ovjhofw16c7	cmnyb21ax00c06ovjhofw16c7	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.605	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21ba00c36ovjy4awkju7	NOTE	cmnyb21b600c26ovj0vh6tvyu	cmnyb21b600c26ovj0vh6tvyu	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.614	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21bj00c56ovj67lydpa5	NOTE	cmnyb21bf00c46ovju4v7vw2y	cmnyb21bf00c46ovju4v7vw2y	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.623	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21bs00c76ovjqf7htbba	NOTE	cmnyb21bp00c66ovjpvzsh5oj	cmnyb21bp00c66ovjpvzsh5oj	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.632	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21bx00c96ovjiwyat0oc	NOTE	cmnyb21bv00c86ovjhsbeogeq	cmnyb21bv00c86ovjhsbeogeq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.637	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21c300cb6ovj0prueqix	NOTE	cmnyb21c000ca6ovjf80z3wwq	cmnyb21c000ca6ovjf80z3wwq	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.643	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21cb00cd6ovjwa4erqgv	NOTE	cmnyb21c700cc6ovjko1ys72k	cmnyb21c700cc6ovjko1ys72k	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.651	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21cq00cf6ovjd2c7mue6	NOTE	cmnyb21cm00ce6ovj6lagbri3	cmnyb21cm00ce6ovj6lagbri3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.666	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21cy00ch6ovjwiingchf	NOTE	cmnyb21cu00cg6ovj21njf5et	cmnyb21cu00cg6ovj21njf5et	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.674	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21d600cj6ovjejhofgey	NOTE	cmnyb21d200ci6ovj17ysyuri	cmnyb21d200ci6ovj17ysyuri	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.682	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21de00cl6ovjrc9kzdqk	NOTE	cmnyb21db00ck6ovjl9srk9yp	cmnyb21db00ck6ovjl9srk9yp	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.69	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21do00cn6ovjkw7nq95k	NOTE	cmnyb21dj00cm6ovjuwtrjwte	cmnyb21dj00cm6ovjuwtrjwte	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.699	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21dv00cp6ovj5smsb9yi	NOTE	cmnyb21dr00co6ovjdmb7gamn	cmnyb21dr00co6ovjdmb7gamn	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.707	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21e400cr6ovj2gy0gtra	NOTE	cmnyb21e000cq6ovjex1a4xo6	cmnyb21e000cq6ovjex1a4xo6	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.716	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21eb00ct6ovj4nlk25ni	NOTE	cmnyb21e700cs6ovjbfu37ed4	cmnyb21e700cs6ovjbfu37ed4	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.723	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21eg00cv6ovjh24zi5a6	NOTE	cmnyb21ed00cu6ovjyvyw5rak	cmnyb21ed00cu6ovjyvyw5rak	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.728	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21ek00cx6ovjaamre83k	NOTE	cmnyb21ei00cw6ovji7jn6op0	cmnyb21ei00cw6ovji7jn6op0	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.732	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21eq00cz6ovjcqlr7e2b	NOTE	cmnyb21en00cy6ovjwkvswmj6	cmnyb21en00cy6ovjwkvswmj6	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.738	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21ev00d16ovjc0smp6on	NOTE	cmnyb21et00d06ovjmxm2vumn	cmnyb21et00d06ovjmxm2vumn	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.743	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21f100d36ovja9mnvf0e	NOTE	cmnyb21ey00d26ovj9hj8irha	cmnyb21ey00d26ovj9hj8irha	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.749	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21f700d56ovjxfdbzp4g	NOTE	cmnyb21f400d46ovjcxjzc43w	cmnyb21f400d46ovjcxjzc43w	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.755	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21fg00d76ovjleml0paj	NOTE	cmnyb21fc00d66ovjsxzaejby	cmnyb21fc00d66ovjsxzaejby	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.764	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21fo00d96ovjx6816w6m	NOTE	cmnyb21fk00d86ovj2cr2ylou	cmnyb21fk00d86ovj2cr2ylou	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.772	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21fw00db6ovj8rpcfxxh	NOTE	cmnyb21fs00da6ovjdugu1e08	cmnyb21fs00da6ovjdugu1e08	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.78	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21g500dd6ovjy8np55ci	NOTE	cmnyb21g100dc6ovj0tnxe0w5	cmnyb21g100dc6ovj0tnxe0w5	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.788	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21gd00df6ovj4cja945c	NOTE	cmnyb21g900de6ovjb3yhsbii	cmnyb21g900de6ovjb3yhsbii	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.796	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21gk00dh6ovjs4jgdlgk	NOTE	cmnyb21gh00dg6ovj8fwf6ozl	cmnyb21gh00dg6ovj8fwf6ozl	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.804	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21gp00dj6ovj6l22tmft	NOTE	cmnyb21gm00di6ovjhpxp9l8y	cmnyb21gm00di6ovjhpxp9l8y	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.809	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21gw00dl6ovjydwbq194	NOTE	cmnyb21gs00dk6ovjjwnjxu9i	cmnyb21gs00dk6ovjjwnjxu9i	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.816	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21h200dn6ovjef496omi	NOTE	cmnyb21gz00dm6ovjt080ywmy	cmnyb21gz00dm6ovjt080ywmy	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.822	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21h800dp6ovj65plejco	NOTE	cmnyb21h500do6ovjtem1ffp6	cmnyb21h500do6ovjtem1ffp6	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.828	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21hd00dr6ovjn6vazaht	NOTE	cmnyb21ha00dq6ovj4q05d4e8	cmnyb21ha00dq6ovj4q05d4e8	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.833	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21hi00dt6ovjhsl19q93	NOTE	cmnyb21hg00ds6ovj9h0c7zs3	cmnyb21hg00ds6ovj9h0c7zs3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.838	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21ho00dv6ovjpdhg3mon	NOTE	cmnyb21hl00du6ovjdt22v8kj	cmnyb21hl00du6ovjdt22v8kj	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.844	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21hu00dx6ovjbzjk3j1n	NOTE	cmnyb21hr00dw6ovj20yra6so	cmnyb21hr00dw6ovj20yra6so	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.85	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21i200dz6ovj1qnemq5y	NOTE	cmnyb21hz00dy6ovjfg8d449x	cmnyb21hz00dy6ovjfg8d449x	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.858	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21i900e16ovjhc2d232f	NOTE	cmnyb21i600e06ovjyobq59o1	cmnyb21i600e06ovjyobq59o1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.865	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21ih00e36ovj5ncsu9y9	NOTE	cmnyb21ie00e26ovjs4k41wjd	cmnyb21ie00e26ovjs4k41wjd	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.873	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21iq00e56ovjawm6j7fe	NOTE	cmnyb21im00e46ovjjzx3cbk5	cmnyb21im00e46ovjjzx3cbk5	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.882	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21iy00e76ovjwlrj2d5l	NOTE	cmnyb21iu00e66ovjvhanxr5r	cmnyb21iu00e66ovjvhanxr5r	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.89	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21j600e96ovjo94b0ftx	NOTE	cmnyb21j200e86ovjf4hpcwxk	cmnyb21j200e86ovjf4hpcwxk	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.898	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21je00eb6ovjgkb3aq5d	NOTE	cmnyb21ja00ea6ovjefed4r6j	cmnyb21ja00ea6ovjefed4r6j	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.906	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21jl00ed6ovjbbkgv76b	NOTE	cmnyb21ji00ec6ovjfetvpigl	cmnyb21ji00ec6ovjfetvpigl	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.913	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21jq00ef6ovjrrlufkxy	NOTE	cmnyb21jo00ee6ovjar4efpjw	cmnyb21jo00ee6ovjar4efpjw	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.918	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21jv00eh6ovj11rifcuh	NOTE	cmnyb21jt00eg6ovjrnjpvjtl	cmnyb21jt00eg6ovjrnjpvjtl	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.923	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21k100ej6ovj83h3bbjk	NOTE	cmnyb21jy00ei6ovjy28f6opm	cmnyb21jy00ei6ovjy28f6opm	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.929	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21k600el6ovj2r9b09tl	NOTE	cmnyb21k300ek6ovjx78qx50m	cmnyb21k300ek6ovjx78qx50m	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.934	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21kb00en6ovjxvihx0c6	NOTE	cmnyb21k800em6ovjkreq05lp	cmnyb21k800em6ovjkreq05lp	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.939	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21kg00ep6ovjc2o4llxy	NOTE	cmnyb21ke00eo6ovj2vxvnpe6	cmnyb21ke00eo6ovj2vxvnpe6	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.944	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21km00er6ovjtt4c7fhy	NOTE	cmnyb21kj00eq6ovjsh0wnxes	cmnyb21kj00eq6ovjsh0wnxes	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.95	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21kr00et6ovj7a0dhdvz	NOTE	cmnyb21ko00es6ovjgf91yxlj	cmnyb21ko00es6ovjgf91yxlj	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.955	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21kx00ev6ovjw85vk65z	NOTE	cmnyb21kv00eu6ovj60r1crt1	cmnyb21kv00eu6ovj60r1crt1	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.961	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21l300ex6ovjwts2f38m	NOTE	cmnyb21l000ew6ovjhq6uwv93	cmnyb21l000ew6ovjhq6uwv93	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.967	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21l900ez6ovj4vt6b5p0	NOTE	cmnyb21l600ey6ovjte0x6mv3	cmnyb21l600ey6ovjte0x6mv3	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.973	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21lh00f16ovjy9x8k7gc	NOTE	cmnyb21le00f06ovj2rymu1nk	cmnyb21le00f06ovj2rymu1nk	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.981	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21lq00f36ovjfgvjudlw	NOTE	cmnyb21lm00f26ovjheokoysb	cmnyb21lm00f26ovjheokoysb	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.99	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21ly00f56ovjhuj4mvm2	NOTE	cmnyb21lu00f46ovj0xgcdu3y	cmnyb21lu00f46ovj0xgcdu3y	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:44.998	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21m600f76ovjidxq49nc	NOTE	cmnyb21m200f66ovj7s9tdihj	cmnyb21m200f66ovj7s9tdihj	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:45.006	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyb21mf00f96ovjpjou9b05	NOTE	cmnyb21mc00f86ovjvxxksjr2	cmnyb21mc00f86ovjvxxksjr2	cmnyax8h300036ovjypf6c2to	2026-04-14 07:33:45.015	Lead importé via Excel par Nonwa Kone (nonwa.kone@appatam.com).
cmnyfiqvv0001xsvjbapz59e9	NOTE	cmnyfiqup0000xsvjvd31p7ny	cmnyfiqup0000xsvjvd31p7ny	cmnyax8h300036ovjypf6c2to	2026-04-14 09:38:42.715	Lead créé manuellement par Nonwa Kone (nonwa.kone@appatam.com).
\.


--
-- Data for Name: AgendaItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AgendaItem" (id, "leadId", title, description, "dueDate", status, "createdAt", "createdById") FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Client" (id, name, contact, "totalRevenue", "companyId", "activityDomain", civility, "companyName", email, location, notes, phone, source, "convertedAt", "convertedById") FROM stdin;
\.


--
-- Data for Name: ClientProductInterest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientProductInterest" (id, "clientId", "productId", "estimatedValue", "createdAt") FROM stdin;
\.


--
-- Data for Name: ClientServiceInterest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientServiceInterest" (id, "clientId", "serviceId", "estimatedValue", "createdAt") FROM stdin;
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, name, plan, "createdAt", kind) FROM stdin;
cmnyavoeq00006ovjcsncu1t9	Socopi	free	2026-04-14 07:28:47.954	CLIENT
cmnyax8fz00026ovj3br2w6uq	Appatam	free	2026-04-14 07:30:00.575	CLIENT
\.


--
-- Data for Name: Deal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Deal" (id, title, amount, stage, probability, "expectedCloseDate", "assignedTo", "companyId") FROM stdin;
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lead" (id, "firstName", "lastName", phone, email, source, status, "assignedTo", "companyId", "createdAt", "companyName", location, "activityDomain", notes, civility, "jobTitle") FROM stdin;
cmnyb1nfs00046ovjg3f6kdxq	Dupont	Acme Corp	+225 01 23 45 67	contact@acme.ci	Informatique / SaaS | Lieu: Abidjan, Cocody | Obs: Client rencontré au salon X	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:26.631	Acme Corp	Abidjan, Cocody	Informatique / SaaS	Client rencontré au salon X	M.	\N
cmnyb1zym00066ovjsc2b6i0o	Nguessan	AVENIRE	\N	\N	Assurance | Lieu: Plateau immeuble CRRAE UEMOA | Obs: RDV pris pour mercredi 23/10/2024 15h: le client demande une cotation pour une formation en cybersecurite, cotation envoyee en attente de retour. Prochaine action : rappeler M. Nguessan apres prise de connaissance de la cotation	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.862	AVENIRE	Plateau immeuble CRRAE UEMOA	Assurance	RDV pris pour mercredi 23/10/2024 15h: le client demande une cotation pour une formation en cybersecurite, cotation envoyee en attente de retour. Prochaine action : rappeler M. Nguessan apres prise de connaissance de la cotation	M	\N
cmnyb1zz300086ovjp3fi2k90	Nguessan	AAVIE	\N	\N	Lieu: Plateau Rue des banques immeuble AMCI | Obs: M. N'guessan me revient pour confirmation de rdv\r\nEchange avec le chef informatique, besoin de borne\r\n pour gestion de fil offre sur les bornes envoyee, \r\nen attente de date de disponibilite pour presentation \r\ndes bornes	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.879	AAVIE	Plateau Rue des banques immeuble AMCI	\N	M. N'guessan me revient pour confirmation de rdv\r\nEchange avec le chef informatique, besoin de borne\r\n pour gestion de fil offre sur les bornes envoyee, \r\nen attente de date de disponibilite pour presentation \r\ndes bornes	M	\N
cmnyb1zze000a6ovjk2qp8zkb	Contact	ASCOMA	\N	\N	Lieu: Rue des jardins | Obs: Numero indisponible	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.89	ASCOMA	Rue des jardins	\N	Numero indisponible	\N	\N
cmnyb1zzp000c6ovjrhui7up9	Zile	SAHAM ASSURANCE	\N	\N	Lieu: Plateau boulevard roume immeuble colina | Obs: RAPPEL mercredi 30 octobre prochain pour confirmation de rdv M. YAO ANTOINE 0747414186	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.901	SAHAM ASSURANCE	Plateau boulevard roume immeuble colina	\N	RAPPEL mercredi 30 octobre prochain pour confirmation de rdv M. YAO ANTOINE 0747414186	M	\N
cmnyb2002000e6ovjuaasar1d	Kei	GRAS SAVOYE [willis towers watson]	\N	\N	Lieu: Plateau rue du commerce | Obs: Numero occupe	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.913	GRAS SAVOYE [willis towers watson]	Plateau rue du commerce	\N	Numero occupe	M	\N
cmnyb200b000g6ovjp6qj6gud	Kaba	SUNU	\N	\N	Lieu: Plateau Immeuble le mans | Obs: Indisponible pour un rdv , n'est pas interresse par nos services	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.923	SUNU	Plateau Immeuble le mans	\N	Indisponible pour un rdv , n'est pas interresse par nos services	M	\N
cmnyb200s000i6ovjr8z5f3s8	Contact	MUGEF CI	\N	\N	Lieu: Plateau centre culturel francais | Obs: Ne decroche pas a rappeler	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.94	MUGEF CI	Plateau centre culturel francais	\N	Ne decroche pas a rappeler	\N	\N
cmnyb2013000k6ovj8fz8xnrr	Contact	NSIA	\N	\N	Lieu: Plateau rue du commerce | Obs: Nsia assurance: adresser une demande d'agrement a NSIA ASSURANCE	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.951	NSIA	Plateau rue du commerce	\N	Nsia assurance: adresser une demande d'agrement a NSIA ASSURANCE	\N	\N
cmnyb201b000m6ovj8mwcw3li	Savi	NOOM	\N	\N	Hotellerie | Lieu: Boulevard lagunaire | Obs: catalogue de formation envoyee, rappeler le client pour en savoir plus	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.959	NOOM	Boulevard lagunaire	Hotellerie	catalogue de formation envoyee, rappeler le client pour en savoir plus	Mme	\N
cmnyb201h000o6ovja2ndmdxn	Contact	NOVOTEL	\N	\N	Hotellerie | Lieu: PLATEAU GARE SUD	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.965	NOVOTEL	PLATEAU GARE SUD	Hotellerie	\N	\N	\N
cmnyb201p000q6ovjiajzaeym	Contact	PULLMAN	\N	\N	Hotellerie | Lieu: PLATEAU Avenue Abdoulaye Fadiga | Obs: landry.assoma@accord.com rdv pris vendredi 25 octobre a 14h30\r\nReunion effectuee: il demande a ce quon appelle le responsable informatique\r\nResponsable informatique en conges il reprend le 15 novembre\r\nEn attente du retour de M. Samuel Kouassi [Chef informatique Pullman]	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.972	PULLMAN	PLATEAU Avenue Abdoulaye Fadiga	Hotellerie	landry.assoma@accord.com rdv pris vendredi 25 octobre a 14h30\r\nReunion effectuee: il demande a ce quon appelle le responsable informatique\r\nResponsable informatique en conges il reprend le 15 novembre\r\nEn attente du retour de M. Samuel Kouassi [Chef informatique Pullman]	\N	\N
cmnyb201u000s6ovjxmrbizm1	Contact	IVOTEL	\N	\N	Hotellerie | Lieu: RUE GOURGAS PLATEAU	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.978	IVOTEL	RUE GOURGAS PLATEAU	Hotellerie	\N	\N	\N
cmnyb2021000u6ovj0du1f6pc	Contact	SOFITEL	\N	\N	Hotellerie | Lieu: cocody | Obs: mardi 29 octobre a 9h avec M. Adingra\r\nReunion effectuee: M. Blede doit nous revenir avec le nombre de personnes a former afin que nous puissions monter une cotation\r\nEn attente du retour de M. Blede	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.985	SOFITEL	cocody	Hotellerie	mardi 29 octobre a 9h avec M. Adingra\r\nReunion effectuee: M. Blede doit nous revenir avec le nombre de personnes a former afin que nous puissions monter une cotation\r\nEn attente du retour de M. Blede	\N	\N
cmnyb202b000w6ovjadjx4thb	Contact	SCICA- AFRIQUE	\N	\N	Cooperatives | Obs: client injoignable	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:42.995	SCICA- AFRIQUE	\N	Cooperatives	client injoignable	\N	\N
cmnyb202k000y6ovjc6pnupir	Contact	RESCOOP CI	\N	\N	Cooperatives | Lieu: YOP BEL AIR	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.004	RESCOOP CI	YOP BEL AIR	Cooperatives	\N	\N	\N
cmnyb202t00106ovjhxieedra	Contact	ACI	\N	\N	Cooperatives | Obs: M Tiemele 0757454139 deposer un agrement physiquement bicici zone 4 non loin de chez marouche [courrier dagrement , dfe, plaquette de presentation]\r\nDemande d'agrement depose\r\nEchange avec Mme Golfier [directrice de ACI]: pas interressee par nos services	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.013	ACI	\N	Cooperatives	M Tiemele 0757454139 deposer un agrement physiquement bicici zone 4 non loin de chez marouche [courrier dagrement , dfe, plaquette de presentation]\r\nDemande d'agrement depose\r\nEchange avec Mme Golfier [directrice de ACI]: pas interressee par nos services	\N	\N
cmnyb203200126ovjgv9cmlso	Contact	CAYAT CI	\N	\N	Cooperatives | Obs: rappeler M. Traore Aboudramane mardi a 10h	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.022	CAYAT CI	\N	Cooperatives	rappeler M. Traore Aboudramane mardi a 10h	\N	\N
cmnyb203h00146ovjuucaqbvo	Contact	UNACOOPEC CI	\N	\N	Cooperatives | Lieu: 2plateaux vallons | Obs: numero injoignable	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.037	UNACOOPEC CI	2plateaux vallons	Cooperatives	numero injoignable	\N	\N
cmnyb203q00166ovj3vxgf54j	Contact	ECOOKIM	\N	\N	Cooperatives | Obs: messagerie vocale	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.046	ECOOKIM	\N	Cooperatives	messagerie vocale	\N	\N
cmnyb204300186ovjk9e8pwej	Contact	USCOA CI	\N	\N	Cooperatives | Obs: client injoignable	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.059	USCOA CI	\N	Cooperatives	client injoignable	\N	\N
cmnyb204c001a6ovjxgsr7agc	Diabate	SODEXAM	\N	\N	Cooperatives | Lieu: Port bouet aeroport | Obs: ne decroche pas, a rappeler	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.068	SODEXAM	Port bouet aeroport	Cooperatives	ne decroche pas, a rappeler	M	\N
cmnyb204o001c6ovj8ngcq9hi	Contact	Sans nom	\N	\N	Cooperatives	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.08	Sans nom	\N	Cooperatives	\N	\N	\N
cmnyb204x001e6ovjs1pplh12	Contact	Sans nom	\N	\N	Cooperatives	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.089	Sans nom	\N	Cooperatives	\N	\N	\N
cmnyb2056001g6ovjolzf4pa8	Contact	Sans nom	\N	\N	Cooperatives	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.098	Sans nom	\N	Cooperatives	\N	\N	\N
cmnyb205f001i6ovj3h5b1fzj	Nembelessini	ACE	\N	\N	AGRO ALIMENTAIRE | Obs: Rappeler M. Silue pour prise de contact a ACE	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.107	ACE	\N	AGRO ALIMENTAIRE	Rappeler M. Silue pour prise de contact a ACE	M	\N
cmnyb205q001k6ovj5joptyh3	Kassi	Kanic Marketing	\N	\N	MARKETING | Obs: Client indisponible	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.117	Kanic Marketing	\N	MARKETING	Client indisponible	M	\N
cmnyb205y001m6ovj675xg15c	Dan	SIBM	\N	\N	BTP | Obs: Ne decroche pas a rappeler ce lundi 04/11/2024	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.126	SIBM	\N	BTP	Ne decroche pas a rappeler ce lundi 04/11/2024	M	\N
cmnyb2066001o6ovjsz4n7sww	Ouedraogo	Ivoirdis	\N	\N	Distribution | Obs: Le client demande a ce quon la rappelle le 30/10/2024 pour prise de rdv\r\nClient ne decroche pas	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.134	Ivoirdis	\N	Distribution	Le client demande a ce quon la rappelle le 30/10/2024 pour prise de rdv\r\nClient ne decroche pas	Mme	\N
cmnyb206f001q6ovja3ks2zmk	Contact	CECC ASSUR	\N	\N	Reassurance | Obs: notre interlocuteur nous informe que l'entreprise n'existe plus	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.143	CECC ASSUR	\N	Reassurance	notre interlocuteur nous informe que l'entreprise n'existe plus	\N	\N
cmnyb206q001s6ovj16ryt4hm	Koffi	MSC	\N	\N	Transport maritime | Obs: rappeler M. Odi Daniel le 31/10/2024 pour mise en relation avec le manager IT: me rappelle dans 10mn\r\ncatalogue de formation et visuels de formation envoyees: le client nous dit qu'il pourrait etre interresser par les applications liees a la power platform pour l'annee prochaine	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.154	MSC	\N	Transport maritime	rappeler M. Odi Daniel le 31/10/2024 pour mise en relation avec le manager IT: me rappelle dans 10mn\r\ncatalogue de formation et visuels de formation envoyees: le client nous dit qu'il pourrait etre interresser par les applications liees a la power platform pour l'annee prochaine	M	\N
cmnyb206x001u6ovjfqq2e5wm	Aboua	CEADIS	\N	\N	Import et ventes de materiaux de construcion | Obs: Ne decroche pas a rappeler	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.161	CEADIS	\N	Import et ventes de materiaux de construcion	Ne decroche pas a rappeler	M	\N
cmnyb2075001w6ovjrxpes3n6	Aliko	Abeil	\N	\N	AGRO ALIMENTAIRE et Transport | Lieu: Plateau immeuble chardy 5eme etage | Obs: rappeler le 31/10/2024 a 10h	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.169	Abeil	Plateau immeuble chardy 5eme etage	AGRO ALIMENTAIRE et Transport	rappeler le 31/10/2024 a 10h	\N	\N
cmnyb207d001y6ovjhkxww7lw	Nguessan	GTX	\N	\N	BTP | Obs: rappeler entre le 10 et le 15 novembre\r\nle client memmene son adresse mail pour qu'on lui envoie la documentation sur les JNSI: jeromenguessan@mediasoftci.net\r\ndocumentation sur JNSI envoyee en attenete de retour du client	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.177	GTX	\N	BTP	rappeler entre le 10 et le 15 novembre\r\nle client memmene son adresse mail pour qu'on lui envoie la documentation sur les JNSI: jeromenguessan@mediasoftci.net\r\ndocumentation sur JNSI envoyee en attenete de retour du client	M	\N
cmnyb207k00206ovjcfvx6kun	Contact	Eden Prestige	\N	\N	Import export | Obs: rappeler le 8 nov M. AMON HERVE	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.184	Eden Prestige	\N	Import export	rappeler le 8 nov M. AMON HERVE	\N	\N
cmnyb207s00226ovjr8uxdhpy	Diby	ARSN	\N	\N	Lieu: Feu du nouveau camp | Obs: Rappeler le 11/11/2024 pour prise de rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.192	ARSN	Feu du nouveau camp	\N	Rappeler le 11/11/2024 pour prise de rdv	M	\N
cmnyb207z00246ovjd41rhhfs	Keita	Mayelia Automotive	\N	\N	Lieu: Marcory zone 4c 32 rue marconi | Obs: Catalogue de formation envoyee. Prochaine action : rappeler le client apres prise de connaissance du catalogue	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.199	Mayelia Automotive	Marcory zone 4c 32 rue marconi	\N	Catalogue de formation envoyee. Prochaine action : rappeler le client apres prise de connaissance du catalogue	M	\N
cmnyb208700266ovjqdwn0aet	Saw	BGFI	\N	\N	Banque | Lieu: Marcory boulevard giscard d'estaing face a cap sud | Obs: rappeler M. Aboubacar le 20 nov pour prise de rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.207	BGFI	Marcory boulevard giscard d'estaing face a cap sud	Banque	rappeler M. Aboubacar le 20 nov pour prise de rdv	M	\N
cmnyb208f00286ovjbp62czg3	M'Bra	Conseil Coton Arnacade	\N	\N	Agriculture | Lieu: Plateau immeuble Caistab | Obs: RDV mardi 5 nov au CCA\r\nReunion effectuee: prochaine etape rentrer en contact avec M. Berte pour mise en relation avec ses collaborateurs pour prise d'informations	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.215	Conseil Coton Arnacade	Plateau immeuble Caistab	Agriculture	RDV mardi 5 nov au CCA\r\nReunion effectuee: prochaine etape rentrer en contact avec M. Berte pour mise en relation avec ses collaborateurs pour prise d'informations	Mme	\N
cmnyb208o002a6ovjrdy2u0p9	Contact	Conseil Hevea Palmier a huile	\N	\N	Agriculture | Lieu: 2 plateaux vallons ambassade du ghana | Obs: RDV avec M. Danho CHPH 15h 2plateaux vallons vers l'ambassade du ghana le rappeler pour plus de details sur localisation\r\nRdv reporte au jeudi 7 nov 2024 a confirmer\r\nReunion effectuee: client interresse par un logiciel de gestion de courrier \r\nProchaine etape: prendre rdv pour presentation de logiciel de gestion de courrier et mise en relation avec le service communication\r\nReunion avec Mme Dosso Kathine [service communication] effectuee	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.224	Conseil Hevea Palmier a huile	2 plateaux vallons ambassade du ghana	Agriculture	RDV avec M. Danho CHPH 15h 2plateaux vallons vers l'ambassade du ghana le rappeler pour plus de details sur localisation\r\nRdv reporte au jeudi 7 nov 2024 a confirmer\r\nReunion effectuee: client interresse par un logiciel de gestion de courrier \r\nProchaine etape: prendre rdv pour presentation de logiciel de gestion de courrier et mise en relation avec le service communication\r\nReunion avec Mme Dosso Kathine [service communication] effectuee	\N	\N
cmnyb208x002c6ovjejnr3qze	Affi	NSIA ASSURANCES	\N	\N	Assurance | Lieu: Plateau avenue nogues | Obs: me rappelle apres fixation de rdv avec le DSI	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.233	NSIA ASSURANCES	Plateau avenue nogues	Assurance	me rappelle apres fixation de rdv avec le DSI	M	\N
cmnyb2096002e6ovjs4ql1x89	Coulibaly	CNS	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.242	CNS	\N	\N	\N	M	\N
cmnyb209f002g6ovj1jaafzgd	Coulibaly	Distripres	\N	\N	Agro alimentaire	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.25	Distripres	\N	Agro alimentaire	\N	\N	\N
cmnyb209m002i6ovjeidy81mp	Gbale	SIVOTECENERGIES	\N	\N	Electricite, Energie, Informatique | Lieu: angre derriere le 22eme	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.258	SIVOTECENERGIES	angre derriere le 22eme	Electricite, Energie, Informatique	\N	\N	\N
cmnyb209v002k6ovjdktrowvo	Contact	AVEPLUS	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.267	AVEPLUS	\N	\N	\N	\N	\N
cmnyb20a3002m6ovjc2p7wnib	Samuel	Pullman	\N	\N	Hotellerie | Lieu: plateau | Obs: rappeler M. Kouassi le 15 nov actuellement en conges	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.275	Pullman	plateau	Hotellerie	rappeler M. Kouassi le 15 nov actuellement en conges	\N	\N
cmnyb20ab002o6ovjyd0szku0	Contact	Kams assurance	\N	\N	Assurance | Lieu: Bingerville	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.283	Kams assurance	Bingerville	Assurance	\N	\N	\N
cmnyb20ai002q6ovj1w70vsr7	Kossi	SIPEL	\N	\N	Lieu: Riviera 2	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.29	SIPEL	Riviera 2	\N	\N	M	\N
cmnyb20ap002s6ovjs9lmu771	Gbahi	CNPS	\N	\N	Lieu: Plateau en face de novotel | Obs: demande d'agrement a deposer	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.297	CNPS	Plateau en face de novotel	\N	demande d'agrement a deposer	M	\N
cmnyb20aw002u6ovj1qaq832h	Diaby	Enical	\N	\N	Informatique | Lieu: Angre 22 eme	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.304	Enical	Angre 22 eme	Informatique	\N	M	\N
cmnyb20b2002w6ovjoqfi42ef	Avenie	MSC	\N	\N	Obs: catalogue de formation envoyee, reste a discuter avec le client	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.31	MSC	\N	\N	catalogue de formation envoyee, reste a discuter avec le client	m	\N
cmnyb20ba002y6ovjwtstycww	Dan	SIBM	\N	\N	Lieu: Zone 4 | Obs: En attente de confirmation de rdv pour demo sur archivage numerique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.318	SIBM	Zone 4	\N	En attente de confirmation de rdv pour demo sur archivage numerique	M	\N
cmnyb20bi00306ovjtqqdx4vh	Yao	Saham	\N	\N	Lieu: Plateau	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.326	Saham	Plateau	\N	\N	M	\N
cmnyb20br00326ovjkx7zf4dk	Ameyo	AFRICA DIGITAL CONNECT	\N	\N	Lieu: 2 plateaux maison palmier | Obs: RDV jeudi 14 nov au siege de africa digital connect	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.335	AFRICA DIGITAL CONNECT	2 plateaux maison palmier	\N	RDV jeudi 14 nov au siege de africa digital connect	M	\N
cmnyb20bz00346ovjn5hugyh0	Kafaloh	Movempick	\N	\N	Lieu: Plateau	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.343	Movempick	Plateau	\N	\N	M	\N
cmnyb20c600366ovjofx6sncq	Abroh	EY	\N	\N	Lieu: Plateau | Obs: catalogue de presentation + catalogue de formation envoyee\r\nProchaine action  rappeler mme Abroh pour rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.35	EY	Plateau	\N	catalogue de presentation + catalogue de formation envoyee\r\nProchaine action  rappeler mme Abroh pour rdv	Mme	\N
cmnyb20cc00386ovjlol5u2yr	Contact	Petro ivoire	\N	\N	Lieu: rue des petroliers	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.356	Petro ivoire	rue des petroliers	\N	\N	\N	\N
cmnyb20ci003a6ovjdpn8vlt3	Contact	Ubipharm	\N	\N	Lieu: zone industrielle yopougon	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.362	Ubipharm	zone industrielle yopougon	\N	\N	\N	\N
cmnyb20cp003c6ovjnamvs9av	Assoumou	Palmci	\N	\N	Lieu: zone portuaire immeuble sifca	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.369	Palmci	zone portuaire immeuble sifca	\N	\N	M	\N
cmnyb20cv003e6ovjv5rucbnb	Diby	ARSN	\N	\N	Lieu: Feu du nouveau camp | Obs: Apres echange telephonique, le client est sense me rappeler\r\nRappeler le client le lundi 11/11/2024 pour prise de rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.375	ARSN	Feu du nouveau camp	\N	Apres echange telephonique, le client est sense me rappeler\r\nRappeler le client le lundi 11/11/2024 pour prise de rdv	M	\N
cmnyb20d3003g6ovjagptz848	Effoly	SANIA	\N	\N	Agro alimentaire | Lieu: Zone industrielle vridi port bouet	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.383	SANIA	Zone industrielle vridi port bouet	Agro alimentaire	\N	\N	\N
cmnyb20d9003i6ovjbzrvwgc8	Franck	SAPH	\N	\N	Lieu: treichville zone portuaire rue des thonniers	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.389	SAPH	treichville zone portuaire rue des thonniers	\N	\N	\N	\N
cmnyb20de003k6ovjy39xlihw	Ane	SETV	\N	\N	Lieu: vridi	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.394	SETV	vridi	\N	\N	M	\N
cmnyb20dl003m6ovjbe9qa5fo	Contact	Conseil Cafe Cacao	\N	\N	Lieu: plateau immeuble caistab | Obs: ne decroche pas a rappeler	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.401	Conseil Cafe Cacao	plateau immeuble caistab	\N	ne decroche pas a rappeler	\N	\N
cmnyb20dq003o6ovjn0xwbpzm	Niamkey	SDV SAGA	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.406	SDV SAGA	\N	\N	\N	M	\N
cmnyb20dw003q6ovjchnhrooa	Diomande	SI CABLE	\N	\N	Lieu: vridi rue du textile	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.412	SI CABLE	vridi rue du textile	\N	\N	M	\N
cmnyb20e1003s6ovj7nv23ggu	Nguessan	GTX	\N	\N	BTP	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.417	GTX	\N	BTP	\N	M	\N
cmnyb20e8003u6ovjhy2sb8mf	Amon	Eden prestige	\N	\N	Import export | Obs: indisponible	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.424	Eden prestige	\N	Import export	indisponible	M	\N
cmnyb20eg003w6ovjbhfemq0c	Yao	Sanlam Allianz	\N	\N	Assurance | Lieu: Plateau rue du commerce | Obs: rdv le 12/11/2024 a 14h\r\nReunion effectuee. le client demande a ce que nous deposions un courrier de demande d'agrement avec nos differentes prestations detaillees	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.432	Sanlam Allianz	Plateau rue du commerce	Assurance	rdv le 12/11/2024 a 14h\r\nReunion effectuee. le client demande a ce que nous deposions un courrier de demande d'agrement avec nos differentes prestations detaillees	M	\N
cmnyb20eo003y6ovj1fe8hi2a	Diby	ARSN	\N	\N	Organisme gouvernemental | Lieu: Feu du nouveau camp | Obs: me rappelle en fonction de sa disponibilite pour un rdv jeudi 14 nov, a confirmer\r\nrdv prevu pour le mercredi 20 novembre a 10h	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.44	ARSN	Feu du nouveau camp	Organisme gouvernemental	me rappelle en fonction de sa disponibilite pour un rdv jeudi 14 nov, a confirmer\r\nrdv prevu pour le mercredi 20 novembre a 10h	M	\N
cmnyb20ey00406ovjzv3kppej	Luc	NSIA	\N	\N	Assurance | Lieu: Plateau avenue nogues | Obs: rappeler le mardi 12 nov a 14h	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.45	NSIA	Plateau avenue nogues	Assurance	rappeler le mardi 12 nov a 14h	M	\N
cmnyb20f600426ovjkmkfu4b2	Kone	SITAB	\N	\N	Industrie | Lieu: cocody ecole de gendarmerie	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.458	SITAB	cocody ecole de gendarmerie	Industrie	\N	M	\N
cmnyb20fe00446ovjzqfzw8qs	Contact	SITARAIL	\N	\N	Lieu: plateau immeuble les acacias	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.466	SITARAIL	plateau immeuble les acacias	\N	\N	\N	\N
cmnyb20fk00466ovjo6rahiro	Contact	SMB	\N	\N	Lieu: vridi boulevard de petit bassam	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.472	SMB	vridi boulevard de petit bassam	\N	\N	\N	\N
cmnyb20fq00486ovj2bszhwa6	Gnaba	SOCIMAT	\N	\N	Ciment	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.478	SOCIMAT	\N	Ciment	\N	M	\N
cmnyb20fv004a6ovje11c5gcm	Contact	STA	\N	\N	TELECOMMUNICATIONS | Lieu: zone 4 marcory	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.483	STA	zone 4 marcory	TELECOMMUNICATIONS	\N	\N	\N
cmnyb20g1004c6ovjifh3gd4n	Jousselin	SUCRIVOIRE	\N	\N	Agro Alimentaire | Lieu: grand bassam	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.489	SUCRIVOIRE	grand bassam	Agro Alimentaire	\N	Mme	\N
cmnyb20g8004e6ovjumqm8i8m	Botto	BAIC	\N	\N	Lieu: zone 3 rue des brasseurs face a papigraph | Obs: Reste en attente de mise en relation avec le service informatique, a relancer	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.496	BAIC	zone 3 rue des brasseurs face a papigraph	\N	Reste en attente de mise en relation avec le service informatique, a relancer	M	\N
cmnyb20gf004g6ovjgdz8g1gl	Ouattara	ADM COCOA	\N	\N	Lieu: vridi rue des textiles	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.503	ADM COCOA	vridi rue des textiles	\N	\N	M	\N
cmnyb20gl004i6ovj4s7s7blp	Contact	AFDB	\N	\N	Lieu: Avenue joseph anoma	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.509	AFDB	Avenue joseph anoma	\N	\N	\N	\N
cmnyb20gs004k6ovjl7ywletj	Yao	Unacoopec ci	\N	\N	Lieu: 2 plateaux vallons	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.516	Unacoopec ci	2 plateaux vallons	\N	\N	M	\N
cmnyb20h0004m6ovji2bssddc	Kouassi	Unilever	\N	\N	Lieu: vridi zone portuaire	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.524	Unilever	vridi zone portuaire	\N	\N	M	\N
cmnyb20h9004o6ovjht827glp	Contact	UA-VIE	\N	\N	Lieu: avenue houdaille	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.533	UA-VIE	avenue houdaille	\N	\N	\N	\N
cmnyb20hj004q6ovjjc60oovb	Contact	BACI	\N	\N	Lieu: avenue nogues, immeuble atlantique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.543	BACI	avenue nogues, immeuble atlantique	\N	\N	\N	\N
cmnyb20hr004s6ovjep9s817q	Contact	Bridge bank	\N	\N	Lieu: plateau avenue du general de gaulle	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.551	Bridge bank	plateau avenue du general de gaulle	\N	\N	\N	\N
cmnyb20i0004u6ovjke5pfnww	Contact	BDA	\N	\N	Lieu: immeuble grande poste du plateau, place de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.56	BDA	immeuble grande poste du plateau, place de la republique	\N	\N	\N	\N
cmnyb20in004w6ovjsh7im7ey	Contact	BDU-CI	\N	\N	BANQUES | Lieu: plateau immeuble jeceda, boulevard de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.583	BDU-CI	plateau immeuble jeceda, boulevard de la republique	BANQUES	\N	\N	\N
cmnyb20iv004y6ovjx0wdekk1	Saw	BGFI Bank	\N	\N	BANQUES | Lieu: marcory bd VGE | Obs: rappeler M. Aboubakar le 20 nov pour prise de rdv\r\nM. Saw me rappelle pour prise de rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.591	BGFI Bank	marcory bd VGE	BANQUES	rappeler M. Aboubakar le 20 nov pour prise de rdv\r\nM. Saw me rappelle pour prise de rdv	M	\N
cmnyb20j200506ovjbh3tb3le	Contact	BHCI	\N	\N	BANQUES | Lieu: avenue joseph anoma | Obs: injoignable	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.598	BHCI	avenue joseph anoma	BANQUES	injoignable	\N	\N
cmnyb20jb00526ovjyfsncjmf	Contact	BICICI	\N	\N	BANQUES | Lieu: avenue franchey d'esperey | Obs: Fomba Ismael: 0709577045 a appeler demain	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.606	BICICI	avenue franchey d'esperey	BANQUES	Fomba Ismael: 0709577045 a appeler demain	\N	\N
cmnyb20ji00546ovj3owg72in	Contact	BNI	\N	\N	BANQUES | Lieu: avenue marchand immeuble sciam	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.614	BNI	avenue marchand immeuble sciam	BANQUES	\N	\N	\N
cmnyb20kh00566ovj4nlamu7z	Contact	BOA	\N	\N	BANQUES | Lieu: immeuble BOA	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.649	BOA	immeuble BOA	BANQUES	\N	\N	\N
cmnyb20kp00586ovjcrkh4b9k	Contact	BSIC	\N	\N	BANQUES | Lieu: avenue nogues	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.657	BSIC	avenue nogues	BANQUES	\N	\N	\N
cmnyb20kx005a6ovjgkip61zz	Contact	CORIS BANK	\N	\N	BANQUES | Lieu: plateau boulevard de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.665	CORIS BANK	plateau boulevard de la republique	BANQUES	\N	\N	\N
cmnyb20l5005c6ovjys1y2dei	Contact	CITIBANK	\N	\N	BANQUES | Lieu: avenue delafosse, immeuble botreau roussel	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.673	CITIBANK	avenue delafosse, immeuble botreau roussel	BANQUES	\N	\N	\N
cmnyb20le005e6ovjk92lseki	Contact	CNCE	\N	\N	BANQUES | Lieu: plateau avenue joseph anoma, rue des banques	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.682	CNCE	plateau avenue joseph anoma, rue des banques	BANQUES	\N	\N	\N
cmnyb20lm005g6ovjmyyga5vd	Contact	DIAMOND BANK	\N	\N	BANQUES | Lieu: rez de chaussee immeuble ivotel	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.69	DIAMOND BANK	rez de chaussee immeuble ivotel	BANQUES	\N	\N	\N
cmnyb20lu005i6ovjrvdv73xi	Contact	ECOBANK	\N	\N	BANQUES | Lieu: avenue houdaille place de la republique | Obs: Guillaume Brandre:0505997787	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.698	ECOBANK	avenue houdaille place de la republique	BANQUES	Guillaume Brandre:0505997787	\N	\N
cmnyb20m0005k6ovjzi3usowt	Contact	GT BANK	\N	\N	BANQUES | Lieu: plateau avenue du senateur LAGAROSSE	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.704	GT BANK	plateau avenue du senateur LAGAROSSE	BANQUES	\N	\N	\N
cmnyb20m7005m6ovjuf8kuof0	Contact	NSIA BANQUE	\N	\N	BANQUES | Lieu: avenue joseph anoma	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.711	NSIA BANQUE	avenue joseph anoma	BANQUES	\N	\N	\N
cmnyb20mc005o6ovjax9v8kri	Contact	OAC	\N	\N	BANQUES | Lieu: avenue nogues	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.716	OAC	avenue nogues	BANQUES	\N	\N	\N
cmnyb20mh005q6ovjscb7z3cq	Contact	ORABANK	\N	\N	BANQUES | Lieu: abidjan plateau, ex score angle boulevard de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.721	ORABANK	abidjan plateau, ex score angle boulevard de la republique	BANQUES	\N	\N	\N
cmnyb20mn005s6ovjgmerfybu	Contact	ALIOS FINANCE	\N	\N	BANQUES | Lieu: zone 3 immeuble safca	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.727	ALIOS FINANCE	zone 3 immeuble safca	BANQUES	\N	\N	\N
cmnyb20ms005u6ovj0eivptnd	Contact	STANDARD CHARTERED	\N	\N	BANQUES | Lieu: boulevard de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.732	STANDARD CHARTERED	boulevard de la republique	BANQUES	\N	\N	\N
cmnyb2106009k6ovjfh7mdgy0	Contact	CGR CONSULTING	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.214	CGR CONSULTING	\N	\N	\N	\N	\N
cmnyb20my005w6ovj4lrgzo5s	Leon	DPSE	\N	\N	Informatique | Lieu: 2 plateaux 7eme tranche | Obs: documentation JNSI envoyee, le client demande a ce qu'on le recontacte la semaine prochaine le temps pour lui de prendre connaissance du fichier\r\nRecontacter le client la semaine prochaine	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.738	DPSE	2 plateaux 7eme tranche	Informatique	documentation JNSI envoyee, le client demande a ce qu'on le recontacte la semaine prochaine le temps pour lui de prendre connaissance du fichier\r\nRecontacter le client la semaine prochaine	\N	\N
cmnyb20n4005y6ovjardxq2yv	Contact	MEDIASOFT	\N	\N	Obs: documentation JNSI envoyee\r\nappeler M. N'guessan pour suite	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.744	MEDIASOFT	\N	\N	documentation JNSI envoyee\r\nappeler M. N'guessan pour suite	\N	\N
cmnyb20ni00606ovjswalas5z	Contact	VEONE	\N	\N	Obs: documentation JNSI envoyee\r\nappeler M. Sounkere pour garantir la participation de veone a l'evenement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.758	VEONE	\N	\N	documentation JNSI envoyee\r\nappeler M. Sounkere pour garantir la participation de veone a l'evenement	\N	\N
cmnyb20nq00626ovj6fol7a6d	Contact	G4S	\N	\N	Securite	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.766	G4S	\N	Securite	\N	\N	\N
cmnyb20ny00646ovjpldg3lww	Contact	BNI FINANCES	\N	\N	Lieu: Avenue Lamblin Plateau | Obs: Prendre rdv avec M. Kabran au retour de son DG	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.774	BNI FINANCES	Avenue Lamblin Plateau	\N	Prendre rdv avec M. Kabran au retour de son DG	\N	\N
cmnyb20o600666ovjmo4lzlf9	Augustin	SIPEF	\N	\N	Lieu: zone 4 rue notre dame d'afrique | Obs: Prendre Rdv avec M. Tivoli/ mail: augustin.tivoli@sipef.ci	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.782	SIPEF	zone 4 rue notre dame d'afrique	\N	Prendre Rdv avec M. Tivoli/ mail: augustin.tivoli@sipef.ci	\N	\N
cmnyb20of00686ovjyrbw3fwi	Alphonse	SIPRA	\N	\N	Lieu: zone industrielle yopougon	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.791	SIPRA	zone industrielle yopougon	\N	\N	\N	\N
cmnyb20on006a6ovjrd91ffuv	Jose	Douane	\N	\N	Lieu: treichville | Obs: Appeler M. Josee Yapi de la douane pour JNSI	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.799	Douane	treichville	\N	Appeler M. Josee Yapi de la douane pour JNSI	M	\N
cmnyb20ov006c6ovjq52w85yi	Contact	Prosuma	\N	\N	Lieu: treichville zone 3 rue des carrosiers	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.807	Prosuma	treichville zone 3 rue des carrosiers	\N	\N	\N	\N
cmnyb20p4006e6ovjuehmhax7	Effoly	Sania	\N	\N	Lieu: zone industrielle vridi port bouet	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.816	Sania	zone industrielle vridi port bouet	\N	\N	\N	\N
cmnyb20pc006g6ovjeltbmm2h	Contact	Ci cables	\N	\N	Lieu: cocody riviera bonoumin	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.824	Ci cables	cocody riviera bonoumin	\N	\N	\N	\N
cmnyb20pk006i6ovjsi2m6dew	Contact	Sitab	\N	\N	Lieu: cocody derriere sodefor	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.832	Sitab	cocody derriere sodefor	\N	\N	\N	\N
cmnyb20pq006k6ovjlfjz5z9b	Amon	Mugef-ci	\N	\N	Lieu: Plateau	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.838	Mugef-ci	Plateau	\N	\N	\N	\N
cmnyb20pv006m6ovjnpdt55e2	Douty	pwc	\N	\N	Lieu: cocody a cote de hotel ivoire	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.843	pwc	cocody a cote de hotel ivoire	\N	\N	\N	\N
cmnyb20q1006o6ovjr0569y1k	Contact	Nestle ci	\N	\N	Lieu: cocody lycee technique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.849	Nestle ci	cocody lycee technique	\N	\N	\N	\N
cmnyb20q6006q6ovjybca4e2a	Sallh	Orange	\N	\N	Lieu: riviera golf hotel	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.854	Orange	riviera golf hotel	\N	\N	Mme	\N
cmnyb20qb006s6ovjb7ezvriu	Fadiga	Petroci	\N	\N	Lieu: Plateau	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.859	Petroci	Plateau	\N	\N	\N	\N
cmnyb20qh006u6ovj7rnpvaj6	Daniel	Palmafrique	\N	\N	Lieu: Anguededou	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.865	Palmafrique	Anguededou	\N	\N	\N	\N
cmnyb20qp006w6ovjp4bxr8w4	Contact	Pullman	\N	\N	Lieu: Plateau rue Abdoulaye Fadiga | Obs: Rappeler M. Landry pour fixation RDV	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.873	Pullman	Plateau rue Abdoulaye Fadiga	\N	Rappeler M. Landry pour fixation RDV	\N	\N
cmnyb20qx006y6ovjt81peiaw	Contact	Movempick	\N	\N	Lieu: Avenue Terrasson de Fougeres | Obs: catalogue de formation envoyée à Mme Sylla Makan, me revient pour un rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.881	Movempick	Avenue Terrasson de Fougeres	\N	catalogue de formation envoyée à Mme Sylla Makan, me revient pour un rdv	\N	\N
cmnyb20r500706ovjpz5sgdpx	Contact	Ivotel	\N	\N	Obs: Rappeler pour parler au service RH	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.889	Ivotel	\N	\N	Rappeler pour parler au service RH	\N	\N
cmnyb20rc00726ovji2bf0w1t	Yao	Sanlam Allianz	\N	\N	Obs: Mise en relation avec le RH M. Yougoné, me revient pour fixation RDV	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.896	Sanlam Allianz	\N	\N	Mise en relation avec le RH M. Yougoné, me revient pour fixation RDV	\N	\N
cmnyb20rk00746ovjkoxr2zwu	Barro	Avenire	\N	\N	Obs: Echanges avec la DRH (Mme Baro) qui part en congé, envoi du catalogue de formation nous rappelle en debut aout pour un rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.904	Avenire	\N	\N	Echanges avec la DRH (Mme Baro) qui part en congé, envoi du catalogue de formation nous rappelle en debut aout pour un rdv	Mme	\N
cmnyb20rq00766ovjug9i07r2	Bakayoko	AAVIE	\N	\N	Obs: Echanges avec Mme Bakayoko pour mise en relation avec la DRH, la rappeler ce 1er aout pour la relancer sur une date de rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.91	AAVIE	\N	\N	Echanges avec Mme Bakayoko pour mise en relation avec la DRH, la rappeler ce 1er aout pour la relancer sur une date de rdv	Mme	\N
cmnyb20rv00786ovjrxfd03y5	Contact	Ascoma	\N	\N	Obs: ne decroche pas, rappeler dans prochain phoning	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.915	Ascoma	\N	\N	ne decroche pas, rappeler dans prochain phoning	\N	\N
cmnyb20s0007a6ovja8lrg229	Jehu	Bgfi	\N	\N	Obs: envoyer le catalogue de formation à M. Jehu pour consultation et le rappeler pour fixation rdv	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.92	Bgfi	\N	\N	envoyer le catalogue de formation à M. Jehu pour consultation et le rappeler pour fixation rdv	M	\N
cmnyb20s4007c6ovj0laalx72	Diaby	Enical	\N	\N	Obs: pas interressé par la formation mais le rappeler pour quil me donne contacts dans d'autres entreprises\r\ninterressé par les JNSI 2026 le contacter au moment opportun	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.924	Enical	\N	\N	pas interressé par la formation mais le rappeler pour quil me donne contacts dans d'autres entreprises\r\ninterressé par les JNSI 2026 le contacter au moment opportun	M	\N
cmnyb210f009m6ovjhoskk68l	Contact	CULTURE RH	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.223	CULTURE RH	\N	\N	\N	\N	\N
cmnyb210n009o6ovja648lnba	Contact	APRH	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.231	APRH	\N	\N	\N	\N	\N
cmnyb20sa007e6ovjxtwlkb02	Adingra	B2M	\N	\N	Obs: M. Adingra me mettra en relation avec son departement RH, le rappeler mardi 5 aout\r\nvisuel de formation envoyée sur whatsapp	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.93	B2M	\N	\N	M. Adingra me mettra en relation avec son departement RH, le rappeler mardi 5 aout\r\nvisuel de formation envoyée sur whatsapp	M	\N
cmnyb20sf007g6ovj53slktri	Contact	SI Beton	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.935	SI Beton	\N	\N	\N	\N	\N
cmnyb20sj007i6ovj54e59ndo	Contact	SNBP	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.939	SNBP	\N	\N	\N	\N	\N
cmnyb20so007k6ovjbinhp2qq	Contact	Societe Nouvelle Premier Béton	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.944	Societe Nouvelle Premier Béton	\N	\N	\N	\N	\N
cmnyb20sv007m6ovjcejtdbcz	Contact	Compagnie Africaine de Prefabriqués et de Béton	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.951	Compagnie Africaine de Prefabriqués et de Béton	\N	\N	\N	\N	\N
cmnyb20t0007o6ovj0bbotbnf	Contact	Société de Béton Préfabriqué (SBP)	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.956	Société de Béton Préfabriqué (SBP)	\N	\N	\N	\N	\N
cmnyb20t5007q6ovjjnkk22xb	Contact	Notre Beton Ivoire (NBI)	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.961	Notre Beton Ivoire (NBI)	\N	\N	\N	\N	\N
cmnyb20ta007s6ovjh0qbootg	Contact	Béton Services CI (BSCI)	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.966	Béton Services CI (BSCI)	\N	\N	\N	\N	\N
cmnyb20tf007u6ovjpnpt38y1	Contact	CIMPOR	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.971	CIMPOR	\N	\N	\N	\N	\N
cmnyb20tl007w6ovj5uqw2rku	Contact	Ciments de l'Afrique	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.977	Ciments de l'Afrique	\N	\N	\N	\N	\N
cmnyb20tt007y6ovj6fib8kf4	Contact	Abeille Béton	\N	\N	Lieu: en face de la foret du banco yopougon	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.985	Abeille Béton	en face de la foret du banco yopougon	\N	\N	\N	\N
cmnyb20u100806ovjdydbri04	Contact	AFRIQTP	\N	\N	Lieu: zone industrielle koumassi	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:43.993	AFRIQTP	zone industrielle koumassi	\N	\N	\N	\N
cmnyb20u900826ovjtgpxptfd	Contact	AGALERO BETONNEUSE	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.001	AGALERO BETONNEUSE	\N	\N	\N	\N	\N
cmnyb20uh00846ovjzsin8it2	Contact	Batipro Sarl	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.009	Batipro Sarl	\N	\N	\N	\N	\N
cmnyb20ut00866ovj0e4bhel0	Contact	Elite Béton	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.021	Elite Béton	\N	\N	\N	\N	\N
cmnyb20uy00886ovjs77g4glq	Contact	Mondial Béton	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.026	Mondial Béton	\N	\N	\N	\N	\N
cmnyb20v3008a6ovjl97jghvw	Contact	Power global africa	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.031	Power global africa	\N	\N	\N	\N	\N
cmnyb20v8008c6ovj1768n9po	Contact	Pro béton	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.036	Pro béton	\N	\N	\N	\N	\N
cmnyb20ve008e6ovjhq6eh3hm	Contact	King Ivoire Sarl	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.042	King Ivoire Sarl	\N	\N	\N	\N	\N
cmnyb20vi008g6ovj40cy19t7	Contact	Azalai	\N	\N	Obs: Le service RH me rappellera si jamais il est interressé	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.046	Azalai	\N	\N	Le service RH me rappellera si jamais il est interressé	\N	\N
cmnyb20vn008i6ovjlguysthr	Fomba	BICICI	\N	\N	Obs: M. Fomba Ismael demande à ce que je le rappelle pour la mise en relation avec le service RH	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.051	BICICI	\N	\N	M. Fomba Ismael demande à ce que je le rappelle pour la mise en relation avec le service RH	\N	\N
cmnyb20vt008k6ovj30vaktvv	Jehu	BGFI	\N	\N	Obs: M. Jehu a bien recu notre catalogue de formation , va l'analyser et nous revenir en cas de besoin	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.057	BGFI	\N	\N	M. Jehu a bien recu notre catalogue de formation , va l'analyser et nous revenir en cas de besoin	M	\N
cmnyb20w1008m6ovjtup8kd8c	Contact	BDU	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.065	BDU	\N	\N	\N	\N	\N
cmnyb20w9008o6ovjn7o7fdce	Contact	BNI	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.073	BNI	\N	\N	\N	\N	\N
cmnyb20wh008q6ovjqhaohnye	Contact	BOA	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.081	BOA	\N	\N	\N	\N	\N
cmnyb20wp008s6ovj76thsld1	Contact	BSIC	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.089	BSIC	\N	\N	\N	\N	\N
cmnyb20wx008u6ovj08zzj63y	Guillaume	ECOBANK	\N	\N	Obs: M. Brandre va nous faire une mise en relation avec le service RH , le rappeler semaine prochaine	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.097	ECOBANK	\N	\N	M. Brandre va nous faire une mise en relation avec le service RH , le rappeler semaine prochaine	\N	\N
cmnyb20x6008w6ovjovd7aom2	Affi	NSIA BANQUE	\N	\N	Obs: M. Affi Luc actuellement en congé demande à ce que je le rappelle pour la mise en relation	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.106	NSIA BANQUE	\N	\N	M. Affi Luc actuellement en congé demande à ce que je le rappelle pour la mise en relation	M	\N
cmnyb20xe008y6ovjb7r3c6xn	Contact	ORABANK	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.114	ORABANK	\N	\N	\N	\N	\N
cmnyb20xn00906ovj6d2k45m1	Contact	STANDARD CHATERED	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.123	STANDARD CHATERED	\N	\N	\N	\N	\N
cmnyb20xv00926ovjt9c4vnm3	Contact	ST DIGITAL	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.131	ST DIGITAL	\N	\N	\N	\N	\N
cmnyb20y400946ovjtuketalk	Contact	AAVIE	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.14	AAVIE	\N	\N	\N	\N	\N
cmnyb20yd00966ovj2t212bjo	Contact	SANLAM ALLIANZ	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.149	SANLAM ALLIANZ	\N	\N	\N	\N	\N
cmnyb20yl00986ovjvo5l2anz	Contact	PULLMAN	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.157	PULLMAN	\N	\N	\N	\N	\N
cmnyb20yt009a6ovjsktbefy8	Contact	B2M	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.165	B2M	\N	\N	\N	\N	\N
cmnyb20z2009c6ovjgkvkpkkg	Contact	MOVEMPICK	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.174	MOVEMPICK	\N	\N	\N	\N	\N
cmnyb20za009e6ovjpxrl0u5c	Contact	Focus RH	\N	\N	Obs: Mail envoyé à Focus RH sur linkedin , en attente d'un contact pour prendre RDV	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.182	Focus RH	\N	\N	Mail envoyé à Focus RH sur linkedin , en attente d'un contact pour prendre RDV	\N	\N
cmnyb20zi009g6ovj5jenmhas	Contact	AGRH	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.19	AGRH	\N	\N	\N	\N	\N
cmnyb20zr009i6ovjjcpoeo98	Contact	AFRIK RH SOLUTIONS	\N	moussa.dembele@cgrconsulting.com	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.199	AFRIK RH SOLUTIONS	\N	\N	\N	\N	\N
cmnyb210v009q6ovjsj6zvj8i	Contact	MIBEM	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.239	MIBEM	\N	\N	\N	\N	\N
cmnyb2114009s6ovj9b99gro5	Contact	SCHIBA HOLDING	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.247	SCHIBA HOLDING	\N	\N	\N	\N	\N
cmnyb211d009u6ovji9qwmgd7	Contact	SITA SA	\N	sitasa06@yahoo.fr	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.257	SITA SA	\N	\N	\N	\N	\N
cmnyb211m009w6ovjsaa4u80b	Contact	EMMANUEL SERVICES	\N	virginiebrou@emmanuel-sce.net	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.266	EMMANUEL SERVICES	\N	\N	\N	\N	\N
cmnyb211u009y6ovjj6qxlfb1	Contact	TRANSCAO NEGOCE	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.274	TRANSCAO NEGOCE	\N	\N	\N	\N	\N
cmnyb212300a06ovjvbp4uijp	Contact	UNISERV BTP	\N	info@uniservci.net	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.283	UNISERV BTP	\N	\N	\N	\N	\N
cmnyb212c00a26ovjxcy705do	Contact	GEBAT	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.292	GEBAT	\N	\N	\N	\N	\N
cmnyb212k00a46ovjdstr383m	Contact	IVOIRE HUMAN CAPITAL	\N	admin@ihc-ci.com	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.3	IVOIRE HUMAN CAPITAL	\N	\N	\N	\N	\N
cmnyb212t00a66ovjuedl9qw0	Contact	MD HOLDING	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.309	MD HOLDING	\N	\N	\N	\N	\N
cmnyb213300a86ovjedpdr5wv	Contact	CEFCC	\N	b.elias@cabinet cefcc.com \r\ncontact@cabinetcefcc.com	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.319	CEFCC	\N	\N	\N	\N	\N
cmnyb213a00aa6ovj1onu5w1s	Contact	Nouvelle MICI	\N	info@nme.com.ci	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.326	Nouvelle MICI	\N	\N	\N	\N	\N
cmnyb213j00ac6ovjnt6q3acb	Contact	Waca Msf	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.335	Waca Msf	\N	\N	\N	\N	\N
cmnyb213r00ae6ovjqqkqzhnj	Contact	MWR Life Cote d'Ivoire	\N	\N	Cabinets de recrutement | Obs: Notre interlocutrice Mme Encel demande à ce qu'on lui envoie les TDR de la formation par whatsapp, apres lecture elle nous fera un retour. Prochaine action: la rappeler la semaine prochaine	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.343	MWR Life Cote d'Ivoire	\N	Cabinets de recrutement	Notre interlocutrice Mme Encel demande à ce qu'on lui envoie les TDR de la formation par whatsapp, apres lecture elle nous fera un retour. Prochaine action: la rappeler la semaine prochaine	\N	\N
cmnyb214f00ag6ovj11y1hbrh	Contact	HSD Human Resource	\N	\N	Cabinets de recrutement | Obs: Echanges avec Mme Koa (comptable) qui nous informe que la responsable est absente , demande à ce qu'on rappelle la semaine prochaine.	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.367	HSD Human Resource	\N	Cabinets de recrutement	Echanges avec Mme Koa (comptable) qui nous informe que la responsable est absente , demande à ce qu'on rappelle la semaine prochaine.	\N	\N
cmnyb214o00ai6ovjkye4afyz	Contact	Azing Ivoir	\N	azingivoirsarl@gmail.com \r\ninfos@groupeazingivoir.com	Cabinets de recrutement | Obs: Echanges avec Miss Carole qui nous a communiqué les mails de l'entreprise sur lesquels nous devons envoyer les TDR et visuels	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.376	Azing Ivoir	\N	Cabinets de recrutement	Echanges avec Miss Carole qui nous a communiqué les mails de l'entreprise sur lesquels nous devons envoyer les TDR et visuels	\N	\N
cmnyb214w00ak6ovjgvmh9cmu	Contact	Helios International	\N	\N	Cabinets de recrutement | Obs: Numero Indisponible	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.384	Helios International	\N	Cabinets de recrutement	Numero Indisponible	\N	\N
cmnyb215500am6ovjaarzh5xy	Contact	Grey search Africa	\N	\N	Cabinets de recrutement | Obs: Ne decroche pas	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.393	Grey search Africa	\N	Cabinets de recrutement	Ne decroche pas	\N	\N
cmnyb215c00ao6ovjk63az1xi	Contact	Gnfad groupe	\N	\N	Cabinets de recrutement | Obs: numero pas en service	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.4	Gnfad groupe	\N	Cabinets de recrutement	numero pas en service	\N	\N
cmnyb215l00aq6ovj897c4cee	Contact	Agiloya Afrique	\N	\N	Cabinets de recrutement | Obs: Notre interlocutrice mme Yoh demande à ce qu'on appelle demain à 11h pour parler avec Mme N'Guetta	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.409	Agiloya Afrique	\N	Cabinets de recrutement	Notre interlocutrice mme Yoh demande à ce qu'on appelle demain à 11h pour parler avec Mme N'Guetta	\N	\N
cmnyb215t00as6ovjdhk5k8if	Contact	Cifip	\N	\N	Cabinets de recrutement | Obs: Nous avons echangé avec mme Lezou qui nous a remis le mail de l'entreprise et nous a demandé d'envoyer les TDR de la formation, ce qui a été fait	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.417	Cifip	\N	Cabinets de recrutement	Nous avons echangé avec mme Lezou qui nous a remis le mail de l'entreprise et nous a demandé d'envoyer les TDR de la formation, ce qui a été fait	\N	\N
cmnyb216200au6ovjlk10484s	Contact	ISK SECURITE	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.425	ISK SECURITE	\N	Cabinets de recrutement	\N	\N	\N
cmnyb216a00aw6ovj9h2p9guk	Traoré	OIC (Office Ivoirien des Chargeurs)	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.433	OIC (Office Ivoirien des Chargeurs)	\N	Cabinets de recrutement	\N	M	\N
cmnyb216i00ay6ovj1kw21nbg	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.442	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb216u00b06ovjinau7g1t	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.454	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb217200b26ovjda0yyjec	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.462	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb217a00b46ovj1hq8lnd5	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.47	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb217i00b66ovjeamyj4aq	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.478	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb217q00b86ovjo8dmqgq3	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.486	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb217y00ba6ovjo27mx9o8	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.494	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb218600bc6ovjb4cngdia	Contact	Sans nom	\N	\N	Cabinets de recrutement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.502	Sans nom	\N	Cabinets de recrutement	\N	\N	\N
cmnyb218e00be6ovjk0a1v1kd	Contact	CARAT SERVICES	\N	\N	Lieu: angré 9e tranche non loin de l'immeuble CGK	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.51	CARAT SERVICES	angré 9e tranche non loin de l'immeuble CGK	\N	\N	\N	\N
cmnyb218m00bg6ovji6x0fmql	Contact	AFRICA RICE	\N	\N	Lieu: Boulevard francois mitterand cocody	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.518	AFRICA RICE	Boulevard francois mitterand cocody	\N	\N	\N	\N
cmnyb218v00bi6ovjbp8m0rty	Contact	ICAHD	\N	\N	Lieu: Riviera bonoumin rue l69 non loin de abidjan mall	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.527	ICAHD	Riviera bonoumin rue l69 non loin de abidjan mall	\N	\N	\N	\N
cmnyb219400bk6ovjhvtspo7q	Contact	CFAO	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.536	CFAO	\N	\N	\N	\N	\N
cmnyb219c00bm6ovjtm1e8pl8	Contact	ALTERA	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.544	ALTERA	\N	\N	\N	\N	\N
cmnyb219k00bo6ovj9bq60f6d	Contact	SPANC	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.552	SPANC	\N	\N	\N	\N	\N
cmnyb219s00bq6ovjpnbenfn0	Contact	SODISTRA	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.56	SODISTRA	\N	\N	\N	\N	\N
cmnyb219z00bs6ovjrswybpvi	Contact	AGROMAP	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.567	AGROMAP	\N	\N	\N	\N	\N
cmnyb21a700bu6ovj73t51264	Contact	ROXGOLD	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.575	ROXGOLD	\N	\N	\N	\N	\N
cmnyb21ag00bw6ovj2um5v0s2	Contact	INSIGHT PLUS AFRICA	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.583	INSIGHT PLUS AFRICA	\N	\N	\N	\N	\N
cmnyb21ao00by6ovj4ansaxde	Contact	CECI	\N	\N	Lieu: Plateau immeuble chardy 8eme etage	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.592	CECI	Plateau immeuble chardy 8eme etage	\N	\N	\N	\N
cmnyb21ax00c06ovjhofw16c7	Contact	BAOBAB	\N	\N	Lieu: vallons rue des jardins	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.601	BAOBAB	vallons rue des jardins	\N	\N	\N	\N
cmnyb21b600c26ovj0vh6tvyu	Contact	BDU-CI	\N	\N	Lieu: Immeuble jeceda boulevard de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.61	BDU-CI	Immeuble jeceda boulevard de la republique	\N	\N	\N	\N
cmnyb21bf00c46ovju4v7vw2y	Contact	LAPAIRE	\N	\N	Lieu: Cocody angré groupement 4000	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.619	LAPAIRE	Cocody angré groupement 4000	\N	\N	\N	\N
cmnyb21bp00c66ovjpvzsh5oj	Contact	ORABANK	\N	\N	Lieu: rue des banques, boulevard de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.629	ORABANK	rue des banques, boulevard de la republique	\N	\N	\N	\N
cmnyb21bv00c86ovjhsbeogeq	Contact	INTERNATIONAL COCOA INITIATIVE	\N	\N	Lieu: Riviera 3 quartier les oscars ilot 109	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.635	INTERNATIONAL COCOA INITIATIVE	Riviera 3 quartier les oscars ilot 109	\N	\N	\N	\N
cmnyb21c000ca6ovjf80z3wwq	Contact	SOLTHIS	\N	\N	Lieu: immeuble SICOMEX, près de la paroisse ST THérèse marcory	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.64	SOLTHIS	immeuble SICOMEX, près de la paroisse ST THérèse marcory	\N	\N	\N	\N
cmnyb21c700cc6ovjko1ys72k	Contact	CMA-CGM	\N	\N	Lieu: marcory zone 4 C rue Clement Ader	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.647	CMA-CGM	marcory zone 4 C rue Clement Ader	\N	\N	\N	\N
cmnyb21cm00ce6ovj6lagbri3	Contact	EDICIEL COTE D'IVOIRE	\N	\N	Lieu: Boulevard des martyrs 2 plateaux	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.662	EDICIEL COTE D'IVOIRE	Boulevard des martyrs 2 plateaux	\N	\N	\N	\N
cmnyb21cu00cg6ovj21njf5et	Contact	WAVE	\N	\N	Lieu: Cocody riviera 4	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.67	WAVE	Cocody riviera 4	\N	\N	\N	\N
cmnyb21d200ci6ovj17ysyuri	Contact	IKOUROX GROUP	\N	\N	Lieu: 2 plateaux 7eme tranche	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.678	IKOUROX GROUP	2 plateaux 7eme tranche	\N	\N	\N	\N
cmnyb21db00ck6ovjl9srk9yp	Contact	CRAEE UMOA	\N	\N	Lieu: Angle boulevard botreau roussel	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.686	CRAEE UMOA	Angle boulevard botreau roussel	\N	\N	\N	\N
cmnyb21dj00cm6ovjuwtrjwte	Contact	NOUVELLE MICI	\N	\N	Lieu: koumassi zone industrielle	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.695	NOUVELLE MICI	koumassi zone industrielle	\N	\N	\N	\N
cmnyb21dr00co6ovjdmb7gamn	Contact	MONTAGE GOLD	\N	\N	Lieu: rue des jardins 2eme etage immeuble Tima	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.703	MONTAGE GOLD	rue des jardins 2eme etage immeuble Tima	\N	\N	\N	\N
cmnyb21e000cq6ovjex1a4xo6	Contact	NESTLE	\N	\N	Lieu: en face de l'immeuble corniche cocody	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.712	NESTLE	en face de l'immeuble corniche cocody	\N	\N	\N	\N
cmnyb21e700cs6ovjbfu37ed4	Contact	AIRONE COTE D'IVOIRE	\N	\N	Lieu: boulevard de marseille zone 3 a coté de la bicici	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.719	AIRONE COTE D'IVOIRE	boulevard de marseille zone 3 a coté de la bicici	\N	\N	\N	\N
cmnyb21ed00cu6ovjyvyw5rak	Contact	CAPRACI	\N	\N	Lieu: zone industrielle yopougon	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.725	CAPRACI	zone industrielle yopougon	\N	\N	\N	\N
cmnyb21ei00cw6ovji7jn6op0	Contact	CARGILL COCOA	\N	\N	Lieu: yopougon	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.73	CARGILL COCOA	yopougon	\N	\N	\N	\N
cmnyb21en00cy6ovjwkvswmj6	Contact	SOLIBRA	\N	\N	Lieu: treichville 35 rue des brasseurs	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.735	SOLIBRA	treichville 35 rue des brasseurs	\N	\N	\N	\N
cmnyb21et00d06ovjmxm2vumn	Contact	CEMOI COTE D'IVOIRE	\N	\N	Lieu: zone industrielle yopougon	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.741	CEMOI COTE D'IVOIRE	zone industrielle yopougon	\N	\N	\N	\N
cmnyb21ey00d26ovj9hj8irha	Contact	Air cote d'Ivoire	\N	\N	Lieu: place de la republique	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.746	Air cote d'Ivoire	place de la republique	\N	\N	\N	\N
cmnyb21f400d46ovjcxjzc43w	Contact	Olam Agri	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.752	Olam Agri	\N	\N	\N	\N	\N
cmnyb21fc00d66ovjsxzaejby	Contact	Comoé Capital	\N	\N	Lieu: vallon près du 12 eme arrondissement	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.76	Comoé Capital	vallon près du 12 eme arrondissement	\N	\N	\N	\N
cmnyb21fk00d86ovj2cr2ylou	Contact	Roxgold	\N	\N	Lieu: angré vallons	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.768	Roxgold	angré vallons	\N	\N	\N	\N
cmnyb21fs00da6ovjdugu1e08	Contact	Nexia	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.776	Nexia	\N	\N	\N	\N	\N
cmnyb21g100dc6ovj0tnxe0w5	Contact	Schiba	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.785	Schiba	\N	\N	\N	\N	\N
cmnyb21g900de6ovjb3yhsbii	Contact	Ensea	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.793	Ensea	\N	\N	\N	\N	\N
cmnyb21gh00dg6ovj8fwf6ozl	Contact	Jmg	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.801	Jmg	\N	\N	\N	\N	\N
cmnyb21gm00di6ovjhpxp9l8y	Contact	Siprochim	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.806	Siprochim	\N	\N	\N	\N	\N
cmnyb21gs00dk6ovjjwnjxu9i	Contact	Bridge Microfinances	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.812	Bridge Microfinances	\N	\N	\N	\N	\N
cmnyb21gz00dm6ovjt080ywmy	Contact	Prosuma	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.819	Prosuma	\N	\N	\N	\N	\N
cmnyb21h500do6ovjtem1ffp6	Contact	Africa Link capital	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.825	Africa Link capital	\N	\N	\N	\N	\N
cmnyb21ha00dq6ovj4q05d4e8	Contact	Distrimat Inter Courrier Express	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.83	Distrimat Inter Courrier Express	\N	\N	\N	\N	\N
cmnyb21hg00ds6ovj9h0c7zs3	Contact	GPFI	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.836	GPFI	\N	\N	\N	\N	\N
cmnyb21hl00du6ovjdt22v8kj	Contact	Baci	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.841	Baci	\N	\N	\N	\N	\N
cmnyb21hr00dw6ovj20yra6so	Contact	Afriland first group	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.847	Afriland first group	\N	\N	\N	\N	\N
cmnyb21hz00dy6ovjfg8d449x	Contact	Africa RE	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.855	Africa RE	\N	\N	\N	\N	\N
cmnyb21i600e06ovjyobq59o1	Contact	Nestlé	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.862	Nestlé	\N	\N	\N	\N	\N
cmnyb21ie00e26ovjs4k41wjd	Contact	Schiba assurances	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.87	Schiba assurances	\N	\N	\N	\N	\N
cmnyb21im00e46ovjjzx3cbk5	Contact	Banque Atlantique	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.878	Banque Atlantique	\N	\N	\N	\N	\N
cmnyb21iu00e66ovjvhanxr5r	Contact	Yelam's	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.886	Yelam's	\N	\N	\N	\N	\N
cmnyb21j200e86ovjf4hpcwxk	Contact	Tropik auto	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.894	Tropik auto	\N	\N	\N	\N	\N
cmnyb21ja00ea6ovjefed4r6j	Contact	IEG	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.902	IEG	\N	\N	\N	\N	\N
cmnyb21ji00ec6ovjfetvpigl	Contact	TIerra Groupe	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.91	TIerra Groupe	\N	\N	\N	\N	\N
cmnyb21jo00ee6ovjar4efpjw	Contact	Baobab	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.916	Baobab	\N	\N	\N	\N	\N
cmnyb21jt00eg6ovjrnjpvjtl	Contact	Mota-engil	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.921	Mota-engil	\N	\N	\N	\N	\N
cmnyb21jy00ei6ovjy28f6opm	Contact	Agromap	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.926	Agromap	\N	\N	\N	\N	\N
cmnyb21k300ek6ovjx78qx50m	Contact	Havasafrica	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.931	Havasafrica	\N	\N	\N	\N	\N
cmnyb21k800em6ovjkreq05lp	Contact	Afriq solus ci	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.936	Afriq solus ci	\N	\N	\N	\N	\N
cmnyb21ke00eo6ovj2vxvnpe6	Contact	Exactgreen	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.941	Exactgreen	\N	\N	\N	\N	\N
cmnyb21kj00eq6ovjsh0wnxes	Contact	Olam agri	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.947	Olam agri	\N	\N	\N	\N	\N
cmnyb21ko00es6ovjgf91yxlj	Contact	Coris bank	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.952	Coris bank	\N	\N	\N	\N	\N
cmnyb21kv00eu6ovj60r1crt1	Contact	Berylinformatique	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.959	Berylinformatique	\N	\N	\N	\N	\N
cmnyb21l000ew6ovjhq6uwv93	Contact	Simam	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.964	Simam	\N	\N	\N	\N	\N
cmnyb21l600ey6ovjte0x6mv3	Contact	Sivop	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.97	Sivop	\N	\N	\N	\N	\N
cmnyb21le00f06ovj2rymu1nk	Contact	AGL	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.977	AGL	\N	\N	\N	\N	\N
cmnyb21lm00f26ovjheokoysb	Contact	TRACTEBEL	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.986	TRACTEBEL	\N	\N	\N	\N	\N
cmnyb21lu00f46ovj0xgcdu3y	Contact	SOLETERRE	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:44.994	SOLETERRE	\N	\N	\N	\N	\N
cmnyb21m200f66ovj7s9tdihj	Contact	DAYO	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:45.002	DAYO	\N	\N	\N	\N	\N
cmnyb21mc00f86ovjvxxksjr2	Contact	PALMCI	\N	\N	\N	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:33:45.011	PALMCI	\N	\N	\N	\N	\N
cmnyfiqup0000xsvjvd31p7ny	Konate	Marie	+2250554318876	ouattara.amara@gmail.com	LinkedIn	NEW	cmnyax8h300036ovjypf6c2to	cmnyax8fz00026ovj3br2w6uq	2026-04-14 09:38:42.672	Tropik auto	Plateau immeuble chardy 8eme etage	Transport & logistique	Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum	M.	DSI
\.


--
-- Data for Name: LeadAttachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LeadAttachment" (id, "leadId", "fileName", "fileType", "fileSize", "storagePath", "createdAt") FROM stdin;
\.


--
-- Data for Name: LeadProductInterest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LeadProductInterest" (id, "leadId", "productId", "estimatedValue", "createdAt") FROM stdin;
\.


--
-- Data for Name: LeadServiceInterest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LeadServiceInterest" (id, "leadId", "serviceId", "estimatedValue", "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, "companyId", "createdAt") FROM stdin;
cmnyb62o200fd6ovjk46lvdfi	BIIM	cmnyavoeq00006ovjcsncu1t9	2026-04-14 07:36:52.994
cmnyb8m9j00ff6ovjlhqrjsl9	ADMINFLOW	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:38:51.703
cmnyb8syf00fg6ovjb3gpxpwi	CONTRIB	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:39:00.375
cmnyb9cx200fh6ovj2x3qj3xw	SUZCASH	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:39:26.246
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sale" (id, "clientId", "userId", "companyId", date, amount, "createdAt") FROM stdin;
\.


--
-- Data for Name: SaleItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SaleItem" (id, "saleId", "productId", "serviceId", quantity, "unitPrice", "lineTotal") FROM stdin;
\.


--
-- Data for Name: SalesGoal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SalesGoal" (id, "userId", "companyId", "periodType", "periodStart", "periodEnd", "targetConversions", "targetRevenue", "setById", "createdAt", "updatedAt") FROM stdin;
cmnybagu800fl6ovja8aqzuq3	cmnyb41p600fc6ovjzcwxeg4y	cmnyax8fz00026ovj3br2w6uq	MONTH	2026-04-01 00:00:00	2026-04-30 23:59:59.999	10	5000000	cmnyax8h300036ovjypf6c2to	2026-04-14 07:40:17.975	2026-04-14 07:40:17.975
cmnybaqdt00fm6ovja5gtz7ct	cmnyb34fl00fa6ovj5h1jlsu5	cmnyax8fz00026ovj3br2w6uq	MONTH	2026-04-01 00:00:00	2026-04-30 23:59:59.999	10	1000000	cmnyax8h300036ovjypf6c2to	2026-04-14 07:40:30.346	2026-04-14 07:40:30.346
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Service" (id, name, "companyId", "createdAt") FROM stdin;
cmnyb6je500fe6ovjf8jh2l53	Conception de plan de maison	cmnyavoeq00006ovjcsncu1t9	2026-04-14 07:37:14.669
cmnyb9jno00fi6ovjgj6zopys	Développement d'Application Mobile	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:39:34.98
cmnyb9ofy00fj6ovjxzeo84n6	Développement d'Application Web	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:39:41.182
cmnyb9syf00fk6ovjcnq4491u	Développement de Site Web	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:39:47.031
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, "companyId", "createdAt", "updatedAt", "mfaEnabled", "mfaSecret") FROM stdin;
cmnyavoge00016ovjwhptw8a2	Mariam Ouattara	ouattara.mariam@suzang-group.com	0123456789	MANAGER	cmnyavoeq00006ovjcsncu1t9	2026-04-14 07:28:48.014	2026-04-14 07:28:48.014	f	\N
cmnyax8h300036ovjypf6c2to	Nonwa Kone	nonwa.kone@appatam.com	bonjour	MANAGER	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:30:00.615	2026-04-14 07:30:00.615	f	\N
cmnyb34fl00fa6ovj5h1jlsu5	Binta Diallo	binta.diallo@appatam.com	0123456789	AGENT	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:34:35.313	2026-04-14 07:34:35.313	f	\N
cmnyb3jb400fb6ovj3eql0ltq	Mariam Ouattara	o.mariam@suzang-group.com	0123456789	DIRECTRICE_COMMERCIALE	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:34:54.592	2026-04-14 07:34:54.592	f	\N
cmnyb41p600fc6ovjzcwxeg4y	Valerie Akue	valerieakue@appatam.com	0123456789	AGENT	cmnyax8fz00026ovj3br2w6uq	2026-04-14 07:35:18.426	2026-04-14 07:35:18.426	f	\N
\.


--
-- Data for Name: _LeadProducts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_LeadProducts" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _LeadServices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_LeadServices" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
965c3e82-33c8-4b1d-8996-e96125bc6596	73dc529002ea420d2402d1aae20e3fb208e654e996949e0efad27f107d9438e7	2026-02-23 12:46:31.737931+01	20260211165909_init	\N	\N	2026-02-23 12:46:31.350536+01	1
0f5e6e81-9174-42a7-99b3-6a01062ae134	ff6e9c1afe442e210b658e420ccd3317478b2d72ac05efcabdb77ecf53a1d545	2026-04-08 12:59:04.244204+02	20260408095000_add_directrice_commerciale_role	\N	\N	2026-04-08 12:59:04.239701+02	1
fa7ad603-922b-43bb-a5b0-ac356238b992	9eaaeb059bce6dae9400865038e80d1c4a0f374cde90f490abe5f153b3a6dae1	2026-02-23 12:46:31.746674+01	20260211200041_add_whatsapp_activity	\N	\N	2026-02-23 12:46:31.739117+01	1
65de79c2-25be-4dd0-9910-a6e97395f6fd	f2644d149c00f19853a3d51d20e2dc35e37283ddebeb9caad1bebd8306a64ac2	2026-02-23 12:46:31.760511+01	20260213100605_add_lead_company_location	\N	\N	2026-02-23 12:46:31.74775+01	1
5f7ba637-c1b7-4a63-aac2-ec7135bfbe62	0d176da4c7c4f0f42b921d84cfaf517665699745d16b49053d98d3897c84c10a	2026-02-23 12:46:31.771449+01	20260213103221_add_lead_activity_domain_notes	\N	\N	2026-02-23 12:46:31.761626+01	1
ccb3e75d-cac8-49ba-8ea0-3d313025f153	b8b4799974259e18c1fef3684d39adeb70062e23c6194d592f668e09469a53f8	2026-04-08 19:17:12.310571+02	20260408103000_add_company_kind	\N	\N	2026-04-08 19:17:12.040686+02	1
d991415b-1a00-4532-a1fc-4237bbf6c1a4	ae3ad6a9694ab813e3331051eabcc259a7bbe555a1cda667f023be5b1b926930	2026-02-23 12:46:31.846663+01	20260213122226_add_lead_civility	\N	\N	2026-02-23 12:46:31.773703+01	1
b2e6ede5-1819-4990-b100-a76cfb0391dd	5b2c590bbed01d8cb054eed351590b5e13115821340be0e2eb8ede77d51b56ed	2026-02-23 12:46:31.928097+01	20260216084147_add_product_service	\N	\N	2026-02-23 12:46:31.847955+01	1
4d21ab40-5b17-4b0f-b599-fb8fe7b81b74	578adf998602fadf3e7e0ed48f339da10ffd975e14f630aff888567da9aed5f2	2026-02-23 12:46:32.134383+01	20260216102154_add_lead_interests	\N	\N	2026-02-23 12:46:31.929399+01	1
3215707e-55f9-4bfb-9f01-9d55542b0210	26ba388704f4b3d67fde5f5d85a0db51f8aea56dee31af865d82f4a931be6648	2026-04-09 11:06:39.92646+02	20260409090639_agenda_created_by	\N	\N	2026-04-09 11:06:39.825079+02	1
1c460f86-596e-4c75-a5a2-3e6d96a82316	49e8bdf299fcc6d314a0f2114168c29d65bf150a9d13dcfc66e3dcb73ffd93fe	2026-02-23 12:46:32.242787+01	20260217162126_add_client_interests	\N	\N	2026-02-23 12:46:32.135815+01	1
7731c3ad-c3ed-4b68-aba5-bc847495807b	bd2bc22600ae36f8329ec3387683ca14c32aac342674d2c16803dd663e11bba4	2026-02-23 12:46:32.2578+01	20260218091745_add_lead_attachments	\N	\N	2026-02-23 12:46:32.243945+01	1
4beb6808-5ee4-462c-9673-77714d086fae	4b8f3e08f8db26b44a7cbf4051d971e750a9f340fe03c64e31f6cebe4bce2d01	2026-02-23 12:46:32.274987+01	20260218172031_add_agenda_item	\N	\N	2026-02-23 12:46:32.258928+01	1
08631385-041d-4641-a314-875a167dcb54	179f9feb388f2fb75a2aceb9060153c2ef7111f70974b28af1f3e5ce0b9d5a73	2026-04-14 11:20:59.070538+02	20260414092059_add_lead_job_title	\N	\N	2026-04-14 11:20:59.048378+02	1
4d478ba3-5a9e-47f6-935b-e9614d31b0d1	cfb1cac7d2f23965dfaebd2796a3dd95a9b7013ba8b01e7d868715e110bbece2	2026-02-23 12:46:32.283909+01	20260219171917_add_user_mfa_enabled	\N	\N	2026-02-23 12:46:32.276208+01	1
194d9e20-4bc2-4a5d-b4d0-84c8c65a1831	15d2443f949f8208803659b75c33737372158e722568fb8b0ec99ebbd0e4deff	2026-02-23 12:47:20.632779+01	20260223114719_add_sales_models	\N	\N	2026-02-23 12:47:20.10087+01	1
5ba4e69f-4121-4e3b-b425-f89214cf5d2b	759a324f629167e589ebfbb0879d490f8734c781a1ea5eff684817c0c4879e1d	2026-04-08 12:59:04.238794+02	20260325162850_lead_interests_estimates	\N	\N	2026-04-08 12:59:04.017272+02	1
\.


--
-- Name: Activity Activity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_pkey" PRIMARY KEY (id);


--
-- Name: AgendaItem AgendaItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AgendaItem"
    ADD CONSTRAINT "AgendaItem_pkey" PRIMARY KEY (id);


--
-- Name: ClientProductInterest ClientProductInterest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientProductInterest"
    ADD CONSTRAINT "ClientProductInterest_pkey" PRIMARY KEY (id);


--
-- Name: ClientServiceInterest ClientServiceInterest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientServiceInterest"
    ADD CONSTRAINT "ClientServiceInterest_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: Deal Deal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_pkey" PRIMARY KEY (id);


--
-- Name: LeadAttachment LeadAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadAttachment"
    ADD CONSTRAINT "LeadAttachment_pkey" PRIMARY KEY (id);


--
-- Name: LeadProductInterest LeadProductInterest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadProductInterest"
    ADD CONSTRAINT "LeadProductInterest_pkey" PRIMARY KEY (id);


--
-- Name: LeadServiceInterest LeadServiceInterest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadServiceInterest"
    ADD CONSTRAINT "LeadServiceInterest_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: SaleItem SaleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: SalesGoal SalesGoal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalesGoal"
    ADD CONSTRAINT "SalesGoal_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _LeadProducts _LeadProducts_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_LeadProducts"
    ADD CONSTRAINT "_LeadProducts_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _LeadServices _LeadServices_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_LeadServices"
    ADD CONSTRAINT "_LeadServices_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ClientProductInterest_clientId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ClientProductInterest_clientId_productId_key" ON public."ClientProductInterest" USING btree ("clientId", "productId");


--
-- Name: ClientServiceInterest_clientId_serviceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ClientServiceInterest_clientId_serviceId_key" ON public."ClientServiceInterest" USING btree ("clientId", "serviceId");


--
-- Name: LeadProductInterest_leadId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LeadProductInterest_leadId_productId_key" ON public."LeadProductInterest" USING btree ("leadId", "productId");


--
-- Name: LeadServiceInterest_leadId_serviceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LeadServiceInterest_leadId_serviceId_key" ON public."LeadServiceInterest" USING btree ("leadId", "serviceId");


--
-- Name: SalesGoal_userId_periodType_periodStart_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SalesGoal_userId_periodType_periodStart_key" ON public."SalesGoal" USING btree ("userId", "periodType", "periodStart");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _LeadProducts_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_LeadProducts_B_index" ON public."_LeadProducts" USING btree ("B");


--
-- Name: _LeadServices_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_LeadServices_B_index" ON public."_LeadServices" USING btree ("B");


--
-- Name: Activity Activity_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Activity Activity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AgendaItem AgendaItem_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AgendaItem"
    ADD CONSTRAINT "AgendaItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AgendaItem AgendaItem_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AgendaItem"
    ADD CONSTRAINT "AgendaItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientProductInterest ClientProductInterest_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientProductInterest"
    ADD CONSTRAINT "ClientProductInterest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClientProductInterest ClientProductInterest_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientProductInterest"
    ADD CONSTRAINT "ClientProductInterest_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClientServiceInterest ClientServiceInterest_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientServiceInterest"
    ADD CONSTRAINT "ClientServiceInterest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClientServiceInterest ClientServiceInterest_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientServiceInterest"
    ADD CONSTRAINT "ClientServiceInterest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Client Client_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Client Client_convertedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_convertedById_fkey" FOREIGN KEY ("convertedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Deal Deal_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LeadAttachment LeadAttachment_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadAttachment"
    ADD CONSTRAINT "LeadAttachment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadProductInterest LeadProductInterest_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadProductInterest"
    ADD CONSTRAINT "LeadProductInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadProductInterest LeadProductInterest_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadProductInterest"
    ADD CONSTRAINT "LeadProductInterest_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LeadServiceInterest LeadServiceInterest_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadServiceInterest"
    ADD CONSTRAINT "LeadServiceInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeadServiceInterest LeadServiceInterest_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadServiceInterest"
    ADD CONSTRAINT "LeadServiceInterest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleItem SaleItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SaleItem SaleItem_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SaleItem SaleItem_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sale Sale_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sale Sale_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalesGoal SalesGoal_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalesGoal"
    ADD CONSTRAINT "SalesGoal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalesGoal SalesGoal_setById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalesGoal"
    ADD CONSTRAINT "SalesGoal_setById_fkey" FOREIGN KEY ("setById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SalesGoal SalesGoal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalesGoal"
    ADD CONSTRAINT "SalesGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Service Service_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _LeadProducts _LeadProducts_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_LeadProducts"
    ADD CONSTRAINT "_LeadProducts_A_fkey" FOREIGN KEY ("A") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _LeadProducts _LeadProducts_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_LeadProducts"
    ADD CONSTRAINT "_LeadProducts_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _LeadServices _LeadServices_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_LeadServices"
    ADD CONSTRAINT "_LeadServices_A_fkey" FOREIGN KEY ("A") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _LeadServices _LeadServices_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_LeadServices"
    ADD CONSTRAINT "_LeadServices_B_fkey" FOREIGN KEY ("B") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 6ZeIzqyj8O4fnNjgxx7IiueU5MYcOpsHCTkJHYpPQE1b6jTpK5ubn8FzIih5T0f

