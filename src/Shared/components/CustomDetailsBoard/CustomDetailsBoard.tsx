/* eslint-disable jsx-a11y/label-has-associated-control */
import { STRINGS } from '../../constants/constants';
import { VariableTypes } from '../../constants/enums';
import { convertToLocale } from '../../utils/functions';
import TruncateText from '../TruncateText';

export interface FieldSchema {
  label: string;
  key: keyof DataKeys;
  truncate?: boolean;
  format?: boolean;
  currencyFormat?: boolean;
  render?: (
    value: string | number | undefined,
    data: DataKeys
  ) => React.ReactNode;
}

export interface DataKeys {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
  auctionsWon?: number;
  referralBidsEarned?: number;
  bidBalance?: number;
  ongoingAuctions?: number;
  totalSpent?: number;
  referredFriendsCount?: number;
  registrationNumber?: string;
  modelYear?: string;
  paint?: string;
  fuel?: string;
  motor?: string;
  gearbox?: string;
  gearCount?: number;
  seatCount?: number;
  security?: string;
  comfort?: string;
  appearance?: string;
  personalNumber?: string;
  bodyType?: string;
}

interface CustomProfileProps {
  schema: FieldSchema[];
  data: DataKeys;
}

function CustomDetailsBoard({ schema, data }: Readonly<CustomProfileProps>) {
  const renderFieldValue = (field: FieldSchema) => {
    const value = data?.[field.key];

    if (field.render) {
      return field.render(value, data);
    }

    if (field.truncate && typeof value === VariableTypes.string) {
      return <TruncateText text={value ?? `No ${field.label}`} />;
    }
    if (field.format && typeof value === VariableTypes.number) {
      return convertToLocale(value);
    }
    if (field.currencyFormat && typeof value === VariableTypes.number) {
      return `${convertToLocale(value, true)}`;
    }
    if (typeof value === VariableTypes.number) {
      return value;
    }
    return value ?? STRINGS.DEFAULT_VALUE;
  };

  return (
    <div className="card">
      <div className="card-body px-4">
        <div className="row pt-2">
          {schema.map((field) => (
            <div key={field.label} className="col-md-3 mb-3">
              <label className="font-weight-bold">{field.label}</label>
              <p>{renderFieldValue(field)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomDetailsBoard;
