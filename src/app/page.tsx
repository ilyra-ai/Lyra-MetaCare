import { HealthDashboard } from "@/components/health-dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="p-4 sm:p-6 lg:p-8">
        <HealthDashboard />
      </main>
    </div>
  );
}