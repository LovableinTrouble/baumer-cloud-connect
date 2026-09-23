"use client";

import { useState } from "react";
import { Check, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { createProfile, updateProfile, type ViewerProfile } from "@/lib/profiles";
import { AVATAR_PRESETS, presetValue } from "@/lib/avatars";
import { UserAvatar } from "@/components/UserAvatar";

interface Props {
  userId: string;
  profile?: ViewerProfile;
  onClose: () => void;
  onSave: (profile?: ViewerProfile) => Promise<void> | void;
}

export function ProfilePicker({ userId, profile, onClose, onSave }: Props) {
  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar ?? presetValue(AVATAR_PRESETS[0]!.id));
  const [pin, setPin] = useState(profile?.pin ?? "");
  const [isKids, setIsKids] = useState(profile?.is_kids ?? false);
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Enter a profile name");
    setBusy(true);
    try {
      const values = {
        name: name.trim().slice(0, 24),
        avatar,
        pin: pin.trim().length === 4 ? pin : null,
        is_kids: isKids,
      };
      if (profile) {
        await updateProfile(profile.id, values);
        toast.success("Profile updated");
        await onSave();
      } else {
        const created = await createProfile(userId, values);
        await onSave(created);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-background/80 backdrop-blur-2xl sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-dialog-title"
    >
      <div className="liquid-glass flex max-h-[94dvh] w-full max-w-lg animate-fade-in flex-col overflow-hidden rounded-t-[1.75rem] sm:max-h-[min(760px,calc(100dvh-2.5rem))] sm:rounded-[2rem]">
        <header className="flex shrink-0 items-start gap-3 border-b border-foreground/10 px-4 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Personalize Sleepy</p>
            <h2 id="profile-dialog-title" className="mt-1 truncate text-xl font-black">
              {profile ? "Edit profile" : "New profile"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="liquid-icon grid size-9 shrink-0 place-items-center rounded-full"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
          <div className="flex items-center gap-3.5">
            <UserAvatar value={avatar} seed={name} className="size-16 shrink-0 text-6xl sm:size-20 sm:text-7xl" />
            <div className="min-w-0 flex-1">
              <label
                className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                htmlFor="profile-name"
              >
                Profile name
              </label>
              <input
                id="profile-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                placeholder="Enter name"
                disabled={busy}
                className="liquid-glass mt-1.5 h-11 w-full rounded-2xl bg-transparent px-3.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
            </div>
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Choose a picture
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 min-[380px]:grid-cols-5 sm:grid-cols-6 sm:gap-3">
            {AVATAR_PRESETS.map((preset) => {
              const value = presetValue(preset.id);
              const selected = avatar === value;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAvatar(value)}
                  disabled={busy}
                  aria-label={preset.label}
                  aria-pressed={selected}
                  className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${selected ? "bg-primary/10" : "hover:bg-foreground/[0.06]"}`}
                >
                  <span
                    className={`relative rounded-full ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                  >
                    <UserAvatar value={value} className="size-12 text-5xl sm:size-14 sm:text-6xl" />
                    {selected && (
                      <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                  </span>
                  <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>

          <label
            className="mt-5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
            htmlFor="profile-pin"
          >
            PIN <span className="normal-case tracking-normal opacity-70">(optional)</span>
          </label>
          <input
            id="profile-pin"
            value={pin}
            inputMode="numeric"
            maxLength={4}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="4 digits"
            disabled={busy}
            className="liquid-glass mt-2 h-12 w-full rounded-2xl bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-foreground/10 p-3.5 sm:p-4">
            <input
              type="checkbox"
              checked={isKids}
              onChange={(e) => setIsKids(e.target.checked)}
              disabled={busy}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Shield className="size-4 shrink-0 text-primary" />
                Kids profile
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Keeps this profile ready for family viewing.
              </span>
            </span>
          </label>
        </div>

        <footer className="flex shrink-0 gap-2.5 border-t border-foreground/10 px-4 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:gap-3 sm:px-7 sm:py-4">
          <button
            onClick={onClose}
            disabled={busy}
            className="liquid-icon h-12 flex-1 rounded-2xl text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={busy || !name.trim()}
            className="liquid-pill h-12 flex-1 rounded-2xl text-sm font-bold disabled:opacity-50"
          >
            {busy ? "Saving…" : profile ? "Save changes" : "Create profile"}
          </button>
        </footer>
      </div>
    </div>
  );
}
