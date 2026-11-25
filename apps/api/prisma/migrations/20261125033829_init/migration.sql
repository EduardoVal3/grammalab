-- CreateEnum
CREATE TYPE "GrammarType" AS ENUM ('REGULAR', 'CONTEXT_FREE');

-- CreateEnum
CREATE TYPE "ExerciseMode" AS ENUM ('MEMBERSHIP', 'CLASSIFICATION', 'CORRECTION');

-- CreateEnum
CREATE TYPE "ExerciseDifficulty" AS ENUM ('BASIC', 'INTERMEDIATE', 'CHALLENGE');

-- CreateEnum
CREATE TYPE "AiInteractionType" AS ENUM ('HINT_L1', 'HINT_L2', 'HINT_L3', 'EXPLAIN_ERROR', 'CHAT');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('GEMINI', 'GROQ', 'FALLBACK_DETERMINISTIC');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammars" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "GrammarType" NOT NULL,
    "definition_json" JSONB NOT NULL,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "grammar_id" UUID NOT NULL,
    "mode" "ExerciseMode" NOT NULL,
    "difficulty" "ExerciseDifficulty" NOT NULL,
    "prompt" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "expected_json" JSONB NOT NULL,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_attempts" (
    "id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "user_id" UUID,
    "session_key" TEXT,
    "submitted_answer_json" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "diagnostic_json" JSONB NOT NULL,
    "hints_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" UUID NOT NULL,
    "exercise_id" UUID,
    "attempt_id" UUID,
    "user_id" UUID,
    "session_key" TEXT,
    "interaction_type" "AiInteractionType" NOT NULL,
    "user_message" TEXT NOT NULL,
    "assistant_response" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "grammars_owner_id_idx" ON "grammars"("owner_id");

-- CreateIndex
CREATE INDEX "grammars_type_is_template_is_public_idx" ON "grammars"("type", "is_template", "is_public");

-- CreateIndex
CREATE INDEX "exercises_grammar_id_idx" ON "exercises"("grammar_id");

-- CreateIndex
CREATE INDEX "exercises_mode_difficulty_idx" ON "exercises"("mode", "difficulty");

-- CreateIndex
CREATE INDEX "exercise_attempts_exercise_id_idx" ON "exercise_attempts"("exercise_id");

-- CreateIndex
CREATE INDEX "exercise_attempts_user_id_created_at_idx" ON "exercise_attempts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "exercise_attempts_session_key_created_at_idx" ON "exercise_attempts"("session_key", "created_at");

-- CreateIndex
CREATE INDEX "ai_interactions_exercise_id_idx" ON "ai_interactions"("exercise_id");

-- CreateIndex
CREATE INDEX "ai_interactions_user_id_created_at_idx" ON "ai_interactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_interactions_session_key_created_at_idx" ON "ai_interactions"("session_key", "created_at");

-- AddForeignKey
ALTER TABLE "grammars" ADD CONSTRAINT "grammars_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_grammar_id_fkey" FOREIGN KEY ("grammar_id") REFERENCES "grammars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exercise_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
