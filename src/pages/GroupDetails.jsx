import React, { useState, useEffect } from "react";
import "../styles/GroupDetails.css";
import { fetchGroups, createGroup, fetchAllUsers,fetchGroupById } from "../api/groups";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import AddGroupExpenseModal from "../layouts/AddGroupExpenseModal";
import SettleUpModal from "../layouts/SettleUpModal";

const GroupDetails = () => {
  // --- STATE MANAGEMENT ---
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [memberDetails, setMemberDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- USER DATA ---
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

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const groupsRes = await fetchGroups(username);
        setGroups(groupsRes.data);

        const usersRes = await fetchAllUsers();
        setAllUsers(usersRes.data);

        const filteredFriends = usersRes.data
          .map((user) => user.split("_")[0])
          .filter((cleanUser) => cleanUser !== username);
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

  // -- Balance Calculation --
  const balanceSummary = React.useMemo(() => {
    if (!groups || groups.length === 0 || !username) {
      return {
        totalOwedToYou: 0,
        totalYouOwe: 0,
        netBalance: 0,
        groupBalances: [],
      };
    }
    let totalOwedToYou = 0;
    let totalYouOwe = 0;
    const groupBalances = groups.map((group) => {
      let currentUserBalanceInGroup = 0;
      group.expenses.forEach((expense) => {
        const myShare = expense.splitWith[username] || 0;
        if (expense.paidBy === username) {
          currentUserBalanceInGroup += expense.amount - myShare;
        } else {
          currentUserBalanceInGroup -= myShare;
        }
      });
      if (currentUserBalanceInGroup > 0)
        totalOwedToYou += currentUserBalanceInGroup;
      if (currentUserBalanceInGroup < 0)
        totalYouOwe += Math.abs(currentUserBalanceInGroup);

      return {
        id: group.id || group._id,
        groupName: group.groupName,
        balance: currentUserBalanceInGroup,
      };
    });
    const netBalance = totalOwedToYou - totalYouOwe;
    return { totalOwedToYou, totalYouOwe, netBalance, groupBalances };
  }, [groups, username]);

  // --- HANDLER FUNCTIONS ---
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
        setGroups((prev) => [...prev, response.data]);
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

  const refreshGroupData = async (groupId) => {
    try {
      const response = await fetchGroupById(groupId);
      const updatedGroup = response.data;
      setSelectedGroup(updatedGroup);
      setGroups((prevGroups) =>
        prevGroups.map((group) => (group.id === groupId ? updatedGroup : group))
      );
    } catch (error) {
      console.error("Failed to refresh group data:", error);
      toast.error("Could not load latest group details.");
    }
  };

  const handleExpenseAdded = () => {
    if (selectedGroup) {
      refreshGroupData(selectedGroup.id);
    }
    setIsModalOpen(false);
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

  const handleGroupClick = (group) => {
    setSelectedGroup(group);

    const details = allUsers.filter((user) =>
      group.members.includes(user.username.split("_")[0])
    );
    setMemberDetails(details);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setMemberDetails([]);
  };

  const handleSettlement = () => {
    if (selectedGroup) {
      refreshGroupData(selectedGroup.id);
    }
    setIsSettleUpModalOpen(false);
  };

  const memberBalances = React.useMemo(() => {
    if (!selectedGroup?.expenses) return {};
    const balances = {};
    selectedGroup.members.forEach((member) => {
      balances[member] = 0;
    });
    selectedGroup.expenses.forEach((expense) => {
      if (balances[expense.paidBy] !== undefined) {
        balances[expense.paidBy] += expense.amount;
      }
      for (const member in expense.splitWith) {
        if (balances[member] !== undefined) {
          balances[member] -= expense.splitWith[member];
        }
      }
    });
    return balances;
  }, [selectedGroup]);

  // --- RENDER LOGIC ---
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
      <>
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
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsModalOpen(true)}>
                      Add First Expense
                    </button>
                  </div>
                ) : (
                  <div className="expense-items-container">
                    {selectedGroup.expenses?.map((expense) => (
                      <div key={expense.id} className="expense-item">
                        <div className="expense-details">
                          <div
                            className={`expense-description ${
                              expense.description
                                .toLowerCase()
                                .includes("settlement")
                                ? "settlement-description"
                                : ""
                            }`}>
                            {expense.description}
                          </div>
                          <div className="expense-payer">
                            Paid by {expense.paidBy}
                          </div>
                        </div>
                        <div
                          className={`expense-amount ${
                            expense.description
                              .toLowerCase()
                              .includes("settlement")
                              ? "settlement-amount"
                              : ""
                          }`}>
                          ₹{expense.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="group-summary">
              <h3>Group Members</h3>
              <div className="members-container">
                {selectedGroup.members?.map((member) => {
                  const balance = memberBalances[member] || 0;
                  const isPositive = balance > 0;
                  const isNegative = balance < 0;

                  let statusText;
                  let statusClass = "member-status";

                  if (isPositive) {
                    statusText = `+₹${balance.toFixed(2)}`;
                    statusClass += " positive";
                  } else if (isNegative) {
                    statusText = `-₹${Math.abs(balance).toFixed(2)}`;
                    statusClass += " negative";
                  } else {
                    statusText = "Settled up";
                    statusClass += " neutral";
                  }
                  return (
                    <div key={member} className="summary-item">
                      <span>{member}</span>
                      <span className={statusClass}>{statusText}</span>
                    </div>
                  );
                })}
              </div>
              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}>
                  Add Expense
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsSettleUpModalOpen(true)}>
                  Settle Up
                </button>
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <AddGroupExpenseModal
            group={selectedGroup}
            onClose={() => setIsModalOpen(false)}
            onExpenseAdded={handleExpenseAdded}
          />
        )}
        {isSettleUpModalOpen && (
          <SettleUpModal
            group={selectedGroup}
            loggedInUser={username}
            memberDetails={memberDetails}
            onClose={() => setIsSettleUpModalOpen(false)}
            onSettled={handleSettlement}
          />
        )}
      </>
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
        <div className="balance-summary-card">
          <h3>Overall Balance</h3>

          {/* Net Balance */}
          <div
            className={`balance-amount ${
              balanceSummary.netBalance >= 0 ? "positive" : "negative"
            }`}>
            {balanceSummary.netBalance >= 0 ? "+" : "-"}₹
            {Math.abs(balanceSummary.netBalance).toFixed(2)}
          </div>

          <div className="balance-details">
            {/* Total Owed to You */}
            <div className="balance-item">
              <span className="label">You are owed:</span>
              <span className="amount positive">
                ₹{balanceSummary.totalOwedToYou.toFixed(2)}
              </span>
            </div>

            {/* Total You Owe */}
            <div className="balance-item">
              <span className="label">You owe:</span>
              <span className="amount negative">
                ₹{balanceSummary.totalYouOwe.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="balance-summary">
            <small>Net balance across all groups</small>
          </div>
          {/* Per-Group Balances List */}
          <div className="group-balances">
            <h4>Group Balances</h4>
            {balanceSummary.groupBalances.length > 0 ? (
              balanceSummary.groupBalances.map((group) => {
                const isPositive = group.balance > 0;
                if (group.balance === 0) return null;

                return (
                  <div key={group.id} className="group-balance-item">
                    <div className="group-balance-header">
                      <span className="group-name">{group.groupName}</span>
                      <span
                        className={`group-balance ${
                          isPositive ? "positive" : "negative"
                        }`}>
                        {isPositive ? "+" : "-"}₹
                        {Math.abs(group.balance).toFixed(2)}
                      </span>
                    </div>
                    <div
                      className={`balance-tag ${
                        isPositive ? "positive" : "negative"
                      }`}>
                      <span>
                        {isPositive ? "You get from group" : "You should pay"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-balances-message">
                <p>No outstanding balances in any groups.</p>
              </div>
            )}
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
