import { Session } from 'next-auth';

export type SongId = string;

export type GetSongFileUploadUrlProps = {
  fileType?: string;
  extension?: string;
  type?: string;
};

export type CreateSongProps = {
  url: string;
  title: string;
  duration: number;
  artist: string | null;
  albumCover: string | null;
  session: Session;
};

export type GetUpdateFileUploadUrlProps = {
  id: string | undefined;
  fileType: string;
  extension: string;
  session: Session;
};

export type UpdateSongProps = {
  id: string | undefined;
  title?: string | null;
  artist?: string | null;
  albumCover?: string | null;
  session: Session;
};
