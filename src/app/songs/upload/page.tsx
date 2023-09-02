import { WithAuth } from '@/components/server/WithAuth';
import UploadSongForm from './UploadSongForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Song | ClickToPlay',
}

const SongUploader = () => {
  return (
    <WithAuth>
      <UploadSongForm />
    </WithAuth>
  );
};

export default SongUploader;
