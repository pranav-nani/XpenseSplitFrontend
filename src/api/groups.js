import axios from "axios";

const API_URL = "https://xpensesplit.onrender.com/api";

// Groups APIs
export const fetchGroups = (username) =>
    axios.get(`${API_URL}/groups/user/${username}`);

export const createGroup = (groupData) =>
    axios.post(`${API_URL}/groups/create`, groupData);

export const settleUp = (groupId, settlementData) =>
    axios.post(`${API_URL}/groups/${groupId}/settle`, settlementData);

export const fetchGroupById = (groupId) =>
    axios.get(`${API_URL}/groups/${groupId}`);

// Expenses APIs
export const categorizeExpense = (description) =>
    axios.post(`${API_URL}/expenses/categorize`, { description });

export const addExpense = (expense) =>
    axios.post(`${API_URL}/expenses/addExpense`, expense);

export const addExpenseToGroup = (groupId, expense) =>
    axios.post(`${API_URL}/groups/${groupId}/addExpense`, expense);

export const fetchBalance = (username) =>
    axios.get(`${API_URL}/expenses/balance/${username}`);

export const fetchExpensesByUsername = async (username) => {
    const response = await axios.get(`${API_URL}/expenses/${username}`);
    return response.data
}

// Users APIs
export const fetchAllUsers = () =>
    axios.get(`${API_URL}/users/all`);

export const loginUser = (username, password) =>
    axios.post(`${API_URL}/users/login`, { username, password });

export const registerUser = (userData) =>
    axios.post(`${API_URL}/users/register`, userData);
