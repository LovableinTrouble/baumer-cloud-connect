import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ViewerProfile {
  id: string;
  user_id: string;
  name: string;
  avatar: string | null;
  color: string | null;
  pin: string | null;
  is_kids: boolean;
  created_at: string;
}

export const MAX_PROFILES = 4;

const ACTIVE_KEY = "sleepy.activeProfile";
const listeners = new Set<() => void>();

export interface ActiveProfile {
  id: string;
  name: string;
  avatar: string | null;
  isKids: boolean;
  userId: string;
}

export function getActiveProfile(): ActiveProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ActiveProfile>;
    if (typeof value.id !== "string" || typeof value.userId !== "string" || typeof value.name !== "string") {
      localStorage.removeItem(ACTIVE_KEY);
      return null;
    }
    return { id: value.id, name: value.name, avatar: value.avatar ?? null, isKids: Boolean(value.isKids), userId: value.userId };
  } catch {
    return null;
  }
}

export function setActiveProfile(p: ActiveProfile | null) {
  try {
    if (p) localStorage.setItem(ACTIVE_KEY, JSON.stringify(p));
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* no-op */
  }
  listeners.forEach((l) => l());
}

/** Subscribes a component to the currently selected viewing profile. */
export function useActiveProfile(): [ActiveProfile | null, (p: ActiveProfile | null) => void] {
  const [p, setP] = useState<ActiveProfile | null>(null);
  useEffect(() => {
    setP(getActiveProfile());
    const l = () => setP(getActiveProfile());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [p, setActiveProfile];
}

export async function listProfiles(userId: string): Promise<ViewerProfile[]> {
  const { data, error } = await supabase
    .from("viewer_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ViewerProfile[];
}

export async function createProfile(
  userId: string,
  input: { name: string; avatar?: string | null; pin?: string | null; is_kids?: boolean },
): Promise<ViewerProfile> {
  const { data, error } = await supabase
    .from("viewer_profiles")
    .insert({
      user_id: userId,
      name: input.name.trim().slice(0, 24) || "Profile",
      avatar: input.avatar ?? null,
      pin: input.pin?.trim() || null,
      is_kids: input.is_kids ?? false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as ViewerProfile;
}

export async function updateProfile(
  id: string,
  patch: { name?: string; avatar?: string | null; pin?: string | null; is_kids?: boolean },
) {
  const { error } = await supabase.from("viewer_profiles").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProfile(id: string) {
  const { error } = await supabase.from("viewer_profiles").delete().eq("id", id);
  if (error) throw error;
  const active = getActiveProfile();
  if (active?.id === id) setActiveProfile(null);
}
