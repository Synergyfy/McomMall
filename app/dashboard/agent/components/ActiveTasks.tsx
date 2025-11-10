// app/dashboard/agent/components/ActiveTasks.tsx
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activeTasks = [
  {
    title: 'Website Redesign Project',
    client: 'ABC Corp',
    deadline: '3 days remaining',
  },
  {
    title: 'Marketing Campaign Analysis',
    client: 'XYZ Inc',
    deadline: '1 week remaining',
  },
];

const ActiveTasks: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeTasks.map((task, index) => (
            <div key={index} className="p-4 border rounded-md">
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-500">
                Client: {task.client} | Deadline: {task.deadline}
              </p>
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" className="mr-2">
                  View Details
                </Button>
                <Button size="sm">Submit Work</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTasks;
