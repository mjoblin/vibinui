import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Album, Artist, Track } from "../types";
import { CurrentTrackTab } from "../../components/features/CurrentTrackScreen";

// ================================================================================================
// Application state for user settings.
//
// See localStorageMiddleware.ts for instructions on how "TO STORE A USER SETTING IN LOCAL STORAGE"
// ================================================================================================

export const minCardGap = 0;
export const maxCardGap = 50;
export const minCardSize = 100;
export const maxCardSize = 300;

const DEFAULT_ALBUMS_ACTIVE_COLLECTION = "all";
const DEFAULT_ALBUMS_CARD_GAP = 15;
const DEFAULT_ALBUMS_CARD_SIZE = 200;
const DEFAULT_ALBUMS_FILTER_TEXT = "";
const DEFAULT_ALBUMS_FOLLOW_CURRENTLY_PLAYING = false;
const DEFAULT_ALBUMS_SHOW_DETAILS = true;
const DEFAULT_ALBUMS_WALL_SORT_FIELD = "title";
const DEFAULT_ALBUMS_WALL_SORT_DIRECTION = "ascending";
const DEFAULT_ALBUMS_WALL_VIEW_MODE = "cards";
const DEFAULT_APPLICATION_AUTO_PLAY_ON_PLAYLIST_ACTIVATION = true;
const DEFAULT_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE = false;
const DEFAULT_APPLICATION_MEDIA_SEARCH_CARD_GAP = 15;
const DEFAULT_APPLICATION_MEDIA_SEARCH_CARD_SIZE = 200;
const DEFAULT_APPLICATION_MEDIA_SEARCH_DISPLAY_CATEGORIES = [
    "albums",
    "tracks",
    "presets",
    "favorites",
];
const DEFAULT_APPLICATION_MEDIA_SEARCH_FILTER_TEXT = "";
const DEFAULT_APPLICATION_MEDIA_SEARCH_SHOW_DETAILS = true;
const DEFAULT_APPLICATION_MEDIA_SEARCH_WALL_SORT_FIELD = "title";
const DEFAULT_APPLICATION_MEDIA_SEARCH_WALL_SORT_DIRECTION = "ascending";
const DEFAULT_APPLICATION_MEDIA_SEARCH_WALL_VIEW_MODE = "cards";
const DEFAULT_APPLICATION_THEME = "dark";
const DEFAULT_APPLICATION_USE_IMAGE_BACKGROUND = true;
const DEFAULT_APPLICATION_VOLUME_LIMIT = null;
const DEFAULT_ARTISTS_ACTIVE_COLLECTION = "with_albums";
const DEFAULT_ARTISTS_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_ARTISTS_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_ARTISTS_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_ARTISTS_SHOW_DETAILS = DEFAULT_ALBUMS_SHOW_DETAILS;
const DEFAULT_ARTISTS_VIEWMODE = "detailed";
const DEFAULT_FAVORITES_ACTIVE_COLLECTION = "all";
const DEFAULT_FAVORITES_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_FAVORITES_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_FAVORITES_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_FAVORITES_SHOW_DETAILS = true;
const DEFAULT_FAVORITES_WALL_SORT_FIELD = "title";
const DEFAULT_FAVORITES_WALL_SORT_DIRECTION = "ascending";
const DEFAULT_FAVORITES_WALL_VIEW_MODE = "cards";
const DEFAULT_CURRENTTRACK_ACTIVETAB = "lyrics";
const DEFAULT_PLAYLIST_EDITOR_SORTFIELD = "name";
const DEFAULT_PLAYLIST_FOLLOW_CURRENTLY_PLAYING = true;
const DEFAULT_PLAYLIST_VIEWMODE = "detailed";
const DEFAULT_PRESETS_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_PRESETS_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_PRESETS_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_PRESETS_SHOW_DETAILS = true;
const DEFAULT_PRESETS_WALL_SORT_FIELD = "id";
const DEFAULT_PRESETS_WALL_SORT_DIRECTION = "ascending";
const DEFAULT_PRESETS_WALL_VIEW_MODE = "cards";
const DEFAULT_TRACKS_CARD_GAP = DEFAULT_ALBUMS_CARD_GAP;
const DEFAULT_TRACKS_CARD_SIZE = DEFAULT_ALBUMS_CARD_SIZE;
const DEFAULT_TRACKS_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_TRACKS_FOLLOW_CURRENTLY_PLAYING = false;
const DEFAULT_TRACKS_SHOW_DETAILS = DEFAULT_ALBUMS_SHOW_DETAILS;
const DEFAULT_TRACKS_WALL_SORT_FIELD = "title";
const DEFAULT_TRACKS_WALL_SORT_DIRECTION = "ascending";
const DEFAULT_TRACKS_WALL_VIEW_MODE = "cards";

