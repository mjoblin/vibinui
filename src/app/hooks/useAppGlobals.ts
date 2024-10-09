import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import { useAppSelector } from "./store";
import { RootState } from "../store/store";

// ================================================================================================
// Application globals.
//
// Globals which don't update during the session (i.e. constants) arguably do not belong here and
// could be factored out.
//
// TODO: Consider whether useAppGlobals() and useAppStatus() should be separate or not.
// ================================================================================================

export const useAppGlobals = () => {
    const theme = useMantineTheme();
    const largeScreen = useMediaQuery("(min-width: 88em)");
    const { currentScreen } = useAppSelector((state: RootState) => state.internal.application);
    const { useImageBackground } = useAppSelector(
        (state: RootState) => state.userSettings.application
    );
    const { currentlyPlayingArtUrl } = useAppSelector(
        (state: RootState) => state.internal.application
    );

    // Prepare for rendering a blurred album art background behind the entire application. This is
    // only done if art exists, the user is in the "current" screen, and the app theme is in dark
    // mode. Rendering the background entails creating some divs outside the <AppShell> which hold
    // the image and its filters. When displaying the art background, the NavBar, Header, and Main
    // section all need to render a transparent background (i.e. rgb(0, 0, 0, 0)).
    //
    // NOTE: Because the AppNav background will be transparent, the main content panel will be
    //  visible underneath it if the main panel needs to scroll vertically. There's a few
    //  solutions to this: prevent the main content pane from scrolling at the window level;
    //  don't make the AppNav transparent; have the AppNav use the top of the same image background
    //  that the app is using (rather than being transparent and showing the app's background).
    //
    // TODO: Can this approach benefit from "top layer":
    //  https://developer.chrome.com/blog/what-is-the-top-layer/

    const renderAppBackgroundImage = !!(
        useImageBackground &&
        theme.colorScheme === "dark" &&
        (currentScreen === "current" || currentScreen === "playlist") &&
        currentlyPlayingArtUrl
    );

    return {
        APP_ALT_FONTFACE: "Kanit",
        APP_PADDING: "md",
        APP_URL_PREFIX: "/ui",
        APP_MODAL_BLUR: 0.5,
        CURRENTLY_PLAYING_COLOR: theme.colors.yellow[4],
        HEADER_HEIGHT: 60,
        HEADER_ICON_SIZE: 20,
        LARGE_SCREEN: largeScreen,
        MAX_TABLE_ITEMS_TO_DISPLAY: 500,
        NAVBAR_WIDTH: largeScreen === false ? 160 : 180,
        RENDER_APP_BACKGROUND_IMAGE: renderAppBackgroundImage,
        SCREEN_LOADING_PT: 25,
        SCREEN_HEADER_HEIGHT: 70,
        SEEK_OFFSET_SECS: 10,
        SCROLL_POS_DISPATCH_RATE: 500,
        SELECTED_COLOR: "rgba(25, 113, 194, 0.2)",
        SORTABLE_MEDIA_FIELDS_ALBUMS: ["artist", "year", "genre", "title"],
        SORTABLE_MEDIA_FIELDS_FAVORITES: ["album", "artist", "year", "duration", "genre", "title"],
        SORTABLE_MEDIA_FIELDS_MEDIA_SEARCH: [
            "album",
            "artist",
            "year",
            "duration",
            "genre",
            "name",
            "title",
        ],
        SORTABLE_MEDIA_FIELDS_PRESETS: ["id", "name", "type"],
        SORTABLE_MEDIA_FIELDS_TRACKS: ["album", "artist", "year", "duration", "genre", "title"],
        BUFFERING_AUDIO_NOTIFY_DELAY: 3000,
        STYLE_LABEL_BESIDE_COMPONENT: {
            root: {
                display: "flex",
                gap: 7,
                alignItems: "center",
            },
        },
        STYLE_DISABLEABLE: {
            "&[data-disabled]": {
                backgroundColor: "rgb(0, 0, 0, 0)",
                opacity: 0.4,
                border: "none",
            },
        },
        TEMPORARY_ACTIVITY_COLOR: theme.colors.yellow[4],
    };
};
