// ================================================================================================
// General application-wide types.
//
// Note: Other types are defined in files under app/services and app/store.
// ================================================================================================

// TODO: A lot of these type keys are strings, which can perhaps be changed to something more
//  suitable (e.g. bit_rate could be a number). They're currently strings because that's the type
//  returned by the backend. Changing the types should perhaps be a backend change, after which
//  these UI types could be updated to match.

// TODO: Consider distinguishing between Album and Track media (owned by the mediasource) and Album
//  and Track updates (owned by the streamer). They overlap a lot, but not entirely (the Media ID's
//  are notably missing from the streamer updates).

export type ApplicationFeature =
    | "albums"
    | "artists"
    | "currentTrack"
    | "favorites"
    | "mediaSearch"
    | "playlists"
    | "presets"
    | "status"
    | "tracks";

export type Media = Album | Track | Preset;

export type MediaId = string;

// Album details.
export type Album = {
    id: MediaId;
    title: string;
    creator: string;
    date: string;
    year: number;
    artist: string;
    genre: string;
    album_art_uri: string; // TODO: This vs. art_url (be consistent; will need to rename somewhere)
};

// Artist details
export type Artist = {
    id: MediaId;
    title: string;
    genre: string;
    album_art_uri: string; // TODO: This vs. art_url (be consistent; will need to rename somewhere)
};

// Preset details
export type PresetId = number;

export type PresetType = "Radio" | "UPnP";

export type Preset = {
    id: PresetId;
    name: string;
    type: PresetType;
    class: string;
    state: string;
    is_playing: boolean;
    art_url: string;
};

// Music track details.
export type Track = {
    id: MediaId;
    albumId: MediaId;
    parentId: MediaId;
    track_number: number;
    duration: number;
    album: string;
    artist: string;
    title: string;
    // TODO: Fix up difference between a Track from /tracks/:id and the "current track" from the websocket
    date?: string;
    year?: number;
    art_url: string;
    album_art_uri?: string; // TODO: Fix "art_url" vs. "album_art_uri"
    genre?: string;
};

// File encoding details.
export type Format = {
    sample_format: string;
    mqa: string;
    codec: string;
    lossless: boolean;
    sample_rate: number;
    bit_depth: number;
    encoding: string;
};

// A file being streamed for playback.
export type Stream = {
    url: string;
};

// TODO: Deprecate Playlist and PlaylistEntry
// A collection of tracks defining track playback sequence.
export type Playlist = PlaylistEntry[];

export type PlaylistEntry = {
    album: string;
    albumArtURI: string;
    artist: string;
    duration: string;
    genre: string;
    id: number;
    index: number;
    originalTrackNumber: string;
    title: string;
    uri: string;
    albumMediaId: MediaId;
    trackMediaId: MediaId;
};

export type QueueItem = {
    id: number;
    position: number;
    metadata: Record<string, any>; // TODO: Figure out possible QueueItem metadata values

    // TODO: Is the backend populating these yet
    albumMediaId: MediaId;
    trackMediaId: MediaId;
}

export type Queue = {
    count: number;
    items: QueueItem[];
    play_id: number | null;
    play_position: number | null; // Between start and (total - 1)
    presettable: boolean;
    start: number;
    total: number;

    // TODO: Do we really want to mix this in here with the backend state?
    haveReceivedInitialState: boolean;
};

export type MediaSourceClass =
    | "digital.coax"
    | "digital.toslink"
    | "digital.usb"
    | "stream.media"
    | "stream.radio"
    | "stream.service.airplay"
    | "stream.service.cast"
    | "stream.service.roon"
    | "stream.service.spotify"
    | "stream.service.tidal";

export const isAlbum = (media: Media): media is Album => !isTrack(media) && !isPreset(media);
export const isTrack = (media: Media): media is Track =>
    (media as Track).track_number !== undefined;
export const isPreset = (media: Media): media is Preset => (media as Preset).class !== undefined;
