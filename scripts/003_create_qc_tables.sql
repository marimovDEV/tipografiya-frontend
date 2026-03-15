-- Quality Control & Defect Tables
CREATE TABLE IF NOT EXISTS public.qc_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workorder_id UUID NOT NULL REFERENCES public.workorders(id) ON DELETE CASCADE,
  operation_id UUID REFERENCES public.workorder_operations(id),
  inspector_id UUID NOT NULL REFERENCES auth.users(id),
  inspection_date TIMESTAMP DEFAULT now(),
  status TEXT CHECK (status IN ('pass', 'fail', 'rework_required')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.qc_inspections(id) ON DELETE CASCADE,
  defect_type TEXT NOT NULL,
  defect_category TEXT CHECK (defect_category IN ('critical', 'major', 'minor')),
  location TEXT,
  description TEXT,
  photos_url TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'rework_in_progress', 'resolved', 'rejected')),
  root_cause TEXT,
  corrective_action TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qc_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE public.qc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qc_inspections_read" ON public.qc_inspections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'quality_controller', 'production_manager')
      )
    )
  );

CREATE POLICY "qc_inspections_insert" ON public.qc_inspections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'quality_controller')
      )
    ) AND inspector_id = auth.uid()
  );

CREATE POLICY "defects_read" ON public.defects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id IN (
        SELECT id FROM public.roles 
        WHERE name IN ('admin', 'quality_controller', 'production_manager')
      )
    )
  );

CREATE POLICY "qc_standards_read" ON public.qc_standards FOR SELECT USING (true);
