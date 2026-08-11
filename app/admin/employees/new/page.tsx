import { NewEmployeeForm } from "@/components/NewEmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-display text-lg text-ink">社員新規登録</h1>
      <NewEmployeeForm />
    </div>
  );
}
