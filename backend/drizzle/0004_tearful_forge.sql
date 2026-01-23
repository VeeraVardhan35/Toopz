CREATE TYPE "public"."roleType" AS ENUM('admin', 'member', 'coordinator', 'co-coordinator', 'captain', 'Mentor');--> statement-breakpoint
CREATE TABLE "groupMembers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "roleType" NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "groupMembers" ADD CONSTRAINT "groupMembers_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groupMembers" ADD CONSTRAINT "groupMembers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;