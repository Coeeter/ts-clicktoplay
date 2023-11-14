import { prisma } from '@/lib/database';
import { notFound, redirect } from 'next/navigation';
import { UpdateArtistForm } from './UpdateArtistForm';
import { getServerSession } from '@/lib/auth';

const UpdateArtistPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  (await getServerSession()) ??
    redirect(`/login?callbackUrl=/artist/update/${id}`);

  const artist =
    (await prisma.artist.findUnique({
      where: { id },
    })) ?? notFound();

  return (
    <>
      <div className="pb-6">
        <UpdateArtistForm artist={artist} />
      </div>
    </>
  );
};

export default UpdateArtistPage;
