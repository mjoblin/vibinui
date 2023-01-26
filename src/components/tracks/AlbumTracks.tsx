import React, { FC, useState } from "react";
import { Box, Paper, Flex, Image, Stack, Text, createStyles } from "@mantine/core";

import { useGetTracksQuery } from "../../app/services/vibinBase";
import { Album, Track } from "../../app/types";
import { secstoHms } from "../../app/utils";
import AlbumActionsButton from "../albums/AlbumActionsButton";
import AlbumArt from "../albums/AlbumArt";
import TrackActionsButton from "./TrackActionsButton";

// TODO: Make these part of the theme.
const DIMMED = "#808080";
const HIGHLIGHT_COLOR = "#252525";

const useStyles = createStyles((theme) => ({
    pointerOnHover: {
        "&:hover": {
            cursor: "pointer",
        },
    },
    highlight: {
        backgroundColor: HIGHLIGHT_COLOR,
    },
    highlightOnHover: {
        "&:hover": {
            backgroundColor: HIGHLIGHT_COLOR,
        },
    },
}));

type AlbumTracksProps = {
    album: Album;
};

const AlbumTracks: FC<AlbumTracksProps> = ({ album }) => {
    const { data, error, isLoading } = useGetTracksQuery(album.id);
    const { classes } = useStyles();
    const [actionsMenuOpen, setActionsMenuOpen] = useState<string | undefined>(undefined);

    // TODO: Add loading & error handling.
    if (!data) {
        return <></>;
    }

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
                        {album.date.split("-")[0]}{" "}
                        {album.genre && album.genre.toLowerCase() !== "unknown"
                            ? `• ${album.genre.toUpperCase()}`
                            : ""}
                    </Text>
                </Stack>

                <Box pr={5}>
                    <AlbumActionsButton album={album} categories={["Playlist"]} position="bottom" />
                </Box>
            </Flex>

            {/* Track details */}
            {/* TODO: Consider whether this should be a table or grid instead (for cleaner layout
                  behaviour across tracks) */}
            <Stack sx={{ gap: 0 }}>
                {data.map((track: Track) => (
                    <Paper
                        key={track.id}
                        shadow="xs"
                        pr={5}
                        // Highlight the track on hover. But if the actions menu is open, then keep
                        // the selected track highlighted but don't highlight any other tracks
                        // (until the actions menu goes away).
                        className={
                            actionsMenuOpen === track.id
                                ? classes.highlight
                                : actionsMenuOpen
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
                                    // Display the track artist if it's different from the album artist
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

                                <TrackActionsButton
                                    track={track}
                                    onOpen={() => setActionsMenuOpen(track.id!!)}
                                    onClose={() => setActionsMenuOpen(undefined)}
                                />
                            </Flex>
                        </Flex>
                    </Paper>
                ))}
            </Stack>
        </Stack>
    );
};

export default AlbumTracks;
