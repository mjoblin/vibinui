import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Album, Artist, Track } from "../types";
import { NowPlayingTab } from "../../components/layout/NowPlayingScreen";

export const minCardGap = 0;
export const maxCardGap = 50;
export const minCardSize = 100;
export const maxCardSize = 300;

const DEFAULT_ALBUMS_ACTIVE_COLLECTION = "all";
const DEFAULT_ALBUMS_CARD_SIZE = 200;
const DEFAULT_ALBUMS_CARD_GAP = 15;
const DEFAULT_ALBUMS_FILTER_TEXT = "";
const DEFAULT_ALBUMS_FOLLOW_CURRENTLY_PLAYING = false;
const DEFAULT_ALBUMS_SHOW_DETAILS = true;
const DEFAULT_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE = false;
const DEFAULT_APPLICATION_THEME = "dark";
const DEFAULT_APPLICATION_USE_IMAGE_BACKGROUND = true;
const DEFAULT_ARTISTS_ACTIVE_COLLECTION = "with_albums";
const DEFAULT_ARTISTS_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_ARTISTS_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_ARTISTS_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_ARTISTS_SHOW_DETAILS = DEFAULT_ALBUMS_SHOW_DETAILS;
const DEFAULT_ARTISTS_VIEWMODE = "detailed";
const DEFAULT_FAVORITES_ACTIVE_COLLECTION = "all";
const DEFAULT_FAVORITES_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_FAVORITES_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_FAVORITES_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_FAVORITES_SHOW_DETAILS = true;
const DEFAULT_NOWPLAYING_ACTIVETAB = "lyrics";
const DEFAULT_PLAYLIST_EDITOR_SORTFIELD = "name";
const DEFAULT_PLAYLIST_FOLLOW_CURRENTLY_PLAYING = true;
const DEFAULT_PLAYLIST_VIEWMODE = "detailed";
const DEFAULT_PRESETS_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_PRESETS_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_PRESETS_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_PRESETS_SHOW_DETAILS = true;
const DEFAULT_TRACKS_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_TRACKS_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_TRACKS_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_TRACKS_FOLLOW_CURRENTLY_PLAYING = false;
const DEFAULT_TRACKS_SHOW_DETAILS = DEFAULT_ALBUMS_SHOW_DETAILS;

// LSKEY = Local Storage Key. These dot-delimited keys need to match the nested object hierarchy
//  in the user settings state.
export const LSKEY_ALBUMS_ACTIVE_COLLECTION = "albums.activeCollection";
export const LSKEY_ALBUMS_CARD_GAP = "albums.cardGap";
export const LSKEY_ALBUMS_CARD_SIZE = "albums.cardSize";
export const LSKEY_ALBUMS_FILTER_TEXT = "albums.filterText";
export const LSKEY_ALBUMS_FOLLOW_CURRENTLY_PLAYING = "albums.followCurrentlyPlaying";
export const LSKEY_ALBUMS_SHOW_DETAILS = "albums.showDetails";
export const LSKEY_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE = "application.haveShownWelcomeMessage";
export const LSKEY_APPLICATION_THEME = "application.theme";
export const LSKEY_APPLICATION_USE_IMAGE_BACKGROUND = "application.useImageBackground";
export const LSKEY_ARTISTS_ACTIVE_COLLECTION = "artists.activeCollection";
export const LSKEY_ARTISTS_CARD_GAP = "artists.cardGap";
export const LSKEY_ARTISTS_CARD_SIZE = "artists.cardSize";
export const LSKEY_ARTISTS_FILTER_TEXT = "artists.filterText";
export const LSKEY_ARTISTS_SHOW_DETAILS = "artists.showDetails";
export const LSKEY_ARTISTS_VIEWMODE = "artists.viewMode";
export const LSKEY_FAVORITES_ACTIVE_COLLECTION = "favorites.activeCollection";
export const LSKEY_FAVORITES_CARD_GAP = "favorites.cardGap";
export const LSKEY_FAVORITES_CARD_SIZE = "favorites.cardSize";
export const LSKEY_FAVORITES_FILTER_TEXT = "favorites.filterText";
export const LSKEY_FAVORITES_SHOW_DETAILS = "favorites.showDetails";
export const LSKEY_NOWPLAYING_ACTIVETAB = "nowPlaying.activeTab";
export const LSKEY_PLAYLIST_EDITOR_SORTFIELD = "playlist.editor.sortField";
export const LSKEY_PLAYLIST_FOLLOW_CURRENTLY_PLAYING = "playlist.followCurrentlyPlaying";
export const LSKEY_PLAYLIST_VIEWMODE = "playlist.viewMode";
export const LSKEY_PRESETS_CARD_GAP = "presets.cardGap";
export const LSKEY_PRESETS_CARD_SIZE = "presets.cardSize";
export const LSKEY_PRESETS_FILTER_TEXT = "presets.filterText";
export const LSKEY_PRESETS_SHOW_DETAILS = "presets.showDetails";
export const LSKEY_TRACKS_CARD_GAP = "tracks.cardGap";
export const LSKEY_TRACKS_CARD_SIZE = "tracks.cardSize";
export const LSKEY_TRACKS_FILTER_TEXT = "tracks.filterText";
export const LSKEY_TRACKS_FOLLOW_CURRENTLY_PLAYING = "tracks.followCurrentlyPlaying";
export const LSKEY_TRACKS_SHOW_DETAILS = "tracks.showDetails";

