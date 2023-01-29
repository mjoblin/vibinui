import React, { FC, useState } from "react";
import { Box, Flex, Stack, Tabs, Text } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import AlbumArt from "../albums/AlbumArt";
import FieldValueList from "../fieldValueList/FieldValueList";
import NowPlaying from "../currentlyPlaying/NowPlaying";
import PlayheadRing from "../currentlyPlaying/PlayheadRing";
import TrackLyrics from "../nowPlaying/TrackLyrics";

const ALBUM_ART_WIDTH = 300;

const NowPlayingScreen: FC = () => {
    const [activeTab, setActiveTab] = useState<string | null>("lyrics");
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);
    const currentStream = useAppSelector((state: RootState) => state.playback.current_stream);

    let sourceAndStreamDetails = {};

    if (currentSource) {
        sourceAndStreamDetails = {
            ...sourceAndStreamDetails,
            Source: currentSource,
        };
    }

    if (currentStream) {
        sourceAndStreamDetails = {
            ...sourceAndStreamDetails,
            Name: currentStream.source_name,
            Type: currentStream.type,
        };
    }

    if (!currentTrack) {
        // TODO: Improve display when no track is playing.
        return <Box>No Track</Box>;
    }

    const trackFilename = currentStream?.url.split("/").pop();
    const trackId = trackFilename && trackFilename.replace(/\.[^\.]+$/, "");

    // @ts-ignore
    return (
        <Flex gap={30}>
            <Stack w={ALBUM_ART_WIDTH}>
                <Stack spacing="xs">
                    <AlbumArt artUri={currentTrack.art_url} size={ALBUM_ART_WIDTH} radius={5} />
                    <NowPlaying showAlbumDetails={false} />

                    <Flex gap={15} justify="flex-start" align="center">
                        <PlayheadRing />
                        <FieldValueList fieldValues={sourceAndStreamDetails} />
                    </Flex>
                </Stack>
            </Stack>

            <Stack spacing="md" sx={{ flexGrow: 1 }}>
                <Stack spacing="xs">
                    <Text size={28} weight="bold">
                        {currentTrack.title}
                    </Text>

                    <FieldValueList
                        fieldValues={{
                            Artist: currentTrack.artist,
                            Album: currentTrack.album,
                        }}
                    />
                </Stack>

                <Tabs value={activeTab} onTabChange={setActiveTab} variant="pills" sx={{ height: "100vh" }}>
                    <Tabs.List>
                        <Tabs.Tab value="lyrics">Lyrics</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="lyrics" sx={{ height: "100vh", overflowY: "scroll" }}>
                        <Box pt="md">
                            {trackId && <TrackLyrics trackId={trackId} />}
                        </Box>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Flex>
    );
};

export default NowPlayingScreen;
