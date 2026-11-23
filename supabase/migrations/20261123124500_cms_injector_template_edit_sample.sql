begin;

-- Keep catalog writes behind the authenticated Super Admin Edge Function.
grant update (name, kind, source) on public.cms_code_templates to service_role;

-- A starter card for existing Super Admin workspaces with no saved templates.
-- It is a normal, editable saved template; never inject it automatically.
insert into public.cms_code_templates (user_id, name, kind, source)
select r.user_id, 'Sample SEO Metadata', 'html',
  E'<meta name="description" content="{{DESCRIPTION}}">\n<meta property="og:title" content="{{OG_TITLE}}">'
from public.cms_user_roles r
where r.role = 'super_admin'
  and not exists (select 1 from public.cms_code_templates t where t.user_id = r.user_id)
on conflict do nothing;

commit;
