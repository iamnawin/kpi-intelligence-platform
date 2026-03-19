CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE trust_level AS ENUM (
  'draft',
  'self_reported',
  'imported',
  'reviewer_approved',
  'system_verified',
  'locked_proof'
);

CREATE TYPE workspace_role AS ENUM ('employee', 'manager', 'executive', 'admin');
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'at_risk', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done', 'cancelled');
