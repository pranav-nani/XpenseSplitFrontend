import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/AddExpenseModal.css";

const AddGroupExpenseModal = ({ group, onClose, onExpenseAdded }) => {
  // --- Get the current logged-in user ---
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser
    ? JSON.parse(storedUser).username.split("_")[0]
    : null;

  // --- State Management ---
  // The initial state is now calculated here and set only once.
  // This resolves the infinite loop.
  const initialSelectedMembers = group.members.filter(
    (member) => member !== currentUser
  );

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMembers, setSelectedMembers] = useState(
    initialSelectedMembers
  );

  // Members available for splitting (used for the list)
  const availableMembers = group.members.filter(
    (member) => member !== currentUser
  );

  const handleMemberSelect = (member) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  const handleSelectAll = () => {
    const allAreSelected = availableMembers.length === selectedMembers.length;
    setSelectedMembers(allAreSelected ? [] : availableMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("You must be logged in to add an expense.");
      return;
    }

    // --- START OF FIX ---

    // 1. Calculate the total number of people splitting the bill
    const totalParticipants = [currentUser, ...selectedMembers];
    const splitCount = totalParticipants.length;

    // 2. Calculate the amount per person
    const splitAmount =
      splitCount > 0 ? (Number(amount) / splitCount).toFixed(2) : 0;

    // 3. Build the 'splitWith' object (the Map)
    const splitWithObject = {};
    totalParticipants.forEach((member) => {
      splitWithObject[member] = parseFloat(splitAmount);
    });

    // 4. Create the final expense object with the correct structure
    const expense = {
      id: `exp-${Date.now()}`,
      description,
      amount: Number(amount),
      paidBy: currentUser,
      splitWith: splitWithObject, // Use the new object here
    };

    // --- END OF FIX ---

    try {
      await axios.post(
        `http://localhost:8080/api/groups/${group.id}/addExpense`,
        expense
      );

      toast.success("Expense added successfully!");
      onExpenseAdded();
      onClose();
    } catch (err) {
      console.error("Failed to add expense:", err);
      toast.error("Failed to add expense.");
    }
  };

  const allSelected =
    availableMembers.length > 0 &&
    availableMembers.length === selectedMembers.length;
  const selectedCount = selectedMembers.length;
  const totalParticipants = selectedMembers.length + 1;
  const splitAmount =
    totalParticipants > 0 && amount > 0
      ? (amount / totalParticipants).toFixed(2)
      : 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Expense to "{group.groupName}"</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              id="amount"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Split between:</label>
            <p className="split-info">
              Paid by <strong>You</strong> and split with the following members.{" "}
              <br />
              (₹{splitAmount} / person)
            </p>
            <div className="user-selection-container">
              <div className="user-selection-header">
                <span className="selection-count">
                  {selectedCount} of {availableMembers.length} members selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`select-all-btn-expense-modal ${
                    allSelected ? "clear-all-active" : ""
                  }`}>
                  {allSelected ? "Clear All" : "Select All"}
                </button>
              </div>
              <div className="user-selection-list">
                {availableMembers.map((member) => (
                  <div key={member} className="user-checkbox-container">
                    <label className="user-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member)}
                        onChange={() => handleMemberSelect(member)}
                      />
                      <span>{member}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              type="submit"
              className="btn btn-primary btn-full-width"
              disabled={!description || !amount || amount <= 0}>
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupExpenseModal;
