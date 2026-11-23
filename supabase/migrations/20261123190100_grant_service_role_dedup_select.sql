-- Allow the server-only service role to inspect conversion_event_id
-- and distinguish a new insert from a deduplicated retry. No public access.
grant select on table public.website_leads to service_role;