import React, { FC, useEffect, useRef, useState } from "react";
import { Box, createStyles, Flex, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Album, Track } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setAlbumCardRenderDimensions } from "../../app/store/internalSlice";
import { MediaViewMode } from "../../app/store/userSettingsSlice";
import { yearFromDate } from "../../app/utils";
import { secstoHms } from "../../app/utils";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import AlbumArt from "./AlbumArt";
import AlbumTracksModal from "../tracks/AlbumTracksModal";
import CompactArtCard from "../shared/CompactArtCard";
import MediaActionsButton, { EnabledActions } from "../shared/MediaActionsButton";

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
                    mediaType="album"
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

const AlbumCardArtFocused: FC<AlbumCardTypeProps> = ({
    album,
    enabledActions,
    sizeOverride,
    detailsOverride,
    selected,
    highlightIfPlaying,
    onClick,
}) => {
    const { CURRENTLY_PLAYING_COLOR, SELECTED_COLOR } = useAppConstants();
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);

    const isCurrentlyPlaying = currentAlbumMediaId === album.id;
    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        card: {
            width: sizeOverride || cardSize,
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
            {/* Album art with play/action controls */}
            <Box onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}>
                <AlbumArt
                    album={album}
                    enabledActions={
                        enabledActions || {
                            Favorites: ["all"],
                            Navigation: ["ViewInArtists", "ViewInTracks"],
                            Playlist: ["all"],
                            Details: ["all"],
                        }
                    }
                    size={sizeOverride ? sizeOverride - borderSize * 2 : cardSize - borderSize * 2}
                    radius={5}
                    onActionsMenuOpen={() => setIsActionsMenuOpen(true)}
                    onActionsMenuClosed={() => setIsActionsMenuOpen(false)}
                />
            </Box>

            {/* Album title, artist, year, genre */}
            {((detailsOverride === undefined && showDetails) || detailsOverride) && (
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
    type?: MediaViewMode;
    album: Album;
    tracks?: Track[];
    enabledActions?: EnabledActions;
    // Allow callers to override the size and details settings which would otherwise be pulled from
    // the users album display settings. This is intended for use by (for now) the favorites
    // screen, so its use of AlbumCard (and TrackCard) can use independent card display settings.
    sizeOverride?: number;
    detailsOverride?: boolean;
    selected?: boolean;
    highlightIfPlaying?: boolean;
    onClick?: (album: Album) => void;
};

const AlbumCard: FC<AlbumCardProps> = ({
    type = "art_focused",
    album,
    tracks,
    enabledActions,
    sizeOverride,
    detailsOverride,
    selected = false,
    highlightIfPlaying = true,
    onClick,
}) => {
    const dispatch = useAppDispatch();
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
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
    }, [cardRef, isVisible, cardSize, showDetails]);

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
                                sizeOverride={sizeOverride}
                                detailsOverride={detailsOverride}
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
                            sizeOverride={sizeOverride}
                            detailsOverride={detailsOverride}
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
