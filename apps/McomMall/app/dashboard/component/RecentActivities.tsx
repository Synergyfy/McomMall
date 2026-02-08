'use client';

import type { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity } from '@/service/activities/types';

interface RecentActivitiesProps {
  activities: Activity[] | undefined;
  isLoading: boolean;
}

const RecentActivities: FC<RecentActivitiesProps> = ({
  activities,
  isLoading,
}) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      <Button variant="ghost" size="sm">
        Clear All
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <p>Loading activities...</p>
      ) : (
        <ul className="space-y-4">
          {activities?.map((activity, index) => (
            <li key={index} className="flex items-center space-x-4">
              <div className="flex-grow">
                <p className="text-sm text-gray-800">{activity.message}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(activity.date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default RecentActivities;