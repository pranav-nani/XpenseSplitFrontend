import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { fetchExpensesByUsername } from "../api/groups";

ChartJS.register(ArcElement, Tooltip, Legend);

const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
};
const ExpenseChart = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      // Logic for getting username from localStorage...
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
        }
      }

      try {
        if (!username) return; // Don't fetch if no user

        const expenses = await fetchExpensesByUsername(username);

        if (!Array.isArray(expenses)) {
          console.warn("Received non-array response, defaulting to empty.");
          setData({ labels: [], datasets: [] });
          return;
        }

        const categoryTotals = expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {});

        const categories = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);

        setData({
          labels: categories,
          datasets: [
            {
              data: values,
              backgroundColor: generateColors(categories.length),
              borderWidth: 0,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
    window.addEventListener("expenseAdded", fetchExpenses);

    return () => window.removeEventListener("expenseAdded", fetchExpenses);
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 15, usePointStyle: true, font: { size: 11 } },
      },
    },
  };

  // --- NEW CODE: Check if there is data to display ---
  // This is true only if the datasets array exists and its first element has data.
  const hasData = data.datasets.length > 0 && data.datasets[0].data.length > 0;

  return (
    <div className="chart-container">
      <h3>Expenses by Category</h3>
      <div className="chart-wrapper">
        {/* --- NEW CODE: Conditional rendering --- */}
        {hasData ? (
          <Doughnut data={data} options={options} />
        ) : (
          <div
            className="no-data-message"
            style={{
              display: "flex",
              justifyContent: "center",
              height: "100%",
              color: "#888",
              fontSize: "1rem",
              textAlign: "center",
              padding: "20px",
            }}>
            <p>Add expenses to show and categorize them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;
