import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { updateIfDifferent } from "./helpers";
import { MediaSourceClass } from "../types";

// ================================================================================================
// Application state for the streaming system (device names, power status, volume, etc).
// ================================================================================================

export type PowerState = "on" | "off" | undefined;

export type MuteState = "on" | "off" | undefined;

export type AudioSource = {
    id: string;
    name: string;
    default_name: string;
    class: MediaSourceClass;
    nameable: boolean;
    ui_selectable: boolean;
    description: string;
    description_locale: string;
    preferred_order: number;
};

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
    display: DeviceDisplay | undefined;
}

export interface MediaServerState extends DeviceState {}

export type AmplifierAction = "power" | "volume" | "mute" | "volume_up_down" | "audio_source";

export interface AmplifierState extends DeviceState {
    supported_actions: AmplifierAction[] | undefined;
    power: PowerState | undefined;
    mute: MuteState | undefined;
    max_volume: number | undefined;
    volume: number | undefined;
    sources: AudioSources | undefined;
}

export interface SystemState {
    power: PowerState;
    streamer: StreamerState;
    media_server: MediaServerState;
    amplifier: AmplifierState;
}

const initialState: SystemState = {
    power: "off",
    streamer: {
        name: "",
        power: undefined,
        sources: undefined,
        display: undefined,
    },
    media_server: {
        name: "",
    },
    amplifier: {
        name: "",
        supported_actions: [],
        power: undefined,
        mute: undefined,
        max_volume: undefined,
        volume: undefined,
        sources: undefined,
    },
};

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
        setSystemPower: (state, action: PayloadAction<PowerState>) => {
            updateIfDifferent(state, "power", action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const { setAmplifierState, setMediaServerState, setStreamerState, setSystemPower } =
    systemSlice.actions;

export default systemSlice.reducer;