// LSKEY = Local Storage Key. These dot-delimited keys need to match the nested object hierarchy
//  in the user settings state.
export const LSKEY_ALBUMS_ACTIVE_COLLECTION = "albums.activeCollection";
export const LSKEY_ALBUMS_CARD_GAP = "albums.cardGap";
export const LSKEY_ALBUMS_CARD_SIZE = "albums.cardSize";
export const LSKEY_ALBUMS_FILTER_TEXT = "albums.filterText";
export const LSKEY_ALBUMS_FOLLOW_CURRENTLY_PLAYING = "albums.followCurrentlyPlaying";
export const LSKEY_ALBUMS_SHOW_DETAILS = "albums.showDetails";
export const LSKEY_ALBUMS_WALL_SORT_DIRECTION = "albums.wallSortDirection";
export const LSKEY_ALBUMS_WALL_SORT_FIELD = "albums.wallSortField";
export const LSKEY_ALBUMS_WALL_VIEW_MODE = "albums.wallViewMode";
export const LSKEY_APPLICATION_AUTO_PLAY_ON_PLAYLIST_ACTIVATION = "application.autoPlayOnPlaylistActivation";
export const LSKEY_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE = "application.haveShownWelcomeMessage";
export const LSKEY_APPLICATION_MEDIA_SEARCH_CARD_GAP = "application.mediaSearch.cardGap";
export const LSKEY_APPLICATION_MEDIA_SEARCH_CARD_SIZE = "application.mediaSearch.cardSize";
export const LSKEY_APPLICATION_MEDIA_SEARCH_DISPLAY_CATEGORIES = "application.mediaSearch.displayCategories";
export const LSKEY_APPLICATION_MEDIA_SEARCH_FILTER_TEXT = "application.mediaSearch.filterText";
export const LSKEY_APPLICATION_MEDIA_SEARCH_SHOW_DETAILS = "application.mediaSearch.showDetails";
export const LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_DIRECTION = "application.mediaSearch.wallSortDirection";
export const LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_FIELD = "application.mediaSearch.wallSortField";
export const LSKEY_APPLICATION_MEDIA_SEARCH_WALL_VIEW_MODE = "application.mediaSearch.wallViewMode";
export const LSKEY_APPLICATION_THEME = "application.theme";
export const LSKEY_APPLICATION_USE_IMAGE_BACKGROUND = "application.useImageBackground";
export const LSKEY_APPLICATION_VOLUME_LIMIT = "application.volumeLimit";
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
export const LSKEY_FAVORITES_WALL_SORT_DIRECTION = "favorites.wallSortDirection";
export const LSKEY_FAVORITES_WALL_SORT_FIELD = "favorites.wallSortField";
export const LSKEY_FAVORITES_WALL_VIEW_MODE = "favorites.wallViewMode";
export const LSKEY_CURRENTTRACK_ACTIVETAB = "currentTrack.activeTab";
export const LSKEY_PLAYLIST_EDITOR_SORTFIELD = "playlist.editor.sortField";
export const LSKEY_PLAYLIST_FOLLOW_CURRENTLY_PLAYING = "playlist.followCurrentlyPlaying";
export const LSKEY_PLAYLIST_VIEWMODE = "playlist.viewMode";
export const LSKEY_PRESETS_CARD_GAP = "presets.cardGap";
export const LSKEY_PRESETS_CARD_SIZE = "presets.cardSize";
export const LSKEY_PRESETS_FILTER_TEXT = "presets.filterText";
export const LSKEY_PRESETS_SHOW_DETAILS = "presets.showDetails";
export const LSKEY_PRESETS_WALL_SORT_DIRECTION = "presets.wallSortDirection";
export const LSKEY_PRESETS_WALL_SORT_FIELD = "presets.wallSortField";
export const LSKEY_PRESETS_WALL_VIEW_MODE = "presets.wallViewMode";
export const LSKEY_TRACKS_CARD_GAP = "tracks.cardGap";
export const LSKEY_TRACKS_CARD_SIZE = "tracks.cardSize";
export const LSKEY_TRACKS_FILTER_TEXT = "tracks.filterText";
export const LSKEY_TRACKS_FOLLOW_CURRENTLY_PLAYING = "tracks.followCurrentlyPlaying";
export const LSKEY_TRACKS_SHOW_DETAILS = "tracks.showDetails";
export const LSKEY_TRACKS_WALL_SORT_DIRECTION = "tracks.wallSortDirection";
export const LSKEY_TRACKS_WALL_SORT_FIELD = "tracks.wallSortField";
export const LSKEY_TRACKS_WALL_VIEW_MODE = "tracks.wallViewMode";

