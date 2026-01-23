CREATE TYPE "public"."batch" AS ENUM('2020', '2021', '2022', '2023', '2024', '2025');--> statement-breakpoint
CREATE TYPE "public"."department" AS ENUM('Computer Science and Engineering', 'Electronics and Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Smart Manufacturing', 'Civil Engineering', 'Chemical Engineering', 'Design', 'others');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'professor', 'admin');--> statement-breakpoint
CREATE TABLE "universities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"domain" varchar(256),
	"city" varchar(256),
	"state" varchar(256),
	"logo_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "universities_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" "role" NOT NULL,
	"department" "department" NOT NULL,
	"batch" "batch" NOT NULL,
	"profile_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;