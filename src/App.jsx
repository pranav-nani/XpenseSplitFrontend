import { Routes, Route, Router } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GroupDetails from "./pages/GroupDetails";
import IndividualExpense from "./pages/IndividualExpenses"
import AddExpense from "./pages/AddExpense";
import RegisterComponent from "./pages/RegisterComponent";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<RegisterComponent />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
          <Route index element={<Dashboard />} />
          <Route path="group" element={<GroupDetails />} />
          <Route path="individual-expenses" element={<IndividualExpense/>}/>
          <Route path="add-expense" element={<AddExpense />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
