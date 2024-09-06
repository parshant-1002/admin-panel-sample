import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AddContentFormItem } from '../../../Models/common';
import {
  useGetContentQuery,
  useUpdateContentMutation,
} from '../../../Services/Api/module/pagescontent/index';
import CustomCardWrapper from '../../../Shared/components/CustomCardWrapper/CustomCardWrapper';
import { CustomForm } from '../../../Shared/components/index';
import { CONTENT_ENUMS } from '../../../Shared/constants/index';
import { isErrors, removeEmptyValues } from '../../../Shared/utils/functions';
import HERO_CONTENT_FORM_SCHEMA from './helpers/HeroContent';
import { HERO_SECTION_SUB_ENUM } from './helpers/transform';

const initialState: AddContentFormItem = {
  title: '',
  content: '',
  errors: {},
};

// const fieldTypes = {
//   title: INPUT_TYPES.TEXT,
//   file: INPUT_TYPES.FILE_UPLOAD,
// };

const labels = {
  title: 'Title',
  file: 'Image',
};

function FaqsContent() {
  const [heroCards, setHeroCards] = useState<AddContentFormItem[]>([
    initialState,
  ]);
  const [initialValues, setInitialValues] = useState({});
  const { data: content, refetch } = useGetContentQuery({});
  const [updateContent] = useUpdateContentMutation({});

  useEffect(() => {
    if (content?.data?.[CONTENT_ENUMS.HERO_SECTION]) {
      // Set initial form values
      const initialFormValues = content.data[CONTENT_ENUMS.HERO_SECTION];
      const image = [
        {
          fileURL:
            content.data[CONTENT_ENUMS.HERO_SECTION][
              HERO_SECTION_SUB_ENUM.HERO_IMAGES
            ]?.[0]?.url,
        },
      ];
      const imageAddedInitialData = { ...initialFormValues, image };
      setInitialValues(imageAddedInitialData);

      // Extract and set heroCards values
      const formGetData = content.data[CONTENT_ENUMS.HERO_SECTION][
        HERO_SECTION_SUB_ENUM.HERO_IMAGES
      ]?.map(({ url, title }: { url: string; title: string }) => ({
        title: String(title),
        file: [{ fileURL: String(url) }],
      }));
      setHeroCards(formGetData);
    }
  }, [content]);

  const onSubmit = async (data: Record<string, unknown>) => {
    if (isErrors(heroCards, setHeroCards, labels)) return;

    const mappedHeroImage = [
      {
        title: 'hero Image',
        url:
          (data?.image as unknown as { fileURL: string }[])?.[0].fileURL || '',
      },
    ];

    const payload = {
      [CONTENT_ENUMS.HERO_SECTION]: removeEmptyValues({
        ...data,
        [HERO_SECTION_SUB_ENUM.HERO_IMAGES]: mappedHeroImage,
        image: '',
      }),
    };
    await updateContent({
      payload,
      onSuccess: (res: { message: string }) => {
        toast.success(res.message);
        refetch();
      },
    });
  };

  return (
    <CustomCardWrapper>
      <CustomForm
        formData={HERO_CONTENT_FORM_SCHEMA}
        id="Hero-form"
        onSubmit={onSubmit}
        defaultValues={initialValues}
        submitText="Update Hero Content"
        // preSubmitElement={
        //   <AddContentForm
        //     content={heroCards || []}
        //     setContent={setHeroCards}
        //     types={fieldTypes}
        //     labels={labels}
        //     title="Hero Content"
        //     initialState={initialState}
        //   />
        // }
      />
    </CustomCardWrapper>
  );
}

export default FaqsContent;
