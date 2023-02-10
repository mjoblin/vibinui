import React, { FC, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
    ActionIcon,
    Box,
    createStyles,
    Flex,
    ScrollArea,
    Skeleton,
    Stack,
    Tabs,
    Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPlayerPlay, IconPower } from "@tabler/icons";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useLazyPowerToggleQuery } from "../../app/services/vibinSystem";
import { setNowPlayingActiveTab } from "../../app/store/userSettingsSlice";
import { usePlayMutation } from "../../app/services/vibinTransport";
import AlbumArt from "../albums/AlbumArt";
import FieldValueList from "../fieldValueList/FieldValueList";
import NowPlaying from "../currentlyPlaying/NowPlaying";
import PlayheadRing from "../currentlyPlaying/PlayheadRing";
import TrackLinks from "../nowPlaying/TrackLinks";
import TrackLyrics from "../nowPlaying/TrackLyrics";
import Waveform from "../nowPlaying/Waveform";

export type NowPlayingTab = "lyrics" | "waveform" | "links";

const ALBUM_ART_WIDTH = 300;

const useStyles = createStyles((theme) => ({
    pausedStatusContainer: {
        position: "absolute",
        width: ALBUM_ART_WIDTH,
        height: ALBUM_ART_WIDTH,
        backgroundColor: "rgb(0, 0, 0, 0.75)",
    },
}));

/**
 *
 */
const StandbyMode: FC = () => {
    const streamerName = useAppSelector((state: RootState) => state.system.streamer.name);
    const [togglePower, togglePowerStatus] = useLazyPowerToggleQuery();

    useEffect(() => {
        if (togglePowerStatus.isError) {
            const { status, data } = togglePowerStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Could not power on the streamer",
                message: `[${status}] ${data}`,
                autoClose: false,
            });
        }
    }, [togglePowerStatus]);

    return (
        <Flex pt={35} gap={15} justify="center" align="center">
            <ActionIcon
                size="lg"
                color="blue"
                variant="filled"
                radius={5}
                onClick={() => togglePower()}
            >
                <IconPower size={20} />
            </ActionIcon>
            <Text>{`${streamerName} is in standby mode`}</Text>
        </Flex>
    );
};

/**
 *
 */
const PlaybackPaused: FC = () => {
    const [resumePlayback] = usePlayMutation();
    const { classes } = useStyles();

    return (
        <Flex className={classes.pausedStatusContainer} direction="column" gap={15} align="center" justify="center">
            <ActionIcon
                size={80}
                color="blue"
                variant="light"
                radius={40}
                onClick={() => resumePlayback()}
            >
                <IconPlayerPlay size={50} fill="lightblue" />
            </ActionIcon>
            <Text color="lightblue" weight="bold">Playback Paused</Text>
        </Flex>
    );
};

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

    if (playStatus === "not_ready") {
        return <StandbyMode />;
    }

    if (!currentTrack) {
        // TODO: Improve display when no track is playing.
        return <Box>No Track</Box>;
    }

    // @ts-ignore
    return (
        <Flex gap={30}>
            {/* LHS stack: Album art, playhead, etc */}
            <Stack w={ALBUM_ART_WIDTH}>
                <Stack spacing="xs">
                    <AlbumArt artUri={currentTrack.art_url} size={ALBUM_ART_WIDTH} radius={5} />

                    {playStatus === "pause" && <PlaybackPaused />}

                    <NowPlaying showAlbumDetails={false} />

                    <Flex gap={15} justify="flex-start" align="center">
                        <PlayheadRing />
                        <FieldValueList fieldValues={sourceAndStreamDetails} />
                    </Flex>
                </Stack>
            </Stack>

            {/* RHS stack: Track name, album, artist, and tabs */}
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
                                <Waveform trackId={currentTrackId} width={2048} height={700} />
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
