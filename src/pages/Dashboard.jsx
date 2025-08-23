import { useState, useEffect } from "react";
import BalanceCard from "../components/BalanceCard";
import ExpenseChart from "../components/ExpenseChart";

const Dashboard = () => {
  const [youOwe, setYouOwe] = useState(0);
  const [youAreOwed, setYouAreOwed] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [hasExpenses, setHasExpenses] = useState(false);

  const username = localStorage.getItem("user")?.split("_")[0];

  useEffect(() => {
    if (!username) return;

    fetch(`http://localhost:8080/api/expenses/balance/${username}`)
      .then((res) => res.json())
      .then((data) => {
        // data is your BalanceDto → { totalBalance, youOwe, youAreOwed }
        setTotalBalance(data.totalBalance);
        setYouOwe(data.youOwe);
        setYouAreOwed(data.youAreOwed);

        // If all are zero → no expenses yet
        if (data.totalBalance === 0 && data.youOwe === 0 && data.youAreOwed === 0) {
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

        {(
          <>
            <div className="balance-cards">
              <BalanceCard amount={`₹${totalBalance}`} label="Total Balance" type="total" />
              <BalanceCard amount={`₹${youOwe}`} label="You Owe" type="owe" />
              <BalanceCard amount={`₹${youAreOwed}`} label="You Are Owed" type="owed" />
            </div>

            <div className="dashboard-content">
              <ExpenseChart /> 
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