export type MediaViewMode = "art_focused" | "compact";
export type ApplicationTheme = "light" | "dark";
export type PlaylistViewMode = "simple" | "detailed";
export type PlaylistEditorSortField = "name" | "created" | "entry_count" | "updated";
export type AlbumCollection = "all" | "new";
export type ArtistCollection = "all" | "with_albums";
export type FavoriteCollection = "all" | "albums" | "tracks";

export interface UserSettingsState {
    albums: {
        activeCollection: AlbumCollection;
        cardGap: number;
        cardSize: number;
        filterText: string;
        followCurrentlyPlaying: boolean;
        showDetails: boolean;
    };
    application: {
        haveShownWelcomeMessage: boolean;
        theme: ApplicationTheme;
        useImageBackground: boolean;
    };
    artists: {
        activeCollection: ArtistCollection;
        cardGap: number;
        cardSize: number;
        filterText: string;
        selectedAlbum: Album | undefined;
        selectedArtist: Artist | undefined;
        selectedTrack: Track | undefined;
        showDetails: boolean;
        viewMode: MediaViewMode;
    };
    favorites: {
        activeCollection: FavoriteCollection;
        cardGap: number;
        cardSize: number;
        filterText: string;
        showDetails: boolean;
    };
    nowPlaying: {
        activeTab: NowPlayingTab;
    };
    playlist: {
        editor: {
            sortField: PlaylistEditorSortField;
        };
        followCurrentlyPlaying: boolean;
        viewMode: PlaylistViewMode;
    };
    presets: {
        cardGap: number;
        cardSize: number;
        filterText: string;
        showDetails: boolean;
    };
    tracks: {
        cardGap: number;
        cardSize: number;
        filterText: string;
        followCurrentlyPlaying: boolean;
        lyricsSearchText: string;
        showDetails: boolean;
    };
}

/**
 * Extract the value for the given dot.delimited key from local storage. The values are assumed to
 * be JSON.stringified (see localStorageMiddleware).
 */
const getLocalStorageValue = (key: string, defaultValue: any) => {
    const localStorageValue = localStorage.getItem(key);

    if (localStorageValue === null) {
        return defaultValue;
    }

    return JSON.parse(localStorageValue);
};

