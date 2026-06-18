import ProtocolForm from "@/components/ProtocolForm";
import { createProtocolAction } from "@/app/admin/_actions";

const INK = "#EAF0FB";
const MUTE = "#7E8DA8";

export default async function NewProtocolPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: INK, margin: "0 0 4px", letterSpacing: -0.3 }}>
          Add new protocol
        </h1>
        <p style={{ fontSize: 13.5, color: MUTE, margin: 0 }}>
          Fill in the fields below. Only the protocol name is required — you can fill in the rest later.
        </p>
      </div>
      <ProtocolForm
        action={createProtocolAction}
        error={error}
        submitLabel="Save protocol"
      />
    </div>
  );
}
