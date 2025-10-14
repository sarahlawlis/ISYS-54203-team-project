import { AttributeCard } from '../AttributeCard';

export default function AttributeCardExample() {
  return (
    <div className="p-6 max-w-md space-y-3">
      <AttributeCard id="1" name="customer_email" type="text" usageCount={12} />
      <AttributeCard id="2" name="project_budget" type="number" usageCount={8} />
      <AttributeCard id="3" name="deadline_date" type="date" usageCount={15} />
    </div>
  );
}
