import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { updateIfDifferent } from "./helpers";
import { AudioSource } from "./playbackSlice";  // TODO: Move from playbackSlice to systemSlice

// ================================================================================================
// Application state for the streaming system (device names, power status, volume, etc).
// ================================================================================================

export type PowerState = "on" | "off" | undefined;

export type MuteState = "on" | "off" | undefined;

export type AudioSources = {
    active: AudioSource | undefined;
    available: AudioSource[] | undefined;
};

// DeviceDisplay is vaguely defined here, to allow for any arbitrary key/value pairs. This is due
// to the shape being potentially very different between streamer types; although in a world where
// this app is specific to CXNv2/StreamMagic, the following shape can be somewhat assumed:
//
// {
//     "line1": "Sooner",
//     "line2": "slowthai",
//     "line3": "UGLY",
//     "format": "44.1kHz/16bit AAC",
//     "mqa": "none",
//     "playback_source": "punnet",
//     "class": "stream.service.airplay",
//     "art_file": "/tmp/current/AlbumArtFile-20969-20",
//     "art_url": "http://192.168.1.13:80/album-art-4356?id=1:36",
//     "progress": {
//         "position": 0,
//         "duration": 174
//     }
// }
export type DeviceDisplay = Record<string, any>;

export interface DeviceState {
    name: string;
}

export interface StreamerState extends DeviceState {
    power: PowerState;
    sources: AudioSources | undefined;
}

export interface MediaServerState extends DeviceState {
}

export interface AmplifierState extends DeviceState {
    power: PowerState;
    mute: MuteState;
    volume: number | undefined;
    sources: AudioSources | undefined;
}

export interface SystemState {
    streamer: StreamerState;
    media_server: MediaServerState;
    amplifier: AmplifierState;
}

const initialState: SystemState = {
    streamer: {
        name: "",
        power: undefined,
        sources: undefined,
    },
    media_server: {
        name: "",
    },
    amplifier: {
        name: "",
        power: undefined,
        mute: undefined,
        volume: undefined,
        sources: undefined,
    }
};

// TODO: Think about ways to distinguish between reducers intended for user-driven use, vs. those
//  intended for infrastructure use. e.g. "setStreamerPower" (and others here) are intended to be
//  used when a power-related message comes in from the backend over a websocket; it's not intended
//  to be used by a user-facing component (which should be using useLazyStreamerPowerToggleQuery in
//  the vibinSystem service).

export const systemSlice = createSlice({
    name: "system",
    initialState,
    reducers: {
        setAmplifierState: (state, action: PayloadAction<AmplifierState>) => {
            updateIfDifferent(state, "amplifier", action.payload);
        },
        setMediaServerState: (state, action: PayloadAction<MediaServerState>) => {
            updateIfDifferent(state, "media_server", action.payload);
        },
        setStreamerState: (state, action: PayloadAction<StreamerState>) => {
            updateIfDifferent(state, "streamer", action.payload);
        },
        // TODO: Deprecate the following
        setMediaServerName: (state, action: PayloadAction<string>) => {
            updateIfDifferent(state, "media_server.name", action.payload);
        },
        setStreamerName: (state, action: PayloadAction<string>) => {
            updateIfDifferent(state, "streamer.name", action.payload);
        },
        setStreamerPower: (state, action: PayloadAction<PowerState>) => {
            updateIfDifferent(state, "streamer.power", action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setAmplifierState,
    setMediaServerState,
    setStreamerState,
    setMediaServerName,
    setStreamerName,
    setStreamerPower,
} = systemSlice.actions;

export default systemSlice.reducer;
