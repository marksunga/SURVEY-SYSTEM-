-- ==============================================================================
-- MIGRATION: Separate Administrator and Student Account Management
-- Strict role boundary enforcement, immutable roles, and account isolation
-- ==============================================================================

-- 1. Function to forbid changes to role_id once assigned
CREATE OR REPLACE FUNCTION public.prevent_role_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role_id IS NOT NULL AND NEW.role_id <> OLD.role_id THEN
        RAISE EXCEPTION 'Role modification is strictly prohibited. Account roles are permanent.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach trigger to profiles table
DROP TRIGGER IF EXISTS trg_prevent_role_modification ON public.profiles;
CREATE TRIGGER trg_prevent_role_modification
BEFORE UPDATE OF role_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_modification();

-- 3. Update RLS policies for profiles:
-- Prevent students from accessing administrator account records
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Role isolated profile reading"
ON public.profiles FOR SELECT TO authenticated
USING (
    -- Administrators can read all user profiles
    public.get_current_role() = 'ADMINISTRATOR'
    -- Students can only read their own profile or fellow student profiles, NEVER administrator profiles
    OR (public.get_current_role() = 'STUDENT' AND role_id = 'STUDENT')
    OR (auth.uid() = id)
);

-- 4. Users can only update their own non-role profile fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own non-role fields"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id
    AND (role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid()))
);

-- 5. Only Administrators can insert or delete accounts via admin management
DROP POLICY IF EXISTS "Admins have full profile control" ON public.profiles;
CREATE POLICY "Admins have account management control"
ON public.profiles FOR ALL TO authenticated
USING (public.get_current_role() = 'ADMINISTRATOR')
WITH CHECK (public.get_current_role() = 'ADMINISTRATOR');

