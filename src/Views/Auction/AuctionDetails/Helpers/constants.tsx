import moment from 'moment';
import { Dispatch, SetStateAction } from 'react';
import { ProductDetailResponsePayload } from './Model';
import { ColumnData } from '../../../../Models/Tables';
import { ViewMultiData, Category } from '../../../Products/helpers/model';
import FileRenderer from '../../../../Shared/components/form/FileUpload/FileRenderer';
import { convertToLocale } from '../../../../Shared/utils/functions';
import { DATE_FORMATS } from '../../../../Shared/constants';

export enum DetailType {
  String,
  Number,
  Dropdown,
  Date,
  DateRange,
}
type OptionType = { value: number; label: string };
export interface AuctionDetailsColumnData {
  title?: string;
  fieldName?: string;
  isTurncated?: boolean;
  isEditable?: boolean;
  type?: DetailType;
  options?: OptionType[];
  render?: (
    row: ProductDetailResponsePayload,
    val: string | number | { categories: []; images: [] }
  ) => JSX.Element[] | string | JSX.Element | string[];
}

export const AuctionStatus: OptionType[] = [
  { value: 1, label: 'Pending' },
  { value: 2, label: 'Active' },
  { value: 3, label: 'Ended' },
  { value: 4, label: 'Cancel' },
];

export const PurchaseStatus: OptionType[] = [
  { value: 1, label: 'Pending' },
  { value: 2, label: 'Purchased' },
  { value: 3, label: 'Expired' },
  { value: 4, label: 'Cancel' },
];

