'use client';

import { trustedSupabaseOAuthNavigationUrl } from '@/lib/oauth-navigation';
import { createClient } from '@/lib/supabase/client';

export const authService = {
  async signInWithOAuth(redirectTo: string) {
    const result = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
    if (result.error) return result;
    return {
      ...result,
      data: {
        ...result.data,
        url: trustedSupabaseOAuthNavigationUrl(result.data.url, process.env.NEXT_PUBLIC_SUPABASE_URL),
      },
    };
  },
  signInWithPassword(email: string, password: string) {
    return createClient().auth.signInWithPassword({ email, password });
  },
  signUp(email: string, password: string, emailRedirectTo: string, data?: Record<string, unknown>) {
    return createClient().auth.signUp({ email, password, options: { emailRedirectTo, data } });
  },
  resetPasswordForEmail(email: string, redirectTo: string) {
    return createClient().auth.resetPasswordForEmail(email, { redirectTo });
  },
  updatePassword(password: string) {
    return createClient().auth.updateUser({ password });
  },
  updateMetadata(data: Record<string, unknown>) {
    return createClient().auth.updateUser({ data });
  },
  signOut() {
    return createClient().auth.signOut();
  },
  onAuthStateChange(onEvent: (event: string) => void) {
    const { data: { subscription } } = createClient().auth.onAuthStateChange(event => onEvent(event));
    return () => subscription.unsubscribe();
  },
};
