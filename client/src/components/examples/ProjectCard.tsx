import { ProjectCard } from '../ProjectCard';

export default function ProjectCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <ProjectCard
        id="1"
        name="Customer Onboarding System"
        description="Streamline new customer intake with automated workflows and documentation"
        status="active"
        dueDate="Dec 15, 2024"
        teamSize={5}
        activeWorkflows={3}
      />
    </div>
  );
}
