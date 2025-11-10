// app/dashboard/agent/components/AvailableTasks.tsx
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tasks = [
  {
    title: 'Data Entry for E-commerce Site',
    pay: '$50',
    deadline: '2 days',
  },
  {
    title: 'Content Writing for a Blog',
    pay: '$100',
    deadline: '5 days',
  },
  {
    title: 'Social Media Management',
    pay: '$200',
    deadline: '1 week',
  },
];

const AvailableTasks: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="flex justify-between items-center p-4 border rounded-md">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-500">
                  Pay: {task.pay} | Deadline: {task.deadline}
                </p>
              </div>
              <Button>Apply</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableTasks;
