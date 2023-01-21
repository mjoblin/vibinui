import React, { FC, useState } from "react";
import { Card, createStyles, Flex, Image, Stack, Text } from "@mantine/core";

import { Album } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import AlbumActionsButton from "./AlbumActionsButton";
import AlbumTracksModal from "../tracks/AlbumTracksModal";
import PlayButton from "./PlayButton";

type AlbumProps = {
    album: Album;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const AlbumCard: FC<AlbumProps> = ({ album }) => {
    const [addMediaToPlaylist] = useAddMediaToPlaylistMutation();
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
        // pr (padding-right) is smaller to allow for the right-side whitespace coming from
        // IconDotsVertical.
        <Card radius="sm" p={7} pb={showDetails ? 7 : 0} pr={2} className={dynamicClasses.albumCard}>
            {/* Album image and play/action controls */}
            <Card.Section onClick={() => !isActionsMenuOpen && setShowTracksModal(true)}>
                <Image
                    src={album.album_art_uri}
                    alt={`${album.artist} / ${album.title}`}
                    fit="cover"
                    width={coverSize}
                    height={coverSize}
                />

                <Flex
                    p="xs"
                    justify="space-between"
                    align="flex-end"
                    className={`${dynamicClasses.albumControls} ${
                        isActionsMenuOpen && dynamicClasses.actionsMenuActive
                    }`}
                >
                    <PlayButton
                        onClick={() => addMediaToPlaylist({ mediaId: album.id, action: "REPLACE" })}
                    />

                    <AlbumActionsButton
                        album={album}
                        onOpen={() => setIsActionsMenuOpen(true)}
                        onClose={() => {
                            // This timeout is to prevent an issue where the user clicks outside
                            // the actions menu to close the menu, but the click is then picked up
                            // by the onClick() handler on the album art, which then triggers the
                            // display of the tracks modal. The delay in setting isActionsMenuOpen
                            // will prevent this behavior.
                            //
                            // This only works as described when the user clicks on album art
                            // associated with the actions menu.
                            //
                            // TODO: This feels hacky. It would be nice to see if there was a way
                            //  to more cleanly ignore clicks which are outside a
                            //  currently-displayed actions menu.
                            //
                            // TODO: Consider doing something in the AlbumWall component to prevent
                            //  all other album interactions if an action menu is open.
                            setTimeout(() => setIsActionsMenuOpen(false), 100);
                        }}
                    />
                </Flex>
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
