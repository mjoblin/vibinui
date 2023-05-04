// ================================================================================================
// NOTE: Most constants (especially ones that depend on React hooks) are defined in
//  useAppConstants(). This file contains mostly constants which need to be accessible from outside
//  the React flow.
// ================================================================================================

const { NODE_ENV, REACT_APP_USING_SSL_PROXY } = process.env;

export const isDev = NODE_ENV === "development";

export const VIBIN_BACKEND_PORT = 8080;

export const API_REFRESH_INTERVAL = 60 * 60 * 24; // Refresh API data once per day.

// Handle a few different cases for websocket URL generation:
//
//  1. Local dev (where the app is served on port 3000 via "npm start") needs to rely on the
//     websocket server provided by the vibin backend, which is expected to be running locally on
//     port 8080.
//  2. The built UI instead assumes that it's being served by the vibin backend (i.e. on port 8080
//     using the backend's hosting of the built UI); so the websocket url is the same as the window
//     url.
//  3. If the UI is built with REACT_APP_USING_SSL_PROXY=true then "wss" will be used instead of
//     "ws". This is useful when the app is being hosted behind an SSL reverse proxy.
export const WEBSOCKET_URL = `${REACT_APP_USING_SSL_PROXY === "true" ? "wss" : "ws"}://${
    window.location.hostname
}${isDev ? `:${VIBIN_BACKEND_PORT}` : window.location.port ? `:${window.location.port}` : ""}/ws`;

export const WEBSOCKET_RECONNECT_DELAY = 3000;