const COUNT_OF_MULTI_RENDER_ELEMENTS_TO_VIEW = 2;
export const AuctionColumn = (
  setShowMultiItemView: Dispatch<SetStateAction<ViewMultiData>>
): AuctionDetailsColumnData[] => [
  {
    title: 'ID',
    isEditable: false,
    fieldName: 'id',
    render: (_, val) => {
      return `${val}`;
    },
  },
  {
    title: 'Auction Name',
    isEditable: false,
    type: DetailType.String,
    fieldName: 'title',
  },
  {
    title: 'Auction Date',
    isEditable: false,
    type: DetailType.Date,
    fieldName: 'bidStartDate',
    render: (row) =>
      moment(row?.bidStartDate).format(DATE_FORMATS.DISPLAY_DATE_WITH_TIME),
  },
  {
    title: 'Reserve End Date',
    isEditable: false,
    type: DetailType.Date,
    fieldName: 'reserveWaitingEndDate',
    render: (row) =>
      moment(row?.reserveWaitingEndDate).format(
        DATE_FORMATS.DISPLAY_DATE_WITH_TIME
      ),
  },
  {
    title: 'Reserve Price',
    isEditable: false,
    type: DetailType.Number,
    fieldName: 'reservePrice',
    render: (row) => `${convertToLocale(row?.reservePrice, true)}`,
  },
  {
    title: 'Auction Time',
    isEditable: false,
    fieldName: 'bidStartDate',
    render: (row) => {
      const start = new Date(row.bidStartDate);
      const end = new Date(row.reserveWaitingEndDate);
      // Subtracting dates to get the difference in time (milliseconds)
      const differenceInTime = end.getTime() - start.getTime();

      // Converting time difference from milliseconds to days
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);

      return `${differenceInDays.toFixed(0)} days`;
    },
  },
  {
    title: 'Bid Timer',
    isEditable: false,
    type: DetailType.Number,
    fieldName: 'turnTimer',
    render: (row) => `${convertToLocale(row?.reservePrice)} sec`,
  },
  {
    title: 'Min Auction Users',
    isEditable: false,
    type: DetailType.Number,
    fieldName: 'preAuctionUsersCount',
  },
  {
    title: 'Product Name',
    isEditable: false,
    type: DetailType.String,
    fieldName: 'productName',
  },
  {
    title: 'Category',
    isEditable: false,
    fieldName: 'categories',
    render: (_, val) => {
      const categories = (val || []) as unknown as Category[];
      if (!categories?.length) return '- - -';
      return (
        <>
          {categories?.map((category: { name: string }, index) => {
            if (index < COUNT_OF_MULTI_RENDER_ELEMENTS_TO_VIEW) {
              return `${category.name}${
                index < categories.length - 1 ? ', ' : ' '
              }`;
            }
            return null;
          })}
          {categories?.length > COUNT_OF_MULTI_RENDER_ELEMENTS_TO_VIEW ? (
            <button
              type="button"
              className="btn border py-0 px-1"
              onClick={() =>
                setShowMultiItemView({
                  show: true,
                  data: { title: 'Categories', size: 'sm', categories },
                })
              }
            >
              {`. . .+${
                categories.length - COUNT_OF_MULTI_RENDER_ELEMENTS_TO_VIEW
              }`}
            </button>
          ) : null}
        </>
      );
    },
  },

  {
    title: 'Current Item Price',
    isEditable: false,
    type: DetailType.Number,
    fieldName: 'currentBidPrice',
    render: (row) => `${convertToLocale(row?.reservePrice, true)}`,
  },
  {
    title: 'Attachment',
    isEditable: false,
    fieldName: 'productImage',
    render: (_, val) => {
      const imgData = val as unknown as {
        _id: string;
        url: string;
        title: string;
      }[];
      return (
        <div className="d-inline-flex align-items-center position-relative uploaded_file">
          {imgData?.map((img, index) =>
            index < COUNT_OF_MULTI_RENDER_ELEMENTS_TO_VIEW ? (
              <figure key={img.url}>
                <FileRenderer fileURL={img.url} />
                {/* <span>{img.title}</span> */}
              </figure>
            ) : null
          )}
          {imgData?.length > COUNT_OF_MULTI_RENDER_ELEMENTS_TO_VIEW ? (
            <button
              type="button"
              className="count_btn"
              onClick={() =>
                setShowMultiItemView({
                  show: true,
                  data: { title: 'Product Images', size: 'lg', imgData },
                })
              }
            >
              {`+${imgData.length - COUNT_OF_MULTI_RENDER_ELEMENTS_TO_VIEW}`}
            </button>
          ) : null}
        </div>
      );
    },
  },
  {
    title: 'Total Bids Placed ',
    isEditable: false,
    fieldName: 'totalBids',
  },
  {
    title: 'Status',
    isEditable: false,
    fieldName: 'status',
    type: DetailType.Dropdown,
    options: AuctionStatus,
  },
  {
    title: 'Winner',
    isEditable: false,
    fieldName: 'winnerName',
  },
  { title: 'No of Users', isEditable: false, fieldName: 'uniqueUserCount' },
  {
    title: 'Product Purchase Status',
    isEditable: false,
    fieldName: 'productPurchaseStatus',
    type: DetailType.Dropdown,
    options: PurchaseStatus,
    render: (_, val) => {
      return (
        PurchaseStatus.find((item) => {
          return item.value === val;
        })?.label.toString() || '-'
      );
    },
  },
  {
    title: 'Product Purchase Duration',
    isEditable: false,
    fieldName: 'prizeClaimDays',
    type: DetailType.String,
  },
];

export const AuctionBidColumn = (): ColumnData[] => [
  {
    title: 'Id',
    fieldName: 'id',
    sortable: true,
    sortType: 'id',
    isTruncated: true,
  },
  {
    title: 'Username',
    fieldName: 'userName',
    sortable: true,
    sortType: 'userName',
    isTruncated: true,
  },
  {
    title: 'Email',
    fieldName: 'userEmail',
    sortable: true,
    sortType: 'userEmail',
    isTruncated: true,
  },
  {
    title: 'Phone No',
    fieldName: 'userPhoneNumber',
    sortable: true,
    sortType: 'userPhoneNumber',
    isTruncated: true,
  },
  {
    title: 'Date',
    fieldName: 'createdAt',
    sortable: true,
    sortType: 'createdAt',
    render: (_, val) => {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
      const day = date.getDate().toString().padStart(2, '0');
      return `${day}-${month}-${year}`;
    },
  },
  {
    title: 'Item Price (SEK)',
    sortable: true,
    sortType: 'currentBidPrice',
    fieldName: 'currentBidPrice',
    render: (row) => `${convertToLocale(row?.reservePrice)}`,
  },
];
