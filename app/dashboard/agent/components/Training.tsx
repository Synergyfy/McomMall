// app/dashboard/agent/components/Training.tsx
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const trainingModules = [
  'Advanced Communication Skills',
  'Client Management Best Practices',
  'Time Management for Freelancers',
];

const Training: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training & Upskill</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc list-inside">
          {trainingModules.map((module, index) => (
            <li key={index}>{module}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default Training;
