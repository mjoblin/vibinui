import React, { FC, useEffect, useRef, useState } from "react";
import { Card, createStyles, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Album } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setAlbumCardRenderDimensions } from "../../app/store/internalSlice";
import AlbumArt from "./AlbumArt";
import AlbumTracksModal from "../tracks/AlbumTracksModal";

type AlbumCardProps = {
    album: Album;
};

const AlbumCard: FC<AlbumCardProps> = ({ album }) => {
    const dispatch = useAppDispatch();
    const { coverSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.browse
    );
    const latestVisibleRenderSize = useAppSelector((state: RootState) => state.internal.albumCard);
    const { colors } = useMantineTheme();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumCard: {
            width: coverSize,
            border: "2px solid rgb(0, 0, 0, 0)",
        },
    }))();

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
    }, [cardRef, isVisible, coverSize, showDetails]);

    return (
        // The visibility offset top/bottom is somewhat arbitrary. The goal is to pre-load enough
        // off-screen AlbumCards to reduce flickering when scrolling (as the art loads/renders).
        // Specifying too-big an offset however will result in laggier performance due to the
        // number of cards being rendered.
        <VisibilitySensor
            onChange={setIsVisible}
            partialVisibility={true}
            offset={{ top: -1000, bottom: -1000 }}
        >
            {/* @ts-ignore */}
            {({ isVisible }) =>
                isVisible ? (
                    <Card
                        // @ts-ignore
                        ref={cardRef}
                        radius="sm"
                        p={7}
                        pb={showDetails ? 7 : 0}
                        className={dynamicClasses.albumCard}
                    >
                        {/* Album art with play/action controls */}
                        <Card.Section
                            onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}
                        >
                            <AlbumArt
                                album={album}
                                actionCategories={["Tracks", "Playlist"]}
                                size={coverSize}
                                onActionsMenuOpen={() => setIsActionsMenuOpen(true)}
                                onActionsMenuClosed={() => setIsActionsMenuOpen(false)}
                            />
                        </Card.Section>

                        {/* Album title, artist, etc. */}
                        {showDetails && (
                            <Stack spacing={0} pt={7}>
                                <Text size="xs" weight="bold" sx={{ lineHeight: 1.25 }}>
                                    {album.title}
                                </Text>
                                <Text size="xs" color="grey" sx={{ lineHeight: 1.25 }}>
                                    {album.artist}
                                </Text>
                            </Stack>
                        )}

                        <AlbumTracksModal
                            album={album}
                            opened={showTracksModal}
                            onClose={() => setShowTracksModal(false)}
                        />
                    </Card>
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

export default AlbumCard;
