import { notFound } from "next/navigation";
import ProtocolForm from "@/components/ProtocolForm";
import { updateProtocolAction } from "@/app/admin/_actions";
import { getAllProtocolsAdmin } from "@/lib/protocols";

const INK  = "#EAF0FB";
const MUTE = "#7E8DA8";
const FAINT = "#566179";

export default async function EditProtocolPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const protocols = await getAllProtocolsAdmin();
  const protocol = protocols.find((p) => p.id === parseInt(id));
  if (!protocol) notFound();

  const boundAction = updateProtocolAction.bind(null, protocol.id);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: FAINT, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
          Editing
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: INK, margin: "0 0 4px", letterSpacing: -0.3 }}>
          {protocol.name}
        </h1>
        <p style={{ fontSize: 13.5, color: MUTE, margin: 0 }}>
          Update any fields below and click Save.
        </p>
      </div>
      <ProtocolForm
        action={boundAction}
        protocol={protocol}
        error={error}
        submitLabel="Save changes"
      />
    </div>
  );
}
