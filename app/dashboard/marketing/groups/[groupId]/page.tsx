'use client';

import GroupDetailsClient from './components/GroupDetailsClient';
import { useParams } from 'next/navigation';

const GroupDetailsPage = () => {
  const params = useParams();
  const { groupId } = params;
  const finalGroupId = Array.isArray(groupId) ? groupId[0] : groupId;

  if (!finalGroupId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-semibold text-red-500">
          Group ID not found.
        </div>
      </div>
    );
  }

  return <GroupDetailsClient groupId={finalGroupId} />;
};

export default GroupDetailsPage;