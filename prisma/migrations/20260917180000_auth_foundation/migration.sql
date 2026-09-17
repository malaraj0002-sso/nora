-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('he', 'ar', 'en', 'ru');

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('super_admin', 'admin', 'editor', 'translator', 'viewer');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('kitchens', 'bedrooms', 'wardrobes', 'furniture', 'commercial');

-- CreateEnum
CREATE TYPE "MediaPlacement" AS ENUM ('primary', 'gallery');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" "RoleKey" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "blurhash" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_translations" (
    "id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "media_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brand_name" TEXT NOT NULL,
    "phone_display" TEXT NOT NULL,
    "phone_tel" TEXT NOT NULL,
    "whatsapp_e164" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagram_url" TEXT,
    "facebook_url" TEXT,
    "map_url" TEXT,
    "logo_media_id" TEXT,
    "logo_dark_media_id" TEXT,
    "qr_media_id" TEXT,
    "seo_image_media_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings_translations" (
    "id" TEXT NOT NULL,
    "site_settings_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "pillars" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "working_hours" TEXT NOT NULL DEFAULT '',
    "whatsapp_message" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "site_settings_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ui_labels" (
    "id" TEXT NOT NULL DEFAULT 'default',

    CONSTRAINT "ui_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ui_label_translations" (
    "id" TEXT NOT NULL,
    "ui_labels_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "home" TEXT NOT NULL DEFAULT '',
    "about" TEXT NOT NULL DEFAULT '',
    "services" TEXT NOT NULL DEFAULT '',
    "projects" TEXT NOT NULL DEFAULT '',
    "materials" TEXT NOT NULL DEFAULT '',
    "how_we_work" TEXT NOT NULL DEFAULT '',
    "testimonials" TEXT NOT NULL DEFAULT '',
    "blog" TEXT NOT NULL DEFAULT '',
    "faq" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "call_us" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "view_work" TEXT NOT NULL DEFAULT '',
    "learn_more" TEXT NOT NULL DEFAULT '',
    "view_all" TEXT NOT NULL DEFAULT '',
    "view_project" TEXT NOT NULL DEFAULT '',
    "read_more" TEXT NOT NULL DEFAULT '',
    "back_home" TEXT NOT NULL DEFAULT '',
    "all" TEXT NOT NULL DEFAULT '',
    "footer_cta" TEXT NOT NULL DEFAULT '',
    "footer_tagline" TEXT NOT NULL DEFAULT '',
    "services_title" TEXT NOT NULL DEFAULT '',
    "nav_title" TEXT NOT NULL DEFAULT '',
    "contact_title" TEXT NOT NULL DEFAULT '',
    "languages_title" TEXT NOT NULL DEFAULT '',
    "not_found_title" TEXT NOT NULL DEFAULT '',
    "not_found_body" TEXT NOT NULL DEFAULT '',
    "related_projects" TEXT NOT NULL DEFAULT '',
    "all_rights_reserved" TEXT NOT NULL DEFAULT '',
    "demo_notice" TEXT NOT NULL DEFAULT '',
    "privacy" TEXT NOT NULL DEFAULT '',
    "cookies" TEXT NOT NULL DEFAULT '',
    "terms" TEXT NOT NULL DEFAULT '',
    "cookie_notice" TEXT NOT NULL DEFAULT '',
    "cookie_accept" TEXT NOT NULL DEFAULT '',
    "legal_title" TEXT NOT NULL DEFAULT '',
    "category_all" TEXT NOT NULL DEFAULT '',
    "category_kitchens" TEXT NOT NULL DEFAULT '',
    "category_bedrooms" TEXT NOT NULL DEFAULT '',
    "category_wardrobes" TEXT NOT NULL DEFAULT '',
    "category_furniture" TEXT NOT NULL DEFAULT '',
    "category_commercial" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ui_label_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_items" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_item_translations" (
    "id" TEXT NOT NULL,
    "navigation_item_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "navigation_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_page" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "seo_image_media_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_page_translations" (
    "id" TEXT NOT NULL,
    "home_page_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "hero_title" TEXT NOT NULL DEFAULT '',
    "hero_subtitle" TEXT NOT NULL DEFAULT '',
    "intro_eyebrow" TEXT NOT NULL DEFAULT '',
    "intro_title" TEXT NOT NULL DEFAULT '',
    "intro_description" TEXT NOT NULL DEFAULT '',
    "why_eyebrow" TEXT NOT NULL DEFAULT '',
    "why_title" TEXT NOT NULL DEFAULT '',
    "why_subtitle" TEXT NOT NULL DEFAULT '',
    "process_eyebrow" TEXT NOT NULL DEFAULT '',
    "process_title" TEXT NOT NULL DEFAULT '',
    "process_subtitle" TEXT NOT NULL DEFAULT '',
    "services_eyebrow" TEXT NOT NULL DEFAULT '',
    "services_title" TEXT NOT NULL DEFAULT '',
    "services_subtitle" TEXT NOT NULL DEFAULT '',
    "projects_eyebrow" TEXT NOT NULL DEFAULT '',
    "projects_title" TEXT NOT NULL DEFAULT '',
    "projects_subtitle" TEXT NOT NULL DEFAULT '',
    "materials_eyebrow" TEXT NOT NULL DEFAULT '',
    "materials_title" TEXT NOT NULL DEFAULT '',
    "materials_subtitle" TEXT NOT NULL DEFAULT '',
    "testimonials_eyebrow" TEXT NOT NULL DEFAULT '',
    "testimonials_title" TEXT NOT NULL DEFAULT '',
    "testimonials_subtitle" TEXT NOT NULL DEFAULT '',
    "cta_title" TEXT NOT NULL DEFAULT '',
    "cta_subtitle" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "home_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "home_page_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_intro_features" (
    "id" TEXT NOT NULL,
    "home_page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "home_intro_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_intro_feature_translations" (
    "id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "desc" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "home_intro_feature_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_why_items" (
    "id" TEXT NOT NULL,
    "home_page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "home_why_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_why_item_translations" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "desc" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "home_why_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_featured_services" (
    "id" TEXT NOT NULL,
    "home_page_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "home_featured_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_featured_projects" (
    "id" TEXT NOT NULL,
    "home_page_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "home_featured_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_page" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "image_media_id" TEXT,
    "seo_image_media_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_page_translations" (
    "id" TEXT NOT NULL,
    "about_page_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "mission" TEXT NOT NULL DEFAULT '',
    "vision" TEXT NOT NULL DEFAULT '',
    "values_title" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "about_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_values" (
    "id" TEXT NOT NULL,
    "about_page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "about_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_value_translations" (
    "id" TEXT NOT NULL,
    "value_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "desc" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "about_value_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "how_we_work_page" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "image_media_id" TEXT,
    "seo_image_media_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "how_we_work_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "how_we_work_page_translations" (
    "id" TEXT NOT NULL,
    "how_we_work_page_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "how_we_work_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "how_we_work_steps" (
    "id" TEXT NOT NULL,
    "how_we_work_page_id" TEXT NOT NULL,
    "number" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "image_media_id" TEXT,

    CONSTRAINT "how_we_work_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "how_we_work_step_translations" (
    "id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "how_we_work_step_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_page" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "image_media_id" TEXT,
    "seo_image_media_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_page_translations" (
    "id" TEXT NOT NULL,
    "contact_page_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "contact_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_page" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "image_media_id" TEXT,
    "seo_image_media_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_page_translations" (
    "id" TEXT NOT NULL,
    "faq_page_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "faq_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_page" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "image_media_id" TEXT,
    "seo_image_media_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_page_translations" (
    "id" TEXT NOT NULL,
    "blog_page_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "blog_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "seo_image_media_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_translations" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_features" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_feature_translations" (
    "id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "service_feature_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_images" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "placement" "MediaPlacement" NOT NULL DEFAULT 'gallery',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ProjectCategory" NOT NULL,
    "completed_at" DATE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "seo_image_media_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_translations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "project_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_materials" (
    "project_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,

    CONSTRAINT "project_materials_pkey" PRIMARY KEY ("project_id","material_id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "image_media_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_translations" (
    "id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "characteristics" TEXT NOT NULL DEFAULT '',
    "applications" TEXT NOT NULL DEFAULT '',
    "finishes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "material_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "image_media_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonial_translations" (
    "id" TEXT NOT NULL,
    "testimonial_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "review" TEXT NOT NULL DEFAULT '',
    "project" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "testimonial_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_item_translations" (
    "id" TEXT NOT NULL,
    "faq_item_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "question" TEXT NOT NULL DEFAULT '',
    "answer" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "faq_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL DEFAULT 'Nora Group',
    "date" DATE,
    "tags" TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "image_media_id" TEXT,
    "seo_image_media_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_translations" (
    "id" TEXT NOT NULL,
    "blog_post_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "seo_title" TEXT NOT NULL DEFAULT '',
    "seo_description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "blog_post_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_storage_key_key" ON "media"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "media_translations_media_id_locale_key" ON "media_translations"("media_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_translations_site_settings_id_locale_key" ON "site_settings_translations"("site_settings_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ui_label_translations_ui_labels_id_locale_key" ON "ui_label_translations"("ui_labels_id", "locale");

-- CreateIndex
CREATE INDEX "navigation_items_sort_order_idx" ON "navigation_items"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_item_translations_navigation_item_id_locale_key" ON "navigation_item_translations"("navigation_item_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "home_page_translations_home_page_id_locale_key" ON "home_page_translations"("home_page_id", "locale");

-- CreateIndex
CREATE INDEX "hero_slides_home_page_id_sort_order_idx" ON "hero_slides"("home_page_id", "sort_order");

-- CreateIndex
CREATE INDEX "home_intro_features_home_page_id_sort_order_idx" ON "home_intro_features"("home_page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "home_intro_feature_translations_feature_id_locale_key" ON "home_intro_feature_translations"("feature_id", "locale");

-- CreateIndex
CREATE INDEX "home_why_items_home_page_id_sort_order_idx" ON "home_why_items"("home_page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "home_why_item_translations_item_id_locale_key" ON "home_why_item_translations"("item_id", "locale");

-- CreateIndex
CREATE INDEX "home_featured_services_home_page_id_sort_order_idx" ON "home_featured_services"("home_page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "home_featured_services_home_page_id_service_id_key" ON "home_featured_services"("home_page_id", "service_id");

-- CreateIndex
CREATE INDEX "home_featured_projects_home_page_id_sort_order_idx" ON "home_featured_projects"("home_page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "home_featured_projects_home_page_id_project_id_key" ON "home_featured_projects"("home_page_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "about_page_translations_about_page_id_locale_key" ON "about_page_translations"("about_page_id", "locale");

-- CreateIndex
CREATE INDEX "about_values_about_page_id_sort_order_idx" ON "about_values"("about_page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "about_value_translations_value_id_locale_key" ON "about_value_translations"("value_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "how_we_work_page_translations_how_we_work_page_id_locale_key" ON "how_we_work_page_translations"("how_we_work_page_id", "locale");

-- CreateIndex
CREATE INDEX "how_we_work_steps_how_we_work_page_id_sort_order_idx" ON "how_we_work_steps"("how_we_work_page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "how_we_work_step_translations_step_id_locale_key" ON "how_we_work_step_translations"("step_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "contact_page_translations_contact_page_id_locale_key" ON "contact_page_translations"("contact_page_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "faq_page_translations_faq_page_id_locale_key" ON "faq_page_translations"("faq_page_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "blog_page_translations_blog_page_id_locale_key" ON "blog_page_translations"("blog_page_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_visible_sort_order_idx" ON "services"("visible", "sort_order");

-- CreateIndex
CREATE INDEX "services_is_locked_idx" ON "services"("is_locked");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_service_id_locale_key" ON "service_translations"("service_id", "locale");

-- CreateIndex
CREATE INDEX "service_features_service_id_sort_order_idx" ON "service_features"("service_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "service_feature_translations_feature_id_locale_key" ON "service_feature_translations"("feature_id", "locale");

-- CreateIndex
CREATE INDEX "service_images_service_id_placement_sort_order_idx" ON "service_images"("service_id", "placement", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_visible_category_idx" ON "projects"("visible", "category");

-- CreateIndex
CREATE UNIQUE INDEX "project_translations_project_id_locale_key" ON "project_translations"("project_id", "locale");

-- CreateIndex
CREATE INDEX "project_images_project_id_sort_order_idx" ON "project_images"("project_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "materials_slug_key" ON "materials"("slug");

-- CreateIndex
CREATE INDEX "materials_visible_sort_order_idx" ON "materials"("visible", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "material_translations_material_id_locale_key" ON "material_translations"("material_id", "locale");

-- CreateIndex
CREATE INDEX "testimonials_visible_sort_order_idx" ON "testimonials"("visible", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "testimonial_translations_testimonial_id_locale_key" ON "testimonial_translations"("testimonial_id", "locale");

-- CreateIndex
CREATE INDEX "faq_items_visible_sort_order_idx" ON "faq_items"("visible", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "faq_item_translations_faq_item_id_locale_key" ON "faq_item_translations"("faq_item_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_visible_date_idx" ON "blog_posts"("visible", "date");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_translations_blog_post_id_locale_key" ON "blog_post_translations"("blog_post_id", "locale");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_translations" ADD CONSTRAINT "media_translations_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_media_id_fkey" FOREIGN KEY ("logo_dark_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_qr_media_id_fkey" FOREIGN KEY ("qr_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings_translations" ADD CONSTRAINT "site_settings_translations_site_settings_id_fkey" FOREIGN KEY ("site_settings_id") REFERENCES "site_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ui_label_translations" ADD CONSTRAINT "ui_label_translations_ui_labels_id_fkey" FOREIGN KEY ("ui_labels_id") REFERENCES "ui_labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_item_translations" ADD CONSTRAINT "navigation_item_translations_navigation_item_id_fkey" FOREIGN KEY ("navigation_item_id") REFERENCES "navigation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_page" ADD CONSTRAINT "home_page_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_page_translations" ADD CONSTRAINT "home_page_translations_home_page_id_fkey" FOREIGN KEY ("home_page_id") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_home_page_id_fkey" FOREIGN KEY ("home_page_id") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_intro_features" ADD CONSTRAINT "home_intro_features_home_page_id_fkey" FOREIGN KEY ("home_page_id") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_intro_feature_translations" ADD CONSTRAINT "home_intro_feature_translations_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "home_intro_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_why_items" ADD CONSTRAINT "home_why_items_home_page_id_fkey" FOREIGN KEY ("home_page_id") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_why_item_translations" ADD CONSTRAINT "home_why_item_translations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "home_why_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_featured_services" ADD CONSTRAINT "home_featured_services_home_page_id_fkey" FOREIGN KEY ("home_page_id") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_featured_services" ADD CONSTRAINT "home_featured_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_featured_projects" ADD CONSTRAINT "home_featured_projects_home_page_id_fkey" FOREIGN KEY ("home_page_id") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_featured_projects" ADD CONSTRAINT "home_featured_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_page" ADD CONSTRAINT "about_page_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_page" ADD CONSTRAINT "about_page_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_page_translations" ADD CONSTRAINT "about_page_translations_about_page_id_fkey" FOREIGN KEY ("about_page_id") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_values" ADD CONSTRAINT "about_values_about_page_id_fkey" FOREIGN KEY ("about_page_id") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_value_translations" ADD CONSTRAINT "about_value_translations_value_id_fkey" FOREIGN KEY ("value_id") REFERENCES "about_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "how_we_work_page" ADD CONSTRAINT "how_we_work_page_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "how_we_work_page" ADD CONSTRAINT "how_we_work_page_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "how_we_work_page_translations" ADD CONSTRAINT "how_we_work_page_translations_how_we_work_page_id_fkey" FOREIGN KEY ("how_we_work_page_id") REFERENCES "how_we_work_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "how_we_work_steps" ADD CONSTRAINT "how_we_work_steps_how_we_work_page_id_fkey" FOREIGN KEY ("how_we_work_page_id") REFERENCES "how_we_work_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "how_we_work_steps" ADD CONSTRAINT "how_we_work_steps_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "how_we_work_step_translations" ADD CONSTRAINT "how_we_work_step_translations_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "how_we_work_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_page" ADD CONSTRAINT "contact_page_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_page" ADD CONSTRAINT "contact_page_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_page_translations" ADD CONSTRAINT "contact_page_translations_contact_page_id_fkey" FOREIGN KEY ("contact_page_id") REFERENCES "contact_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_page" ADD CONSTRAINT "faq_page_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_page" ADD CONSTRAINT "faq_page_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_page_translations" ADD CONSTRAINT "faq_page_translations_faq_page_id_fkey" FOREIGN KEY ("faq_page_id") REFERENCES "faq_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_page" ADD CONSTRAINT "blog_page_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_page" ADD CONSTRAINT "blog_page_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_page_translations" ADD CONSTRAINT "blog_page_translations_blog_page_id_fkey" FOREIGN KEY ("blog_page_id") REFERENCES "blog_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_features" ADD CONSTRAINT "service_features_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_feature_translations" ADD CONSTRAINT "service_feature_translations_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "service_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_materials" ADD CONSTRAINT "project_materials_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_materials" ADD CONSTRAINT "project_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_translations" ADD CONSTRAINT "material_translations_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonial_translations" ADD CONSTRAINT "testimonial_translations_testimonial_id_fkey" FOREIGN KEY ("testimonial_id") REFERENCES "testimonials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_item_translations" ADD CONSTRAINT "faq_item_translations_faq_item_id_fkey" FOREIGN KEY ("faq_item_id") REFERENCES "faq_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_seo_image_media_id_fkey" FOREIGN KEY ("seo_image_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_translations" ADD CONSTRAINT "blog_post_translations_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 2: email normalization and last active super_admin protection.
-- No users or CMS content rows are inserted.

CREATE OR REPLACE FUNCTION nora_lowercase_user_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email := lower(NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_lowercase_email
BEFORE INSERT OR UPDATE OF email ON users
FOR EACH ROW
EXECUTE FUNCTION nora_lowercase_user_email();

CREATE OR REPLACE FUNCTION nora_protect_last_active_super_admin()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_is_super boolean := false;
  new_is_super boolean := false;
  remaining integer := 0;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT EXISTS (
      SELECT 1 FROM roles r WHERE r.id = OLD.role_id AND r.key::text = 'super_admin'
    ) INTO old_is_super;
    IF old_is_super AND OLD.is_active THEN
      SELECT COUNT(*)::int INTO remaining
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.key::text = 'super_admin' AND u.is_active = true AND u.id <> OLD.id;
      IF remaining < 1 THEN
        RAISE EXCEPTION 'Cannot delete the final active super_admin';
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM roles r WHERE r.id = OLD.role_id AND r.key::text = 'super_admin'
  ) INTO old_is_super;

  IF old_is_super THEN
    SELECT EXISTS (
      SELECT 1 FROM roles r WHERE r.id = NEW.role_id AND r.key::text = 'super_admin'
    ) INTO new_is_super;

    IF OLD.is_active AND (NEW.is_active = false OR NOT new_is_super) THEN
      SELECT COUNT(*)::int INTO remaining
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.key::text = 'super_admin' AND u.is_active = true AND u.id <> NEW.id;
      IF remaining < 1 THEN
        RAISE EXCEPTION 'Cannot disable or demote the final active super_admin';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER users_protect_last_super_admin
BEFORE DELETE OR UPDATE OF role_id, is_active ON users
FOR EACH ROW
EXECUTE FUNCTION nora_protect_last_active_super_admin();

