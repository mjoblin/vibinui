import React, { FC, useState } from "react";
import { Card, createStyles, Stack, Text } from "@mantine/core";

import { Album } from "../../app/types";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import AlbumArt from "./AlbumArt";
import AlbumTracksModal from "../tracks/AlbumTracksModal";

type AlbumCardProps = {
    album: Album;
};

const AlbumCard: FC<AlbumCardProps> = ({ album }) => {
    const { coverSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.browse
    );
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumCard: {
            width: coverSize,
            border: "2px solid rgb(0, 0, 0, 0)",
        },
        albumControls: {
            position: "absolute",
            width: "100%",
            height: coverSize,
            top: 0,
            left: 0,
            opacity: 0,
            transition: "transform .2s ease-in-out, opacity .2s ease-in-out",
            "&:hover": {
                opacity: 1,
            },
        },
        cardPlayButtonContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            height: coverSize,
            width: "100%",
            transition: "transform .2s ease-in-out, background-color .2s ease-in-out",
            "&:hover": {
                backgroundColor: "rgb(0, 0, 0, 0.25)",
            },
        },
        actionsMenuActive: {
            opacity: 1,
        },
    }))();

    return (
        <Card radius="sm" p={7} pb={showDetails ? 7 : 0} className={dynamicClasses.albumCard}>
            {/* Album art with play/action controls */}
            <Card.Section onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}>
                <AlbumArt
                    album={album}
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
    );
};

export default AlbumCard;
