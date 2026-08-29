'use client';

import { createClient } from '@/lib/supabase/client';

export const authService = {
  signInWithOAuth(redirectTo: string) {
    return createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
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
