CREATE TABLE public.addresses (
    id integer NOT NULL,
    user_id integer,
    label text DEFAULT 'Home'::text NOT NULL,
    full_name text NOT NULL,
    phone text NOT NULL,
    city text DEFAULT 'Douala'::text NOT NULL,
    area text DEFAULT ''::text NOT NULL,
    street text DEFAULT ''::text NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;
CREATE TABLE public.ai_conversations (
    id integer NOT NULL,
    user_id integer,
    session_id text DEFAULT ''::text NOT NULL,
    transcript jsonb,
    escalated_to_whatsapp boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.ai_conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.ai_conversations_id_seq OWNED BY public.ai_conversations.id;
CREATE TABLE public.appointments (
    id integer NOT NULL,
    reference text NOT NULL,
    user_id integer,
    guest_name text DEFAULT ''::text NOT NULL,
    guest_contact text DEFAULT ''::text NOT NULL,
    service text DEFAULT 'Styling session'::text NOT NULL,
    slot_start timestamp with time zone NOT NULL,
    slot_end timestamp with time zone NOT NULL,
    status text DEFAULT 'requested'::text NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;
CREATE TABLE public.audit_log (
    id integer NOT NULL,
    actor_id integer,
    actor_email text DEFAULT ''::text NOT NULL,
    action text NOT NULL,
    detail text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;
CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    variant_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);
CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;
CREATE TABLE public.carts (
    id integer NOT NULL,
    user_id integer,
    session_id text,
    coupon_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;
CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id integer,
    sort_order integer DEFAULT 0 NOT NULL,
    name_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
CREATE TABLE public.collections (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    cover_image text DEFAULT ''::text NOT NULL,
    season text DEFAULT ''::text NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name_fr text DEFAULT ''::text NOT NULL,
    description_fr text DEFAULT ''::text NOT NULL,
    season_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.collections_id_seq OWNED BY public.collections.id;
CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name text NOT NULL,
    contact text NOT NULL,
    message text NOT NULL,
    handled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;
CREATE TABLE public.coupons (
    id integer NOT NULL,
    code text NOT NULL,
    type text DEFAULT 'percentage'::text NOT NULL,
    value integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone,
    usage_limit integer DEFAULT 0 NOT NULL,
    times_used integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);
CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;
CREATE TABLE public.delivery_zones (
    id integer NOT NULL,
    name text NOT NULL,
    method text DEFAULT 'douala_local'::text NOT NULL,
    fee integer DEFAULT 0 NOT NULL,
    eta_label text DEFAULT '1–2 days'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    name_fr text DEFAULT ''::text NOT NULL,
    eta_label_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.delivery_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.delivery_zones_id_seq OWNED BY public.delivery_zones.id;
CREATE TABLE public.faqs (
    id integer NOT NULL,
    category text DEFAULT 'General'::text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    category_fr text DEFAULT ''::text NOT NULL,
    question_fr text DEFAULT ''::text NOT NULL,
    answer_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;
CREATE TABLE public.home_blocks (
    id integer NOT NULL,
    type text DEFAULT 'hero'::text NOT NULL,
    eyebrow text DEFAULT ''::text NOT NULL,
    heading text DEFAULT ''::text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    image_url text DEFAULT ''::text NOT NULL,
    cta_label text DEFAULT ''::text NOT NULL,
    cta_href text DEFAULT '/shop'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    eyebrow_fr text DEFAULT ''::text NOT NULL,
    heading_fr text DEFAULT ''::text NOT NULL,
    body_fr text DEFAULT ''::text NOT NULL,
    cta_label_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.home_blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.home_blocks_id_seq OWNED BY public.home_blocks.id;
CREATE TABLE public.journal_posts (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text DEFAULT ''::text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    cover_image text DEFAULT ''::text NOT NULL,
    author_name text DEFAULT 'OSSZ Studio'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title_fr text DEFAULT ''::text NOT NULL,
    excerpt_fr text DEFAULT ''::text NOT NULL,
    body_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.journal_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.journal_posts_id_seq OWNED BY public.journal_posts.id;
CREATE TABLE public.lookbook_items (
    id integer NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    caption text DEFAULT ''::text NOT NULL,
    image_url text NOT NULL,
    product_slug text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    caption_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.lookbook_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.lookbook_items_id_seq OWNED BY public.lookbook_items.id;
CREATE TABLE public.media (
    id integer NOT NULL,
    url text NOT NULL,
    alt_text text DEFAULT ''::text NOT NULL,
    tags text DEFAULT ''::text NOT NULL,
    uploaded_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;
CREATE TABLE public.newsletter_signups (
    id integer NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.newsletter_signups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.newsletter_signups_id_seq OWNED BY public.newsletter_signups.id;
CREATE TABLE public.notifications (
    id integer NOT NULL,
    order_id integer,
    appointment_id integer,
    channel text DEFAULT 'email'::text NOT NULL,
    recipient text DEFAULT ''::text NOT NULL,
    subject text DEFAULT ''::text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    error text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    variant_id integer,
    product_name text NOT NULL,
    product_slug text DEFAULT ''::text NOT NULL,
    variant_label text DEFAULT ''::text NOT NULL,
    image_url text DEFAULT ''::text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price integer DEFAULT 0 NOT NULL
);
CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;
CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number text NOT NULL,
    user_id integer,
    guest_email text DEFAULT ''::text NOT NULL,
    guest_phone text DEFAULT ''::text NOT NULL,
    customer_name text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'placed'::text NOT NULL,
    subtotal integer DEFAULT 0 NOT NULL,
    discount integer DEFAULT 0 NOT NULL,
    delivery_fee integer DEFAULT 0 NOT NULL,
    total integer DEFAULT 0 NOT NULL,
    coupon_code text DEFAULT ''::text NOT NULL,
    payment_method text DEFAULT 'mobile_money_mtn'::text NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    delivery_method text DEFAULT 'douala_local'::text NOT NULL,
    delivery_zone text DEFAULT ''::text NOT NULL,
    shipping_snapshot jsonb,
    notes text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;
CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;
CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    url text NOT NULL,
    alt_text text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);
CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;
CREATE TABLE public.product_variants (
    id integer NOT NULL,
    product_id integer NOT NULL,
    size text DEFAULT 'One size'::text NOT NULL,
    colour text DEFAULT 'Natural'::text NOT NULL,
    sku text DEFAULT ''::text NOT NULL,
    price_override integer,
    stock_qty integer DEFAULT 0 NOT NULL,
    low_stock_threshold integer DEFAULT 3 NOT NULL
);
CREATE SEQUENCE public.product_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.product_variants_id_seq OWNED BY public.product_variants.id;
CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    details text DEFAULT ''::text NOT NULL,
    care_instructions text DEFAULT ''::text NOT NULL,
    category_id integer,
    collection_id integer,
    base_price integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    popularity integer DEFAULT 0 NOT NULL,
    seo_title text DEFAULT ''::text NOT NULL,
    seo_description text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name_fr text DEFAULT ''::text NOT NULL,
    description_fr text DEFAULT ''::text NOT NULL,
    details_fr text DEFAULT ''::text NOT NULL,
    care_instructions_fr text DEFAULT ''::text NOT NULL
);
CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
CREATE TABLE public.settings (
    key text NOT NULL,
    value text DEFAULT ''::text NOT NULL
);
CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    phone text,
    full_name text DEFAULT ''::text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'customer'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    username text
);
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
CREATE TABLE public.wishlists (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.wishlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;
ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);
ALTER TABLE ONLY public.ai_conversations ALTER COLUMN id SET DEFAULT nextval('public.ai_conversations_id_seq'::regclass);
ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);
ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);
ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);
ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);
ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
ALTER TABLE ONLY public.collections ALTER COLUMN id SET DEFAULT nextval('public.collections_id_seq'::regclass);
ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);
ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);
ALTER TABLE ONLY public.delivery_zones ALTER COLUMN id SET DEFAULT nextval('public.delivery_zones_id_seq'::regclass);
ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);
ALTER TABLE ONLY public.home_blocks ALTER COLUMN id SET DEFAULT nextval('public.home_blocks_id_seq'::regclass);
ALTER TABLE ONLY public.journal_posts ALTER COLUMN id SET DEFAULT nextval('public.journal_posts_id_seq'::regclass);
ALTER TABLE ONLY public.lookbook_items ALTER COLUMN id SET DEFAULT nextval('public.lookbook_items_id_seq'::regclass);
ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);
ALTER TABLE ONLY public.newsletter_signups ALTER COLUMN id SET DEFAULT nextval('public.newsletter_signups_id_seq'::regclass);
ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);
ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);
ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);
ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);
ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);
ALTER TABLE ONLY public.product_variants ALTER COLUMN id SET DEFAULT nextval('public.product_variants_id_seq'::regclass);
ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);
ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_reference_unique UNIQUE (reference);
ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_slug_unique UNIQUE (slug);
ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_unique UNIQUE (code);
ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.home_blocks
    ADD CONSTRAINT home_blocks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.journal_posts
    ADD CONSTRAINT journal_posts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.journal_posts
    ADD CONSTRAINT journal_posts_slug_unique UNIQUE (slug);
