import { withAuth } from '@/components/auth/WithAuth';
import UploadSongForm from './UploadSongForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Song | ClickToPlay',
};

const SongUploader = withAuth(() => {
  return (
    <div className="pb-6">
      <UploadSongForm />
    </div>
  );
});

export default SongUploader;
