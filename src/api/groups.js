import axios from "axios";

const API_URL = "http://localhost:8080/api/groups";

export const fetchGroups = (username) =>
    axios.get(`${API_URL}/user/${username}`);

export const createGroup = (groupData) =>
    axios.post(API_URL + "/create", groupData);

export const settleUp = (groupId, settlementData) => {
    // settlementData should be an object like { payer, payee, amount }
    return axios.post(`${API_URL}/${groupId}/settle`, settlementData);
};