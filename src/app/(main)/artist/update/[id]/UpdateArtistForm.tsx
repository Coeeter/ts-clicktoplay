'use client';
import { Artist } from '@prisma/client';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/forms/Button';
import { ImageInput } from '@/components/forms/ImageInput';
import {
  getUpdateArtistUploadUrl,
  updateArtist,
} from '@/actions/artist/artist';
import { useToastStore } from '@/store/ToastStore';
import { useNavigationRouter } from '@/hooks/useNavigation';

type UpdateArtistFormProps = {
  artist: Artist;
};

const UpdateArtistFormSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'Artist name must be at least 1 character',
    })
    .max(100, {
      message: 'Artist name must be at most 100 characters',
    }),
  description: z.string().max(1000, {
    message: 'Artist description must be at most 1000 characters',
  }),
  image: z.custom<FileList | null>(value => {
    if (!value) return true;
    if (!(value instanceof FileList)) return false;
    if (value.length === 0) return true;
    if (value.length > 1) return 'You can only upload one image';
    return true;
  }),
});

type UpdateArtistFormValues = z.infer<typeof UpdateArtistFormSchema>;

export const UpdateArtistForm = ({ artist }: UpdateArtistFormProps) => {
  const router = useNavigationRouter();
  const createToast = useToastStore(state => state.createToast);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<UpdateArtistFormValues>({
    resolver: zodResolver(UpdateArtistFormSchema),
    defaultValues: {
      name: artist.name,
      description: artist.description,
      image: null,
    },
  });

  const image = watch('image');

  const onSubmit: SubmitHandler<UpdateArtistFormValues> = async values => {
    try {
      let url: string | undefined;
      if (values.image) {
        const contentType = values.image[0].type;
        const extension = contentType.split('/')[1];
        const uploadUrl = await getUpdateArtistUploadUrl(
          artist.id,
          extension,
          contentType
        );
        if (uploadUrl) {
          await fetch(uploadUrl, {
            method: 'PUT',
            body: values.image[0],
          });
          url = uploadUrl.split('?')[0];
        }
      }
      await updateArtist({
        id: artist.id,
        name: values.name,
        description: values.description,
        image: url,
      });
      createToast('Artist updated successfully', 'success');
      router.push(`/artist/${artist.id}`);
    } catch (e) {
      console.log(e);
      if (e instanceof Error) return createToast(e.message, 'error');
      createToast('Something went wrong', 'error');
    }
  };

  return (
    <form
      className="flex flex-col gap-5 bg-slate-900 p-6 rounded-md max-w-md w-full mx-auto mt-[calc(1.5rem+64px)] shadow-lg shadow-gray-800"
      onSubmit={handleSubmit(onSubmit)}
    >
      <ImageInput
        registerValues={register('image')}
        setValue={value => setValue('image', value)}
        defaultPreview={artist.image ?? undefined}
        value={image}
        contain={true}
      />
      {errors.image && (
        <div className="text-red-500 text-sm -mt-3">{errors.image.message}</div>
      )}
      <TextField
        label="Name"
        {...register('name')}
        error={errors.name?.message}
        defaultValue={artist.name}
      />
      <TextField
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        variant="textarea"
        defaultValue={artist.description}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Update Artist
      </Button>
    </form>
  );
};
