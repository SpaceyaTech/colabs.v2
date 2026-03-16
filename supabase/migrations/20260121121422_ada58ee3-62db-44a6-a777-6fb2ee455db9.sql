-- Add policy for project creators to view proposals submitted to their projects
CREATE POLICY "Project creators can view proposals for their projects"
ON public.proposals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id::text = proposals.project_id
    AND projects.creator_id = auth.uid()
  )
);