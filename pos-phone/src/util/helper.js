import axios from "axios";
import { Config } from "./config";
import { getAccessToken } from "../store/profile.store";

let isRedirectingToLogin = false;

export const request = async (url = "", method = "get", data = {}) => {
  try {
    var access_token = getAccessToken();
    const headers = {
      Authorization: "Bearer " + access_token,
    };
    // Do NOT set Content-Type for FormData — the browser/axios must generate
    // it automatically so the multipart boundary parameter is included.
    if (!(data instanceof FormData)) {
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
    if (err.response?.status === 401) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;
        localStorage.removeItem("access_token");
        localStorage.removeItem("profile");
        window.location.href = "/login";
      }
      return;
    }
    return {
      success: false,
      message: err.response?.data?.message || "Server Error",
    };
  }
};
