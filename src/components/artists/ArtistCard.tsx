import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Card, createStyles, Flex, Image, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Album, Artist, Track } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setArtistCardRenderDimensions } from "../../app/store/internalSlice";
import { ArtistsViewMode } from "../../app/store/userSettingsSlice";
import MediaActionsButton from "../shared/MediaActionsButton";
import CompactArtCard from "../shared/CompactArtCard";

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

const albumAndTrackCount = (albumCount: number, trackCount: number) => (
    <Flex gap={5}>
        <Text size={14} color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {albumCount}
        </Text>
        <Text size={14} color="grey" sx={{ lineHeight: 1.0 }}>
            album{albumCount === 1 ? "" : "s"}
        </Text>
        <Text size={14} color="grey" sx={{ lineHeight: 1.0 }}>
            •
        </Text>
        <Text size={14} color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {trackCount}
        </Text>
        <Text size={14} color="grey" sx={{ lineHeight: 1.0 }}>
            track{trackCount === 1 ? "" : "s"}
        </Text>
    </Flex>
);

// ------------------------------------------------------------------------------------------------
// Artist card types: ArtistCardCompact, ArtistCardArtFocused
// ------------------------------------------------------------------------------------------------

type ArtistCardTypeProps = Omit<ArtistCardProps, "type">;

const ArtistCardCompact: FC<ArtistCardTypeProps> = ({
    artist,
    albums = [],
    tracks = [],
    onClick,
}) => {
    return (
        <CompactArtCard
            artUrl={artist.album_art_uri}
            actions={
                <MediaActionsButton
                    mediaType="track"
                    media={tracks && tracks[0]}
                    position="bottom"
                />
            }
            onClick={() => onClick && onClick(artist)}
        >
            <Text size={14} weight="bold" sx={{ lineHeight: 1.0 }}>
                {artist.title}
            </Text>

            {albumAndTrackCount(albums.length, tracks.length)}

            <Text size={12} color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
                {artist.genre.toLowerCase() === "unknown" ? "" : artist.genre.toLocaleUpperCase()}
            </Text>
        </CompactArtCard>
    );
};

const ArtistCardArtFocused: FC<ArtistCardTypeProps> = ({ artist, albums, tracks, onClick }) => {
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.artists
    );

    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        artistCard: {
            width: cardSize,
            border: `${borderSize}px solid rgb(0, 0, 0, 0)`,
        },
    }))();

    return (
        <Card radius="sm" p={7} pb={showDetails ? 7 : 0} className={dynamicClasses.artistCard}>
            {/* Artist art */}
            <Card.Section>
                <Image
                    src={artist.album_art_uri}
                    width={cardSize - borderSize * 2}
                    height={cardSize - borderSize * 2}
                    radius={5}
                />
            </Card.Section>

            {/* Artist title (name) */}
            {showDetails && (
                <Stack spacing={0} pt={7}>
                    <Text size="xs" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {artist.title}
                    </Text>
                </Stack>
            )}
        </Card>
    );
};

// ------------------------------------------------------------------------------------------------
// ArtistCard
// ------------------------------------------------------------------------------------------------

type ArtistCardProps = {
    type: ArtistsViewMode;
    artist: Artist;
    albums?: Album[];
    tracks?: Track[];
    onClick?: (artist: Artist) => void;
};

const ArtistCard: FC<ArtistCardProps> = ({ type, artist, albums, tracks, onClick }) => {
    const dispatch = useAppDispatch();
    const latestVisibleRenderSize = useAppSelector(
        (state: RootState) => state.internal.artists.artistCard
    );
    const { colors } = useMantineTheme();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>();

    /**
     * For visible ArtistCards, we want to store their width and height in application state. We do
     * this so the "last rendered" width and height can be used by not-visible ArtistCards to render
     * an appropriately-sized empty box.
     *
     * The goal is render performance. The idea is to only fully render the ArtistCards currently
     * visible, while doing a quick empty-container render for not-visible ArtistCards. Not-visible
     * ArtistCards need their container to be rendered at roughly the correct size to ensure
     * scrolling (and scrollbar height) works as expected by the user.
     */
    useEffect(() => {
        if (cardRef.current && isVisible) {
            const newRenderWidth = cardRef.current.offsetWidth;
            const newRenderHeight = cardRef.current.offsetHeight;

            newRenderWidth !== latestVisibleRenderSize.renderWidth &&
                newRenderHeight !== latestVisibleRenderSize.renderHeight &&
                dispatch(
                    setArtistCardRenderDimensions({
                        width: newRenderWidth,
                        height: newRenderHeight,
                    })
                );
        }
    }, [
        dispatch,
        cardRef,
        isVisible,
        latestVisibleRenderSize.renderWidth,
        latestVisibleRenderSize.renderHeight,
    ]);

    const visibilityOffset = type === "simple" ? -1000 : -200;

    return (
        // The visibility offset top/bottom is somewhat arbitrary. The goal is to pre-load enough
        // off-screen ArtistCards to reduce flickering when scrolling (as the art loads/renders).
        // Specifying too-big an offset however will result in laggier performance due to the
        // number of cards being rendered.
        <VisibilitySensor
            onChange={setIsVisible}
            partialVisibility={true}
            offset={{ top: visibilityOffset, bottom: visibilityOffset }}
        >
            {/* @ts-ignore */}
            {({ isVisible }) =>
                type === "simple" ? (
                    isVisible ? (
                        // @ts-ignore
                        <Box ref={cardRef}>
                            <ArtistCardArtFocused artist={artist} />
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
                        <ArtistCardCompact
                            artist={artist}
                            albums={albums}
                            tracks={tracks}
                            onClick={onClick}
                        />
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

export default ArtistCard;