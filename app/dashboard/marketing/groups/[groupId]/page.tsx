import GroupDetailsClient from './components/GroupDetailsClient';

interface GroupDetailsPageProps {
  params: {
    groupId: string;
  };
}

const GroupDetailsPage = ({ params }: GroupDetailsPageProps) => {
  return <GroupDetailsClient groupId={params.groupId} />;
};

export default GroupDetailsPage;