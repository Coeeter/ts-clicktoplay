import { QueueList } from '@/components/queue/QueueList';
import { WithAuth } from '@/components/server/WithAuth';
import { getSongs } from '@/actions/songs';

export default async function QueuePage() {
  const songs = await getSongs();

  return (
    <WithAuth>
      <QueueList songs={songs} />
    </WithAuth>
  );
}
