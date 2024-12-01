import React, { FC, useState } from "react";
import { Box, Center, createStyles, Flex, Paper, Stack, Text } from "@mantine/core";

import { useGetAlbumTracksQuery } from "../../../app/services/vibinAlbums";
import { Album, Track } from "../../../app/types";
import { secstoHms } from "../../../app/utils";
import AppendMediaToPlaylistButton from "../../shared/buttons/AppendMediaToPlaylistButton";
import FavoriteIndicator from "../../shared/buttons/FavoriteIndicator";
import LoadingDataMessage from "../../shared/textDisplay/LoadingDataMessage";
import MediaActionsButton from "../../shared/buttons/MediaActionsButton";
import MediaSummaryBanner from "../../shared/textDisplay/MediaSummaryBanner";
import PlayButton from "../../shared/buttons/PlayButton";
import SadLabel from "../../shared/textDisplay/SadLabel";

// ================================================================================================
// Show all the Tracks associated with the given Album.
//
// Contains:
//  - Album summary.
//  - List of Tracks.
//  - Each Track has a <MediaActionsButton>.
//  - One-click option to append a Track to the Playlist.
// ================================================================================================

const DIMMED = "#808080";

const useStyles = createStyles((theme) => ({
    pointerOnHover: {
        "&:hover": {
            cursor: "pointer",
        },
    },
    highlight: {
        backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.yellow[2],
    },
    highlightOnHover: {
        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.yellow[2],
        },
    },
}));

type AlbumTracksProps = {
    album: Album;
};

const AlbumTracks: FC<AlbumTracksProps> = ({ album }) => {
    const { data: albumTracks, isLoading } = useGetAlbumTracksQuery(album.id);
    const { classes } = useStyles();
    const [actionsMenuOpenFor, setActionsMenuOpenFor] = useState<string | undefined>(undefined);

    // TODO: The date and genre processing here is similar to <Playlist>. Consider extracting.

    return (
        <Stack>
            {/* Album details */}
            <MediaSummaryBanner
                media={album}
                showArtControls={true}
                showSeparateActionsButton={true}
            />

            {/* Track details */}
            {isLoading && (
                // Tracks currently being loaded.
                <Center pt={20}>
                    <LoadingDataMessage message="Retrieving tracks..." />
                </Center>
            )}

            {!isLoading &&
                // Tracks are not currently being loaded.
                (!albumTracks || albumTracks.length <= 0 ? (
                    <Center pt="xl">
                        <SadLabel label="No tracks found" />
                    </Center>
                ) : (
                    // Tracks were found, so display them.

                    // TODO: Consider whether this should be a table or grid instead (for cleaner
                    //  layout behaviour across tracks).
                    <Stack sx={{ gap: 5 }}>
                        {albumTracks.map((track: Track) => (
                            <Paper
                                key={track.id}
                                pr={5}
                                // Highlight the track on hover. But if the actions menu is open,
                                // then keep the selected track highlighted but don't highlight any
                                // other tracks (until the actions menu goes away).
                                className={
                                    actionsMenuOpenFor === track.id
                                        ? classes.highlight
                                        : actionsMenuOpenFor
                                          ? ""
                                          : classes.highlightOnHover
                                }
                            >
                                <Flex gap="sm" align="center" justify="space-between">
                                    <Flex justify="flex-end" sx={{ minWidth: "1.5rem" }}>
                                        <Text size="sm" color={DIMMED}>
                                            {track.track_number}
                                        </Text>
                                    </Flex>

                                    <Box sx={{ flexGrow: 1 }}>
                                        {track.artist === album.artist ? (
                                            <Text size="sm">{track.title}</Text>
                                        ) : (
                                            // Display the track artist if it's different from the
                                            // album artist
                                            <Stack pb={5} sx={{ gap: 0 }}>
                                                <Text size="sm">{track.title}</Text>
                                                {track.artist !== album.artist && (
                                                    <Text
                                                        size="xs"
                                                        color={DIMMED}
                                                        sx={{ lineHeight: 1.25 }}
                                                    >
                                                        {track.artist}
                                                    </Text>
                                                )}
                                            </Stack>
                                        )}
                                    </Box>

                                    <Text size="sm" color={DIMMED} pr={5}>
                                        {secstoHms(track.duration)}
                                    </Text>

                                    <Flex
                                        gap={10}
                                        align="center"
                                        justify="flex-end"
                                        sx={{ minWidth: "4rem" }}
                                    >
                                        <PlayButton media={track} size={20} />
                                        <AppendMediaToPlaylistButton media={track} size={20} />
                                        <MediaActionsButton
                                            media={track}
                                            size={10}
                                            onOpen={() => setActionsMenuOpenFor(track.id)}
                                            onClose={() => setActionsMenuOpenFor(undefined)}
                                        />
                                        <FavoriteIndicator media={track} />
                                    </Flex>
                                </Flex>
                            </Paper>
                        ))}
                    </Stack>
                ))}
        </Stack>
    );
};

export default AlbumTracks;
