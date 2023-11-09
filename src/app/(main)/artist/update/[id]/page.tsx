import { prisma } from '@/lib/database';
import { notFound } from 'next/navigation';
import { UpdateArtistForm } from './UpdateArtistForm';

const UpdateArtistPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
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
