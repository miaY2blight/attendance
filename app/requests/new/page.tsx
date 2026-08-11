import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { CorrectionRequestForm } from "@/components/CorrectionRequestForm";

export default async function NewCorrectionRequestPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 text-lg font-semibold text-gray-900">打刻修正申請</h1>
        <CorrectionRequestForm />
      </main>
    </div>
  );
}
