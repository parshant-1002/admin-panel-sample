/* eslint-disable consistent-return */
// libs
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// types
import { DeleteData, FileData, FileInputProps, Files } from './helpers/modal';

// redux
import {
  useFileDeleteMutation,
  useFileUploadMutation,
  useGetFilesQuery,
} from '../../../../Services/Api/module/file';
import { RootState } from '../../../../Store';
import {
  deletedImages,
  updateUploadedImages,
} from '../../../../Store/UploadedImages';

// consts
import { Delete, RED_WARNING } from '../../../../assets';
import {
  BUTTON_LABELS,
  CONFIRMATION_DESCRIPTION_IMAGE_DELETE,
  FILE_TYPE,
  STRINGS,
} from '../../../constants/constants';
import ERROR_MESSAGES from '../../../constants/messages';
import TOAST_MESSAGES from '../../../constants/toastMessages';
import {
  FILE_MAX_SIZE,
  IMAGE_TYPES,
  SPREAD_SHEET_TYPES,
  TABS,
} from './helpers/constants';

// utils
import {
  checkValidFileExtension,
  generateErrorMessage,
  removeEmptyValues,
} from '../../../utils/functions';

// components
import ConfirmationModal from '../../ConfirmationModal';
import DefaultFile from './components/DefaultFile';
import FileRenderer from './components/FileRenderer';
import FileUploadModal from './components/FileUploadModal';
import ImageFile from './components/ImageFile';
import SpreadsheetFile from './components/SpreadsheetFile';

// styles
import './FileUpload.scss';
import {
  checkIsCreateProductAuction,
  checkIsProductAuction,
  createQueryParams,
  getChoosenFilesWithId,
  getCloseModalVariables,
  getDeleteImageFunctionVariables,
  getUploadFileVariables,
} from './helpers/utils';
import ImageUploadBox from './components/ImageUploadBox';

