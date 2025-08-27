import axios from "axios";

const API_URL = "http://localhost:8080/api/groups";

export const fetchGroups = (username) =>
    axios.get(`${API_URL}/user/${username}`);

export const createGroup = (groupData) =>
    axios.post(API_URL+"/create", groupData);
