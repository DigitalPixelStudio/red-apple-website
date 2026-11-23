-- Restrict the server-only service role to the two operations required by the website API.
revoke all on table public.website_leads from service_role;
grant select, insert on table public.website_leads to service_role;