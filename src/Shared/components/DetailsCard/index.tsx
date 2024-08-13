import React, { useCallback, useState } from 'react';
import { ProductDetailResponsePayload } from '../../../Views/Auction/AuctionDetails/Helpers/Model';
import { AuctionDetailsColumnData } from '../../../Views/Auction/AuctionDetails/Helpers/constants';

const styles = {
  container: {
    border: '1px solid #000',
    padding: '10px',
    borderRadius: '5px',
    width: '100%',
    color: 'black',
  },
  table: {
    display: 'table' as const,
    width: '100%',
  },
  row: {
    display: 'table-row' as const,
  },
  cell: {
    display: 'table-cell' as const,
    padding: '5px',
    border: '1px solid #000',
    textAlign: 'center' as const,
  },
  icon: {
    width: '20px',
    height: '20px',
  },
  input: {
    width: '100%',
    padding: '5px',
    textAlign: 'center' as const,
  },
};

type DetailsWrapperCardProps = {
  details: ProductDetailResponsePayload;
  dataScema: AuctionDetailsColumnData[];
};

// Helper function to format keys (convert camelCase or underscores to readable text)

// Helper function to render values, handling different types of content
const renderValue = (
  value: React.ReactNode,
  editable: boolean | undefined,
  onChange: (newValue: string | number) => void
): JSX.Element | React.ReactNode => {
  if (editable && (typeof value === 'string' || typeof value === 'number')) {
    return (
      <input
        type={typeof value === 'number' ? 'number' : 'text'}
        value={value as string | number}
        onChange={(e) =>
          onChange(typeof value === 'number' ? +e.target.value : e.target.value)
        }
        style={styles.input}
      />
    );
  }

  if (typeof value === 'boolean') {
    return <input type="checkbox" checked={value} readOnly />;
  }

  if (typeof value === 'string' && value.startsWith('http')) {
    return <img src={value} alt="icon" style={styles.icon} />;
  }

  return value;
};

function DetailsWrapperCard({ details, dataScema }: DetailsWrapperCardProps) {
  const [data, setData] = useState(details);

  const handleValueChange = (
    newValue: string | number,
    key: keyof ProductDetailResponsePayload
  ) => {
    const updatedData = { ...data, [key]: newValue };
    setData(updatedData);
  };

  const getColumnValue = useCallback(
    (rows: ProductDetailResponsePayload, column: AuctionDetailsColumnData) => {
      if (column.render && column.fieldName) {
        return column.render(
          rows,
          rows[column.fieldName as keyof ProductDetailResponsePayload]
        );
      }
      if (
        typeof rows[column.fieldName as keyof ProductDetailResponsePayload] ===
        'number'
      ) {
        return rows[column.fieldName as keyof ProductDetailResponsePayload];
      }
      return (
        rows[column.fieldName as keyof ProductDetailResponsePayload] || '-'
      );
    },
    []
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="row border p-3">
        {dataScema.map((field) => (
          <div key={field.title} className="col-md-3 mb-3">
            <h5 className="font-weight-bold">{field.title}</h5>
            <p>
              {' '}
              {renderValue(
                getColumnValue(data, field),
                field.isEditable,
                (newValue) =>
                  handleValueChange(
                    newValue,
                    field.fieldName as keyof ProductDetailResponsePayload
                  )
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetailsWrapperCard;
