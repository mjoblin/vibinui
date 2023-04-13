import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Card, createStyles, Flex, Image, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Album, Artist, Track } from "../../../app/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { setArtistCardRenderDimensions } from "../../../app/store/internalSlice";
import { MediaViewMode } from "../../../app/store/userSettingsSlice";
import CompactArtCard from "../../shared/mediaDisplay/CompactArtCard";

// ================================================================================================
// A card representing a single Artist.
//
// See <AlbumCard> for more information on media cards.
//
// NOTE: <ArtistCard> has an emphasis on the compact style as the application currently does not
//  render art-focused cards for Artists.
// ================================================================================================

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

const albumAndTrackCount = (albumCount: number, trackCount: number) => (
    <Flex gap={5}>
        <Text size="sm" color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {albumCount}
        </Text>
        <Text size="sm" color="grey" sx={{ lineHeight: 1.0 }}>
            album{albumCount === 1 ? "" : "s"}
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
    selected,
    isCurrentlyPlaying,
    highlightIfPlaying,
    onClick,
}) => {
    // TODO: Determination of isCurrentlyPlaying should be done here rather than being passed in
    //  by the caller. It's currently *not* determined here to prevent every artist card from
    //  having to reference the full artist list and determine the current track. This should be
    //  re-done once the app has formal support for "current artist".

    return (
        <CompactArtCard
            artUrl={artist.album_art_uri}
            selected={selected}
            isCurrentlyPlaying={highlightIfPlaying && isCurrentlyPlaying}
            onClick={() => onClick && onClick(artist)}
        >
            <Text size="sm" weight="bold" sx={{ lineHeight: 1.0 }}>
                {artist.title}
            </Text>

            {albumAndTrackCount(albums.length, tracks.length)}

            <Text size="xs" color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
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
    type: MediaViewMode;
    artist: Artist;
    albums?: Album[];
    tracks?: Track[];
    selected?: boolean;
    isCurrentlyPlaying?: boolean;
    highlightIfPlaying?: boolean;
    onClick?: (artist: Artist) => void;
};

const ArtistCard: FC<ArtistCardProps> = ({
    type,
    artist,
    albums,
    tracks,
    selected = false,
    isCurrentlyPlaying = false,
    highlightIfPlaying = true,
    onClick,
}) => {
    const dispatch = useAppDispatch();
    const latestVisibleRenderSize = useAppSelector(
        (state: RootState) => state.internal.artists.artistCard
    );
    const theme = useMantineTheme();
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

    const visibilityOffset = type === "art_focused" ? -1000 : -200;

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
                type === "art_focused" ? (
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
                        <ArtistCardCompact
                            artist={artist}
                            albums={albums}
                            tracks={tracks}
                            selected={selected}
                            isCurrentlyPlaying={isCurrentlyPlaying}
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

export default ArtistCard;
