import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* People & access                                                     */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  /** Short sign-in name for staff accounts (customers sign in with email). */
  username: text("username").unique(),
  phone: text("phone"),
  fullName: text("full_name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  // customer | uploader | staff | admin
  role: text("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull().default("Douala"),
  area: text("area").notNull().default(""),
  street: text("street").notNull().default(""),
  notes: text("notes").notNull().default(""),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("addresses_user_idx").on(table.userId),
]);

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameFr: text("name_fr").notNull().default(""),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  season: text("season").notNull().default(""),
  nameFr: text("name_fr").notNull().default(""),
  descriptionFr: text("description_fr").notNull().default(""),
  seasonFr: text("season_fr").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  details: text("details").notNull().default(""),
  careInstructions: text("care_instructions").notNull().default(""),
  nameFr: text("name_fr").notNull().default(""),
  descriptionFr: text("description_fr").notNull().default(""),
  detailsFr: text("details_fr").notNull().default(""),
  careInstructionsFr: text("care_instructions_fr").notNull().default(""),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  collectionId: integer("collection_id").references(() => collections.id, { onDelete: "set null" }),
  basePrice: integer("base_price").notNull().default(0), // XAF, no decimals
  isPublished: boolean("is_published").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  popularity: integer("popularity").notNull().default(0),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("products_category_idx").on(table.categoryId),
  index("products_collection_idx").on(table.collectionId),
  index("products_published_idx").on(table.isPublished),
  index("products_created_idx").on(table.createdAt),
]);

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  size: text("size").notNull().default("One size"),
  colour: text("colour").notNull().default("Natural"),
  sku: text("sku").notNull().default(""),
  priceOverride: integer("price_override"),
  stockQty: integer("stock_qty").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(3),
}, (table) => [
  index("variants_product_idx").on(table.productId),
]);

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [
  index("product_images_product_idx").on(table.productId, table.sortOrder),
]);

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  altText: text("alt_text").notNull().default(""),
  tags: text("tags").notNull().default(""),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Cart & orders                                                       */
/* ------------------------------------------------------------------ */

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("carts_user_idx").on(table.userId),
  index("carts_session_idx").on(table.sessionId),
]);

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
}, (table) => [
  index("cart_items_cart_idx").on(table.cartId),
  index("cart_items_variant_idx").on(table.variantId),
]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  guestEmail: text("guest_email").notNull().default(""),
  guestPhone: text("guest_phone").notNull().default(""),
  customerName: text("customer_name").notNull().default(""),
  // placed | processing | ready | out_for_delivery | delivered | returned | cancelled
  status: text("status").notNull().default("placed"),
  subtotal: integer("subtotal").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull().default(0),
  couponCode: text("coupon_code").notNull().default(""),
  // mobile_money_orange | mobile_money_mtn | card | cash_on_delivery
  paymentMethod: text("payment_method").notNull().default("mobile_money_mtn"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  // douala_local | national | pickup
  deliveryMethod: text("delivery_method").notNull().default("douala_local"),
  deliveryZone: text("delivery_zone").notNull().default(""),
  shippingSnapshot: jsonb("shipping_snapshot"),
  paymentProofUrl: text("payment_proof_url"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("orders_user_idx").on(table.userId),
  index("orders_status_idx").on(table.status),
  index("orders_created_idx").on(table.createdAt),
]);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  productSlug: text("product_slug").notNull().default(""),
  variantLabel: text("variant_label").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull().default(0),
}, (table) => [
  index("order_items_order_idx").on(table.orderId),
]);

/* ------------------------------------------------------------------ */
/* Appointments, wishlist, coupons                                     */
/* ------------------------------------------------------------------ */

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  guestName: text("guest_name").notNull().default(""),
  guestContact: text("guest_contact").notNull().default(""),
  service: text("service").notNull().default("Styling session"),
  slotStart: timestamp("slot_start", { withTimezone: true }).notNull(),
  slotEnd: timestamp("slot_end", { withTimezone: true }).notNull(),
  // requested | confirmed | completed | cancelled
  status: text("status").notNull().default("requested"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("appointments_slot_idx").on(table.slotStart),
  index("appointments_user_idx").on(table.userId),
]);

