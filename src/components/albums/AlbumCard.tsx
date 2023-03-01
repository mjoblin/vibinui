import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Card, createStyles, Flex, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Album, Track } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setAlbumCardRenderDimensions } from "../../app/store/internalSlice";
import { yearFromDate } from "../../app/utils";
import AlbumArt from "./AlbumArt";
import AlbumTracksModal from "../tracks/AlbumTracksModal";
import CompactArtCard from "../shared/CompactArtCard";
import MediaActionsButton from "../shared/MediaActionsButton";
import { useMediaGroupings } from "../../app/hooks/useMediaGroupings";
import { secstoHms } from "../../app/utils";

type AlbumCardType = "compact" | "art_focused";

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

const albumDetails = (album: Album, trackCount: number, duration: number) => (
    <Flex gap={5}>
        <Text size={14} color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {yearFromDate(album.date)}
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
        <Text size={14} color="grey" sx={{ lineHeight: 1.0 }}>
            •
        </Text>
        <Text size={14} color="grey" weight="bold" sx={{ lineHeight: 1.0 }}>
            {`${secstoHms(duration)}s`}
        </Text>
    </Flex>
);

// ------------------------------------------------------------------------------------------------
// Album card types: AlbumCardCompact, AlbumCardArtFocused
// ------------------------------------------------------------------------------------------------

type AlbumCardTypeProps = Omit<AlbumCardProps, "type">;

const AlbumCardCompact: FC<AlbumCardTypeProps> = ({ album, tracks, onClick }) => {
    const albumDuration = tracks?.reduce((duration, track) => duration + track.duration, 0) || 0;

    return (
        <CompactArtCard
            artUrl={album.album_art_uri}
            actions={
                <MediaActionsButton
                    mediaType="album"
                    media={album}
                    categories={["Playlist"]}
                    position="bottom"
                />
            }
            onClick={() => onClick && onClick(album)}
        >
            <Text size={14} weight="bold" sx={{ lineHeight: 1.0 }}>
                {album.title}
            </Text>

            {albumDetails(album, tracks?.length || 0, albumDuration)}
        </CompactArtCard>
    );
};

const AlbumCardArtFocused: FC<AlbumCardTypeProps> = ({ album, onClick }) => {
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);

    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumCard: {
            width: cardSize,
            border: `${borderSize}px solid rgb(0, 0, 0, 0)`,
        },
    }))();

    const albumYear = yearFromDate(album.date);

    return (
        <Card radius="sm" p={7} pb={showDetails ? 7 : 0} className={dynamicClasses.albumCard}>
            {/* Album art with play/action controls */}
            <Card.Section onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}>
                <AlbumArt
                    album={album}
                    actionCategories={["Tracks", "Playlist"]}
                    size={cardSize - borderSize * 2}
                    radius={5}
                    onActionsMenuOpen={() => setIsActionsMenuOpen(true)}
                    onActionsMenuClosed={() => setIsActionsMenuOpen(false)}
                />
            </Card.Section>

            {/* Album title, artist, year, genre */}
            {showDetails && (
                <Stack spacing={0} pt={7}>
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
        </Card>
    );
};

// ------------------------------------------------------------------------------------------------
// AlbumCard
// ------------------------------------------------------------------------------------------------

type AlbumCardProps = {
    type?: AlbumCardType;
    album: Album;
    tracks?: Track[];
    onClick?: (album: Album) => void;
};

