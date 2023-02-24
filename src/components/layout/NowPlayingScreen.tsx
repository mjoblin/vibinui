import React, { FC } from "react";
import {
    ActionIcon,
    Box,
    Center,
    createStyles,
    Flex,
    ScrollArea,
    Skeleton,
    Stack,
    Tabs,
    Text,
} from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setNowPlayingActiveTab } from "../../app/store/userSettingsSlice";
import { usePlayMutation } from "../../app/services/vibinTransport";
import AlbumArt from "../albums/AlbumArt";
import FieldValueList from "../fieldValueList/FieldValueList";
import NowPlaying from "../currentlyPlaying/NowPlaying";
import PlayheadRing from "../currentlyPlaying/PlayheadRing";
import TrackLinks from "../nowPlaying/TrackLinks";
import TrackLyrics from "../nowPlaying/TrackLyrics";
import Waveform from "../nowPlaying/Waveform";
import SadLabel from "../shared/SadLabel";
import StandbyMode from "../shared/StandbyMode";
import MediaSourceBadge from "../shared/MediaSourceBadge";

export type NowPlayingTab = "links" | "lyrics" | "waveform";

const sourcesSupportingDetailsTabs: Record<string, NowPlayingTab[]> = {
    "stream.media": ["links", "lyrics", "waveform"],
};

const albumArtWidth = 300;

const useStyles = createStyles((theme) => ({
    pausedStatusContainer: {
        position: "absolute",
        width: albumArtWidth,
        height: albumArtWidth,
        backgroundColor: "rgb(0, 0, 0, 0.75)",
    },
}));

/**
 *
 */
const PlaybackPaused: FC = () => {
    const [resumePlayback] = usePlayMutation();
    const { classes } = useStyles();

    return (
        <Flex
            className={classes.pausedStatusContainer}
            direction="column"
            gap={15}
            align="center"
            justify="center"
        >
            <ActionIcon
                size={80}
                color="blue"
                variant="light"
                radius={40}
                onClick={() => resumePlayback()}
            >
                <IconPlayerPlay size={50} fill="lightblue" />
            </ActionIcon>
            <Text color="lightblue" weight="bold">
                Playback Paused
            </Text>
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

    if (playStatus === "not_ready") {
        return <StandbyMode />;
    }

    if (playStatus === "ready" || !currentTrack) {
        return (
            <Center pt="xl">
                <SadLabel label="Nothing is currently playing" />
            </Center>
        );
    }

    const tabsToDisplay = currentSource
        ? sourcesSupportingDetailsTabs[currentSource.class]
        : undefined;

    // @ts-ignore
    return (
        <Flex gap={30} pt={10}>
            {/* LHS stack: Album art, playhead, etc */}
            <Stack miw={albumArtWidth} maw={albumArtWidth}>
                <Stack spacing="xs">
                    <Flex justify="flex-end">
                        <MediaSourceBadge />
                    </Flex>

                    <AlbumArt artUri={currentTrack.art_url} size={albumArtWidth} radius={5} />
                    {playStatus === "pause" && <PlaybackPaused />}

                    <NowPlaying showAlbumDetails={false} />

                    <Flex gap={15} justify="flex-start" align="center">
                        <PlayheadRing />
                    </Flex>
                </Stack>
            </Stack>

            {/* RHS stack: Track name, album, artist, and tabs */}
            <Stack spacing="lg" sx={{ flexGrow: 1 }}>
                <Stack spacing="xs">
                    <Text size={28} weight="bold" lh={1}>
                        {currentTrack.title || "-"}
                    </Text>

                    <FieldValueList
                        fieldValues={{
                            Artist: currentTrack.artist,
                            Album: currentTrack.album,
                        }}
                    />
                </Stack>

                {tabsToDisplay && currentTrackId && (
                    <Tabs
                        value={activeTab}
                        onTabChange={(tabName) =>
                            dispatch(setNowPlayingActiveTab(tabName as NowPlayingTab))
                        }
                        variant="outline"
                    >
                        <Tabs.List mb={20}>
                            {tabsToDisplay.includes("lyrics") && (
                                <Tabs.Tab value="lyrics">Lyrics</Tabs.Tab>
                            )}
                            {tabsToDisplay.includes("waveform") && (
                                <Tabs.Tab value="waveform">Waveform</Tabs.Tab>
                            )}
                            {tabsToDisplay.includes("links") && (
                                <Tabs.Tab value="links">Links</Tabs.Tab>
                            )}
                        </Tabs.List>

                        {tabsToDisplay.includes("lyrics") && (
                            <Tabs.Panel value="lyrics">
                                <ScrollArea>
                                    {currentTrackId && <TrackLyrics trackId={currentTrackId} />}
                                </ScrollArea>
                            </Tabs.Panel>
                        )}

                        {tabsToDisplay.includes("waveform") && (
                            <Tabs.Panel value="waveform">
                                <ScrollArea>
                                    {currentTrackId && (
                                        <Waveform
                                            trackId={currentTrackId}
                                            width={2048}
                                            height={700}
                                        />
                                    )}
                                </ScrollArea>
                            </Tabs.Panel>
                        )}

                        {tabsToDisplay.includes("links") && (
                            <Tabs.Panel value="links">
                                <ScrollArea>
                                    {currentTrackId && <TrackLinks trackId={currentTrackId} />}
                                </ScrollArea>
                            </Tabs.Panel>
                        )}
                    </Tabs>
                )}
            </Stack>
        </Flex>
    );
};

export default NowPlayingScreen;
