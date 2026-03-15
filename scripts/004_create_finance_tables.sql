-- Invoicing and Finance Tables
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  invoice_date TIMESTAMP DEFAULT now(),
  due_date TIMESTAMP,
  subtotal DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  shipping_cost DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled')),
  payment_terms TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT now(),
  payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'other')),
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date TIMESTAMP DEFAULT now(),
  entry_type TEXT CHECK (entry_type IN ('invoice', 'payment', 'expense', 'adjustment')),
  amount DECIMAL(15, 2),
  description TEXT,
  related_invoice_id UUID REFERENCES public.invoices(id),
  related_payment_id UUID REFERENCES public.payments(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date TIMESTAMP DEFAULT now(),
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2),
  receipt_url TEXT,
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_read" ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'sales_manager', 'finance_manager')
      )
    )
  );

CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'finance_manager')
      )
    ) AND created_by = auth.uid()
  );

CREATE POLICY "payments_read" ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'finance_manager')
      )
    )
  );

CREATE POLICY "ledger_read" ON public.ledger_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'finance_manager')
      )
    )
  );

CREATE POLICY "expenses_read" ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'finance_manager')
      )
    ) OR submitted_by = auth.uid()
  );
