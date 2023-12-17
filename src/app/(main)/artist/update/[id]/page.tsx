import { prisma } from '@/lib/database';
import { UpdateArtistForm } from './UpdateArtistForm';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { withAuth } from '@/components/auth/WithAuth';
import { Metadata } from 'next/types';

const getArtist = async (id: string) => {
  return await prisma.artist.findUnique({
    where: { id },
  });
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const artist = await getArtist(params.id);
  if (!artist) return { title: 'ClickToPlay' };
  return {
    title: `Update Artist - ${artist.name} | ClickToPlay`,
  };
}

const UpdateArtistPage = withAuth<{ params: { id: string } }>(
  async ({ params: { id } }) => {
    const session = await getServerSession();
    if (!session) redirect(`/login?callbackUrl=/artist/update/${id}`);

    const artist = await prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      return notFound();
    }

    return (
      <div className="pb-6">
        <UpdateArtistForm artist={artist} />
      </div>
    );
  },
  {
    callbackUrl: props => `/artist/update/${props.params.id}`,
  }
);

export default UpdateArtistPage;
