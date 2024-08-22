/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
// Libraries
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactPaginate from 'react-paginate';

// Components
import ConfirmationModal from '../../../../../Shared/components/ConfirmationModal';
import CustomTableView, {
  Column,
  Row,
} from '../../../../../Shared/components/CustomTableView';
import StatsFilters from '../../../../../Shared/components/Filters';
import ViewMultiTableItem from '../ViewMultiTableItem';

// Constants
import {
  BUTTON_LABELS,
  FilterOrder,
  PRICE_RANGE,
  STRINGS,
} from '../../../../../Shared/constants';
import { Filter, RED_WARNING } from '../../../../../assets';
import {
  BID_STATUS_OPTIONS,
  CONFIRMATION_DESCRIPTION,
  biddingHistoryColumn,
} from '../../helpers/constants';

// Models
import { ViewMultiData } from '../../helpers/model';

// API

// Utilities
import { useGetBidsSpentHistoryQuery } from '../../../../../Services/Api/module/auctionHistories';
import { FiltersState } from '../../../../../Shared/components/Filters/helpers/models';
import { removeEmptyValues } from '../../../../../Shared/utils/functions';
import { transformBiddingHistoryResponse } from '../../helpers/utils';

interface DeleteData {
  data: { id?: string; ids?: string[] } | null;
  show: boolean;
}

interface FilterPayload {
  fromDate?: string | Date;
  toDate?: string | Date;
  status?: number | string;
  type?: number | string;
  currentBidPriceMin?: number;
  currentBidPriceMax?: number;
}

// Constants
const PROFILE_RELATED_LIST_PAGE_LIMIT = 10;

export default function BiddingHistory({
  search = '',
  setSearch = () => {},
  currentPage = 0,
  setCurrentPage = () => {},
  sortKey = '',
  sortDirection = FilterOrder.ASCENDING,
  setSortKey = () => {},
  setSortDirection = () => {},
  userId,
  currentTab,
  callBidsCreditApi,
}: {
  search: string;
  setSearch: (search: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortKey: string;
  sortDirection: FilterOrder;
  setSortKey: (search: string) => void;
  setSortDirection: (order: FilterOrder) => void;
  userId?: string;
  currentTab: string;
  callBidsCreditApi?: boolean;
}) {
  // State Management
  const [deleteModal, setDeleteModal] = useState<DeleteData>({
    show: false,
    data: { id: '', ids: [''] },
  });
  const [filters, setFilters] = useState({});
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const [tableData, setTableData] = useState({ data: [], count: 0 });
  const [showMultiItemView, setShowMultiItemView] = useState<ViewMultiData>({
    data: { title: '' },
    show: false,
  });

  // Refs
  const onComponentMountRef = useRef(false);

  // Query Parameters
  const queryParams = {
    skip: currentPage * PROFILE_RELATED_LIST_PAGE_LIMIT,
    limit: PROFILE_RELATED_LIST_PAGE_LIMIT,
    searchString: search,
    sortKey,
    sortDirection,
    userId,
    ...filters,
  };
  // API Queries
  const { data: userBidsSpentHistory, refetch: refetchBidsSpentHistory } =
    useGetBidsSpentHistoryQuery(
      {
        params: removeEmptyValues(
          queryParams as unknown as Record<string, unknown>
        ),
      }
      // {
      //   skip: currentTab !== UserDetailsTabs.BIDDING_HISTORY,
      // }
    );
  // Function to handle page click
  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  // Function to close delete modal
  const handleCloseDelete = () => {
    setDeleteModal({ data: null, show: false });
  };

  // Function to handle sorting click
  const handleSortingClick = (
    selectedOrder: number = FilterOrder.DESCENDING,
    selectedSortKey: string = ''
  ) => {
    setSortKey(selectedSortKey);
    setSortDirection(selectedOrder);
  };

  // Function to handle search with debounce
  const debounceSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(0);
    setSearch(e.target.value);
  }, 1000);

  const columns = useMemo(() => {
    return biddingHistoryColumn;
  }, [currentTab]);

  const refetchData = useCallback(() => {
    try {
      if (refetchBidsSpentHistory) {
        refetchBidsSpentHistory();
        setSelectedRow('');
      }
    } catch (err) {
      console.error('error');
    }
  }, []);

  useEffect(() => {
    if (onComponentMountRef.current) {
      refetchData();
    }
    onComponentMountRef.current = true;
  }, [
    currentTab,
    search,
    sortDirection,
    sortKey,
    callBidsCreditApi,
    refetchBidsSpentHistory,
    filters,
    refetchData,
  ]);

  // Define the useEffect hook
  useEffect(() => {
    const transformFunction = transformBiddingHistoryResponse;

    if (transformFunction) {
      const data = transformFunction(userBidsSpentHistory);

      setTableData(data as unknown as { data: never[]; count: number });
    } else {
      setTableData({ data: [], count: 0 });
    }
  }, [currentTab, userBidsSpentHistory]);

  const handleApplyFilters = (filter: FiltersState) => {
    const initalFilterPayload: FilterPayload = {
      fromDate: filter?.startDate,
      toDate: filter?.endDate,
      status: filter?.selectedStatus?.value,
      currentBidPriceMin: filter?.priceRange?.[0],
      currentBidPriceMax: filter?.priceRange?.[1],
    };
    setFilters(initalFilterPayload);
    setCurrentPage(0);
  };
  return (
    <>
      <ViewMultiTableItem
        show={showMultiItemView}
        setShow={setShowMultiItemView}
      />

      <ConfirmationModal
        title={CONFIRMATION_DESCRIPTION.DELETE}
        open={deleteModal?.show}
        handleClose={handleCloseDelete}
        showCancelButton
        submitButtonText={BUTTON_LABELS.YES}
        cancelButtonText={BUTTON_LABELS.NO}
        icon={RED_WARNING}
        handleSubmit={() => {}}
        showClose={false}
      />

      <StatsFilters
        handleClearSearch={() => setSearch('')}
        handleSearch={debounceSearch}
        filterToggleImage={Filter}
        showHeading={false}
        showDateFilter
        statusOptions={BID_STATUS_OPTIONS}
        rangeSilderTitle="Item Price"
        priceRange={PRICE_RANGE}
        handleApply={handleApplyFilters}
      />

      <CustomTableView
        rows={(tableData?.data as unknown as Row[]) || []}
        columns={columns as unknown as Column[]}
        pageSize={PROFILE_RELATED_LIST_PAGE_LIMIT}
        noDataFound={STRINGS.NO_RESULT}
        handleSortingClick={handleSortingClick}
        quickEditRowId={null}
        selectedRow={selectedRow}
        renderTableFooter={() => (
          <ReactPaginate
            pageCount={
              (tableData?.count || 1) / PROFILE_RELATED_LIST_PAGE_LIMIT
            }
            onPageChange={handlePageClick}
            activeClassName={STRINGS.ACTIVE}
            nextClassName={`${STRINGS.NEXT_BTN} ${
              Math.ceil(
                (tableData?.count || 1) / PROFILE_RELATED_LIST_PAGE_LIMIT
              ) !==
              currentPage + 1
                ? STRINGS.EMPTY_STRING
                : STRINGS.DISABLED
            }`}
            previousClassName={STRINGS.PREV_BTN}
            disabledClassName={STRINGS.DISABLED}
            forcePage={currentPage}
          />
        )}
      />
    </>
  );
}
