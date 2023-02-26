// TODO: A lot of these sub-types are strings, which can perhaps be changed to something more
//  suitable (e.g. bit_rate could be a number). They're currently strings because that's the type
//  returned by the backend. Changing the types should perhaps be a backend change, after which
//  these UI types could be updated to match.

// TODO: Consider distinguishing between Album and Track media (owned by the mediasource) and Album
//  and Track updates (owned by the streamer). They overlap a lot, but not entirely (the Media ID's
//  are notably missing from the streamer updates).

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
    // TODO: This MediaId should not be optional. Consider removing it entirely (playlist entries
    //  get media ids from the back-end; and the playbackSlice stores current_track_media_id from
    //  incoming Stream data). OR we need to distinguish between Album and Track media (owned by
    //  the mediasource) and Album and Track updates owned by the streamer.
    id?: MediaId;
    track_number: number;
    duration: number;
    album: string;
    artist: string;
    title: string;
    // TODO: Fix up difference between a Track from /tracks/:id and the "current track" from the websocket
    date?: string;
    art_url: string;
    album_art_uri?: string;  // TODO: Fix "art_url" vs. "album_art_uri"
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
}

// A file being streamed for playback.
export type Stream = {
    type: string;
    source_name: string;
    url: string;
}

// A collection of tracks defining track playback sequence.
export type Playlist = PlaylistEntry[]

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
}