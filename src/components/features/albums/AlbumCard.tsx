import React, { FC, useEffect, useRef, useState } from "react";
import { Box, createStyles, Flex, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Album, Track } from "../../../app/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { setAlbumCardRenderDimensions } from "../../../app/store/internalSlice";
import { MediaCardViewMode } from "../../../app/store/userSettingsSlice";
import { yearFromDate } from "../../../app/utils";
import { secstoHms } from "../../../app/utils";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import MediaArt from "../../shared/mediaDisplay/MediaArt";
import AlbumTracksModal from "./AlbumTracksModal";
import CompactArtCard from "../../shared/mediaDisplay/CompactArtCard";
import MediaActionsButton, { EnabledActions } from "../../shared/buttons/MediaActionsButton";

// ================================================================================================
// A card representing a single Album.
//
// Contains:
//  - Album art (with overlays for media actions and media play).
//  - Album details (title, artist, etc).
//
// Card will highlight if the Album is currently playing.
//
// <AlbumCardArtFocused> renders a card with the art up top and the Album details (optionally)
// underneath. <AlbumCardCompact> renders a smaller card with the art on the left and the Album
// details to the right.
//
// The card renders as a simple div if it's not currently visible. This is done for performance
// reasons. The stand-in div (when not visible) is rendered with the dimensions of a recently-
// rendered visible card. This means the not-visible cards consume roughly (but not exactly) the
// space they would consume if all cards were fully rendered. This has consequences for things
// which might care about how much space the cards consume (such as scroll restoration).
// ================================================================================================

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

const albumDetails = (album: Album, trackCount: number, duration: number) => (
    <Flex gap={5}>
        <Text size="sm" color="grey" sx={{ lineHeight: 1.0 }}>
            {yearFromDate(album.date)}
        </Text>
        <Text size="sm" color="grey" sx={{ lineHeight: 1.0 }}>
            •
        </Text>
        <Text size="sm" color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {trackCount}
        </Text>
        <Text size="sm" color="grey" sx={{ lineHeight: 1.0 }}>
            track{trackCount === 1 ? "" : "s"}
        </Text>
        <Text size="sm" color="grey" sx={{ lineHeight: 1.0 }}>
            •
        </Text>
        <Text size="sm" color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {`${secstoHms(duration)}s`}
        </Text>
    </Flex>
);

// ------------------------------------------------------------------------------------------------
// Album card types: AlbumCardCompact, AlbumCardArtFocused
// ------------------------------------------------------------------------------------------------

type AlbumCardTypeProps = Omit<AlbumCardProps, "type">;

const AlbumCardCompact: FC<AlbumCardTypeProps> = ({
    album,
    tracks,
    enabledActions,
    selected,
    highlightIfPlaying,
    onClick,
}) => {
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );

    const isCurrentlyPlaying = currentAlbumMediaId === album.id;
    const albumDuration = tracks?.reduce((duration, track) => duration + track.duration, 0) || 0;

    return (
        <CompactArtCard
            artUrl={album.album_art_uri}
            actions={
                <MediaActionsButton
                    media={album}
                    enabledActions={
                        enabledActions || {
                            Favorites: ["all"],
                            Navigation: ["ViewInArtists", "ViewInTracks"],
                            Playlist: ["all"],
                            Details: ["all"],
                        }
                    }
                    size="sm"
                    position="bottom"
                />
            }
            selected={selected}
            isCurrentlyPlaying={highlightIfPlaying && isCurrentlyPlaying}
            onClick={() => onClick && onClick(album)}
        >
            <Text size="sm" weight="bold" sx={{ lineHeight: 1.0 }}>
                {album.title}
            </Text>

            {albumDetails(album, tracks?.length || 0, albumDuration)}
        </CompactArtCard>
    );
};

// ------------------------------------------------------------------------------------------------

const AlbumCardArtFocused: FC<AlbumCardTypeProps> = ({
    album,
    enabledActions,
    size = 200,
    showDetails = true,
    selected,
    highlightIfPlaying,
    onClick,
}) => {
    const { CURRENTLY_PLAYING_COLOR, SELECTED_COLOR } = useAppGlobals();
    // const { cardSize, showDetails } = useAppSelector(
    //     (state: RootState) => state.userSettings.albums
    // );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);

    const isCurrentlyPlaying = currentAlbumMediaId === album.id;
    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        card: {
            width: size,
            border:
                highlightIfPlaying && isCurrentlyPlaying
                    ? `${borderSize}px solid ${CURRENTLY_PLAYING_COLOR}`
                    : `${borderSize}px solid rgb(0, 0, 0, 0)`,
            borderRadius: 5,
            backgroundColor: selected
                ? SELECTED_COLOR
                : theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[3],
        },
    }))();

    const albumYear = yearFromDate(album.date);

    return (
        <Box className={dynamicClasses.card}>
            {/* Media art with play/action controls */}
            <Box onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}>
                <MediaArt
                    media={album}
                    enabledActions={
                        enabledActions || {
                            Favorites: ["all"],
                            Navigation: ["ViewInArtists", "ViewInTracks"],
                            Playlist: ["all"],
                            Details: ["all"],
                        }
                    }
                    size={size - borderSize * 2}
                    showPlayButton={true}
                    showActions={true}
                    onActionsMenuOpen={() => setIsActionsMenuOpen(true)}
                    onActionsMenuClosed={() => setIsActionsMenuOpen(false)}
                />
            </Box>

            {/* Album title, artist, year, genre */}
            {showDetails && (
                <Stack spacing={0} p={7}>
                    <Text size="xs" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {album.title}
                    </Text>
                    <Text size="xs" color="grey" sx={{ lineHeight: 1.25 }}>
                        {`${album.artist}${
                            albumYear ? `${album.artist ? " • " : ""}${albumYear}` : ""
                        }`}
                    </Text>
                    <Text size={11} color="grey" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {album.genre === "Unknown" ? "" : album.genre.toLocaleUpperCase()}
                    </Text>
                </Stack>
            )}

            <AlbumTracksModal
                album={album}
                opened={showTracksModal}
                onClose={() => setShowTracksModal(false)}
            />
        </Box>
    );
};

