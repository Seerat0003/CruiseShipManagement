import React from "react";
import { useQuery } from '@apollo/client/react';
import AddNewItem from "./AddNewItem";
import EditDeleteNewItem from "./EditDeleteNewItem";
import "./Admin.css";
import { INVENTORY_PRODUCTS_QUERY } from "../graphql/operations";
import { getItemTypeFromCategory } from "./inventoryConfig";

const Admin = () => {
  const { data, loading, error, refetch } = useQuery(INVENTORY_PRODUCTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const items = (data?.products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    type: getItemTypeFromCategory(product.category),
  }));

  return (
    <div className="admin-handle">
      <h2 className="admin-title">Admin Panel</h2>

      <AddNewItem onItemAdded={refetch} />

      {loading && !data ? (
        <p style={{ color: '#fff' }}>Loading inventory...</p>
      ) : error ? (
        <p style={{ color: '#fff' }}>{error.message}</p>
      ) : (
        <EditDeleteNewItem items={items} refreshItems={refetch} />
      )}
    </div>
  );
};

export default Admin;
