import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { MANAGER_BOOKINGS_QUERY } from '../graphql/operations';

const ManagerBookingsTable = ({
  category,
  title,
  containerClassName,
  tableClassName,
  emptyMessage,
  loadingMessage,
  titleClassName,
  useMain = false,
  columns,
  mapBookingToRow,
}) => {
  const { data, loading, error, refetch } = useQuery(MANAGER_BOOKINGS_QUERY, {
    variables: { category },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener('REFRESH_BOOKINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_BOOKINGS', handleRefresh);
  }, [refetch]);

  const bookings = data?.bookings ?? [];
  const Wrapper = useMain ? 'main' : 'div';

  return (
    <Wrapper className={containerClassName}>
      <h1 className={titleClassName}>{title}</h1>

      {loading ? (
        <p>{loadingMessage}</p>
      ) : error ? (
        <p>{error.message}</p>
      ) : bookings.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <table className={tableClassName}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const values = mapBookingToRow(booking);
              return (
                <tr key={booking.id}>
                  {values.map((value, index) => (
                    <td key={`${booking.id}-${columns[index]}`}>{value}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Wrapper>
  );
};

export default ManagerBookingsTable;