// ------------------------------------------------------------------------------------------------
// AlbumCard
// ------------------------------------------------------------------------------------------------

type AlbumCardProps = {
    type?: MediaCardViewMode;
    album: Album;
    tracks?: Track[];
    enabledActions?: EnabledActions;
    size?: number;
    showDetails?: boolean;
    selected?: boolean;
    highlightIfPlaying?: boolean;
    onClick?: (album: Album) => void;
};

const AlbumCard: FC<AlbumCardProps & { cacheRenderSize?: boolean }> = ({
    type = "art_focused",
    album,
    tracks,
    enabledActions,
    size = 200,
    showDetails = true,
    selected = false,
    highlightIfPlaying = true,
    onClick,
    cacheRenderSize = true,
}) => {
    const dispatch = useAppDispatch();
    const latestVisibleRenderSize = useAppSelector(
        (state: RootState) => state.internal.albums.albumCard
    );
    const theme = useMantineTheme();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>();

    /**
     * For visible AlbumCards, we want to store their width and height in application state. We do
     * this so the "last rendered" width and height can be used by not-visible AlbumCards to render
     * an appropriately-sized empty box.
     *
     * The goal is render performance. The idea is to only fully render the AlbumCards currently
     * visible, while doing a quick empty-container render for not-visible AlbumCards. Not-visible
     * AlbumCards need their container to be rendered at roughly the correct size to ensure
     * scrolling (and scrollbar height) works as expected by the user.
     */
    useEffect(() => {
        if (!cacheRenderSize) {
            return;
        }

        if (cardRef.current && isVisible) {
            const newRenderWidth = cardRef.current.offsetWidth;
            const newRenderHeight = cardRef.current.offsetHeight;

            newRenderWidth !== latestVisibleRenderSize.renderWidth &&
                newRenderHeight !== latestVisibleRenderSize.renderHeight &&
                dispatch(
                    setAlbumCardRenderDimensions({
                        width: newRenderWidth,
                        height: newRenderHeight,
                    })
                );
        }
    }, [cardRef, cacheRenderSize, isVisible, size, showDetails, latestVisibleRenderSize, dispatch]);

    const visibilityOffset = type === "art_focused" ? -1000 : -200;

    return (
        // The visibility offset top/bottom is somewhat arbitrary. The goal is to pre-load enough
        // off-screen AlbumCards to reduce flickering when scrolling (as the art loads/renders).
        // Specifying too-big an offset however will result in laggier performance due to the
        // number of cards being rendered.
        <VisibilitySensor
            onChange={setIsVisible}
            partialVisibility={true}
            offset={{ top: visibilityOffset, bottom: visibilityOffset }}
        >
            {/* @ts-ignore */}
            {({ isVisible }) =>
                type === "art_focused" ? (
                    isVisible ? (
                        // @ts-ignore
                        <Box ref={cardRef}>
                            <AlbumCardArtFocused
                                album={album}
                                enabledActions={enabledActions}
                                size={size}
                                showDetails={showDetails}
                                selected={selected}
                                highlightIfPlaying={highlightIfPlaying}
                            />
                        </Box>
                    ) : (
                        <div
                            style={{
                                width: latestVisibleRenderSize.renderWidth,
                                height: latestVisibleRenderSize.renderHeight,
                                backgroundColor:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[6]
                                        : theme.colors.gray[3],
                            }}
                        ></div>
                    )
                ) : isVisible ? (
                    // @ts-ignore
                    <Box ref={cardRef}>
                        <AlbumCardCompact
                            album={album}
                            tracks={tracks}
                            enabledActions={enabledActions}
                            size={size}
                            showDetails={showDetails}
                            selected={selected}
                            highlightIfPlaying={highlightIfPlaying}
                            onClick={onClick}
                        />
                    </Box>
                ) : (
                    <div
                        style={{
                            width: latestVisibleRenderSize.renderWidth,
                            height: latestVisibleRenderSize.renderHeight,
                            backgroundColor:
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[6]
                                    : theme.colors.gray[3],
                        }}
                    ></div>
                )
            }
        </VisibilitySensor>
    );
};

export default AlbumCard;
