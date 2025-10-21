import { useState, useEffect } from "react";
import "../styles/IndividualExpenses.css";
import { fetchExpensesByUsername } from "../api/groups";

const IndividualExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = localStorage.getItem("user");
  let username = null;
  if (storedUser) {
    try {
      const userObject = JSON.parse(storedUser);
      if (userObject && typeof userObject.username === "string") {
        username = userObject.username.split("_")[0];
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      username = null;
    }
  }

  useEffect(() => {
    const loadExpenses = async () => {
      if (!username) {
        setLoading(false);
        setExpenses([]);
        return;
      }

      try {
        setLoading(true);
        setError(null); 
        const data = await fetchExpensesByUsername(username);

        setExpenses(data);
      } catch (err) {
        console.error("Error fetching expenses:", err);

        if (err.response && err.response.status === 404) {
          setExpenses([]);
        } else {
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [username]); 

  const getCategoryIcon = (category) => {
    const icons = {
      Food: "🍽️",
      Transportation: "🚗",
      Entertainment: "🎬",
      Utilities: "💡",
      Shopping: "🛍️",
      Healthcare: "🏥",
      Travel: "✈️",
      Others: "📦",
    };
    return icons[category] || "📦";
  };

  const renderSplitWith = (splitWith) => {
    if (!splitWith || Object.keys(splitWith).length === 0) {
      return <span className="no-split">No split</span>;
    }

    return (
      <div className="split-container">
        <span className="split-label">Split with:</span>
        <div className="split-persons">
          {Object.entries(splitWith).map(([person, amount]) => (
            <span key={person} className="split-person">
              {person}: {amount}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="Ind-container">
        <div className="loading">Loading expenses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Ind-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const averageAmount =
    expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : 0;

  return (
    <div className="Ind-container">
      <div className="header">
        <h1>Individual Expenses</h1>
        <p>Track and manage your personal expenses</p>
      </div>

      {expenses.length > 0 && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">{expenses.length}</div>
            <div className="stat-label">Total Expenses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{totalAmount}</div>
            <div className="stat-label">Total Amount</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{averageAmount}</div>
            <div className="stat-label">Average Expense</div>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="no-expenses">
          <h3>Please add expenses to display here</h3>
        </div>
      ) : (
        <div className="expenses-grid">
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <div className="category-badge">
                  <span>{getCategoryIcon(expense.category)}</span>
                  <span>{expense.category}</span>
                </div>
                <div className="amount">₹{expense.amount}</div>
              </div>

              <div className="description">{expense.description}</div>

              <div className="expense-details">
                <div className="detail-row">
                  <span>👤</span>
                  <span>Paid by:</span>
                  <span className="paid-by">{expense.paidBy}</span>
                </div>

                <div className="detail-row">
                  <span>💰</span>
                  {renderSplitWith(expense.splitWith)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndividualExpenses;
