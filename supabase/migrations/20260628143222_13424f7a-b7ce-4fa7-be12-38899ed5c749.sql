
DROP POLICY IF EXISTS "ticket_insert_any" ON public.support_tickets;
CREATE POLICY "ticket_insert_self_or_anon" ON public.support_tickets
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
