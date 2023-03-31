import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Format, MediaId, MediaSourceClass, Stream, Track } from "../types";
import { updateIfDifferent } from "./helpers";

/**
 * The Playback slice is intended to contain information about the current playback status of the
 * streamer. e.g. Whether it's playing or not; what the current track is; etc.
 */

export type PlayStatus =
    | "buffering"
    | "connecting"
    | "no_signal"
    | "not_ready"
    | "pause"
    | "play"
    | "ready"
    | "stop";

export type TransportAction =
    | "next"
    | "pause"
    | "play"
    | "previous"
    | "repeat"
    | "seek"
    | "shuffle"
    | "stop";

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

export type RepeatState = "off" | "all";

export type ShuffleState = "off" | "all";

// TODO: Rename top-level state fields from snake_case to camelCase.

// TODO: Clarify current_track_media_id vs current_track. The former is valid for local media and
//  is the source of truth for the playing track id. current_track however is also populated by
//  other sources like AirPlay. It would be good to either merge these, or be clearer about when
//  to use what.

export interface PlaybackState {
    play_status: PlayStatus | undefined;
    active_transport_actions: TransportAction[];
    audio_sources: {
        // TODO: Audio Sources doesn't belong in current playback slice
        [key: number]: AudioSource;
    };
    current_audio_source: AudioSource | undefined;
    current_track: Track | undefined;
    // TODO: For the "current ids", consider adding Artist -- and also storing full
    //  Artist/Album/Track objects rather than just ids (so the other information, like title, is
    //  more easily accessible when required).
    //
    //  These will need to be distinct from artist/album/track information which is not associated
    //  with local media (e.g. Airplay). These should probably be undefined when not playing from
    //  local media.
    current_track_media_id: MediaId | undefined;
    current_album_media_id: MediaId | undefined;
    current_format: Format | undefined;
    current_stream: Stream | undefined;
    device_display: DeviceDisplay | undefined;
    repeat: RepeatState | undefined;
    shuffle: ShuffleState | undefined;
    playhead: {
        position: number;
        position_normalized: number;
    };
}

const initialState: PlaybackState = {
    play_status: undefined,
    active_transport_actions: [],
    audio_sources: {},
    current_audio_source: undefined,
    current_track: undefined,
    current_track_media_id: undefined,
    current_album_media_id: undefined,
    current_format: undefined,
    current_stream: undefined,
    device_display: undefined,
    repeat: undefined,
    shuffle: undefined,
    playhead: {
        position: 0,
        position_normalized: 0,
    },
};

export const playbackSlice = createSlice({
    name: "playback",
    initialState,
    reducers: {
        restartPlayhead: (state) => {
            state.playhead.position = 0;
            state.playhead.position_normalized = 0;
        },
        setActiveTransportActions: (state, action: PayloadAction<TransportAction[]>) => {
            updateIfDifferent(state, "active_transport_actions", action.payload);
        },
        setAudioSources: (state, action: PayloadAction<{ [key: number]: AudioSource }>) => {
            updateIfDifferent(state, "audio_sources", action.payload);
        },
        setCurrentAudioSource: (state, action: PayloadAction<AudioSource | undefined>) => {
            updateIfDifferent(state, "current_audio_source", action.payload);
        },
        setCurrentFormat: (state, action: PayloadAction<Partial<Format> | undefined>) => {
            updateIfDifferent(state, "current_format", action.payload);
        },
        setCurrentStream: (state, action: PayloadAction<Stream | undefined>) => {
            updateIfDifferent(state, "current_stream", action.payload);
        },
        setCurrentTrack: (state, action: PayloadAction<Partial<Track> | undefined>) => {
            updateIfDifferent(state, "current_track", action.payload);
        },
        setCurrentTrackMediaId: (state, action: PayloadAction<MediaId | undefined>) => {
            updateIfDifferent(state, "current_track_media_id", action.payload);
        },
        setCurrentAlbumMediaId: (state, action: PayloadAction<MediaId | undefined>) => {
            updateIfDifferent(state, "current_album_media_id", action.payload);
        },
        setDeviceDisplay: (state, action: PayloadAction<DeviceDisplay>) => {
            updateIfDifferent(state, "device_display", action.payload);
        },
        setPlayStatus: (state, action: PayloadAction<PlayStatus | undefined>) => {
            updateIfDifferent(state, "play_status", action.payload);
        },
        setPlayheadPosition: (state, action: PayloadAction<number>) => {
            state.playhead.position = action.payload;
        },
        setPlayheadPositionNormalized: (state, action: PayloadAction<number>) => {
            state.playhead.position_normalized = action.payload;
        },
        setRepeat: (state, action: PayloadAction<RepeatState | undefined>) => {
            updateIfDifferent(state, "repeat", action.payload);
        },
        setShuffle: (state, action: PayloadAction<ShuffleState | undefined>) => {
            updateIfDifferent(state, "shuffle", action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    restartPlayhead,
    setActiveTransportActions,
    setAudioSources,
    setCurrentAudioSource,
    setCurrentFormat,
    setCurrentStream,
    setCurrentTrack,
    setCurrentTrackMediaId,
    setCurrentAlbumMediaId,
    setDeviceDisplay,
    setPlayStatus,
    setPlayheadPosition,
    setPlayheadPositionNormalized,
    setRepeat,
    setShuffle,
} = playbackSlice.actions;

export default playbackSlice.reducer;
