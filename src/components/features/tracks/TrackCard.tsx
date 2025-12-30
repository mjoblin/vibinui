import React, { FC, useEffect, useRef, useState } from "react";
import { Box, createStyles, Flex, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { RootState } from "../../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { Track } from "../../../app/types";
import { MediaCardViewMode } from "../../../app/store/userSettingsSlice";
import { setTrackCardRenderDimensions } from "../../../app/store/internalSlice";
import { secstoHms, yearFromDate } from "../../../app/utils";
import CompactArtCard from "../../shared/mediaDisplay/CompactArtCard";
import MediaArt from "../../shared/mediaDisplay/MediaArt";
import MediaActionsButton, { EnabledActions } from "../../shared/buttons/MediaActionsButton";

// ================================================================================================
// A card representing a single Track.
//
// See <AlbumCard> for more information on media cards.
// ================================================================================================

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

const trackDetails = (track: Track) => (
    <Flex gap={5}>
        {track.date && (
            <>
                <Text size="sm" color="grey" sx={{ lineHeight: 1.0 }}>
                    {yearFromDate(track.date || "")}
                </Text>
                <Text size="sm" color="grey" sx={{ lineHeight: 1.0 }}>
                    •
                </Text>
            </>
        )}
        <Text size="sm" color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {`${secstoHms(track.duration)}s`}
        </Text>
    </Flex>
);

// ------------------------------------------------------------------------------------------------
// Track card types: TrackCardCompact, TrackCardArtFocused
// ------------------------------------------------------------------------------------------------

type TrackCardTypeProps = Omit<TrackCardProps, "type">;

const TrackCardCompact: FC<TrackCardTypeProps> = ({
    track,
    showArt,
    enabledActions,
    selected,
    highlightIfPlaying,
    onClick,
}) => {
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id,
    );

    const isCurrentlyPlaying = currentTrackMediaId === track.id;

    return (
        <CompactArtCard
            media={track}
            artUrl={showArt && track.album_art_uri ? track.album_art_uri : undefined}
            actions={
                <MediaActionsButton
                    media={track}
                    enabledActions={
                        enabledActions || {
                            Favorites: ["all"],
                            Navigation: ["ViewInArtists", "ViewInAlbums"],
                            Queue: ["all"],
                            Presets: ["all"],
                            Details: ["all"],
                        }
                    }
                    position="bottom"
                    size="sm"
                />
            }
            selected={selected}
            isCurrentlyPlaying={highlightIfPlaying && isCurrentlyPlaying}
            onClick={() => onClick && onClick(track)}
        >
            <Flex gap={5}>
                <Text size="sm" weight="bold" sx={{ lineHeight: 1.0 }}>
                    {`${track.track_number}.`}
                </Text>
                <Text size="sm" weight="bold" sx={{ lineHeight: 1.0 }}>
                    {track.title}
                </Text>
            </Flex>

            {trackDetails(track)}
        </CompactArtCard>
    );
};

// ------------------------------------------------------------------------------------------------

const TrackCardArtFocused: FC<TrackCardTypeProps> = ({
    track,
    enabledActions,
    size = 200,
    showDetails = true,
    selected,
    highlightIfPlaying,
    onClick,
}) => {
    const { CURRENTLY_PLAYING_COLOR, SELECTED_COLOR } = useAppGlobals();
    // const { cardSize, showDetails } = useAppSelector(
    //     (state: RootState) => state.userSettings.tracks
    // );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id,
    );

    const isCurrentlyPlaying = currentTrackMediaId === track.id;
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

    const trackYear = track.date && yearFromDate(track.date);

    return (
        <Box className={dynamicClasses.card}>
            {/* Media art with play/action controls */}
            <Box>
                <MediaArt
                    media={track}
                    enabledActions={enabledActions}
                    size={size - borderSize * 2}
                    showControls={true}
                />
            </Box>

            {/* Track title, artist, year, genre */}
            {showDetails && (
                <Stack spacing={0} p={7}>
                    <Text size="xs" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {track.title}
                    </Text>
                    <Text size="xs" color="grey" sx={{ lineHeight: 1.25 }}>
                        {`${track.artist}${
                            trackYear ? `${track.artist ? " • " : ""}${trackYear}` : ""
                        }`}
                    </Text>
                    <Text size={11} color="grey" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {track.genre === "Unknown" ||
                        track.genre === "(Unknown Genre)" ||
                        !track.genre
                            ? ""
                            : track.genre.toLocaleUpperCase()}
                    </Text>
                </Stack>
            )}
        </Box>
    );
};

// ------------------------------------------------------------------------------------------------
// TrackCard
// ------------------------------------------------------------------------------------------------

type TrackCardProps = {
    type?: MediaCardViewMode;
    track: Track;
    showArt?: boolean;
    enabledActions?: EnabledActions;
    size?: number;
    showDetails?: boolean;
    selected?: boolean;
    highlightIfPlaying?: boolean;
    onClick?: (track: Track) => void;
};

const TrackCard: FC<TrackCardProps & { cacheRenderSize?: boolean }> = ({
    type = "art_focused",
    track,
    showArt = true,
    enabledActions,
    size,
    showDetails,
    selected = false,
    highlightIfPlaying = true,
    onClick,
    cacheRenderSize = true,
}) => {
    const dispatch = useAppDispatch();
    // const { cardSize, showDetails } = useAppSelector(
    //     (state: RootState) => state.userSettings.tracks
    // );
    const latestVisibleRenderSize = useAppSelector(
        (state: RootState) => state.internal.tracks.trackCard,
    );
    const theme = useMantineTheme();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>();

    /**
     * For visible TrackCards, we want to store their width and height in application state. We do
     * this so the "last rendered" width and height can be used by not-visible TrackCards to render
     * an appropriately-sized empty box.
     *
     * The goal is render performance. The idea is to only fully render the TrackCards currently
     * visible, while doing a quick empty-container render for not-visible TrackCards. Not-visible
     * TrackCards need their container to be rendered at roughly the correct size to ensure
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
                    setTrackCardRenderDimensions({
                        width: newRenderWidth,
                        height: newRenderHeight,
                    }),
                );
        }
    }, [cardRef, cacheRenderSize, isVisible, size, showDetails, latestVisibleRenderSize, dispatch]);

    const visibilityOffset = type === "art_focused" ? -1000 : -200;

    return (
        // The visibility offset top/bottom is somewhat arbitrary. The goal is to pre-load enough
        // off-screen TrackCards to reduce flickering when scrolling (as the art loads/renders).
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
                            <TrackCardArtFocused
                                track={track}
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
                        <TrackCardCompact
                            track={track}
                            showArt={showArt}
                            enabledActions={enabledActions}
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

export default TrackCard;