export type MediaWallViewMode = "cards" | "table";
export type MediaSortDirection = "ascending" | "descending";
export type MediaSortField = string;
export type MediaCardViewMode = "art_focused" | "compact";
export type ApplicationTheme = "light" | "dark";
export type PlaylistViewMode = "simple" | "detailed";
export type PlaylistEditorSortField = "name" | "created" | "entry_count" | "updated";
export type AlbumCollection = "all" | "new";
export type ArtistCollection = "all" | "with_albums";
export type FavoriteCollection = "all" | "albums" | "tracks";
export type MediaSearchDisplayCategory = "albums" | "tracks" | "presets" | "favorites";

export interface UserSettingsState {
    albums: {
        activeCollection: AlbumCollection;
        cardGap: number;
        cardSize: number;
        filterText: string;
        followCurrentlyPlaying: boolean;
        showDetails: boolean;
        wallSortDirection: MediaSortDirection;
        wallSortField: string;
        wallViewMode: MediaWallViewMode;
    };
    application: {
        autoPlayOnPlaylistActivation: boolean;
        haveShownWelcomeMessage: boolean;
        mediaSearch: {
            cardGap: number;
            cardSize: number;
            displayCategories: MediaSearchDisplayCategory[];
            filterText: string;
            showDetails: boolean;
            wallSortDirection: MediaSortDirection;
            wallSortField: string;
            wallViewMode: MediaWallViewMode;
        }
        theme: ApplicationTheme;
        useImageBackground: boolean;
        volumeLimit: number | null;
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
        viewMode: MediaCardViewMode;
    };
    favorites: {
        activeCollection: FavoriteCollection;
        cardGap: number;
        cardSize: number;
        filterText: string;
        showDetails: boolean;
        wallSortDirection: MediaSortDirection;
        wallSortField: string;
        wallViewMode: MediaWallViewMode;
    };
    currentTrack: {
        activeTab: CurrentTrackTab;
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
        wallSortDirection: MediaSortDirection;
        wallSortField: string;
        wallViewMode: MediaWallViewMode;
    };
    tracks: {
        cardGap: number;
        cardSize: number;
        filterText: string;
        followCurrentlyPlaying: boolean;
        lyricsSearchText: string;
        showDetails: boolean;
        wallSortDirection: MediaSortDirection;
        wallSortField: string;
        wallViewMode: MediaWallViewMode;
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
        wallSortDirection: getLocalStorageValue(
            LSKEY_ALBUMS_WALL_SORT_DIRECTION,
            DEFAULT_ALBUMS_WALL_SORT_DIRECTION
        ),
        wallSortField: getLocalStorageValue(
            LSKEY_ALBUMS_WALL_SORT_FIELD,
            DEFAULT_ALBUMS_WALL_SORT_FIELD
        ),
        wallViewMode: getLocalStorageValue(
            LSKEY_ALBUMS_WALL_VIEW_MODE,
            DEFAULT_ALBUMS_WALL_VIEW_MODE
        ),
    },
    application: {
        autoPlayOnPlaylistActivation: getLocalStorageValue(
            LSKEY_APPLICATION_AUTO_PLAY_ON_PLAYLIST_ACTIVATION,
            DEFAULT_APPLICATION_AUTO_PLAY_ON_PLAYLIST_ACTIVATION
        ),
        haveShownWelcomeMessage: getLocalStorageValue(
            LSKEY_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE,
            DEFAULT_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE
        ),
        mediaSearch: {
            cardGap: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_CARD_GAP,
                DEFAULT_APPLICATION_MEDIA_SEARCH_CARD_GAP
            ),
            cardSize: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_CARD_SIZE,
                DEFAULT_APPLICATION_MEDIA_SEARCH_CARD_SIZE
            ),
            displayCategories: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_DISPLAY_CATEGORIES,
                DEFAULT_APPLICATION_MEDIA_SEARCH_DISPLAY_CATEGORIES
            ),
            filterText: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_FILTER_TEXT,
                DEFAULT_APPLICATION_MEDIA_SEARCH_FILTER_TEXT
            ),
            showDetails: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_SHOW_DETAILS,
                DEFAULT_APPLICATION_MEDIA_SEARCH_SHOW_DETAILS
            ),
            wallSortDirection: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_DIRECTION,
                DEFAULT_APPLICATION_MEDIA_SEARCH_WALL_SORT_DIRECTION
            ),
            wallSortField: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_FIELD,
                DEFAULT_APPLICATION_MEDIA_SEARCH_WALL_SORT_FIELD
            ),
            wallViewMode: getLocalStorageValue(
                LSKEY_APPLICATION_MEDIA_SEARCH_WALL_VIEW_MODE,
                DEFAULT_APPLICATION_MEDIA_SEARCH_WALL_VIEW_MODE
            ),
        },
        theme: getLocalStorageValue(LSKEY_APPLICATION_THEME, DEFAULT_APPLICATION_THEME),
        useImageBackground: getLocalStorageValue(
            LSKEY_APPLICATION_USE_IMAGE_BACKGROUND,
            DEFAULT_APPLICATION_USE_IMAGE_BACKGROUND
        ),
        volumeLimit: getLocalStorageValue(
            LSKEY_APPLICATION_VOLUME_LIMIT,
            DEFAULT_APPLICATION_VOLUME_LIMIT
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
        wallSortDirection: getLocalStorageValue(
            LSKEY_FAVORITES_WALL_SORT_DIRECTION,
            DEFAULT_FAVORITES_WALL_SORT_DIRECTION
        ),
        wallSortField: getLocalStorageValue(
            LSKEY_FAVORITES_WALL_SORT_FIELD,
            DEFAULT_FAVORITES_WALL_SORT_FIELD
        ),
        wallViewMode: getLocalStorageValue(
            LSKEY_FAVORITES_WALL_VIEW_MODE,
            DEFAULT_FAVORITES_WALL_VIEW_MODE
        ),
    },
    currentTrack: {
        activeTab: getLocalStorageValue(
            LSKEY_CURRENTTRACK_ACTIVETAB,
            DEFAULT_CURRENTTRACK_ACTIVETAB
        ),
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
        wallSortDirection: getLocalStorageValue(
            LSKEY_PRESETS_WALL_SORT_DIRECTION,
            DEFAULT_PRESETS_WALL_SORT_DIRECTION
        ),
        wallSortField: getLocalStorageValue(
            LSKEY_PRESETS_WALL_SORT_FIELD,
            DEFAULT_PRESETS_WALL_SORT_FIELD
        ),
        wallViewMode: getLocalStorageValue(
            LSKEY_PRESETS_WALL_VIEW_MODE,
            DEFAULT_PRESETS_WALL_VIEW_MODE
        ),
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
        wallSortDirection: getLocalStorageValue(
            LSKEY_TRACKS_WALL_SORT_DIRECTION,
            DEFAULT_TRACKS_WALL_SORT_DIRECTION
        ),
        wallSortField: getLocalStorageValue(
            LSKEY_TRACKS_WALL_SORT_FIELD,
            DEFAULT_TRACKS_WALL_SORT_FIELD
        ),
        wallViewMode: getLocalStorageValue(
            LSKEY_TRACKS_WALL_VIEW_MODE,
            DEFAULT_TRACKS_WALL_VIEW_MODE
        ),
    },
};

