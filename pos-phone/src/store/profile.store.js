export const setAccessToken = (value) => {
  localStorage.setItem("access_token", value);
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const setProfile = (value) => {
  localStorage.setItem(
    "profile",
    JSON.stringify(value)
  );
};

export const getProfile = () => {
  try {
    const profile = localStorage.getItem("profile");

    if (!profile) return null;

    return JSON.parse(profile);
  } catch (error) {
    return null;
  }
};