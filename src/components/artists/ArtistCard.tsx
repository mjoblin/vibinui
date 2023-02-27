import React, { FC, useEffect, useRef, useState } from "react";
import { Card, createStyles, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { Artist } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setTrackCardRenderDimensions } from "../../app/store/internalSlice";
import { yearFromDate } from "../../app/utils";
import ArtistArt from "./ArtistArt";

type ArtistCardProps = {
    artist: Artist;
};

const ArtistCard: FC<ArtistCardProps> = ({ artist }) => {
    const dispatch = useAppDispatch();
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.artists
    );
    const latestVisibleRenderSize = useAppSelector((state: RootState) => state.internal.artistCard);
    const { colors } = useMantineTheme();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>();

    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        artistCard: {
            width: cardSize,
            border: `${borderSize}px solid rgb(0, 0, 0, 0)`,
        },
    }))();

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

    return (
        // The visibility offset top/bottom is somewhat arbitrary. The goal is to pre-load enough
        // off-screen TrackCards to reduce flickering when scrolling (as the art loads/renders).
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
                        className={dynamicClasses.artistCard}
                    >
                        {/* Track art with play/action controls */}
                        <Card.Section
                            onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}
                        >
                            <ArtistArt
                                artist={artist}
                                // actionCategories={["Tracks", "Playlist"]}
                                size={cardSize - borderSize * 2}
                                radius={5}
                                onActionsMenuOpen={() => setIsActionsMenuOpen(true)}
                                onActionsMenuClosed={() => setIsActionsMenuOpen(false)}
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
