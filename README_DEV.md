# `vibinui` development

`vibinui` is based on [Create React App]. It relies primarily on the following packages:

* [React].
* [React Router] (for client routing).
* [Redux Tookit] (for state management, including RTK Query for talking to the backend).
* [Mantine] (a React components library).
* [Tabler] (for icons).

The app also uses [TypeScript] and [Prettier].

> `vibinui` expects to be running on a low-latency, high-speed local network. It will still work in
> slower network environments (like over the internet), but it does little to mitigate the effects
> of slower network connections.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000/ui](http://localhost:3000/ui) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests] for more information.

**Note:** `vibinui` currently has no tests. I am not proud of that.

### `npm run build`

Builds the app for production to the `build` folder. This is the folder that can be served by the
`vibin` backend (see the backend's `--vibinui` flag).

To enable support for running the UI behind an SSL reverse proxy, build the app with:

```
REACT_APP_USING_SSL_PROXY=true npm run build
```

This can be paired with the `vibin` backend's `--proxy-media-server` flag to run everything behind
an SSL proxy, where the browser wants everything to be https (not http) and the browser does not
have direct network access to the media server (to retrieve album art).

## React components

The high-level React component structure is shown below.

![Components]

### Component overview

1. See `App.tsx` for the route/component configuration.
1. The `FeatureScreen` code lives under `src/components/features/`.
1. The `AppHeader` and `AppNav` code lives under `src/components/app/layout/`.
1. The App Managers live under `src/components/app/managers/`.

#### Manager components

There's a number of manager components in `src/components/app/managers/`. These managers want to be
part of the React component flow, but usually don't render anything and are instead tasked with
managing some high-level aspect of the application (so they're injected fairly high up in the
React hierarchy).

These managers handle things like: initiating the WebSocket connection to the backend; retrieving
information on all Albums/Tracks/Artists from the backend; determining which art to use as a
background image across multiple screens; handling keyboard shortcuts; etc.

## File structure

The `src/` directory is broadly laid out as follows:

```
.
├── App.tsx
├── app/                 Application data management and helpers
│   ├── constants.ts
│   ├── hooks/           Application-specific React hooks
│   ├── services/        RTK Query API handlers to the backend (incl. WebSocket)
│   ├── store/           Redux application state
│   ├── types.ts         Shared application types
│   ├── utils.ts
│   └── workers/         Web workers
├── assets/              Media assets
├── components/          React components
│   ├── app/             Top application-level components
│   │   ├── customFonts/
│   │   ├── layout/      Application layout
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppNav.tsx
│   │   │   ├── RootLayout.tsx
│   │   │   └── ScreenHeader.tsx
│   │   └── managers/    Application-wide React managers
│   ├── features/        Feature screens
│   │   ├── albums/      Components for the "Albums" screen
│   │   ├── artists/     Components for the "Artists" screen
│   │   ├── favorites/   Components for the "Favorites" screen
│   │   ├── playlist/    Components for the "Playlist" screen
│   │   ├── presets/     Components for the "Presets" screen
│   │   └── tracks/      Components for the "Tracks" screen
│   └── shared/          Application-wide shared components
├── index.css
└── index.tsx
```

## Data flow

The high-level data flow between the UI and the backend is shown below:

![Data Flow]

### Data flow overview

1. The UI receives most of its runtime information from its WebSocket connection to the backend.
   This includes changes to:
   * Playhead position.
   * The current Track.
   * The current Playlist.
   * Favorites.
   * Stored Playlists.
   * Media source.
   * etc...
1. WebSocket message handling can be found in `src/app/services/vibinWebsocket.ts`.
1. Updates received by the UI from the WebSocket connection to the backend are used to update the
   application state (stored in Redux). The rest of the UI will then react to those updates.
1. The UI uses the backend's REST API mostly for:
   * **The initial bulk retrieval** of information on Tracks, Albums, and Artists.
   * **Details on the currently-playing Track** (lyrics, waveform, etc).
   * **Performing actions on the streamer** such as pause/play, modifying the current Playlist, etc.
   * **Persisting information to the backend**, such as saving Playlists, marking Tracks or Albums
     as Favorites, etc.
1. The REST API handlers can be found in `src/app/services/vibin*.ts`.
1. The Redux store definitions can be found in `src/app/store`.

### Multiple client instances

All Vibin UI client sessions will have their own WebSocket connection to the back-end. Also, all
changes made to the streamer will be announced to all clients over their WebSocket -- even changes
made by other apps such as the StreamMagic app, or changes made by a person pressing the buttons on
the streamer itself.

**This means that an instance of the Vibin UI might get updates triggered from another application,
or from the streamer being interacted with in person.** This is considered a feature.

One exception is changes made to the media on the NAS, which are not announced over the WebSocket.
To get those updates, a Vibin UI instance needs to request a refresh of its Album/Track/Artist data
(which can be done from the Settings screen).

### WebSocket messages

The UI receives most of its runtime information over a persistent WebSocket connection to the
backend. These messages are used to make updates to application state (Redux), which then drives UI
updates.

> *NOTE:* To see all the messages, open the developer tools in a new browser tab and load the
> Vibin application. The Network tab's WebSocket filter can then be used to view all incoming
> messages.

When the UI's WebSocket connection is first established, **the back-end will send a batch of
messages** (one each of most types) so the UI will know the current state of everything.

From that point on, subsequent messages of a given type are usually being sent only because
something has **changed** (e.g. a Playlist Entry was added; a new Stored Playlist was created, a
Track was favorited, etc).

However, even though messages are usually being sent because something has _changed_, the message
itself will usually describe **the entire state of the data the message represents**. For example,
the `Favorites` message always describes _all_ Favorites, not just the latest _change_ to the
Favorites. This means the UI can always rely on a message providing all the information it needs,
at the expense of larger messages -- and not necessarily knowing exactly what has changed (just
that a change has occurred).

#### Example message

Following is an example `TransportState` message. All message types adhere to the same format,
although their `payload` shape will be different.

```json
{
    "id": "267c3e25-1f82-47ed-b711-3146511ad6d9",
    "client_id": "51e668ad-bf18-44ba-a19d-5e67779be4e9",
    "time": 1685764530636,
    "type": "TransportState",
    "payload": {
        "play_state": "play",
        "active_controls": [
            "pause",
            "stop",
            "shuffle",
            "repeat",
            "next",
            "previous",
            "seek"
        ],
        "repeat": "all",
        "shuffle": "off"
    }
}
```

#### Message fields

* `type`: The message type.
* `id`: The unique message ID (a UUID).
* `client_id`: The ID of the WebSocket client the message is intended for (will always be the same
  for each client).
* `time`: The time the message was sent (epoch seconds).
* `payload`: The message payload. Shape will differ based on `type`.

#### Message types

The following message types are received:

* `CurrentlyPlaying`: Information about what's currently playing (current track, current playlist,
   format details, stream details, etc).
* `Favorites`: Information on Favorite Albums and Tracks.
* `Position`: Playhead position.
* `Presets`: Information on Presets (e.g. Internet Radio stations).
* `StoredPlaylists`: Information on Stored Playlists.
* `System`: Information about the hardware devices (streamer name, power status, audio sources,
  device display details; media server name).
* `TransportState`: Current state of the streamer transport (play state, active transport controls,
  shuffle and repeat state, etc).
* `UPnPProperties`: A general kitchen-sink message containing all the UPnP property values received
* by the streamer and media server.
* `VibinStatus`: Information about the Vibin back-end (start time, system information, connected
  clients, etc).

#### Common message-based data flow

There are two primary causes for a message being received by the UI: The backend is automatically
announcing something unrelated to user input; or the backend is responding to something the user
has done.

##### Automatic

Many messages are sent automatically from the backend, unrelated to user input. Examples include
messages announcing playhead updates, or announcing when the track has changed.

##### User-driven

Sometimes a user action will trigger one or more messages from the backend. A common sequence of
events is:

1. The user does something in the UI (e.g. clicks "pause").
1. The UI makes a REST API call to the backend to act on the pause request.
1. The backend instructs the streamer to pause.
1. The backend sends a WebSocket message to all clients, announcing the new pause state.
1. The UI's `vibinWebsocket.ts` receives this message and updates the application state
   appropriately.
1. The new application state drives a visual update in the UI (changing the play/pause icon).

This means that **the UI code running in response to a user action does not control what will
happen in the UI as a result of that action** (that will happen later after the response message is
received). A downside to this is that it may not be obvious -- when looking at the code which
triggers an action (i.e. #1 above) -- exactly what will happen next, as that depends entirely on
how the backend responds, and what message(s) it ends up sending back.

### REST API calls

The UI also makes REST calls, usually to trigger an action on the backend -- or to bulk-retrieve 
information it won't receive over the WebSocket (such as full Album/Track/Artist information).

The REST API documentation is available at the backend's `http://<host>:8080/docs` endpoint, and
the UI's API handlers are found under `src/app/services/`.

## Debug panel

The Debug panel (activated with the "d" hotkey) can be helpful for tracking what's happening in the
application without having to use the browser's developer tools. It is intended as a raw data view
into the application, can be extended to display additional details as required.

<img src="https://github.com/mjoblin/media/blob/main/vibin/images/debug.jpg" width="400" />

## Additional notes

* The app uses `@hello-pangea/dnd` instead of `react-beautiful-dnd` due to an issue outlined
  [here](https://stackoverflow.com/a/72355197).
* The `react-visibility-sensor` dependency is causing `findDOMNode is deprecated in StrictMode`
  warnings. See GibHub issues [141](https://github.com/joshwnj/react-visibility-sensor/pull/141)
  and [142](https://github.com/joshwnj/react-visibility-sensor/pull/142).


[//]: # "--- Links -------------------------------------------------------------------------------"

[Create React App]: https://create-react-app.dev/
[React]: https://react.dev
[React Router]: https://reactrouter.com
[Redux Tookit]: https://redux-toolkit.js.org/
[Mantine]: https://mantine.dev/
[Tabler]: https://tabler-icons.io/
[TypeScript]: https://www.typescriptlang.org/
[Prettier]: https://prettier.io/
[running tests]: https://facebook.github.io/create-react-app/docs/running-tests

[//]: # "--- Images ------------------------------------------------------------------------------"

[Data Flow]: media/vibinui_dataflow.svg
[Components]: media/vibinui_components.svg
