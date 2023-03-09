import React, { FC, useEffect, useRef, useState } from "react";
import { Box, createStyles, Flex, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Track } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setTrackCardRenderDimensions } from "../../app/store/internalSlice";
import { secstoHms, yearFromDate } from "../../app/utils";
import TrackArt from "./TrackArt";
import CompactArtCard from "../shared/CompactArtCard";
import MediaActionsButton from "../shared/MediaActionsButton";
import { MediaViewMode } from "../../app/store/userSettingsSlice";
import { useAppConstants } from "../../app/hooks/useAppConstants";

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

const TrackCardCompact: FC<TrackCardTypeProps> = ({ track, showArt, onClick }) => {
    return (
        <CompactArtCard
            artUrl={showArt && track.album_art_uri ? track.album_art_uri : undefined}
            actions={
                <MediaActionsButton mediaType="track" media={track} position="bottom" size="sm" />
            }
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

const TrackCardArtFocused: FC<TrackCardTypeProps> = ({ track, selected, onClick }) => {
    const { SELECTED_COLOR } = useAppConstants();
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.tracks
    );
    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        card: {
            width: cardSize,
            border: selected
                ? `${borderSize}px solid ${SELECTED_COLOR}`
                : `${borderSize}px solid rgb(0, 0, 0, 0)`,
            borderRadius: 5,
            backgroundColor: theme.colors.dark[6],
        },
    }))();

    const trackYear = track.date && yearFromDate(track.date);

    return (
        <Box className={dynamicClasses.card}>
            {/* Track art with play/action controls */}
            <Box>
                <TrackArt track={track} size={cardSize - borderSize * 2} radius={5} />
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
    type?: MediaViewMode;
    track: Track;
    showArt?: boolean;
    selected?: boolean;

    onClick?: (track: Track) => void;
};

const TrackCard: FC<TrackCardProps> = ({
    type = "art_focused",
    track,
    showArt = true,
    selected = false,
    onClick,
}) => {
    const dispatch = useAppDispatch();
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.tracks
    );
    const latestVisibleRenderSize = useAppSelector(
        (state: RootState) => state.internal.tracks.trackCard
    );
    const { colors } = useMantineTheme();
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
        if (cardRef.current && isVisible) {
            const newRenderWidth = cardRef.current.offsetWidth;
            const newRenderHeight = cardRef.current.offsetHeight;

            newRenderWidth !== latestVisibleRenderSize.renderWidth &&
                newRenderHeight !== latestVisibleRenderSize.renderHeight &&
                dispatch(
                    setTrackCardRenderDimensions({
                        width: newRenderWidth,
                        height: newRenderHeight,
                    })
                );
        }
    }, [cardRef, isVisible, cardSize, showDetails]);

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
                            <TrackCardArtFocused track={track} selected={selected} />
                        </Box>
                    ) : (
                        <div
                            style={{
                                width: latestVisibleRenderSize.renderWidth,
                                height: latestVisibleRenderSize.renderHeight,
                                backgroundColor: colors.dark[6],
                            }}
                        ></div>
                    )
                ) : isVisible ? (
                    // @ts-ignore
                    <Box ref={cardRef}>
                        <TrackCardCompact track={track} showArt={showArt} onClick={onClick} />
                    </Box>
                ) : (
                    <div
                        style={{
                            width: latestVisibleRenderSize.renderWidth,
                            height: latestVisibleRenderSize.renderHeight,
                            backgroundColor: colors.dark[6],
                        }}
                    ></div>
                )
            }
        </VisibilitySensor>
    );
};

export default TrackCard;
