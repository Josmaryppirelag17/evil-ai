CREATE TABLE "ai"."password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "ai"."sessions" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "ai"."users" ADD COLUMN "username" varchar(50);--> statement-breakpoint
ALTER TABLE "ai"."users" ADD COLUMN "last_name" varchar(100);--> statement-breakpoint
UPDATE "ai"."users" SET "username" = split_part("email", '@', 1) WHERE "username" IS NULL;--> statement-breakpoint
UPDATE "ai"."users" SET "last_name" = '' WHERE "last_name" IS NULL;--> statement-breakpoint
ALTER TABLE "ai"."users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ai"."users" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ai"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "ai"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "ai"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");