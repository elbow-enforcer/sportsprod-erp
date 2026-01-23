/**
 * @file drizzle.config.ts
 * @description Drizzle Kit configuration for migrations
 * @related-prd Issue #29 - Database Schema Setup
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './sportsprod.db',
  },
  verbose: true,
  strict: true,
});
