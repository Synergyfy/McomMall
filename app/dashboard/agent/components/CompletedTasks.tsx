// app/dashboard/agent/components/CompletedTasks.tsx
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const completedTasks = [
  {
    title: 'Logo Design for a Startup',
    client: 'Creative Solutions',
    rating: 5,
  },
  {
    title: 'Blog Post on AI Trends',
    client: 'Tech Insights',
    rating: 4,
  },
];

const CompletedTasks: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completed Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {completedTasks.map((task, index) => (
            <div key={index} className="p-4 border rounded-md">
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-500">
                Client: {task.client} | Rating: {task.rating}/5
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedTasks;
