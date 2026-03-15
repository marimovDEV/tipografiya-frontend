-- Create a default company for test users
INSERT INTO public.companies (name, registration_number, email)
VALUES ('Test Company', 'TEST-001', 'test@printrp.local')
ON CONFLICT DO NOTHING;

-- Helper function to create test user
CREATE OR REPLACE FUNCTION create_test_user(p_username TEXT, p_password TEXT, p_role_name TEXT) 
RETURNS TABLE(user_id UUID, username TEXT, role TEXT) AS $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  -- Get role ID
  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  
  -- For demo purposes: create user with email format
  -- In production, you'd use Supabase Auth Admin API
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_app_meta_data)
  VALUES (
    p_username || '@printrp.local',
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('role', p_role_name)
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt(p_password, gen_salt('bf'))
  RETURNING id INTO v_user_id;

  -- Create profile
  INSERT INTO public.profiles (id, email, first_name, role_id, is_active)
  VALUES (
    v_user_id,
    p_username || '@printrp.local',
    INITCAP(p_username),
    v_role_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role_id = v_role_id,
    is_active = true;

  RETURN QUERY SELECT v_user_id, p_username, p_role_name;
END;
$$ LANGUAGE plpgsql;

-- Create test users for each role
SELECT * FROM create_test_user('admin', 'admin', 'admin');
SELECT * FROM create_test_user('sales', 'sales', 'sales_manager');
SELECT * FROM create_test_user('production', 'production', 'production_manager');
SELECT * FROM create_test_user('warehouse', 'warehouse', 'warehouse_manager');
SELECT * FROM create_test_user('quality', 'quality', 'quality_controller');
SELECT * FROM create_test_user('finance', 'finance', 'finance_manager');
SELECT * FROM create_test_user('operator', 'operator', 'operator_print');
SELECT * FROM create_test_user('shop_floor', 'shop_floor', 'shop_floor_supervisor');
SELECT * FROM create_test_user('customer_service', 'customer_service', 'customer_service');
