"use client";

import { deleteProtocolAction } from "@/app/admin/_actions";

const CORAL = "#F87171";

export default function DeleteProtocolButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  return (
    <form
      action={deleteProtocolAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        style={{
          background: "#2A1515",
          border: `1px solid #5A2020`,
          color: CORAL,
          borderRadius: 7,
          padding: "6px 12px",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </form>
  );
}
