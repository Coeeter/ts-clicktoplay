import { prisma } from '@/lib/database';
import { redirect } from 'next/navigation';
import { UpdateSongForm } from './UpdateSongForm';
import { withAuth } from '@/components/auth/WithAuth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Update Song | ClickToPlay',
};

const UpdateSongPage = withAuth<{ params: { id: string } }>(
  async ({ params: { id } }) => {
    const song = await prisma.song.findUnique({
      where: {
        id: id,
      },
    });

    if (!song) {
      return redirect('/');
    }

    return (
      <div className="pb-6">
        <UpdateSongForm song={song} />
      </div>
    );
  },
  {
    callbackUrl: props => `/song/update/${props.params.id}`,
    hasPermissions: async (userId, props) => {
      return (
        userId ===
        (
          await prisma.song.findUnique({
            where: {
              id: props.params.id,
            },
          })
        )?.uploaderId
      );
    },
  }
);

export default UpdateSongPage;