const AlbumCard: FC<AlbumCardProps> = ({ type = "art_focused", album, tracks, onClick }) => {
    const dispatch = useAppDispatch();
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const latestVisibleRenderSize = useAppSelector(
        (state: RootState) => state.internal.albums.albumCard
    );
    const { colors } = useMantineTheme();
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
                            <AlbumCardArtFocused album={album} />
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
                        <AlbumCardCompact album={album} tracks={tracks} onClick={onClick} />
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

// type AlbumCardProps = {
//     type?: AlbumCardType;
//     album: Album;
// };
//
// const AlbumCard: FC<AlbumCardProps> = ({ type = "art_focused", album }) => {
//     const dispatch = useAppDispatch();
//     const { cardSize, showDetails } = useAppSelector(
//         (state: RootState) => state.userSettings.albums
//     );
//     const latestVisibleRenderSize = useAppSelector(
//         (state: RootState) => state.internal.albums.albumCard
//     );
//     const { colors } = useMantineTheme();
//     const [isVisible, setIsVisible] = useState<boolean>(false);
//     const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
//     const [showTracksModal, setShowTracksModal] = useState<boolean>(false);
//     const cardRef = useRef<HTMLDivElement>();
//
//     const borderSize = 2;
//
//     const { classes: dynamicClasses } = createStyles((theme) => ({
//         albumCard: {
//             width: cardSize,
//             border: `${borderSize}px solid rgb(0, 0, 0, 0)`,
//         },
//     }))();
//
//     /**
//      * For visible AlbumCards, we want to store their width and height in application state. We do
//      * this so the "last rendered" width and height can be used by not-visible AlbumCards to render
//      * an appropriately-sized empty box.
//      *
//      * The goal is render performance. The idea is to only fully render the AlbumCards currently
//      * visible, while doing a quick empty-container render for not-visible AlbumCards. Not-visible
//      * AlbumCards need their container to be rendered at roughly the correct size to ensure
//      * scrolling (and scrollbar height) works as expected by the user.
//      */
//     useEffect(() => {
//         if (cardRef.current && isVisible) {
//             const newRenderWidth = cardRef.current.offsetWidth;
//             const newRenderHeight = cardRef.current.offsetHeight;
//
//             newRenderWidth !== latestVisibleRenderSize.renderWidth &&
//                 newRenderHeight !== latestVisibleRenderSize.renderHeight &&
//                 dispatch(
//                     setAlbumCardRenderDimensions({
//                         width: newRenderWidth,
//                         height: newRenderHeight,
//                     })
//                 );
//         }
//     }, [cardRef, isVisible, cardSize, showDetails]);
//
//     const albumYear = yearFromDate(album.date);
//
//     return (
//         // The visibility offset top/bottom is somewhat arbitrary. The goal is to pre-load enough
//         // off-screen AlbumCards to reduce flickering when scrolling (as the art loads/renders).
//         // Specifying too-big an offset however will result in laggier performance due to the
//         // number of cards being rendered.
//         <VisibilitySensor
//             onChange={setIsVisible}
//             partialVisibility={true}
//             offset={{ top: -1000, bottom: -1000 }}
//         >
//             {/* @ts-ignore */}
//             {({ isVisible }) =>
//                 isVisible ? (
//                     <Card
//                         // @ts-ignore
//                         ref={cardRef}
//                         radius="sm"
//                         p={7}
//                         pb={showDetails ? 7 : 0}
//                         className={dynamicClasses.albumCard}
//                     >
//                         {/* Album art with play/action controls */}
//                         <Card.Section
//                             onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}
//                         >
//                             <AlbumArt
//                                 album={album}
//                                 actionCategories={["Tracks", "Playlist"]}
//                                 size={cardSize - borderSize * 2}
//                                 radius={5}
//                                 onActionsMenuOpen={() => setIsActionsMenuOpen(true)}
//                                 onActionsMenuClosed={() => setIsActionsMenuOpen(false)}
//                             />
//                         </Card.Section>
//
//                         {/* Album title, artist, year, genre */}
//                         {showDetails && (
//                             <Stack spacing={0} pt={7}>
//                                 <Text size="xs" weight="bold" sx={{ lineHeight: 1.25 }}>
//                                     {album.title}
//                                 </Text>
//                                 <Text size="xs" color="grey" sx={{ lineHeight: 1.25 }}>
//                                     {`${album.artist}${
//                                         albumYear ? `${album.artist ? " • " : ""}${albumYear}` : ""
//                                     }`}
//                                 </Text>
//                                 <Text
//                                     size={11}
//                                     color="grey"
//                                     weight="bold"
//                                     sx={{ lineHeight: 1.25 }}
//                                 >
//                                     {album.genre === "Unknown"
//                                         ? ""
//                                         : album.genre.toLocaleUpperCase()}
//                                 </Text>
//                             </Stack>
//                         )}
//
//                         <AlbumTracksModal
//                             album={album}
//                             opened={showTracksModal}
//                             onClose={() => setShowTracksModal(false)}
//                         />
//                     </Card>
//                 ) : (
//                     <div
//                         style={{
//                             width: latestVisibleRenderSize.renderWidth,
//                             height: latestVisibleRenderSize.renderHeight,
//                             backgroundColor: colors.dark[6],
//                         }}
//                     ></div>
//                 )
//             }
//         </VisibilitySensor>
//     );
// };

export default AlbumCard;
