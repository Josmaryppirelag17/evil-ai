CREATE TABLE "ai"."messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"sources" jsonb,
	"suggestions" jsonb
);
--> statement-breakpoint
CREATE TABLE "ai"."preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"locale" varchar(5) DEFAULT 'es',
	"selected_voice" varchar(100),
	"speech_rate" real DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "preferences_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "ai"."sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"metadata" jsonb,
	CONSTRAINT "sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "ai"."messages" ADD CONSTRAINT "messages_session_id_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "ai"."sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."preferences" ADD CONSTRAINT "preferences_session_id_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "ai"."sessions"("session_id") ON DELETE cascade ON UPDATE no action;