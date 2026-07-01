
-- 1) Storage: add UPDATE policy for scan-images bucket, mirroring INSERT
CREATE POLICY "scan_images_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'scan-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'scan-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2) support_tickets: require auth for inserts, allow owners to update/delete
DROP POLICY IF EXISTS ticket_insert_self_or_anon ON public.support_tickets;

CREATE POLICY ticket_insert_authenticated
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY ticket_update_own
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY ticket_delete_own
ON public.support_tickets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enforce non-null user_id going forward
ALTER TABLE public.support_tickets ALTER COLUMN user_id SET NOT NULL;
