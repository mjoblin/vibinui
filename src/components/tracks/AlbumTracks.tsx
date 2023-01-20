import React, { FC } from "react";
import { Box, Paper, Flex, Image, Stack, Text, createStyles } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons";

import { useGetTracksQuery } from "../../app/services/vibinBase";
import { Album, Track } from "../../app/types";
import { secstoHms } from "../../app/utils";
import AlbumActions from "../albums/AlbumActions";

// TODO: Make this part of the theme.
const DIMMED = "#808080";

const useStyles = createStyles((theme) => ({
    pointerOnHover: {
        "&:hover": {
            cursor: "pointer",
        },
    },
}));

type AlbumTracksProps = {
    album: Album;
};

const AlbumTracks: FC<AlbumTracksProps> = ({ album }) => {
    // const { data, error, isLoading } = useGetTracksQuery(album.id);
    const { classes } = useStyles();

    const data = [
        {
            track_number: 1,
            duration: 200,
            album: "Album Title",
            artist: "Artist Name",
            title: "This is the Song Title",
            art_url:
                "https://img.washingtonpost.com/rw/2010-2019/WashingtonPost/2012/09/28/Style/Images/825646568796.jpg",
        },
        {
            track_number: 2,
            duration: 200,
            album: "Album Title",
            artist: "Artist Name",
            title: "Song Two",
            art_url:
                "https://img.washingtonpost.com/rw/2010-2019/WashingtonPost/2012/09/28/Style/Images/825646568796.jpg",
        },
        {
            track_number: 3,
            duration: 200,
            album: "Album Title",
            artist: "Artist Name",
            title: "The Third Song is This One",
            art_url:
                "https://img.washingtonpost.com/rw/2010-2019/WashingtonPost/2012/09/28/Style/Images/825646568796.jpg",
        },
    ];

    // TODO: Add loading & error handling.
    if (!data) {
        return <></>;
    }

    return (
        <Stack>
            {/* Album details */}
            <Flex gap="md" justify="space-between">
                <Image
                    // src={album.album_art_uri}
                    src={
                        "https://img.washingtonpost.com/rw/2010-2019/WashingtonPost/2012/09/28/Style/Images/825646568796.jpg"
                    }
                    alt={`${album.artist} / ${album.title}`}
                    fit="cover"
                    width={100}
                    height={100}
                    sx={{ overflow: "hidden", borderRadius: "4px 0px 0px 4px" }}
                />

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

                <AlbumActions album={album} categories={["Playlist"]} />
            </Flex>

            {/* Track details */}
            <Stack sx={{ gap: 0 }}>
                {data.map((track: Track) => (
                    <Paper shadow="xs">
                        <Flex gap="sm" align="flex-start" justify="space-between">
                            <Flex w="1.5rem" justify="flex-end">
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

                            <Flex gap="sm" align="center" justify="center">
                                <Text size="sm" color={DIMMED}>
                                    {secstoHms(track.duration)}
                                </Text>

                                <Box className={classes.pointerOnHover}>
                                    <IconDotsVertical size={15} />
                                </Box>
                            </Flex>
                        </Flex>
                    </Paper>
                ))}
            </Stack>
        </Stack>
    );
};

export default AlbumTracks;
