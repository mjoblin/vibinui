import React, { FC, useState } from "react";
import { Box, Center, createStyles, Flex, Paper, Stack, Text } from "@mantine/core";

import { useGetAlbumTracksQuery } from "../../app/services/vibinAlbums";
import { Album, Track } from "../../app/types";
import { secstoHms, yearFromDate } from "../../app/utils";
import MediaActionsButton from "../shared/MediaActionsButton";
import AlbumArt from "../albums/AlbumArt";
import AppendToPlaylistButton from "./AppendToPlaylistButton";
import LoadingDataMessage from "../shared/LoadingDataMessage";
import SadLabel from "../shared/SadLabel";

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
    const { data: albumTracks, error, isLoading } = useGetAlbumTracksQuery(album.id);
    const { classes } = useStyles();
    const [actionsMenuOpenFor, setActionsMenuOpenFor] = useState<string | undefined>(undefined);

    // TODO: The date and genre processing here is similar to <Playlist>. Consider extracting.

    return (
        <Stack>
            {/* Album details */}
            <Flex gap="md" justify="space-between">
                <AlbumArt album={album} size={100} actionsMenuPosition={"bottom"} />

                <Stack sx={{ gap: 0, flexGrow: 1 }}>
                    <Text size="lg" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {album.title}
                    </Text>
                    <Text size="md" sx={{ lineHeight: 1.25 }}>
                        {album.artist}
                    </Text>
                    <Text size="xs" weight="bold" color={DIMMED}>
                        {yearFromDate(album.date) || ""}
                        {album.genre && album.genre.toLowerCase() !== "unknown"
                            ? ` • ${album.genre.toUpperCase()}`
                            : ""}
                    </Text>
                </Stack>

                <Box pr={5}>
                    <MediaActionsButton
                        media={album}
                        mediaType="album"
                        position="bottom"
                    />
                </Box>
            </Flex>

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
                    <Stack sx={{ gap: 0 }}>
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

                                    <Flex
                                        gap="sm"
                                        align="center"
                                        justify="flex-end"
                                        sx={{ minWidth: "4rem" }}
                                    >
                                        <Text size="sm" color={DIMMED}>
                                            {secstoHms(track.duration)}
                                        </Text>

                                        <MediaActionsButton
                                            media={track}
                                            mediaType="track"
                                            inCircle={false}
                                            onOpen={() => setActionsMenuOpenFor(track.id!!)}
                                            onClose={() => setActionsMenuOpenFor(undefined)}
                                        />

                                        <AppendToPlaylistButton item={track} />
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
