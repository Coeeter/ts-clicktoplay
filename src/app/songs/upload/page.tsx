import { WithAuth } from '@/components/server';
import UploadSongForm from './UploadSongForm';

const SongUploader = () => {
  return (
    <WithAuth>
      <UploadSongForm />
    </WithAuth>
  );
};

export default SongUploader;
