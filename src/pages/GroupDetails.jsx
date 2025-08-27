import React, { useState, useEffect } from "react";
import "../styles/GroupDetails.css";
import axios from "axios";
import { fetchGroups, createGroup } from "../api/groups";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const GroupDetails = () => {
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const storedUser = localStorage.getItem("user");
  let username = null;
  let fullname = null;
  if (storedUser) {
    try {
      const userObject = JSON.parse(storedUser);
      if (userObject && typeof userObject.username === "string") {
        username = userObject.username;
        fullname = username;
        username = username.split("_")[0];
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
  }

  // Fetch all users and groups on initial component load
  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        // Fetch groups
        const groupsRes = await fetchGroups(username);
        setGroups(groupsRes.data);

        // Fetch all users
        const usersRes = await axios.get("http://localhost:8080/api/users/all");
        const filteredFriends = usersRes.data.filter(
          (user) => user !== fullname
        );
        setAvailableFriends(filteredFriends);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setFetchError(true);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [username]);

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedFriends.length > 0) {
      const groupData = {
        createdBy: username,
        groupName: groupName.trim(),
        members: [username, ...selectedFriends],
        expenses: [],
      };
      try {
        const response = await createGroup(groupData);
        const createdGroup = response.data;
        setGroups((prev) => [...prev, createdGroup]);
        setGroupName("");
        setSelectedFriends([]);
        setShowCreateForm(false);
        toast.success("Group created successfully!");
      } catch (error) {
        console.error("Error creating group:", error);
        toast.error("Failed to create group. Please try again.");
      }
    }
  };

  const handleFriendSelect = (friend) => {
    setSelectedFriends((prev) =>
      prev.includes(friend)
        ? prev.filter((f) => f !== friend)
        : [...prev, friend]
    );
  };

  const handleSelectAll = () => {
    setSelectedFriends(
      selectedFriends.length === availableFriends.length
        ? []
        : [...availableFriends]
    );
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
  };

  if (loading) {
    return (
      <div className="page active">
        <div className="loading-state">Loading your groups...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="page active">
        <div className="error-state">
          <h2>An error occurred</h2>
          <p>
            We could not load your groups. Please check your connection or try
            again later.
          </p>
        </div>
      </div>
    );
  }

  if (groups.length === 0 && !showCreateForm) {
    return (
      <div className="page active">
        <div className="empty-state">
          <div className="empty-state-content">
            <h2>Create a group and add expenses to get started</h2>
            <p>Track shared expenses with friends and family</p>
            <button
              className="btn btn-primary create-group-btn"
              onClick={() => setShowCreateForm(true)}>
              <Plus size={20} /> Create Your First Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="page active">
        <div className="create-group-header">
          <button className="back-btn" onClick={() => setShowCreateForm(false)}>
            ← Back
          </button>
          <h1>Create New Group</h1>
        </div>
        <div className="create-group-form">
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name (e.g., Trip to Goa)"
              required
            />
          </div>
          <div className="form-group">
            <label>Add friends to this group:</label>
            <div className="user-selection-container">
              <div className="user-selection-header">
                <span className="selection-count">
                  {selectedFriends.length} of {availableFriends.length} friends
                  selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`select-all-btn ${
                    selectedFriends.length === availableFriends.length
                      ? "clear-all"
                      : ""
                  }`}
                  disabled={availableFriends.length === 0}>
                  {selectedFriends.length === availableFriends.length
                    ? "Clear All"
                    : "Select All"}
                </button>
              </div>
              <div className="user-selection-list">
                {availableFriends.map((friend) => (
                  <div key={friend} className="user-checkbox-container">
                    <label className="user-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend)}
                        onChange={() => handleFriendSelect(friend)}
                      />
                      <span>{friend}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              className="btn btn-primary"
              disabled={!groupName.trim() || selectedFriends.length === 0}>
              Create Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <div className="page active">
        <div className="group-header">
          <button className="back-btn" onClick={handleBackToGroups}>
            ← Back to Groups
          </button>
          <h1>{selectedGroup.groupName}</h1>
          <div>
            {selectedGroup.members?.length || 0} participants • Created on{" "}
            {new Date(selectedGroup.createdDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div className="group-content">
          <div className="expenses-list">
            <h3>Recent Expenses</h3>
            <div className="expenses-content">
              {selectedGroup.expenses?.length === 0 ? (
                <div className="no-expenses">
                  <p>No expenses added yet</p>
                  <button className="btn btn-primary">Add First Expense</button>
                </div>
              ) : (
                <div className="expense-items-container">
                  {selectedGroup.expenses?.map((expense) => (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-details">
                        <div className="expense-description">
                          {expense.description}
                        </div>
                        <div className="expense-payer">
                          Paid by {expense.paidBy}
                        </div>
                      </div>
                      <div className="expense-amount">₹{expense.amount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="group-summary">
            <h3>Group Members</h3>
            <div className="members-container">
              {selectedGroup.members?.map((member) => (
                <div key={member} className="summary-item">
                  <span>{member}</span>
                  <span className="member-status">₹0</span>
                </div>
              ))}
            </div>
            <div className="action-buttons">
              <button className="btn btn-primary">Add Expense</button>
              <button className="btn btn-secondary">Settle Up</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="groups-header">
        <h1>Your Groups</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}>
          <Plus size={20} /> Create New Group
        </button>
      </div>
      <div className="groups-content">
        {/* Balance Summary Card (Static, as requested) */}
        <div className="balance-summary-card">
          <h3>Overall Balance</h3>
          <div className="balance-amount positive">+₹2,450.75</div>
          <div className="balance-details">
            <div className="balance-item">
              <span className="label">You are owed:</span>
              <span className="amount positive">₹3,200.50</span>
            </div>
            <div className="balance-item">
              <span className="label">You owe:</span>
              <span className="amount negative">₹749.75</span>
            </div>
          </div>
          <div className="balance-summary">
            <small>Net balance across all groups</small>
          </div>
          <div className="group-balances">
            <h4>Group Balances</h4>
            <div className="group-balance-item">
              <div className="group-balance-header">
                <span className="group-name">Trip to Goa</span>
                <span className="group-balance positive">+₹1,200.25</span>
              </div>
              <div className="balance-tag positive">
                <span>You get from group</span>
              </div>
            </div>
            <div className="group-balance-item">
              <div className="group-balance-header">
                <span className="group-name">Office Lunch</span>
                <span className="group-balance negative">-₹480.50</span>
              </div>
              <div className="balance-tag negative">
                <span>You should pay</span>
              </div>
            </div>
            <div className="group-balance-item">
              <div className="group-balance-header">
                <span className="group-name">Movie Night</span>
                <span className="group-balance positive">+₹730.00</span>
              </div>
              <div className="balance-tag positive">
                <span>You get from group</span>
              </div>
            </div>
            <div className="group-balance-item">
              <div className="group-balance-header">
                <span className="group-name">House Party</span>
                <span className="group-balance positive">+₹1,000.00</span>
              </div>
              <div className="balance-tag positive">
                <span>You get from group</span>
              </div>
            </div>
          </div>
        </div>
        {/* Groups List */}
        <div className="groups-list">
          {groups.map((group) => (
            <div
              key={group.id}
              className="group-card"
              onClick={() => handleGroupClick(group)}>
              <div className="group-card-header">
                <h3>{group.groupName}</h3>
                <div className="group-card-meta">
                  {group.members?.length || 0} participants • Created on{" "}
                  {new Date(group.createdDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="group-card-footer">
                <span className="expenses-count">
                  {group.expenses?.length || 0} expenses
                </span>
                <span className="arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