export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId)],
);

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  // percentage | fixed | free_delivery
  type: text("type").notNull().default("percentage"),
  value: integer("value").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  usageLimit: integer("usage_limit").notNull().default(0),
  timesUsed: integer("times_used").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export const journalPosts = pgTable("journal_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  titleFr: text("title_fr").notNull().default(""),
  excerptFr: text("excerpt_fr").notNull().default(""),
  bodyFr: text("body_fr").notNull().default(""),
  authorName: text("author_name").notNull().default("OSSZ Studio"),
  // draft | published
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("journal_status_idx").on(table.status, table.publishedAt),
]);

export const homeBlocks = pgTable("home_blocks", {
  id: serial("id").primaryKey(),
  // hero | banner | quote | editorial
  type: text("type").notNull().default("hero"),
  eyebrow: text("eyebrow").notNull().default(""),
  heading: text("heading").notNull().default(""),
  body: text("body").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default(""),
  eyebrowFr: text("eyebrow_fr").notNull().default(""),
  headingFr: text("heading_fr").notNull().default(""),
  bodyFr: text("body_fr").notNull().default(""),
  ctaLabelFr: text("cta_label_fr").notNull().default(""),
  ctaHref: text("cta_href").notNull().default("/shop"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
});

export const lookbookItems = pgTable("lookbook_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default(""),
  caption: text("caption").notNull().default(""),
  captionFr: text("caption_fr").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  /** image | video — videos also store a poster frame for fast first paint. */
  mediaType: text("media_type").notNull().default("image"),
  videoUrl: text("video_url"),
  posterUrl: text("poster_url"),
  durationSeconds: integer("duration_seconds"),
  productSlug: text("product_slug").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  category: text("category").notNull().default("General"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  categoryFr: text("category_fr").notNull().default(""),
  questionFr: text("question_fr").notNull().default(""),
  answerFr: text("answer_fr").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const deliveryZones = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  method: text("method").notNull().default("douala_local"),
  fee: integer("fee").notNull().default(0),
  etaLabel: text("eta_label").notNull().default("1–2 days"),
  nameFr: text("name_fr").notNull().default(""),
  etaLabelFr: text("eta_label_fr").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id").notNull().default(""),
  transcript: jsonb("transcript"),
  escalatedToWhatsapp: boolean("escalated_to_whatsapp").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("ai_session_idx").on(table.sessionId),
]);

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorEmail: text("actor_email").notNull().default(""),
  action: text("action").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSignups = pgTable("newsletter_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Questions the concierge could not confidently answer, so staff can
 *  review and add approved answers. */
export const aiGaps = pgTable("ai_gaps", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().default(""),
  question: text("question").notNull(),
  locale: text("locale").notNull().default("en"),
  detectedIntent: text("detected_intent").notNull().default(""),
  searchPerformed: text("search_performed").notNull().default(""),
  searchResult: text("search_result").notNull().default(""),
  reason: text("reason").notNull().default(""),
  resolvedAnswer: text("resolved_answer").notNull().default(""),
  resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
  status: text("status").notNull().default("open"), // open | resolved
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("ai_gaps_session_idx").on(table.sessionId)]);

/**
 * Outbound customer notifications (§12.2) — every order status change is
 * recorded here so staff can see what was sent, and re-send if needed.
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "cascade" }),
  // email | whatsapp | sms
  channel: text("channel").notNull().default("email"),
  recipient: text("recipient").notNull().default(""),
  subject: text("subject").notNull().default(""),
  body: text("body").notNull().default(""),
  // queued | sent | failed
  status: text("status").notNull().default("queued"),
  error: text("error").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Password reset tokens (§4.2 profile & security). */
export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
