/**
 * @file index.ts
 * @description Database connection and query interface
 * @related-prd Issue #29 - Database Schema Setup
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Database file path - can be configured via env
const DB_PATH = process.env.DATABASE_URL || './sportsprod.db';

// Create SQLite database connection
const sqlite = new Database(DB_PATH);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from './schema';

// Export the raw sqlite connection for migrations
export { sqlite };
