// api/settingsApi.js
import { request } from "../util/helper";

// Get all settings
export const getSettings = async () => {
  return await request("settings", "get");
};

// Update settings (bulk key-value update)
export const updateSettings = async (data) => {
  return await request("settings", "put", data);
};

// Upload store logo
export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return await request("settings/upload-logo", "post", formData);
};
