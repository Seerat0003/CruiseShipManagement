import React, { useState } from "react";
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';
import './AddNewItem.css';
import { CREATE_PRODUCT_MUTATION } from '../graphql/operations';
import { categoryGroups } from './inventoryConfig';

const AddNewItem = ({ onItemAdded }) => {
  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT_MUTATION);
  const [item, setItem] = useState({
    name: "",
    price: "",
    stock: "0",
    category: categoryGroups.catering[0],
    type: "catering",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!item.name || !item.price || !item.category || item.stock === "") {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      await createProduct({
        variables: {
          name: item.name,
          category: item.category,
          price: Number.parseFloat(item.price),
          stock: Number.parseInt(item.stock, 10),
        },
      });

      toast.success("Item saved to the database.");
      setItem({
        name: "",
        price: "",
        stock: "0",
        category: categoryGroups.catering[0],
        type: "catering",
      });

      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save item.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-item-form">
      <h2 className="form-title">Add New Item</h2>

      <select
        name="type"
        value={item.type}
        onChange={(event) => {
          const newType = event.target.value;
          setItem((prev) => ({
            ...prev,
            type: newType,
            category: categoryGroups[newType][0],
          }));
        }}
        className="form-select"
      >
        <option value="catering">Catering</option>
        <option value="stationery">Stationery</option>
      </select>

      <input
        name="name"
        placeholder="Item Name"
        value={item.name}
        onChange={handleChange}
        className="form-input"
        required
        disabled={loading}
      />

      <input
        name="price"
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        value={item.price}
        onChange={handleChange}
        className="form-input"
        required
        disabled={loading}
      />

      <input
        name="stock"
        type="number"
        min="0"
        placeholder="Stock"
        value={item.stock}
        onChange={handleChange}
        className="form-input"
        required
        disabled={loading}
      />

      <select
        name="category"
        value={item.category}
        onChange={handleChange}
        className="form-select"
        disabled={loading}
      >
        {categoryGroups[item.type].map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <button type="submit" className="form-button" disabled={loading}>
        {loading ? "Saving..." : "Add Item"}
      </button>
    </form>
  );
};

export default AddNewItem;
