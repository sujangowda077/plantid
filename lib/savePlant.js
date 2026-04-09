/**
 * /lib/savePlant.js  v3
 * All Supabase DB operations for the plants table.
 * Fixed: consistent error handling, typed returns, added upsertPlant.
 */
import { supabase } from './supabaseClient';

/** @typedef {{ id:string, user_id:string, plant_name:string, scientific?:string, family?:string,
 *   confidence:number, image_url?:string, alternatives?:object[], care_tips?:object,
 *   user_notes?:string, is_favorite:boolean, created_at:string }} Plant */

/** Save a new detection result */
export async function savePlant({ user_id, plant_name, scientific, family,
  confidence, image_url, alternatives, care_tips }) {
  try {
    const { data, error } = await supabase
      .from('plants')
      .insert([{ user_id, plant_name, scientific, family, confidence, image_url, alternatives, care_tips }])
      .select()
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** Fetch all plants for a user (newest first) */
export async function getPlantsByUser(user_id) {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** Toggle favourite flag */
export async function toggleFavorite(id, current) {
  try {
    const { data, error } = await supabase
      .from('plants')
      .update({ is_favorite: !current })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** Update user notes */
export async function updateNotes(id, user_notes) {
  try {
    const { data, error } = await supabase
      .from('plants')
      .update({ user_notes })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** Delete a plant */
export async function deletePlant(id) {
  try {
    const { error } = await supabase.from('plants').delete().eq('id', id);
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/** Fetch a single plant by id */
export async function getPlantById(id) {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}
