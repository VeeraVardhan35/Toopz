CREATE TABLE "pendingUniversityRequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"domain" varchar(256) NOT NULL,
	"city" varchar(256),
	"state" varchar(256),
	"logo_url" text,
	"status" "requestStatus" DEFAULT 'pending' NOT NULL,
	"request_message" text,
	"response_message" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pendingUniversityRequests" ADD CONSTRAINT "pendingUniversityRequests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pendingUniversityRequests" ADD CONSTRAINT "pendingUniversityRequests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;