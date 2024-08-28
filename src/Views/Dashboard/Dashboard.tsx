// src/components/Dashboard.tsx

import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetDashboardQuery } from '../../Services/Api/module/dashboard';
import { Filters } from '../../Shared/components';
import { FiltersState } from '../../Shared/components/Filters/helpers/models';
import {
  convertToLocale,
  removeEmptyValues,
} from '../../Shared/utils/functions';
import { RedirectionIcon } from '../../assets';
import { BidsHistory } from '../Transactions';
import cardData from './helpers/constants';
import './style.scss';

function Dashboard() {
  const [search, setSearch] = useState<string>('');
  const onComponentMountRef = useRef(false);

  const [filters, setFilters] = useState({});
  const debounceSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, 1000);

  const handleApplyFilters = (filterState: FiltersState) => {
    setFilters({
      fromDate: filterState?.startDate,
      toDate: filterState?.endDate,
    });
  };
  const queryParams = {
    searchString: search,
    ...filters,
  };
  const { data: dashboard, refetch } = useGetDashboardQuery({
    params: removeEmptyValues(
      queryParams as unknown as Record<string, unknown>
    ),
  });
  useEffect(() => {
    if (onComponentMountRef.current) {
      refetch();
    }
    onComponentMountRef.current = true;
  }, [refetch, search, filters]);
  return (
    <>
      <Filters
        handleClearSearch={() => setSearch('')}
        handleSearch={debounceSearch}
        showDateFilter
        showSearch={false}
        handleApply={handleApplyFilters}
      />
      <div className="row dashboad-cards">
        {cardData?.map((card) => (
          <div key={card?.label} className="col-lg-3 col-sm-6 col-xl-3 mb-4">
            <div className="card h-100">
              <div className="card-body d-inline-flex flex-column justify-content-center align-items-start">
                <em className="d-Icon">
                  <img src={card.icon} alt="Icon" width="70" />
                </em>
                <span className="text-small">{card.label}</span>
                <h2 className="h4">
                  {convertToLocale(dashboard?.[card?.field], card.isCurrency)}
                </h2>
                <span
                  className={`d-inline-flex align-items-center badge ${card.badge.color}`}
                >
                  <em className="me-2">
                    <img
                      src={card.badge.icon}
                      alt="badge"
                      width={16}
                      height={16}
                    />
                  </em>
                  {card.badge.percentage}
                </span>
                <Link className="redirection" to={card?.redirectionRoute || ''}>
                  <img src={RedirectionIcon} alt="" width="40" height="40" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BidsHistory onDashBoard={false} />
    </>
  );
}

export default Dashboard;
