-- =====================================================================
--  Security hardening flagged by the Supabase advisor after 0001_init.
-- =====================================================================

-- Pin search_path on the trigger helper (linter: function_search_path_mutable).
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- handle_new_user is only ever invoked by the auth.users trigger; it must not
-- be reachable through /rest/v1/rpc.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
