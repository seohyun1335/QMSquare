-- This script will seed some sample data after users sign up and confirm their email
-- Note: This is just an example structure. Actual data will be created by users.

-- Add document types as a reference
COMMENT ON COLUMN public.documents.document_type IS 'Types: SOP, Work Instruction, Quality Manual, Form, Policy, Procedure, Record';
COMMENT ON COLUMN public.documents.status IS 'Status: draft, review, approved, archived, obsolete';

-- Add quality record types as a reference
COMMENT ON COLUMN public.quality_records.record_type IS 'Types: CAPA, Deviation, Change Control, Audit, Complaint, Risk Assessment';
COMMENT ON COLUMN public.quality_records.status IS 'Status: open, in_progress, resolved, closed';
COMMENT ON COLUMN public.quality_records.priority IS 'Priority: low, medium, high, critical';