export const userSettingsSlice = createSlice({
    name: "userSettings",
    initialState,
    reducers: {
        resetAlbumsToDefaults: (state) => {
            state.albums.cardGap = DEFAULT_ALBUMS_CARD_GAP;
            state.albums.cardSize = DEFAULT_ALBUMS_CARD_SIZE;
            state.albums.showDetails = DEFAULT_ALBUMS_SHOW_DETAILS;
        },
        resetApplicationMediaSearchToDefaults: (state) => {
            state.application.mediaSearch.cardGap = DEFAULT_APPLICATION_MEDIA_SEARCH_CARD_GAP;
            state.application.mediaSearch.cardSize = DEFAULT_APPLICATION_MEDIA_SEARCH_CARD_SIZE;
            state.application.mediaSearch.showDetails =
                DEFAULT_APPLICATION_MEDIA_SEARCH_SHOW_DETAILS;
        },
        resetArtistsToDefaults: (state) => {
            state.artists.cardGap = DEFAULT_ARTISTS_CARD_GAP;
            state.artists.cardSize = DEFAULT_ARTISTS_CARD_SIZE;
            state.artists.showDetails = DEFAULT_ARTISTS_SHOW_DETAILS;
        },
        resetFavoritesToDefaults: (state) => {
            state.favorites.cardGap = DEFAULT_FAVORITES_CARD_GAP;
            state.favorites.cardSize = DEFAULT_FAVORITES_CARD_SIZE;
            state.favorites.showDetails = DEFAULT_FAVORITES_SHOW_DETAILS;
        },
        resetPresetsToDefaults: (state) => {
            state.presets.cardGap = DEFAULT_PRESETS_CARD_GAP;
            state.presets.cardSize = DEFAULT_PRESETS_CARD_SIZE;
            state.presets.showDetails = DEFAULT_PRESETS_SHOW_DETAILS;
        },
        resetTracksToDefaults: (state) => {
            state.tracks.cardGap = DEFAULT_TRACKS_CARD_GAP;
            state.tracks.cardSize = DEFAULT_TRACKS_CARD_SIZE;
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
        setAlbumsWallSortDirection: (state, action: PayloadAction<MediaSortDirection>) => {
            state.albums.wallSortDirection = action.payload;
        },
        setAlbumsWallSortField: (state, action: PayloadAction<MediaSortField>) => {
            state.albums.wallSortField = action.payload;
        },
        setAlbumsWallViewMode: (state, action: PayloadAction<MediaWallViewMode>) => {
            state.albums.wallViewMode = action.payload;
        },
        setApplicationAutoPlayOnPlaylistActivation: (state, action: PayloadAction<boolean>) => {
            state.application.autoPlayOnPlaylistActivation = action.payload;
        },
        setApplicationHaveShownWelcomeMessage: (state, action: PayloadAction<boolean>) => {
            state.application.haveShownWelcomeMessage = action.payload;
        },
        setApplicationMediaSearchCardGap: (state, action: PayloadAction<number>) => {
            state.application.mediaSearch.cardGap = action.payload;
        },
        setApplicationMediaSearchCardSize: (state, action: PayloadAction<number>) => {
            state.application.mediaSearch.cardSize = action.payload;
        },
        setApplicationMediaSearchDisplayCategories: (
            state,
            action: PayloadAction<MediaSearchDisplayCategory[]>
        ) => {
            state.application.mediaSearch.displayCategories = action.payload;
        },
        setApplicationMediaSearchFilterText: (state, action: PayloadAction<string>) => {
            state.application.mediaSearch.filterText = action.payload;
        },
        setApplicationMediaSearchShowDetails: (state, action: PayloadAction<boolean>) => {
            state.application.mediaSearch.showDetails = action.payload;
        },
        setApplicationMediaSearchWallSortDirection: (state, action: PayloadAction<MediaSortDirection>) => {
            state.application.mediaSearch.wallSortDirection = action.payload;
        },
        setApplicationMediaSearchWallSortField: (state, action: PayloadAction<MediaSortField>) => {
            state.application.mediaSearch.wallSortField = action.payload;
        },
        setApplicationMediaSearchWallViewMode: (state, action: PayloadAction<MediaWallViewMode>) => {
            state.application.mediaSearch.wallViewMode = action.payload;
        },
        setApplicationTheme: (state, action: PayloadAction<ApplicationTheme>) => {
            state.application.theme = action.payload;
        },
        setApplicationUseImageBackground: (state, action: PayloadAction<boolean>) => {
            state.application.useImageBackground = action.payload;
        },
        setApplicationVolumeLimit: (state, action: PayloadAction<number | null>) => {
            state.application.volumeLimit = action.payload;
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
        setArtistsViewMode: (state, action: PayloadAction<MediaCardViewMode>) => {
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
        setFavoritesWallSortDirection: (state, action: PayloadAction<MediaSortDirection>) => {
            state.favorites.wallSortDirection = action.payload;
        },
        setFavoritesWallSortField: (state, action: PayloadAction<MediaSortField>) => {
            state.favorites.wallSortField = action.payload;
        },
        setFavoritesWallViewMode: (state, action: PayloadAction<MediaWallViewMode>) => {
            state.favorites.wallViewMode = action.payload;
        },
        setCurrentTrackActiveTab: (state, action: PayloadAction<CurrentTrackTab>) => {
            state.currentTrack.activeTab = action.payload;
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
        setPresetsWallSortDirection: (state, action: PayloadAction<MediaSortDirection>) => {
            state.presets.wallSortDirection = action.payload;
        },
        setPresetsWallSortField: (state, action: PayloadAction<MediaSortField>) => {
            state.presets.wallSortField = action.payload;
        },
        setPresetsWallViewMode: (state, action: PayloadAction<MediaWallViewMode>) => {
            state.presets.wallViewMode = action.payload;
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
        setTracksWallSortDirection: (state, action: PayloadAction<MediaSortDirection>) => {
            state.tracks.wallSortDirection = action.payload;
        },
        setTracksWallSortField: (state, action: PayloadAction<MediaSortField>) => {
            state.tracks.wallSortField = action.payload;
        },
        setTracksWallViewMode: (state, action: PayloadAction<MediaWallViewMode>) => {
            state.tracks.wallViewMode = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    resetAlbumsToDefaults,
    resetApplicationMediaSearchToDefaults,
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
    setAlbumsWallSortDirection,
    setAlbumsWallSortField,
    setAlbumsWallViewMode,
    setApplicationAutoPlayOnPlaylistActivation,
    setApplicationHaveShownWelcomeMessage,
    setApplicationMediaSearchCardGap,
    setApplicationMediaSearchCardSize,
    setApplicationMediaSearchDisplayCategories,
    setApplicationMediaSearchFilterText,
    setApplicationMediaSearchShowDetails,
    setApplicationMediaSearchWallSortDirection,
    setApplicationMediaSearchWallSortField,
    setApplicationMediaSearchWallViewMode,
    setApplicationTheme,
    setApplicationUseImageBackground,
    setApplicationVolumeLimit,
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
    setFavoritesWallSortDirection,
    setFavoritesWallSortField,
    setFavoritesWallViewMode,
    setCurrentTrackActiveTab,
    setPlaylistEditorSortField,
    setPlaylistFollowCurrentlyPlaying,
    setPlaylistViewMode,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsFilterText,
    setPresetsShowDetails,
    setPresetsWallSortDirection,
    setPresetsWallSortField,
    setPresetsWallViewMode,
    setTracksCardGap,
    setTracksCardSize,
    setTracksFilterText,
    setTracksFollowCurrentlyPlaying,
    setTracksLyricsSearchText,
    setTracksShowDetails,
    setTracksWallSortDirection,
    setTracksWallSortField,
    setTracksWallViewMode,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
