// TODO: A lot of these sub-types are strings, which can perhaps be changed to something more
//  suitable (e.g. bit_rate could be a number). They're currently strings because that's the type
//  returned by the backend. Changing the types should perhaps be a backend change, after which
//  these UI types could be updated to match.

export type Album = {
    id: string;
    title: string;
    creator: string;
    date: string;
    artist: string;
    genre: string;
    album_art_uri: string;
};

export type Track = {
    title: string;
    artist: string;
    album: string;
    album_art_url?: string;
    duration: string;
    genre?: string;
}

export type Format = {
    codec?: string;
    sample_rate?: string;
    vbr?: string;
    bit_rate?: string;
    bit_depth?: string;
}