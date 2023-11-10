import { prisma } from '@/lib/database';
import { notFound, redirect } from 'next/navigation';
import { UpdateArtistForm } from './UpdateArtistForm';
import { getServerSession } from '@/lib/auth';

const UpdateArtistPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const session = await getServerSession();
  if (!session) {
    return redirect(`/login?callbackUrl=/artist/update/${id}`);
  }

  const artist = await prisma.artist.findUnique({
    where: { id },
  });

  if (!artist) {
    notFound();
  }

  return (
    <>
      <div className="pb-6">
        <UpdateArtistForm artist={artist} />
      </div>
    </>
  );
};

export default UpdateArtistPage;
