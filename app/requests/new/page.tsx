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
    <div className="min-h-screen bg-paper">
      <AppHeader user={user} />
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 font-display text-lg text-ink">打刻修正申請</h1>
        <CorrectionRequestForm />
      </main>
    </div>
  );
}