const initialDeleteModalState: DeleteData = {
  show: false,
  data: { fileId: [STRINGS.EMPTY_STRING] },
};

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  function FileInput(
    {
      value,
      onChange = () => {},
      label,
      subLabel,
      maxSize = FILE_MAX_SIZE, // 6mb
      accept = STRINGS.EMPTY_STRING,
      singleImageSelectionEnabled = true,
      ratio = [],
      imageFileType = FILE_TYPE.CMS,
      fetchImageDataConfig,
      hideListSelection = false,
    },
    ref
  ) {
    const selectedFilesList = useRef<FileData[]>();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const uploadedImages = useSelector(
      (state: RootState) => state.UploadedImages.images
    );
    const deletedIds = useSelector(
      (state: RootState) => state.UploadedImages.deletedIds
    );

    // CHECKING IS PRODUCT OR AUCTION IMAGE SELECTION
    const isProductAuction = useMemo(
      () => checkIsProductAuction(imageFileType),
      [imageFileType]
    );

    // SETTING UPLOADED FILES IN LIST
    const imageList = useMemo(
      () => ({
        files: [...(uploadedImages ?? [])],
      }),
      [uploadedImages]
    );

    // CHECKING IS PRODUCT OR AUCTION IMAGE SELECTION FOR CREATION PURPOSE
    const isCreateProductAuction = useMemo(
      () => checkIsCreateProductAuction(fetchImageDataConfig, imageFileType),
      [fetchImageDataConfig, imageFileType]
    );
    const dispatch = useDispatch();

    // STATE
    const [deleteModal, setDeleteModal] = useState(initialDeleteModalState);
    const [chooseFile, setChooseFile] = useState(value);
    const [fileValue, setFileValue] = useState<FileData[]>();
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState(
      hideListSelection ? TABS.FILE_UPLOAD : TABS.LIST_FILES
    );

    // API
    const [fileUpload] = useFileUploadMutation();
    const [fileDelete] = useFileDeleteMutation();
    const [selectedFiles, setSelectedFiles] = useState<Files[]>([]);

    // FETCHING FILES FROM API
    const { data, refetch, isLoading } = useGetFilesQuery(
      {
        params: removeEmptyValues(
          createQueryParams(fetchImageDataConfig, imageFileType)
        ),
      },
      {
        skip: isCreateProductAuction,
      }
    );

    useEffect(() => {
      dispatch(updateUploadedImages(data?.files));
    }, [data?.files, dispatch]);

    useEffect(() => {
      const choosenFilesWithId = getChoosenFilesWithId(
        chooseFile,
        isProductAuction
      );
      setSelectedFiles(choosenFilesWithId);
    }, [chooseFile, isProductAuction]);

    useEffect(() => {
      if (value) setChooseFile(value);
    }, [value]);

    const openModal = useCallback(() => setShowModal(true), []);
    const closeModal = useCallback(() => setShowModal(false), []);

    const handleFileUpload = useCallback(
      async (fileValueList: FileData[]) => {
        try {
          if (!fileValueList?.length) {
            return toast.error(TOAST_MESSAGES().SELECT_ATLEAST_ONE_FILE);
          }
          const { finalDataForProductAuction, allAssignedData, responseData } =
            await getUploadFileVariables(
              hideListSelection,
              fileValueList,
              fileUpload,
              imageList,
              singleImageSelectionEnabled,
              imageFileType
            );
          // Dispatch actions based on conditions
          if (isProductAuction) {
            dispatch(updateUploadedImages(finalDataForProductAuction));
            if (hideListSelection) {
              onChange(allAssignedData);
              setChooseFile(allAssignedData);
              setShowModal(false);
            } else {
              setActiveTab(TABS.LIST_FILES);
            }
          } else {
            onChange(responseData);
            setChooseFile(responseData);
          }
          if (!isCreateProductAuction) {
            refetch();
          }
          setFileValue([]);
          selectedFilesList.current = [];
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error(ERROR_MESSAGES().SOMETHING_WENT_WRONG);
          }
        }
      },
      [
        dispatch,
        fileUpload,
        hideListSelection,
        imageFileType,
        imageList,
        isCreateProductAuction,
        isProductAuction,
        onChange,
        refetch,
        singleImageSelectionEnabled,
      ]
    );

    const imageOnLoad = useCallback(
      (img: HTMLImageElement, file: File, result: string) => {
        const { width, height } = img;
        const calculatedRatio = width / height;
        const [firstValue, secondValue] = ratio;
        const calculatedRequiredRatio = firstValue / secondValue;
        if (Math.abs(calculatedRatio - calculatedRequiredRatio) < 0.1) {
          // Image has the required aspect ratio (tolerance of 0.1)
          setFileValue((prevState) => [
            ...(prevState ?? []),
            { file, src: result },
          ]);
          if (hideListSelection && imageList?.files?.length) {
            openModal();
          }
        } else {
          toast.error(
            TOAST_MESSAGES(firstValue, secondValue).IMAGE_RATIO_ERROR
          );
        }
      },
      [ratio, hideListSelection, imageList?.files?.length, openModal]
    );

    const isFileValid = useCallback(
      (file: File) => {
        if (!checkValidFileExtension(file.name, accept)) {
          toast.error(TOAST_MESSAGES(accept).PLEASE_UPLOAD_ONLY_ACCEPTED_FILES);
          return false;
        }

        if (file.size > maxSize) {
          toast.error(ERROR_MESSAGES().FILE_SIZE_ERROR);
          return false;
        }

        return true;
      },
      [accept, maxSize]
    );

    const handleImageLoadToCheckRatio = useCallback(
      (file: File, result: string) => {
        const img = new Image();
        img.onload = () => imageOnLoad(img, file, result);
        img.src = result;
      },
      [imageOnLoad]
    );

    const addFileToState = useCallback(
      (file: File, result: string) => {
        setFileValue((prevState) => [
          ...(prevState ?? []),
          { file, src: result },
        ]);
        if (hideListSelection && imageList?.files?.length) {
          openModal();
        }
      },
      [hideListSelection, imageList?.files?.length, openModal]
    );

    const handleFileLoad = useCallback(
      (e: ProgressEvent<FileReader>, file: File) => {
        const result = e.target?.result as string;

        if (ratio && ratio.length === 2) {
          handleImageLoadToCheckRatio(file, result);
        } else {
          addFileToState(file, result);
        }
      },
      [addFileToState, handleImageLoadToCheckRatio, ratio]
    );

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        // Clear previous file values
        setFileValue([]);

        acceptedFiles.forEach((file) => {
          if (!isFileValid(file)) return;

          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) =>
            handleFileLoad(e, file);
          reader.readAsDataURL(file);
        });
      },
      [handleFileLoad, isFileValid] // Added ratio to dependency array
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple: !hideListSelection || !singleImageSelectionEnabled,
    });

    const handleRemoveFileFromPreview = useCallback((index: number) => {
      setFileValue(
        (prevState: FileData[] | undefined) =>
          prevState?.filter((_, i) => i !== index)
      );
    }, []);

    const handleOpenDeleteFileConfirmation = useCallback(
      (fileId: (string | undefined)[], isMultiDelete?: boolean) => {
        setDeleteModal({
          data: { fileId, isMultiDelete },
          show: true,
        });
      },
      []
    );

    const handleCloseDelete = useCallback(() => {
      setDeleteModal({ data: null, show: false });
    }, []);

    const handleDeleteClick = async () => {
      const {
        shouldRefetch,
        isResetValuesForProductionAuction,
        deletedImagesArray,
        filteredImages,
        fileId,
      } = getDeleteImageFunctionVariables(
        isCreateProductAuction,
        isProductAuction,
        deleteModal,
        imageList,
        deletedIds,
        selectedFiles
      );

      try {
        if (isProductAuction) {
          handleCloseDelete();

          dispatch(deletedImages(deletedImagesArray));
          dispatch(updateUploadedImages(filteredImages));
          if (isResetValuesForProductionAuction) {
            setChooseFile([]);
            onChange([]);
            setSelectedFiles([]);
          }
        } else {
          await fileDelete({
            payload: { fileId },
            onSuccess: (res: { message: string }) => {
              toast.success(res?.message);
              handleCloseDelete();
              if (shouldRefetch) {
                refetch();
              }
            },
          });
        }
      } catch (error: unknown) {
        const errorMessage = generateErrorMessage(error);
        toast.error(errorMessage);
      }
    };

    const renderSelectedFile = useMemo(() => {
      if (!fileValue) return null;

      return fileValue.map((fileData, index) => {
        const { type, name } = fileData?.file ?? {};
        const src = fileData?.src;

        if (!type || !name) return null;

        if (SPREAD_SHEET_TYPES.includes(type)) {
          return (
            <SpreadsheetFile
              key={type}
              name={name}
              index={index}
              handleRemoveFile={handleRemoveFileFromPreview}
            />
          );
        }

        if (IMAGE_TYPES.includes(type) && src) {
          return (
            <ImageFile
              key={type}
              name={name}
              src={src as string}
              index={index}
              handleRemoveFile={handleRemoveFileFromPreview}
            />
          );
        }

        return (
          <DefaultFile
            key={type}
            name={name}
            index={index}
            handleRemoveFile={handleRemoveFileFromPreview}
          />
        );
      });
    }, [fileValue, handleRemoveFileFromPreview]);

    const generateFilesData = (files?: Files[]): Files[] | undefined => {
      if (!isProductAuction) return files;

      const selectedFileIds = new Set(files?.map((file) => file._id));

      return imageList?.files?.map((file: { _id: string }) => ({
        ...file,
        assigned: selectedFileIds.has(file._id),
      }));
    };

    const handleChooseFile = (files: Files[] | undefined) => {
      if (!files?.length) {
        return toast.error(TOAST_MESSAGES().SELECT_ATLEAST_ONE_FILE);
      }

      const firstFileUrl = files?.[0]?.fileURL ?? files?.[0]?.url;
      if (!checkValidFileExtension(firstFileUrl, accept)) {
        return toast.error(
          TOAST_MESSAGES(accept).PLEASE_CHOOSE_ONLY_ACCEPTED_FILES
        );
      }

      const filesData = generateFilesData(files);
      onChange(filesData);
      setChooseFile(filesData as Files[]);
      closeModal();
    };

    const handleCloseFileUploadModal = () => {
      if (isProductAuction && selectedFiles?.length && chooseFile?.length) {
        // Get the files to persist by filtering the selected files
        const { updatedFiles } = getCloseModalVariables(
          selectedFiles,
          chooseFile,
          imageList
        );

        onChange(updatedFiles);
      }
      closeModal();
    };

    const handleClickDeleteForNoListSelectionCase = (img: Files) => {
      const filteredFiles = chooseFile?.filter(
        (file) => file?._id !== img?._id
      );
      setChooseFile(filteredFiles);
      onChange(filteredFiles);
      dispatch(updateUploadedImages(filteredFiles));
    };

    const openFileInputForNoListShownCase = () => {
      // Trigger the file input's click event
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleAddFilesForNoListShownCase = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (!e.target.files) {
        return;
      }
      const acceptedFiles = Array.from(e.target.files);

      acceptedFiles?.forEach((file) => {
        if (!isFileValid(file)) return;

        const reader = new FileReader();
        reader.onload = (loadEvent: ProgressEvent<FileReader>) =>
          // upload when all selected images are loaded to check ratio and valid file type.
          handleFileLoad(loadEvent, file);
        reader.readAsDataURL(file);
      });
    };

    return (
      <>
        <ConfirmationModal
          title={CONFIRMATION_DESCRIPTION_IMAGE_DELETE}
          open={deleteModal?.show}
          handleClose={handleCloseDelete}
          showCancelButton
          submitButtonText={BUTTON_LABELS.YES}
          cancelButtonText={BUTTON_LABELS.NO}
          icon={RED_WARNING}
          handleSubmit={handleDeleteClick}
          showClose={false}
        />
        <div className="form-control">
          {!hideListSelection ? (
            <Button
              className="btn btn-md my-2  me-2"
              variant="primary"
              onClick={openModal}
            >
              {chooseFile?.length
                ? BUTTON_LABELS.CHANGE_FILE
                : BUTTON_LABELS.CHOOSE_FILE}
            </Button>
          ) : null}
          {imageList?.files?.length && hideListSelection ? (
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple={!singleImageSelectionEnabled}
                onChange={handleAddFilesForNoListShownCase}
              />
              <Button
                className="btn btn-md my-2  me-2"
                variant="primary"
                onClick={openFileInputForNoListShownCase}
              >
                {singleImageSelectionEnabled
                  ? BUTTON_LABELS.CHANGE_FILE
                  : BUTTON_LABELS.ADD_FILE}
              </Button>
            </>
          ) : null}
          {!imageList?.files?.length && hideListSelection && !isLoading ? (
            <ImageUploadBox
              label={label}
              subLabel={subLabel}
              accept={accept}
              renderSelectedFile={renderSelectedFile}
              fileValue={fileValue}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              ref={ref}
              ratio={ratio}
              isDragActive={isDragActive}
              handleFileUpload={handleFileUpload}
            />
          ) : null}
          {chooseFile?.length ? (
            <div className="p-3">
              <div className="grid-container">
                {chooseFile?.map((img) => {
                  if (isProductAuction && !img.assigned) {
                    return null;
                  }
                  return (
                    <div key={img.url ?? img.fileURL} className="grid-item m-2">
                      <span className="uploaded_file position-relative">
                        {hideListSelection ? (
                          <button
                            type="button"
                            className="btn  btn-danger d-inline-flex align-items-center justify-content-center btn-danger-outline ms-2 uploaded-pic-grid__delete-button"
                            onClick={() =>
                              handleClickDeleteForNoListSelectionCase(img)
                            }
                          >
                            <img src={Delete} alt="delete" />
                          </button>
                        ) : null}
                        <FileRenderer fileURL={img.url ?? img.fileURL} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <FileUploadModal
          showModal={showModal}
          handleCloseModal={handleCloseFileUploadModal}
          label={label}
          subLabel={subLabel}
          accept={accept}
          ratio={ratio}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          chooseFile={chooseFile}
          handleChooseFile={handleChooseFile}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          fileValue={fileValue}
          imageList={imageList}
          handleDeleteFile={handleOpenDeleteFileConfirmation}
          singleImageSelectionEnabled={singleImageSelectionEnabled}
          handleFileUpload={handleFileUpload}
          renderSelectedFile={renderSelectedFile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ref={ref}
          hideListSelection={hideListSelection}
        />
      </>
    );
  }
);

FileInput.displayName = 'FileInput';
export default FileInput;
