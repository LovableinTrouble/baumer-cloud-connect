"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Plus, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "@/components/UserAvatar";
import { AVATAR_PRESETS, presetValue } from "@/lib/avatars";
import {
  MAX_PROFILES,
  createProfile,
  getActiveProfile,
  listProfiles,
  setActiveProfile,
  type ViewerProfile,
} from "@/lib/profiles";

const SESSION_KEY = "sleepy.profileGateShown";

function seenThisSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* no-op */
  }
}

function toActive(profile: ViewerProfile) {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    isKids: profile.is_kids,
    userId: profile.user_id,
  };
}

export function ProfileGate() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ViewerProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [pinFor, setPinFor] = useState<ViewerProfile | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(presetValue(AVATAR_PRESETS[0]!.id));
  const [newPin, setNewPin] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const uid = data.session?.user?.id ?? null;
        if (!alive || !uid) return;
        setUserId(uid);
        try {
          const rows = await listProfiles(uid);
          if (!alive) return;
          setProfiles(rows);
          // Ask "Who's watching?" once per browser session whenever the
          // account has profiles; otherwise offer to create the first one.
          if (rows.length === 0) {
            if (!seenThisSession()) {
              setCreating(true);
              setOpen(true);
            }
            return;
          }
          if (seenThisSession()) {
            const active = getActiveProfile();
            if (active && active.userId === uid && rows.some((row) => row.id === active.id)) return;
          }
          setOpen(true);
        } catch {
          if (alive) setProfiles([]);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Lock background scrolling while the gate is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !userId) return null;

  const dismiss = () => {
    markSeen();
    setOpen(false);
  };
  const commit = (profile: ViewerProfile) => {
    setActiveProfile(toActive(profile));
    dismiss();
  };
  const choose = (profile: ViewerProfile) =>
    profile.pin ? (setPinFor(profile), setPin(""), setPinError(false)) : commit(profile);
  const submitPin = () => {
    if (!pinFor) return;
    if (pin === pinFor.pin) {
      commit(pinFor);
      setPinFor(null);
    } else setPinError(true);
  };
  const addProfile = async () => {
    if (!newName.trim() || busy || profiles.length >= MAX_PROFILES) return;
    setBusy(true);
    try {
      const profile = await createProfile(userId, {
        name: newName,
        avatar: newAvatar,
        pin: newPin.length === 4 ? newPin : null,
      });
      setProfiles((current) => [...current, profile]);
      setCreating(false);
      setNewName("");
      setNewPin("");
      commit(profile);
    } finally {
      setBusy(false);
    }
  };

  const heading = pinFor
    ? `Enter ${pinFor.name}'s PIN`
    : creating
      ? profiles.length
        ? "Add a profile"
        : "Create your profile"
      : "Who's watching?";
  const subheading = pinFor
    ? "This profile is protected by a 4-digit PIN."
    : creating
      ? "A separate space for recommendations and watch progress."
      : "Pick a profile to pick up where you left off.";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 backdrop-blur-2xl sm:items-center sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-gate-title"
        className="liquid-glass flex max-h-[94dvh] w-full max-w-3xl animate-fade-in flex-col overflow-hidden rounded-t-[1.75rem] sm:max-h-[min(760px,calc(100dvh-2.5rem))] sm:rounded-[2rem]"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-foreground/10 px-4 py-4 sm:px-8 sm:py-6">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Sleepy profiles</p>
            <h1 id="profile-gate-title" className="mt-1.5 text-xl font-black tracking-tight sm:text-3xl">
              {heading}
            </h1>
            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground sm:text-sm">{subheading}</p>
          </div>
          {!pinFor && profiles.length > 0 && (
            <button
              onClick={dismiss}
              className="liquid-icon grid size-9 shrink-0 place-items-center rounded-full"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-7">
          {pinFor ? (
            <div className="mx-auto flex max-w-xs flex-col items-center text-center">
              <UserAvatar
                value={pinFor.avatar}
                seed={pinFor.name}
                className="size-24 text-6xl sm:size-28 sm:text-7xl"
              />
              <Lock className="mt-5 size-5 text-primary" />
              <input
                autoFocus
                value={pin}
                inputMode="numeric"
                maxLength={4}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setPinError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) submitPin();
                }}
                className={`liquid-glass mt-4 h-14 w-full rounded-2xl bg-transparent text-center text-2xl font-black tracking-[0.5em] outline-none ${pinError ? "ring-2 ring-destructive" : ""}`}
                aria-label="Profile PIN"
                placeholder="••••"
              />
              {pinError && <p className="mt-2 text-sm text-destructive">That PIN doesn&apos;t match.</p>}
            </div>
          ) : creating ? (
            <div className="mx-auto max-w-2xl">
              <label
                className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                htmlFor="new-profile-name"
              >
                Profile name
              </label>
              <input
                id="new-profile-name"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value.slice(0, 24))}
                placeholder="Enter a name"
                className="liquid-glass mt-2 h-12 w-full rounded-2xl bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
              />

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Choose a picture
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2 min-[380px]:grid-cols-5 sm:grid-cols-6 sm:gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const value = presetValue(preset.id);
                  const selected = newAvatar === value;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewAvatar(value)}
                      aria-label={preset.label}
                      aria-pressed={selected}
                      className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl p-1.5 transition ${selected ? "bg-primary/10" : "hover:bg-foreground/[0.06]"}`}
                    >
                      <span
                        className={`rounded-full ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      >
                        <UserAvatar value={value} className="size-12 text-5xl sm:size-14 sm:text-6xl" />
                      </span>
                      <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label
                className="mt-5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                htmlFor="new-profile-pin"
              >
                PIN <span className="normal-case tracking-normal opacity-70">(optional)</span>
              </label>
              <input
                id="new-profile-pin"
                value={newPin}
                inputMode="numeric"
                maxLength={4}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="4 digits"
                className="liquid-glass mt-2 h-12 w-full rounded-2xl bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          ) : (
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:gap-5 md:grid-cols-4">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => choose(profile)}
                  className="group flex min-w-0 flex-col items-center gap-2.5 rounded-2xl p-2 text-center transition hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:gap-3 sm:p-3"
                >
                  <UserAvatar
                    value={profile.avatar}
                    seed={profile.name}
                    className="size-20 text-6xl ring-1 ring-foreground/10 transition group-hover:ring-primary min-[420px]:size-24 min-[420px]:text-7xl sm:size-28 sm:text-8xl"
                  />
                  <span className="flex max-w-full items-center gap-1 truncate text-[13px] font-bold sm:text-base">
                    {profile.name}
                    {profile.pin && <Lock className="size-3 shrink-0 text-muted-foreground" />}
                  </span>
                  {profile.is_kids && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Kids</span>
                  )}
                </button>
              ))}
              {profiles.length < MAX_PROFILES && (
                <button
                  onClick={() => setCreating(true)}
                  className="flex min-h-32 flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-foreground/20 p-2 text-center text-muted-foreground transition hover:border-primary hover:text-primary sm:min-h-40 sm:gap-3"
                >
                  <span className="grid size-12 place-items-center rounded-full border border-current sm:size-14">
                    <Plus className="size-5" />
                  </span>
                  <span className="text-[13px] font-bold sm:text-sm">Add profile</span>
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 gap-2.5 border-t border-foreground/10 px-4 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:gap-3 sm:px-8 sm:py-4">
          <button
            onClick={() => (pinFor ? setPinFor(null) : creating && profiles.length ? setCreating(false) : dismiss())}
            disabled={busy}
            className="liquid-icon h-12 flex-1 rounded-2xl text-sm font-bold"
          >
            {pinFor ? (
              <>
                <ArrowLeft className="mr-2 inline size-4" />
                Back
              </>
            ) : (
              "Cancel"
            )}
          </button>
          {pinFor ? (
            <button
              onClick={submitPin}
              disabled={pin.length !== 4}
              className="liquid-pill h-12 flex-1 rounded-2xl text-sm font-bold disabled:opacity-50"
            >
              Continue
            </button>
          ) : creating ? (
            <button
              onClick={addProfile}
              disabled={busy || !newName.trim()}
              className="liquid-pill h-12 flex-1 rounded-2xl text-sm font-bold disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create profile"}
            </button>
          ) : (
            <div className="hidden flex-1 items-center justify-end gap-2 text-xs text-muted-foreground sm:flex">
              <ShieldCheck className="size-4 text-primary" />
              Private spaces
            </div>
          )}
        </footer>
      </section>
    </div>
  );
}
