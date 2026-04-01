import React, { useState } from "react";
import './AddNewItem.css';

//defining categories options for catering and stationery
const categories = {
  catering: [
    "Starter",
    "Friday Special",
    "Dinner",
    "Desserts",
    "Chinese",
    "Japanese"
  ],
  stationery: [
    "Writing Tools",
    "Notes & Pads",
    "Measuring Tools",
    "Accessories"
  ]
};

const AddNewItem = ({ onItemAdded }) => {
  //initializing state for a new item form
  const [item, setItem] = useState({
    name: "",
    price: "",
    category: categories.catering[0], //default to first category
    type: "catering"
  });

  //handle changes in input form and update the state item accordingly
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  // Local placeholder submit handler.
  const handleSubmit = async (e) => {
    e.preventDefault(); //revent from reload behavior
    console.log("Form submitted with:", item);

    //validation to ensure all fields are filled
    if (!item.name || !item.price || !item.category || !item.type) {
      console.warn("Form validation failed. Missing fields.");
      alert("Please fill out all fields.");
      return;
    }

    console.log("Add item submitted locally.", item);
    alert("Add-item persistence is not wired right now.");

    setItem({
      name: "",
      price: "",
      category: categories.catering[0],
      type: "catering"
    });

    if (onItemAdded) {
      onItemAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-item-form">
      <h2 className="form-title">Add New Item</h2>

      {/* Type (catering or stationery) */}
      <select
        name="type"
        value={item.type}
        onChange={(e) => {
          const newType = e.target.value;
          console.log("Changing item type to:", newType); //reset the category when type changes
          setItem({
            ...item,
            type: newType,
            category: categories[newType][0]
          });
        }}
        className="form-select"
      >
        <option value="catering">Catering</option>
        <option value="stationery">Stationery</option>
      </select>

      {/* Input for item name */}
      <input
        name="name"
        placeholder="Item Name"
        value={item.name}
        onChange={handleChange}
        className="form-input"
        required
      />

      {/* Input for item price */}
      <input
        name="price"
        type="number"
        placeholder="Price"
        value={item.price}
        onChange={handleChange}
        className="form-input"
        required
      />

      {/* Category dropdown based on selected type */}
      <select
        name="category"
        value={item.category}
        onChange={handleChange}
        className="form-select"
      >
        {categories[item.type].map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      {/* Submit button */}
      <button type="submit" className="form-button">
        Add Item
      </button>
    </form>
  );
};

export default AddNewItem;
