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
    <div className="admin-handle inventory-page-shell">
      <div className="inventory-page-header">
        <h2 className="admin-title">Manage Inventory</h2>
        <p className="inventory-page-subtitle">
          Curate catering and stationery products for voyagers with real-time stock visibility.
        </p>
      </div>

      <section className="inventory-section inventory-section-form">
        <AddNewItem onItemAdded={refetch} />
      </section>

      <section className="inventory-section inventory-section-table">
        {loading && !data ? (
          <div className="inventory-feedback-card">Loading inventory...</div>
        ) : error ? (
          <div className="inventory-feedback-card inventory-feedback-error">{error.message}</div>
        ) : (
          <EditDeleteNewItem items={items} refreshItems={refetch} />
        )}
      </section>
    </div>
  );
};

export default Admin;
