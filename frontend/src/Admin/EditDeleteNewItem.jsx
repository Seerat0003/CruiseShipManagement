import React, { useState } from "react";
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';
import './EditDeleteNewItem.css';
import { DELETE_PRODUCT_MUTATION, UPDATE_PRODUCT_MUTATION } from '../graphql/operations';
import { categoryGroups, getItemTypeFromCategory } from './inventoryConfig';

const EditDeleteNewItem = ({ items = [], refreshItems }) => {
  const [updateProduct, { loading: isSaving }] = useMutation(UPDATE_PRODUCT_MUTATION);
  const [deleteProduct, { loading: isDeleting }] = useMutation(DELETE_PRODUCT_MUTATION);
  const [editItemId, setEditItemId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "catering",
    category: categoryGroups.catering[0],
    price: "",
    stock: "0",
  });

  const handleEditClick = (item) => {
    const type = getItemTypeFromCategory(item.category);
    setEditItemId(item.id);
    setEditForm({
      name: item.name,
      type,
      category: item.category,
      price: String(item.price ?? ""),
      stock: String(item.stock ?? 0),
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      await updateProduct({
        variables: {
          id,
          name: editForm.name,
          category: editForm.category,
          price: Number.parseFloat(editForm.price),
          stock: Number.parseInt(editForm.stock, 10),
        },
      });

      toast.success("Item updated in the database.");
      refreshItems();
      setEditItemId(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update item.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct({
        variables: { id },
      });
      toast.success("Item deleted from the database.");
      refreshItems();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete item.");
    }
  };

  const handleCancel = () => {
    setEditItemId(null);
  };

  return (
    <div className="edit-delete-container">
      <h2 className="edit-delete-title">Edit / Delete Items</h2>
      <table className="edit-delete-table">
        <thead>
          <tr className="edit-delete-header-row">
            <th className="edit-delete-header-cell">Name</th>
            <th className="edit-delete-header-cell">Type</th>
            <th className="edit-delete-header-cell">Category</th>
            <th className="edit-delete-header-cell">Price</th>
            <th className="edit-delete-header-cell">Stock</th>
            <th className="edit-delete-header-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="6" className="edit-delete-empty-row">
                No items to display.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="edit-delete-data-row">
                <td className="edit-delete-cell">
                  {editItemId === item.id ? (
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="edit-delete-input"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="edit-delete-cell">
                  {editItemId === item.id ? (
                    <select
                      name="type"
                      value={editForm.type}
                      onChange={(event) => {
                        const newType = event.target.value;
                        setEditForm((prev) => ({
                          ...prev,
                          type: newType,
                          category: categoryGroups[newType][0],
                        }));
                      }}
                      className="edit-delete-select"
                    >
                      <option value="catering">Catering</option>
                      <option value="stationery">Stationery</option>
                    </select>
                  ) : (
                    item.type
                  )}
                </td>
                <td className="edit-delete-cell">
                  {editItemId === item.id ? (
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      className="edit-delete-select"
                    >
                      {categoryGroups[editForm.type].map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    item.category
                  )}
                </td>
                <td className="edit-delete-cell">
                  {editItemId === item.id ? (
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={handleEditChange}
                      className="edit-delete-input"
                    />
                  ) : (
                    `$${item.price}`
                  )}
                </td>
                <td className="edit-delete-cell">
                  {editItemId === item.id ? (
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={handleEditChange}
                      className="edit-delete-input"
                    />
                  ) : (
                    item.stock
                  )}
                </td>
                <td className="edit-delete-cell">
                  {editItemId === item.id ? (
                    <>
                      <button
                        onClick={() => handleSave(item.id)}
                        className="edit-delete-btn save"
                        disabled={isSaving}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="edit-delete-btn cancel"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="edit-delete-btn edit"
                        disabled={isDeleting}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="edit-delete-btn delete"
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EditDeleteNewItem;
