// components/DangerZone.client.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "./ConfirmModal.client";

type Props = {
  /** Server action passed from the page to perform the destructive delete */
  onDeleteAccount: () => void;
};

export default function DangerZone({ onDeleteAccount }: Props) {
  const supabase = createClient();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function logoutEverywhere() {
    try {
      // Logs out this device AND revokes all refresh tokens
      await supabase.auth.signOut({ scope: "global" as any });
    } catch {
      // ignore
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <div className="ui-card p-5">
      <h3 className="text-sm font-semibold mb-4">Danger zone</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Log out everywhere */}
        <div className="rounded-xl ring-1 ring-white/10 bg-white/[.03] p-4">
          <div className="font-medium">Log out of all devices</div>
          <p className="text-sm opacity-75 mt-1">
            Sign out on this device and revoke sessions on every device.
          </p>
          <button
            className="mt-3 btn-ghost"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Log out everywhere
          </button>
        </div>

        {/* Delete account */}
        <div className="rounded-xl ring-1 ring-white/10 bg-white/[.03] p-4">
          <div className="font-medium">Delete account</div>
          <p className="text-sm opacity-75 mt-1">
            Permanently delete your account and profile. This cannot be undone.
          </p>
          <button
            className="mt-3 btn bg-red-500/90 hover:bg-red-500 text-white rounded-xl px-3 py-2"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete my account
          </button>
        </div>
      </div>

      {/* Confirms */}
      <ConfirmModal
        open={showLogoutConfirm}
        title="Log out of all devices?"
        message="We’ll revoke sessions on every device. You’ll need to sign in again."
        confirmLabel="Log out everywhere"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logoutEverywhere();
        }}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete your account?"
        message="This permanently removes your account and profile. This cannot be undone."
        tone="danger"
        confirmLabel="Yes, delete it"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteAccount();
        }}
      />
    </div>
  );
}