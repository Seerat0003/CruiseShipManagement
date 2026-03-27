import React, { useState } from "react";
import './EditDeleteNewItem.css';

const EditDeleteNewItem = ({ items = [], refreshItems }) => {
  const [editItemId, setEditItemId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", type: "catering", price: "" });

  const handleEditClick = (item) => {
    console.log("Editing item:", item);
    setEditItemId(item.id);
    setEditForm({ name: item.name, type: item.type, price: item.price });
  };

  const handleEditChange = (e) => {
    console.log(`Edit field changed - ${e.target.name}:`, e.target.value);
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    console.log("Attempting to save item:", { id, ...editForm });

    alert("Item editing is not wired right now.");
    refreshItems();

    setEditItemId(null);
    console.log("Exited edit mode.");
  };

  const handleDelete = async (id, type) => {
    console.log(`Attempting to delete item ${id} from ${type}`);
    alert("Item deletion is not wired right now.");
    refreshItems();
  };

  const handleCancel = () => {
    console.log("Edit cancelled for item:", editItemId);
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
            <th className="edit-delete-header-cell">Price</th>
            <th className="edit-delete-header-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="4" className="edit-delete-empty-row">
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
                      onChange={handleEditChange}
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
                    <input
                      name="price"
                      type="number"
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
                    <>
                      <button
                        onClick={() => handleSave(item.id)}
                        className="edit-delete-btn save"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="edit-delete-btn cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="edit-delete-btn edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.type)}
                        className="edit-delete-btn delete"
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
