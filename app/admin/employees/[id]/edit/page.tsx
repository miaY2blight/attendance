import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditEmployeeForm } from "@/components/EditEmployeeForm";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-display text-lg text-ink">社員編集: {employee.name}</h1>
      <EditEmployeeForm
        employee={{
          id: employee.id,
          employeeCode: employee.employeeCode,
          name: employee.name,
          role: employee.role,
          isActive: employee.isActive,
        }}
      />
    </div>
  );
}
