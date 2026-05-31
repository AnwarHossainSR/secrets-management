import { ClientForm } from "../_form";

export default function NewClientPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">New Client</h1>
      <ClientForm />
    </div>
  );
}
