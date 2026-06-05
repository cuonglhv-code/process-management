-- RLS Policies for Jaxtina Process Library
-- Run these in the Supabase SQL Editor after running Prisma migrations.

-- Enable RLS on all tables
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Process" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Step" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StepEdge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Form" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

-- Authenticated users can view profiles
CREATE POLICY "profiles_select_authenticated" ON "Profile"
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert profiles (triggered by invite)
CREATE POLICY "profiles_insert_admin" ON "Profile"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM "Profile" WHERE role = 'admin'
    )
  );

-- Only admins can update profiles (role assignment)
CREATE POLICY "profiles_update_admin" ON "Profile"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM "Profile" WHERE role = 'admin'
    )
  );

-- ============================================================
-- PROCESSES
-- ============================================================

-- Staff can view published processes or processes they own
CREATE POLICY "processes_select_staff" ON "Process"
  FOR SELECT
  TO authenticated
  USING (
    published = true
    OR ownerId = auth.uid()
    OR auth.uid() IN (
      SELECT id FROM "Profile" WHERE role IN ('admin', 'owner')
    )
  );

-- Owner and admin can insert
CREATE POLICY "processes_insert_owner_admin" ON "Process"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM "Profile" WHERE role IN ('admin', 'owner')
    )
  );

-- Owner can update their own; admin can update any
CREATE POLICY "processes_update_owner_admin" ON "Process"
  FOR UPDATE
  TO authenticated
  USING (
    ownerId = auth.uid()
    OR auth.uid() IN (
      SELECT id FROM "Profile" WHERE role = 'admin'
    )
  );

-- Only admin can delete
CREATE POLICY "processes_delete_admin" ON "Process"
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM "Profile" WHERE role = 'admin'
    )
  );

-- ============================================================
-- STEPS (inherit from parent process)
-- ============================================================

CREATE POLICY "steps_select" ON "Step"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Process"
      WHERE "Process".id = "Step"."processId"
      AND (
        "Process".published = true
        OR "Process".ownerId = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM "Profile" WHERE role IN ('admin', 'owner')
        )
      )
    )
  );

CREATE POLICY "steps_insert_update_delete" ON "Step"
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Process"
      WHERE "Process".id = "Step"."processId"
      AND (
        "Process".ownerId = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM "Profile" WHERE role = 'admin'
        )
      )
    )
  );

-- ============================================================
-- STEP EDGES (inherit from parent process via step)
-- ============================================================

CREATE POLICY "edges_select" ON "StepEdge"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Step"
      JOIN "Process" ON "Process".id = "Step"."processId"
      WHERE "Step".id = "StepEdge"."sourceId"
      AND (
        "Process".published = true
        OR "Process".ownerId = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM "Profile" WHERE role IN ('admin', 'owner')
        )
      )
    )
  );

CREATE POLICY "edges_insert_update_delete" ON "StepEdge"
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Step"
      JOIN "Process" ON "Process".id = "Step"."processId"
      WHERE "Step".id = "StepEdge"."sourceId"
      AND (
        "Process".ownerId = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM "Profile" WHERE role = 'admin'
        )
      )
    )
  );

-- ============================================================
-- FORMS (inherit from parent process via step)
-- ============================================================

CREATE POLICY "forms_select" ON "Form"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Step"
      JOIN "Process" ON "Process".id = "Step"."processId"
      WHERE "Step".id = "Form"."stepId"
      AND (
        "Process".published = true
        OR "Process".ownerId = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM "Profile" WHERE role IN ('admin', 'owner')
        )
      )
    )
  );

CREATE POLICY "forms_insert_update_delete" ON "Form"
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Step"
      JOIN "Process" ON "Process".id = "Step"."processId"
      WHERE "Step".id = "Form"."stepId"
      AND (
        "Process".ownerId = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM "Profile" WHERE role = 'admin'
        )
      )
    )
  );
