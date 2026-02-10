import EventConfigForm from "@/components/admin/event-config-form"; // Corrected import path

export default function AdminConfigPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Generell Konfigurasjon</h1>

      <section className="p-6 bg-white rounded-lg shadow border">
        <EventConfigForm />
      </section>
    </div>
  );
}
