import { Navigate } from 'react-router-dom';
import { ROUTES_CONFIG, WILDCARD_ROUTES } from '../Shared/constants';
import Dashboard from '../Views/Dashboard';
import { ProductsList } from '../Views/Products';
import { CustomRouter } from './RootRoutes';
import { CategoriesList } from '../Views/Categories';
import Users from '../Views/Users';
import UserDetails from '../Views/Users/UserDetails';
import Invoices from '../Views/Invoices';
import { CreateReferral, ReferralListing } from '../Views/ReferralSystem';

// eslint-disable-next-line import/prefer-default-export
export const PRIVATE_ROUTES: Array<CustomRouter> = [
  {
    path: ROUTES_CONFIG.HOMEPAGE.path,
    element: <Dashboard />,
    title: ROUTES_CONFIG.HOMEPAGE.title,
  },
  {
    path: ROUTES_CONFIG.INVOICES_AUCTION.path,
    element: <Invoices />,
    title: ROUTES_CONFIG.INVOICES_AUCTION.title,
  },
  {
    path: ROUTES_CONFIG.INVOICES_PURCHASE.path,
    element: <Invoices />,
    title: ROUTES_CONFIG.INVOICES_PURCHASE.title,
  },
  {
    path: ROUTES_CONFIG.PRODUCTS.path,
    element: <ProductsList />,
    title: ROUTES_CONFIG.PRODUCTS.title,
  },
  {
    path: ROUTES_CONFIG.CATEGORIES.path,
    element: <CategoriesList />,
    title: ROUTES_CONFIG.CATEGORIES.title,
  },
  {
    path: ROUTES_CONFIG.USERS.path,
    element: <Users />,
    title: ROUTES_CONFIG.USERS.title,
  },
  {
    path: ROUTES_CONFIG.USERS_DETAILS.path,
    element: <UserDetails />,
    title: ROUTES_CONFIG.USERS_DETAILS.title,
  },
  // Referral
  {
    path: ROUTES_CONFIG.CREATE_REFERRAL.path,
    element: <CreateReferral />,
    title: ROUTES_CONFIG.CREATE_REFERRAL.title,
  },
  {
    path: ROUTES_CONFIG.REFERRAL_LISTING.path,
    element: <ReferralListing />,
    title: ROUTES_CONFIG.REFERRAL_LISTING.title,
  },
  {
    path: `${ROUTES_CONFIG.REFERRAL_LISTING.path}/:id`,
    element: <ReferralListing />,
    title: ROUTES_CONFIG.REFERRAL_LISTING.title,
  },
  // Wildcard
  {
    path: '*',
    element: <Navigate to={WILDCARD_ROUTES.PRIVATE} />,
    title: 'Rendering wildcard',
  },
];
