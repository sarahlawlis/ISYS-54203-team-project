import { StatsCard } from '../StatsCard';
import { Folder, GitBranch, CheckCircle2, Clock } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <StatsCard
        title="Active Projects"
        value={24}
        icon={Folder}
        trend={{ value: 12, direction: "up" }}
        subtitle="Across all teams"
      />
      <StatsCard
        title="Workflows"
        value={47}
        icon={GitBranch}
        subtitle="Ready to use"
      />
      <StatsCard
        title="Completed Tasks"
        value={156}
        icon={CheckCircle2}
        trend={{ value: 8, direction: "up" }}
        subtitle="This month"
      />
      <StatsCard
        title="Pending Tasks"
        value={23}
        icon={Clock}
        trend={{ value: 5, direction: "down" }}
        subtitle="Due this week"
      />
    </div>
  );
}
