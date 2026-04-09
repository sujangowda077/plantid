/**
 * /lib/getUser.js
 * Returns the current Supabase user or null.
 */
import { supabase } from './supabaseClient';

export async function getUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}