ALTER TABLE ONLY public.lookbook_items
    ADD CONSTRAINT lookbook_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.newsletter_signups
    ADD CONSTRAINT newsletter_signups_email_unique UNIQUE (email);
ALTER TABLE ONLY public.newsletter_signups
    ADD CONSTRAINT newsletter_signups_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_token_key UNIQUE (token);
ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);
ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);
CREATE INDEX addresses_user_idx ON public.addresses USING btree (user_id);
CREATE INDEX ai_session_idx ON public.ai_conversations USING btree (session_id);
CREATE INDEX appointments_slot_idx ON public.appointments USING btree (slot_start);
CREATE INDEX appointments_user_idx ON public.appointments USING btree (user_id);
CREATE INDEX cart_items_cart_idx ON public.cart_items USING btree (cart_id);
CREATE INDEX cart_items_variant_idx ON public.cart_items USING btree (variant_id);
CREATE INDEX carts_session_idx ON public.carts USING btree (session_id);
CREATE INDEX carts_user_idx ON public.carts USING btree (user_id);
CREATE INDEX journal_status_idx ON public.journal_posts USING btree (status, published_at);
CREATE INDEX notifications_order_idx ON public.notifications USING btree (order_id);
CREATE INDEX order_items_order_idx ON public.order_items USING btree (order_id);
CREATE INDEX orders_created_idx ON public.orders USING btree (created_at);
CREATE INDEX orders_status_idx ON public.orders USING btree (status);
CREATE INDEX orders_user_idx ON public.orders USING btree (user_id);
CREATE INDEX product_images_product_idx ON public.product_images USING btree (product_id, sort_order);
CREATE INDEX products_category_idx ON public.products USING btree (category_id);
CREATE INDEX products_collection_idx ON public.products USING btree (collection_id);
CREATE INDEX products_created_idx ON public.products USING btree (created_at);
CREATE INDEX products_published_idx ON public.products USING btree (is_published);
CREATE UNIQUE INDEX users_username_unique ON public.users USING btree (username);
CREATE INDEX variants_product_idx ON public.product_variants USING btree (product_id);
CREATE UNIQUE INDEX wishlist_user_product_idx ON public.wishlists USING btree (user_id, product_id);
ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_actor_id_users_id_fk FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_carts_id_fk FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_product_variants_id_fk FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_product_variants_id_fk FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_collection_id_collections_id_fk FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
