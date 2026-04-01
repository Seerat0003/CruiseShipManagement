import React, { useState, useEffect } from "react";
import AddNewItem from "./AddNewItem";
import EditDeleteNewItem from "./EditDeleteNewItem";
import "./Admin.css";

const Admin = () => {
  const [items, setItems] = useState([]); //state to store items

  // Placeholder until persistence is reworked.
  const fetchItems = async () => {
    setItems([]);
  };

  //fetchItems when the component mounts
  useEffect(() => {
    console.log("Admin component mounted. Initiating fetchItems...");
    fetchItems();
  }, []);

  return (
    <div className="admin-handle">
      <h2 className="admin-title">Admin Panel</h2>

      {/* Component for adding a new item */}
      {/* onItemAdded refresh after new item is added */}
      <AddNewItem onItemAdded={() => {
        console.log("New item added. Refreshing item list...");
        fetchItems();
      }} />

      {/* Component for editing and deleting items */}
      {/* refreshItems to fetch items on edit/delete */}
      <EditDeleteNewItem items={items} refreshItems={() => {
        console.log("Refresh requested from child component. Re-fetching items...");
        fetchItems();
      }} />
    </div>
  );
};

export default Admin;
