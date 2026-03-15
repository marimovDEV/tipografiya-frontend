-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users & Roles)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'project_manager', 'warehouse', 'cutter', 'printer', 'finishing', 'qc', 'accountant')) default 'project_manager',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLIENTS
create table clients (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  company text,
  phone text,
  email text,
  address text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MATERIALS (Inventory)
create table materials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text, -- e.g., 'paper', 'ink', 'glue'
  unit text, -- e.g., 'kg', 'sheet', 'liter'
  current_stock numeric default 0,
  min_stock numeric default 10,
  price_per_unit numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS (Catalog - Optional, but good for recurring orders)
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  box_type text,
  -- default specs
  default_dimensions jsonb, -- {length, width, height}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS
create type order_status as enum ('pending', 'approved', 'in_production', 'completed', 'rejected');

create table orders (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) not null,
  order_number serial, -- Human readable ID like 1001
  status order_status default 'pending',
  
  -- Specifications
  box_type text,
  dimensions jsonb, -- {length, width, height}
  paper_type text,
  paper_density numeric,
  print_colors integer,
  print_type text,
  lacquer_type text,
  cutting_type text,
  additional_processing text,
  
  quantity integer not null,
  price_per_unit numeric,
  total_price numeric,
  deadline timestamp with time zone,
  
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTION STEPS
create type production_step_type as enum ('warehouse', 'cutting', 'printing', 'finishing', 'assembly', 'qc');
create type step_status as enum ('pending', 'in_progress', 'completed');

create table production_steps (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  step production_step_type not null,
  status step_status default 'pending',
  assigned_to uuid references profiles(id),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVOICES
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) not null,
  amount numeric not null,
  status text default 'unpaid', -- paid, unpaid, partial
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Simple version for now)
alter table profiles enable row level security;
alter table clients enable row level security;
alter table materials enable row level security;
alter table orders enable row level security;
alter table production_steps enable row level security;

-- Allow authenticated users to do everything for now (can be restricted later)
create policy "Allow all operations for authenticated users on profiles" on profiles for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on clients" on clients for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on materials" on materials for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on orders" on orders for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on production_steps" on production_steps for all using (auth.role() = 'authenticated');

-- Trigger to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'project_manager');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on multiple runs (optional but safer)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
