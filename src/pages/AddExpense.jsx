import { useState, useEffect } from "react";
import "../styles/AddExpense.css";
import CategoryModal from "../components/CategoryModal";
import { toast } from "react-toastify";
import { categorizeExpense, addExpense, fetchAllUsers } from "../api/groups";
const AddExpense = () => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const storedUser = localStorage.getItem("user");
  let username = null;

  if (storedUser) {
    try {
      const userObject = JSON.parse(storedUser);
      if (userObject && typeof userObject.username === "string") {
        username = userObject.username;
        username = username.split("_")[0];
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      username = null;
    }
  }
  useEffect(() => {
    fetchAllUsers()
      .then((res) => setAllUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUsers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  };

  const handleSelectAll = () => {
    const availableUsers = allUsers.filter((user) => user !== username);
    const allSelected = availableUsers.every((user) =>
      selectedUsers.includes(user)
    );
    setSelectedUsers(allSelected ? [] : availableUsers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await categorizeExpense(description);
      const categorySuggestion = res.data; // axios gives data in res.data
      setSuggestedCategory(categorySuggestion);
      setShowCategoryModal(true);
    } catch (err) {
      console.error("Error fetching category:", err);
    }
  };

  const saveExpense = async (finalCategory) => {
    setShowCategoryModal(false);
    if (selectedUsers.length === 0) {
      alert("Please select at least one user to split the expense with.");
      return;
    }

    const splitAmount = (Number(amount) / selectedUsers.length).toFixed(2);
    const splitWith = {};
    selectedUsers.forEach((u) => {
      const cleanUsername = u.split("_")[0];
      if (cleanUsername !== username) {
        splitWith[cleanUsername] = parseFloat(splitAmount);
      }
    });

    const expense = {
      description,
      amount: Number(amount),
      category: finalCategory,
      paidBy: username,
      splitWith,
    };

    try {
      await addExpense(expense);
      toast.success("Expense added successfully!");
      window.dispatchEvent(new Event("expenseAdded"));
      setDescription("");
      setAmount("");
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Failed to add expense.");
    }
  };

  const availableUsers = allUsers.filter((user) => user !== username);
  const allSelected =
    availableUsers.length > 0 &&
    availableUsers.every((user) => selectedUsers.includes(user));
  const selectedCount = selectedUsers.length;

  return (
    <>
      <div className="add-expense-page add-expense-page-active">
        <div className="add-expense-container">
          <div className="add-expense-modal-content">
            <div className="add-expense-modal-header">
              <h2>Add New Expense</h2>
              <div className="add-expense-modal-header-subtitle">
                Split an expense with your friends
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="add-expense-form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  placeholder="What was this expense for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="add-expense-form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="add-expense-form-group">
                <label>Select friends to split with:</label>
                <div className="add-expense-user-selection-container">
                  <div className="add-expense-user-selection-header">
                    <span className="add-expense-selection-count">
                      {selectedCount} of {availableUsers.length} friends
                      selected
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={`add-expense-select-all-btn ${
                        allSelected ? "add-expense-clear-all" : ""
                      }`}
                      disabled={availableUsers.length === 0}>
                      {allSelected ? "Clear All" : "Select All"}
                    </button>
                  </div>
                  <div className="add-expense-user-selection-list">
                    {availableUsers.map((user) => (
                      <div
                        key={user}
                        className="add-expense-user-checkbox-container">
                        <label className="add-expense-user-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user)}
                            onChange={() => handleUserSelect(user)}
                          />
                          <span>{user}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="add-expense-action-buttons">
                <button
                  type="submit"
                  className="add-expense-btn-1 add-expense-btn-primary add-expense-btn-full-width"
                  disabled={
                    !description || !amount || selectedUsers.length === 0
                  }>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <CategoryModal
          category={suggestedCategory}
          onConfirm={saveExpense}
          onCancel={() => setShowCategoryModal(false)}
          onChange={setSuggestedCategory}
        />
      )}
    </>
  );
};

export default AddExpense;