const initialState: UserSettingsState = {
    albums: {
        activeCollection: getLocalStorageValue(
            LSKEY_ALBUMS_ACTIVE_COLLECTION,
            DEFAULT_ALBUMS_ACTIVE_COLLECTION
        ),
        cardGap: getLocalStorageValue(LSKEY_ALBUMS_CARD_GAP, DEFAULT_ALBUMS_CARD_GAP),
        cardSize: getLocalStorageValue(LSKEY_ALBUMS_CARD_SIZE, DEFAULT_ALBUMS_CARD_SIZE),
        filterText: getLocalStorageValue(LSKEY_ALBUMS_FILTER_TEXT, DEFAULT_ALBUMS_FILTER_TEXT),
        followCurrentlyPlaying: getLocalStorageValue(
            LSKEY_ALBUMS_FOLLOW_CURRENTLY_PLAYING,
            DEFAULT_ALBUMS_FOLLOW_CURRENTLY_PLAYING
        ),
        showDetails: getLocalStorageValue(LSKEY_ALBUMS_SHOW_DETAILS, DEFAULT_ALBUMS_SHOW_DETAILS),
    },
    application: {
        haveShownWelcomeMessage: getLocalStorageValue(
            LSKEY_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE,
            DEFAULT_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE
        ),
        theme: getLocalStorageValue(LSKEY_APPLICATION_THEME, DEFAULT_APPLICATION_THEME),
        useImageBackground: getLocalStorageValue(
            LSKEY_APPLICATION_USE_IMAGE_BACKGROUND,
            DEFAULT_APPLICATION_USE_IMAGE_BACKGROUND
        ),
    },
    artists: {
        activeCollection: getLocalStorageValue(
            LSKEY_ARTISTS_ACTIVE_COLLECTION,
            DEFAULT_ARTISTS_ACTIVE_COLLECTION
        ),
        cardGap: getLocalStorageValue(LSKEY_ARTISTS_CARD_GAP, DEFAULT_ARTISTS_CARD_GAP),
        cardSize: getLocalStorageValue(LSKEY_ARTISTS_CARD_SIZE, DEFAULT_ARTISTS_CARD_SIZE),
        filterText: getLocalStorageValue(LSKEY_ARTISTS_FILTER_TEXT, DEFAULT_ARTISTS_FILTER_TEXT),
        selectedAlbum: undefined,
        selectedArtist: undefined,
        selectedTrack: undefined,
        showDetails: getLocalStorageValue(LSKEY_ARTISTS_SHOW_DETAILS, DEFAULT_ARTISTS_SHOW_DETAILS),
        viewMode: getLocalStorageValue(LSKEY_ARTISTS_VIEWMODE, DEFAULT_ARTISTS_VIEWMODE),
    },
    favorites: {
        activeCollection: getLocalStorageValue(
            LSKEY_FAVORITES_ACTIVE_COLLECTION,
            DEFAULT_FAVORITES_ACTIVE_COLLECTION
        ),
        cardGap: getLocalStorageValue(LSKEY_FAVORITES_CARD_GAP, DEFAULT_FAVORITES_CARD_GAP),
        cardSize: getLocalStorageValue(LSKEY_FAVORITES_CARD_SIZE, DEFAULT_FAVORITES_CARD_SIZE),
        filterText: getLocalStorageValue(
            LSKEY_FAVORITES_FILTER_TEXT,
            DEFAULT_FAVORITES_FILTER_TEXT
        ),
        showDetails: getLocalStorageValue(
            LSKEY_FAVORITES_SHOW_DETAILS,
            DEFAULT_FAVORITES_SHOW_DETAILS
        ),
    },
    nowPlaying: {
        activeTab: getLocalStorageValue(LSKEY_NOWPLAYING_ACTIVETAB, DEFAULT_NOWPLAYING_ACTIVETAB),
    },
    playlist: {
        editor: {
            sortField: getLocalStorageValue(
                LSKEY_PLAYLIST_EDITOR_SORTFIELD,
                DEFAULT_PLAYLIST_EDITOR_SORTFIELD
            ),
        },
        followCurrentlyPlaying: getLocalStorageValue(
            LSKEY_PLAYLIST_FOLLOW_CURRENTLY_PLAYING,
            DEFAULT_PLAYLIST_FOLLOW_CURRENTLY_PLAYING
        ),
        viewMode: getLocalStorageValue(LSKEY_PLAYLIST_VIEWMODE, DEFAULT_PLAYLIST_VIEWMODE),
    },
    presets: {
        cardGap: getLocalStorageValue(LSKEY_PRESETS_CARD_GAP, DEFAULT_PRESETS_CARD_GAP),
        cardSize: getLocalStorageValue(LSKEY_PRESETS_CARD_SIZE, DEFAULT_PRESETS_CARD_SIZE),
        filterText: getLocalStorageValue(LSKEY_PRESETS_FILTER_TEXT, DEFAULT_PRESETS_FILTER_TEXT),
        showDetails: getLocalStorageValue(LSKEY_PRESETS_SHOW_DETAILS, DEFAULT_PRESETS_SHOW_DETAILS),
    },
    tracks: {
        cardGap: getLocalStorageValue(LSKEY_TRACKS_CARD_GAP, DEFAULT_TRACKS_CARD_GAP),
        cardSize: getLocalStorageValue(LSKEY_TRACKS_CARD_SIZE, DEFAULT_TRACKS_CARD_SIZE),
        filterText: getLocalStorageValue(LSKEY_TRACKS_FILTER_TEXT, DEFAULT_TRACKS_FILTER_TEXT),
        followCurrentlyPlaying: getLocalStorageValue(
            LSKEY_TRACKS_FOLLOW_CURRENTLY_PLAYING,
            DEFAULT_TRACKS_FOLLOW_CURRENTLY_PLAYING
        ),
        lyricsSearchText: "",
        showDetails: getLocalStorageValue(LSKEY_TRACKS_SHOW_DETAILS, DEFAULT_TRACKS_SHOW_DETAILS),
    },
};

