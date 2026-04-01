// Centralized API configuration
// This ensures that the frontend uses the correct backend URL regardless of the environment.

const getApiBaseUrl = () => {
  const host = import.meta.env.VITE_HOST;
  
  // If host is explicitly defined, use it
  if (host) {
    // Ensure it doesn't end with a slash to maintain consistency
    return host.endsWith('/') ? host.slice(0, -1) : host;
  }

  // Fallback for production: If we are on a deployed site, we might want to use a relative path
  // if the backend is served from the same domain or via a proxy.
  // Otherwise, default to localhost for development.
  if (import.meta.env.PROD) {
    return ""; // Relative path /api
  }
  
  return "http://localhost:5000";
};

export const API_BASE = getApiBaseUrl();
