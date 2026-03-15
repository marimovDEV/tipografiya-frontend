-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles and permissions table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert predefined roles
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('sales_manager', 'Manage customers, quotes, orders'),
  ('production_manager', 'Manage production, workorders'),
  ('warehouse_manager', 'Manage inventory, stock'),
  ('operator_print', 'Execute print operations'),
  ('operator_cutting', 'Execute cutting operations'),
  ('operator_packing', 'Execute packing operations'),
  ('quality_controller', 'Quality control and testing'),
  ('finance_manager', 'Invoicing, payments, ledger'),
  ('shop_floor_supervisor', 'Oversee shop floor operations'),
  ('customer_service', 'Customer support and inquiries')
ON CONFLICT (name) DO NOTHING;

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role_id UUID REFERENCES public.roles(id),
  is_active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en', -- en, uz, ru
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Companies/Organizations
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  registration_number TEXT UNIQUE,
  tax_id TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  founded_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('individual', 'business', 'wholesale')),
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  tax_id TEXT,
  credit_limit DECIMAL(15, 2),
  payment_terms TEXT DEFAULT 'cash',
  currency TEXT DEFAULT 'UZS',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Contact persons for customers
CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Materials/Supplies
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL, -- kg, m, sheet, etc
  description TEXT,
  unit_cost DECIMAL(15, 4),
  supplier_code TEXT,
  reorder_level INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Stock/Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id),
  warehouse_location TEXT,
  quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
  reserved_quantity DECIMAL(15, 4) DEFAULT 0,
  available_quantity DECIMAL(15, 4) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  last_counted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

-- Products/Services offered
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  unit_price DECIMAL(15, 2),
  currency TEXT DEFAULT 'UZS',
  unit TEXT NOT NULL,
  is_service BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  quote_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  quote_date TIMESTAMP DEFAULT now(),
  valid_until TIMESTAMP,
  subtotal DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'UZS',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Quote line items
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity DECIMAL(15, 2),
  unit_price DECIMAL(15, 2),
  line_total DECIMAL(15, 2),
  sort_order INT
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  quote_id UUID REFERENCES public.quotes(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'production', 'ready', 'shipped', 'delivered', 'cancelled')),
  order_date TIMESTAMP DEFAULT now(),
  required_date TIMESTAMP,
  shipped_date TIMESTAMP,
  subtotal DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'UZS',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Order line items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity DECIMAL(15, 2),
  unit_price DECIMAL(15, 2),
  line_total DECIMAL(15, 2),
  sort_order INT
);

-- WorkOrders for production
CREATE TABLE IF NOT EXISTS public.workorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  workorder_number TEXT UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'paused', 'completed', 'rejected')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  estimated_hours INT,
  actual_hours INT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- WorkOrder operations/stages
CREATE TABLE IF NOT EXISTS public.workorder_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workorder_id UUID NOT NULL REFERENCES public.workorders(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL, -- 'cutting', 'printing', 'packing'
  operation_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  assigned_to UUID REFERENCES auth.users(id),
  material_id UUID REFERENCES public.materials(id),
  material_quantity DECIMAL(15, 4),
  notes TEXT,
  sort_order INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workorder_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_view_own" ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for roles (public read, admin only modify)
CREATE POLICY "roles_read_all" ON public.roles FOR SELECT
  USING (true);

-- RLS Policies for companies (users can see their own company)
CREATE POLICY "companies_select" ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles WHERE name = 'admin'
      )
    )
  );

-- RLS Policies for customers (company level access)
CREATE POLICY "customers_select" ON public.customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'sales_manager', 'customer_service')
      )
    )
  );

CREATE POLICY "customers_insert" ON public.customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'sales_manager')
      )
    )
  );

-- RLS for orders (sales and relevant staff)
CREATE POLICY "orders_select" ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'sales_manager', 'production_manager', 'finance_manager')
      )
    )
  );

CREATE POLICY "orders_insert" ON public.orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'sales_manager')
      )
    ) AND created_by = auth.uid()
  );
