import { NewEmployeeForm } from "@/components/NewEmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-gray-900">社員新規登録</h1>
      <NewEmployeeForm />
    </div>
  );
}
