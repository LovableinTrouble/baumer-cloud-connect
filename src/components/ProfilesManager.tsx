"use client";

import { useEffect, useState } from "react";
import { Lock, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  listProfiles,
  deleteProfile,
  setActiveProfile,
  MAX_PROFILES,
  type ViewerProfile,
} from "@/lib/profiles";
import { UserAvatar } from "@/components/UserAvatar";
import { ProfilePicker } from "@/components/ProfilePicker";

interface Props {
  userId: string;
}

export function ProfilesManager({ userId }: Props) {
  const [profiles, setProfiles] = useState<ViewerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ViewerProfile | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, [userId]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const rows = await listProfiles(userId);
      setProfiles(rows);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      toast.error("Could not load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleting !== id) {
      setDeleting(id);
      return;
    }
    try {
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      toast.success("Profile deleted");
      setDeleting(null);
    } catch (error) {
      toast.error("Could not delete profile");
    }
  };

  const handleSetActive = (profile: ViewerProfile) => {
    setActiveProfile({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      isKids: profile.is_kids,
      userId: profile.user_id,
    });
    toast.success(`Now watching as ${profile.name}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {profiles.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No profiles yet. Create one in the "Who's watching?" screen.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="liquid-glass flex items-start gap-3 rounded-2xl p-3.5 sm:p-4"
              >
                <UserAvatar
                  value={profile.avatar}
                  seed={profile.name}
                  className="size-12 shrink-0 text-[3rem]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="truncate text-sm font-semibold">{profile.name}</span>
                    {profile.pin && <Lock className="size-3 shrink-0 text-muted-foreground" />}
                  </div>
                  {profile.is_kids && (
                    <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Kids
                    </span>
                  )}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleSetActive(profile)}
                      className="liquid-icon inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold"
                    >
                      Watch
                    </button>
                    <button
                      onClick={() => setEditing(profile)}
                      className="liquid-icon inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold"
                    >
                      <Edit2 className="size-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className={`inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors ${
                        deleting === profile.id
                          ? "bg-destructive/20 text-destructive"
                          : "liquid-icon"
                      }`}
                    >
                      <Trash2 className="size-3" />
                      {deleting === profile.id ? "Confirm?" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {profiles.length < MAX_PROFILES && !creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="liquid-pill mt-4 h-11 w-full rounded-2xl text-sm font-bold"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Add profile
          </button>
        )}
      </div>

      {creating && (
        <ProfilePicker
          userId={userId}
          onClose={() => setCreating(false)}
          onSave={async (profile) => {
            if (profile) setProfiles((prev) => [...prev, profile]);
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <ProfilePicker
          userId={userId}
          profile={editing}
          onClose={() => setEditing(null)}
          onSave={async () => {
            await loadProfiles();
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
