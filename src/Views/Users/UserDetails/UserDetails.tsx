import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CustomModal from '../../../Shared/components/CustomModal';
import CustomTabs from '../../../Shared/components/CustomTabs';
import Filters from '../../../Shared/components/Filters';
import { BUTTON_LABELS, FilterOrder } from '../../../Shared/constants';
import AddBidForm from './components/AddBidForm';
// import ProfileRelatedLists from './components/ProfileRelatedLists';
import UserProfile from './components/UserProfile';
import { UserDetailsTabs } from './helpers/constants';
import BidPurchaseHistory from './components/ProfileRelatedLists/BidPurchaseHistory';
import BiddingHistory from './components/ProfileRelatedLists/BiddingHistory';
import ProductHistoryList from './components/ProfileRelatedLists/ProductHistory';
import ReferalHistoryList from './components/ProfileRelatedLists/ReferalHistoryList';
import AuctionHistory from './components/ProfileRelatedLists/AuctionHistory';
import { useGetUsersQuery } from '../../../Services/Api/module/users';

export default function UserDetails() {
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState(
    UserDetailsTabs.BIDS_PURCHASE_HISTORY
  );
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<FilterOrder>(
    FilterOrder.ASCENDING
  );
  const { data: userDetails, refetch: refetchUserDetails } = useGetUsersQuery({
    params: { userId: state },
  });
  const [addData, setAddData] = useState<boolean>(false);
  const [callBidsCreditApi, setCallBidsCreditApi] = useState<boolean>(false);
  const handleAddSuccess = () => {
    setAddData(false);
    setCallBidsCreditApi(true);
    refetchUserDetails();
  };

  const handleAddBids = () => {
    setAddData(true);
    setCallBidsCreditApi(false);
  };

  const userTabs = useMemo(() => Object.values(UserDetailsTabs), []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearch('');
    setCurrentPage(0);
    setSortKey('');
    setSortDirection(FilterOrder.ASCENDING);
  };
  const renderProfileRelatedList = () => {
    switch (activeTab) {
      case UserDetailsTabs.BIDS_PURCHASE_HISTORY:
        return (
          <BidPurchaseHistory
            search={search}
            setSearch={setSearch}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            setSortKey={setSortKey}
            setSortDirection={setSortDirection}
            userId={state}
            currentTab={activeTab}
            callBidsCreditApi={callBidsCreditApi}
          />
        );
      case UserDetailsTabs.BIDDING_HISTORY:
        return (
          <BiddingHistory
            search={search}
            setSearch={setSearch}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            setSortKey={setSortKey}
            setSortDirection={setSortDirection}
            userId={state}
            currentTab={activeTab}
            callBidsCreditApi={callBidsCreditApi}
          />
        );
      case UserDetailsTabs.PRODUCT_HISTORY:
        return (
          <ProductHistoryList
            search={search}
            setSearch={setSearch}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            setSortKey={setSortKey}
            setSortDirection={setSortDirection}
            userId={state}
            currentTab={activeTab}
            callBidsCreditApi={callBidsCreditApi}
          />
        );
      case UserDetailsTabs.REFERRAL_HISTORY:
        return (
          <ReferalHistoryList
            search={search}
            setSearch={setSearch}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            setSortKey={setSortKey}
            setSortDirection={setSortDirection}
            userId={state}
            currentTab={activeTab}
            callBidsCreditApi={callBidsCreditApi}
          />
        );
      case UserDetailsTabs.AUCTION_HISTORY:
        return (
          <AuctionHistory
            search={search}
            setSearch={setSearch}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            setSortKey={setSortKey}
            setSortDirection={setSortDirection}
            userId={state}
            currentTab={activeTab}
            callBidsCreditApi={callBidsCreditApi}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {addData && (
        <CustomModal
          title="Add Bids"
          show={addData}
          onClose={() => setAddData(false)}
        >
          <AddBidForm
            initialData={{ userId: state }}
            onAdd={handleAddSuccess}
          />
        </CustomModal>
      )}
      <Filters
        showSearch={false}
        addButtonLabel={BUTTON_LABELS.ADD_BIDS}
        setAddData={handleAddBids}
        showFiltersToggle={false}
      />
      <UserProfile userDetails={userDetails} />
      <div className="mt-4 mt-lg-5 tab-with-filter">
        <CustomTabs
          tabs={userTabs}
          setActiveTab={handleTabChange}
          activeTab={activeTab}
        />
        {renderProfileRelatedList()}
        {/* <ProfileRelatedLists
          search={search}
          setSearch={setSearch}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sortKey={sortKey}
          sortDirection={sortDirection}
          setSortKey={setSortKey}
          setSortDirection={setSortDirection}
          userId={state}
          currentTab={activeTab}
          callBidsCreditApi={callBidsCreditApi}
        /> */}
      </div>
    </>
  );
}
