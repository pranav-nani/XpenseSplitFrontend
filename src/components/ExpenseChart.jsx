import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useState, useEffect } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i); // Spread evenly across the color wheel
    colors.push(`hsl(${hue}, 70%, 60%)`); // Adjust saturation & lightness for balance
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
      const storedUser = localStorage.getItem("user");
      let username = null;

      if (storedUser) {
        try {
          // Parse the JSON string from localStorage
          const userObject = JSON.parse(storedUser);

          // Check if the username property exists and is a string
          if (userObject && typeof userObject.username === "string") {
            username = userObject.username;

            // Apply your split logic to the extracted username
            // Example: if the username is "nani_reddy", this will get "nani"
            username = username.split("_")[0];
          }
        } catch (error) {
          // Fallback for cases where the stored value is not valid JSON
          console.error("Failed to parse user data from localStorage:", error);
          // In this case, you might want to handle it differently or set username to null
          username = null;
        }
      }
      try {
        const response = await fetch(
          `http://localhost:8080/api/expenses/${username}`
        );
        const expenses = await response.json();

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

  return (
    <div className="chart-container">
      <h3>Expenses by Category</h3>
      <div className="chart-wrapper">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default ExpenseChart;
