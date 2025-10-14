import { SavedSearchCard } from '../SavedSearchCard';

export default function SavedSearchCardExample() {
  return (
    <div className="p-6 max-w-md space-y-3">
      <SavedSearchCard
        id="1"
        name="High Priority Active Projects"
        filters="type:project, priority:high, status:active"
        resultCount={12}
      />
      <SavedSearchCard
        id="2"
        name="Overdue Tasks"
        filters="type:task, dueDate:<today"
        resultCount={5}
      />
    </div>
  );
}
