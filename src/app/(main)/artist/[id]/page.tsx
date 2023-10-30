import { prisma } from '@/lib/database';

const ArtistPage = async ({ params: { id } }: { params: { id: string } }) => {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      songs: true,
      _count: {
        select: {
          songs: true,
          playHistory: true,
        },
      },
    },
  });

  return <div className="px-6 pt-[64px] pb-8">
    <pre className='bg-slate-700 p-3 rounded-md'>{JSON.stringify(artist, null, 2)}</pre>
  </div>;
};

export default ArtistPage;