export const userSettingsSlice = createSlice({
    name: "userSettings",
    initialState,
    reducers: {
        resetAlbumsToDefaults: (state) => {
            state.albums.cardSize = DEFAULT_ALBUMS_CARD_SIZE;
            state.albums.cardGap = DEFAULT_ALBUMS_CARD_GAP;
            state.albums.showDetails = DEFAULT_ALBUMS_SHOW_DETAILS;
        },
        resetArtistsToDefaults: (state) => {
            state.artists.cardSize = DEFAULT_ARTISTS_CARD_SIZE;
            state.artists.cardGap = DEFAULT_ARTISTS_CARD_GAP;
            state.artists.showDetails = DEFAULT_ARTISTS_SHOW_DETAILS;
        },
        resetFavoritesToDefaults: (state) => {
            state.favorites.cardSize = DEFAULT_FAVORITES_CARD_SIZE;
            state.favorites.cardGap = DEFAULT_FAVORITES_CARD_GAP;
            state.favorites.showDetails = DEFAULT_FAVORITES_SHOW_DETAILS;
        },
        resetPresetsToDefaults: (state) => {
            state.presets.cardSize = DEFAULT_PRESETS_CARD_SIZE;
            state.presets.cardGap = DEFAULT_PRESETS_CARD_GAP;
            state.presets.showDetails = DEFAULT_PRESETS_SHOW_DETAILS;
        },
        resetTracksToDefaults: (state) => {
            state.tracks.cardSize = DEFAULT_TRACKS_CARD_SIZE;
            state.tracks.cardGap = DEFAULT_TRACKS_CARD_GAP;
            state.tracks.showDetails = DEFAULT_TRACKS_SHOW_DETAILS;
        },
        setAlbumsActiveCollection: (state, action: PayloadAction<AlbumCollection>) => {
            state.albums.activeCollection = action.payload;
        },
        setAlbumsCardGap: (state, action: PayloadAction<number>) => {
            state.albums.cardGap = action.payload;
        },
        setAlbumsCardSize: (state, action: PayloadAction<number>) => {
            state.albums.cardSize = action.payload;
        },
        setAlbumsFilterText: (state, action: PayloadAction<string>) => {
            state.albums.filterText = action.payload;
        },
        setAlbumsFollowCurrentlyPlaying: (state, action: PayloadAction<boolean>) => {
            state.albums.followCurrentlyPlaying = action.payload;
        },
        setAlbumsShowDetails: (state, action: PayloadAction<boolean>) => {
            state.albums.showDetails = action.payload;
        },
        setApplicationHaveShownWelcomeMessage: (state, action: PayloadAction<boolean>) => {
            state.application.haveShownWelcomeMessage = action.payload;
        },
        setApplicationTheme: (state, action: PayloadAction<ApplicationTheme>) => {
            state.application.theme = action.payload;
        },
        setApplicationUseImageBackground: (state, action: PayloadAction<boolean>) => {
            state.application.useImageBackground = action.payload;
        },
        setArtistsActiveCollection: (state, action: PayloadAction<ArtistCollection>) => {
            state.artists.activeCollection = action.payload;
        },
        setArtistsCardGap: (state, action: PayloadAction<number>) => {
            state.artists.cardGap = action.payload;
        },
        setArtistsCardSize: (state, action: PayloadAction<number>) => {
            state.artists.cardSize = action.payload;
        },
        setArtistsFilterText: (state, action: PayloadAction<string>) => {
            state.artists.filterText = action.payload;
        },
        setArtistsSelectedAlbum: (state, action: PayloadAction<Album | undefined>) => {
            state.artists.selectedAlbum = action.payload;
        },
        setArtistsSelectedArtist: (state, action: PayloadAction<Artist | undefined>) => {
            state.artists.selectedArtist = action.payload;
        },
        setArtistsSelectedTrack: (state, action: PayloadAction<Track | undefined>) => {
            state.artists.selectedTrack = action.payload;
        },
        setArtistsShowDetails: (state, action: PayloadAction<boolean>) => {
            state.artists.showDetails = action.payload;
        },
        setArtistsViewMode: (state, action: PayloadAction<MediaViewMode>) => {
            state.artists.viewMode = action.payload;
        },
        setFavoritesActiveCollection: (state, action: PayloadAction<FavoriteCollection>) => {
            state.favorites.activeCollection = action.payload;
        },
        setFavoritesCardGap: (state, action: PayloadAction<number>) => {
            state.favorites.cardGap = action.payload;
        },
        setFavoritesCardSize: (state, action: PayloadAction<number>) => {
            state.favorites.cardSize = action.payload;
        },
        setFavoritesFilterText: (state, action: PayloadAction<string>) => {
            state.favorites.filterText = action.payload;
        },
        setFavoritesShowDetails: (state, action: PayloadAction<boolean>) => {
            state.favorites.showDetails = action.payload;
        },
        setNowPlayingActiveTab: (state, action: PayloadAction<NowPlayingTab>) => {
            state.nowPlaying.activeTab = action.payload;
        },
        setPlaylistEditorSortField: (state, action: PayloadAction<PlaylistEditorSortField>) => {
            state.playlist.editor.sortField = action.payload;
        },
        setPlaylistFollowCurrentlyPlaying: (state, action: PayloadAction<boolean>) => {
            state.playlist.followCurrentlyPlaying = action.payload;
        },
        setPlaylistViewMode: (state, action: PayloadAction<PlaylistViewMode>) => {
            state.playlist.viewMode = action.payload;
        },
        setPresetsCardGap: (state, action: PayloadAction<number>) => {
            state.presets.cardGap = action.payload;
        },
        setPresetsCardSize: (state, action: PayloadAction<number>) => {
            state.presets.cardSize = action.payload;
        },
        setPresetsFilterText: (state, action: PayloadAction<string>) => {
            state.presets.filterText = action.payload;
        },
        setPresetsShowDetails: (state, action: PayloadAction<boolean>) => {
            state.presets.showDetails = action.payload;
        },
        setTracksCardGap: (state, action: PayloadAction<number>) => {
            state.tracks.cardGap = action.payload;
        },
        setTracksCardSize: (state, action: PayloadAction<number>) => {
            state.tracks.cardSize = action.payload;
        },
        setTracksFilterText: (state, action: PayloadAction<string>) => {
            state.tracks.filterText = action.payload;
        },
        setTracksFollowCurrentlyPlaying: (state, action: PayloadAction<boolean>) => {
            state.tracks.followCurrentlyPlaying = action.payload;
        },
        setTracksLyricsSearchText: (state, action: PayloadAction<string>) => {
            state.tracks.lyricsSearchText = action.payload;
        },
        setTracksShowDetails: (state, action: PayloadAction<boolean>) => {
            state.tracks.showDetails = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    resetAlbumsToDefaults,
    resetArtistsToDefaults,
    resetFavoritesToDefaults,
    resetPresetsToDefaults,
    resetTracksToDefaults,
    setAlbumsActiveCollection,
    setAlbumsCardGap,
    setAlbumsCardSize,
    setAlbumsFilterText,
    setAlbumsFollowCurrentlyPlaying,
    setAlbumsShowDetails,
    setApplicationHaveShownWelcomeMessage,
    setApplicationTheme,
    setApplicationUseImageBackground,
    setArtistsActiveCollection,
    setArtistsCardGap,
    setArtistsCardSize,
    setArtistsFilterText,
    setArtistsShowDetails,
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
    setArtistsViewMode,
    setFavoritesActiveCollection,
    setFavoritesCardGap,
    setFavoritesCardSize,
    setFavoritesFilterText,
    setFavoritesShowDetails,
    setNowPlayingActiveTab,
    setPlaylistEditorSortField,
    setPlaylistFollowCurrentlyPlaying,
    setPlaylistViewMode,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsFilterText,
    setPresetsShowDetails,
    setTracksCardGap,
    setTracksCardSize,
    setTracksFilterText,
    setTracksFollowCurrentlyPlaying,
    setTracksLyricsSearchText,
    setTracksShowDetails,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
