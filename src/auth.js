/* Customer auth — Supabase Auth (email + password) + customers profile row. */
import { supabase } from './supabase.js'

export async function signUp({ email, password, fullName, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, phone } },
  })
  if (error) return { ok: false, error: error.message }

  // Insert profile row (id = auth user id). If the user already exists from prior signup, skip silently.
  if (data.user) {
    const { error: pErr } = await supabase.from('customers').upsert({
      id: data.user.id,
      email,
      full_name: fullName || '',
      phone: phone || '',
    }, { onConflict: 'id' })
    if (pErr) console.warn('customers profile insert failed:', pErr.message)
  }
  return { ok: true, user: data.user, needsConfirm: !data.session }
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: error.message }
  return { ok: true, user: data.user, session: data.session }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session?.user || null))
  return () => data?.subscription?.unsubscribe?.()
}

export async function getProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) return null
  return data
}

export async function updateProfile(userId, patch) {
  const { error } = await supabase
    .from('customers')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function isAdmin(userId) {
  if (!userId) return false
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  if (error) return false
  return !!data
}

export async function listCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw error
  return data || []
}
