import React, { FC } from "react";
import { Box, Flex, ScrollArea, Skeleton, Stack, Tabs, Text } from "@mantine/core";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setNowPlayingActiveTab } from "../../app/store/userSettingsSlice";
import AlbumArt from "../albums/AlbumArt";
import FieldValueList from "../fieldValueList/FieldValueList";
import NowPlaying from "../currentlyPlaying/NowPlaying";
import PlayheadRing from "../currentlyPlaying/PlayheadRing";
import TrackLinks from "../nowPlaying/TrackLinks";
import TrackLyrics from "../nowPlaying/TrackLyrics";
import Waveform from "../nowPlaying/Waveform";

export type NowPlayingTab = "lyrics" | "waveform" | "links";

const ALBUM_ART_WIDTH = 300;

const NowPlayingScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { activeTab } = useAppSelector((state: RootState) => state.userSettings.nowPlaying);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
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

            <Stack spacing="lg" sx={{ flexGrow: 1 }}>
                <Stack spacing="xs">
                    <Skeleton visible={!["play", "pause"].includes(playStatus || "")}>
                        <Text size={28} weight="bold">
                            {currentTrack.title || "-"}
                        </Text>

                        <FieldValueList
                            fieldValues={{
                                Artist: currentTrack.artist,
                                Album: currentTrack.album,
                            }}
                        />
                    </Skeleton>
                </Stack>

                <Tabs
                    value={activeTab}
                    onTabChange={(tabName) =>
                        dispatch(setNowPlayingActiveTab(tabName as NowPlayingTab))
                    }
                    variant="outline"
                >
                    <Tabs.List mb={20}>
                        <Tabs.Tab value="lyrics">Lyrics</Tabs.Tab>
                        <Tabs.Tab value="waveform">Waveform</Tabs.Tab>
                        <Tabs.Tab value="links">Links</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="lyrics">
                        <ScrollArea>
                            {currentTrackId && <TrackLyrics trackId={currentTrackId} />}
                        </ScrollArea>
                    </Tabs.Panel>

                    <Tabs.Panel value="waveform">
                        <ScrollArea>
                            {currentTrackId && (
                                <Waveform trackId={currentTrackId} width={2048} height={500} />
                            )}
                        </ScrollArea>
                    </Tabs.Panel>

                    <Tabs.Panel value="links">
                        <ScrollArea>
                            {currentTrackId && <TrackLinks trackId={currentTrackId} />}
                        </ScrollArea>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Flex>
    );
};

export default NowPlayingScreen;
