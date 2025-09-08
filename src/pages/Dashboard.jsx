import { useState, useEffect } from "react";
import BalanceCard from "../components/BalanceCard";
import ExpenseChart from "../components/ExpenseChart";

const Dashboard = () => {
  const [youOwe, setYouOwe] = useState(0);
  const [youAreOwed, setYouAreOwed] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [hasExpenses, setHasExpenses] = useState(false);

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
    if (!username) return;

    fetch(`http://localhost:8080/api/expenses/balance/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setTotalBalance(data.totalBalance);
        setYouOwe(data.youOwe);
        setYouAreOwed(data.youAreOwed);
        if (
          data.totalBalance === 0 &&
          data.youOwe === 0 &&
          data.youAreOwed === 0
        ) {
          setHasExpenses(false);
        } else {
          setHasExpenses(true);
        }
      })
      .catch((err) => console.error("Error fetching balances:", err));
  }, [username]);

  return (
    <>
      <div className="page active">
        <div className="header">
          <div className="welcome-text">
            Welcome back, <strong>{username?.toUpperCase()}</strong> !
          </div>
          {hasExpenses ? (
            <div>Here's your expense summary</div>
          ) : (
            <div>Add expenses to get started</div>
          )}
        </div>

        {
          <>
            <div className="balance-cards">
              <BalanceCard
                amount={`₹${totalBalance}`}
                label="Total Balance"
                type="total"
              />
              <BalanceCard amount={`₹${youOwe}`} label="You Owe" type="owe" />
              <BalanceCard
                amount={`₹${youAreOwed}`}
                label="You Are Owed"
                type="owed"
              />
            </div>

            <div className="dashboard-content">
              <ExpenseChart />
            </div>
          </>
        }
      </div>
    </>
  );
};

export default Dashboard;
