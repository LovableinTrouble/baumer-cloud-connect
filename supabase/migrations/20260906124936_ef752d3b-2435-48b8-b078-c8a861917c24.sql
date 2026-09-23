REVOKE ALL ON FUNCTION public.enforce_viewer_profile_limit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_viewer_profile_limit() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_viewer_profile_limit() FROM authenticated;