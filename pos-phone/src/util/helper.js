import axios from "axios";
import { Config } from "./config";
import { getAccessToken } from "../store/profile.store";

export const request = async (url = "", method = "get", data = {}) => {
  try {
    var access_token = getAccessToken();
    const headers = {
      Authorization: "Bearer " + access_token,
    };
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }
    const res = await axios({
      url: Config.base_url + url,
      method,
      data,
      headers,
    });

    return res.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Server Error",
    };
  }
};
