import { WithAuth } from '@/components/server/WithAuth';
import UploadSongForm from './UploadSongForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Song | ClickToPlay',
};

const SongUploader = () => {
  return (
    <WithAuth>
      <div className="pb-6">
        <UploadSongForm />
      </div>
    </WithAuth>
  );
};

export default SongUploader;
