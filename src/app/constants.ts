// NOTE: Most constants (especially ones that depend on React hooks) are defined in
// useAppConstants(). This file contains constants which need to be accessible from outside
// the React flow.

export const API_REFRESH_INTERVAL = 60 * 60 * 24; // Refresh API data once per day.

export const WEBSOCKET_RECONNECT_DELAY = 5000;