-- Block all INSERT operations on payments (only backend can insert via service role)
CREATE POLICY "No user inserts on payments"
ON public.payments
FOR INSERT
WITH CHECK (false);

-- Block all UPDATE operations on payments
CREATE POLICY "No user updates on payments"
ON public.payments
FOR UPDATE
USING (false);

-- Block all DELETE operations on payments
CREATE POLICY "No user deletes on payments"
ON public.payments
FOR DELETE
USING (false);