// app/notifications/error.tsx
"use client";
export default function Error({ error }: { error: Error }) {
  return (
    <div className="app-container py-10">
      <div className="ui-card p-6">
        Something went wrong loading notifications.
        <div className="mt-2 text-xs opacity-70">{error.message}</div>
      </div>
    </div>
  );
}