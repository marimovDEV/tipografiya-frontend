-- Insert default roles
INSERT INTO public.roles (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Admin', 'System administrator with full access'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sales Manager', 'Manages customers, quotes, and orders'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Production Manager', 'Manages production workflows'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Production Operator', 'Executes production operations'),
  ('550e8400-e29b-41d4-a716-446655440005', 'QC Inspector', 'Quality control and inspection'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Finance Manager', 'Manages invoicing and payments'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Warehouse Manager', 'Manages inventory and stock'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Sales Rep', 'Creates quotes and manages customer inquiries'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Customer', 'External customer portal access'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Account Manager', 'Manages multiple customer accounts'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Supervisor', 'Supervises operations and staff')
ON CONFLICT DO NOTHING;

-- Create test company
INSERT INTO public.companies (id, name, email, phone, website, address, city, country, registration_number, tax_id, founded_at, is_active, created_by, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655550001', 'PrintERP Test Company', 'test@printrp.local', '+998 (90) 123-45-67', 'https://printrp.local', '123 Main Street', 'Tashkent', 'Uzbekistan', 'REG-001', 'TAX-001', NOW(), true, NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Note: To create the actual test user in Supabase Auth, use the Supabase dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Invite"
-- 3. Enter: admin@printrp.local
-- 4. Set a strong password (or use the one provided)
-- 
-- After the user is created in Auth, their profile will be auto-created via trigger.
-- Then manually update their role:

UPDATE public.profiles 
SET role_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE email = 'admin@printrp.local';
