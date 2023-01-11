// TODO: A lot of these sub-types are strings, which can perhaps be changed to something more
//  suitable (e.g. bit_rate could be a number). They're currently strings because that's the type
//  returned by the backend. Changing the types should perhaps be a backend change, after which
//  these UI types could be updated to match.

export type MediaId = string;

// Album details.
export type Album = {
    id: MediaId;
    title: string;
    creator: string;
    date: string;
    artist: string;
    genre: string;
    album_art_uri: string; // TODO: This vs. art_url (be consistent; will need to rename somewhere)
};

// Music track details.
export type Track = {
    track_number: number;
    duration: number;
    album: string;
    artist: string;
    title: string;
    art_url: string;
    genre?: string;
}

// File encoding details.
export type Format = {
    sample_format: string;
    mqa: string;
    codec: string;
    lossless: boolean;
    sample_rate: number;
    bit_depth: number;
    encoding: string;
}

// A file being streamed for playback.
export type Stream = {
    type: string;
    source_name: string;
    url: string;
}

// A collection of tracks defining track playback sequence.
export type Playlist = {
    entries: PlaylistEntry[];
}

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
}