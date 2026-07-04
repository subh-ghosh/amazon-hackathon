import { ExecutiveDashboardView } from "@/components/dashboard/executive-dashboard-view";

export default function ExecutiveDashboard() {
  return (
    <>
      <ExecutiveDashboardView />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <p className="mt-6 text-right text-xs text-slate-400">
          Reporting snapshot sourced from DynamoDB
        </p>
      </div>
    </>
  );
}
