import React, { FC, useEffect, useState } from "react";
import {
    ActionIcon,
    Box,
    Center,
    createStyles,
    Flex,
    ScrollArea,
    Stack,
    Tabs,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setNowPlayingActiveTab } from "../../app/store/userSettingsSlice";
import { usePlayMutation } from "../../app/services/vibinTransport";
import { useLazyGetTrackByIdQuery } from "../../app/services/vibinTracks";
import AlbumArt from "../albums/AlbumArt";
import FieldValueList from "../fieldValueList/FieldValueList";
import NowPlaying from "../currentlyPlaying/NowPlaying";
import TrackLinks from "../nowPlaying/TrackLinks";
import TrackLyrics from "../nowPlaying/TrackLyrics";
import Waveform from "../nowPlaying/Waveform";
import SadLabel from "../shared/SadLabel";
import StandbyMode from "../shared/StandbyMode";
import MediaSourceBadge from "../shared/MediaSourceBadge";
import { yearFromDate } from "../../app/utils";
import { MediaSourceClass, Track } from "../../app/types";
import { useAppConstants } from "../../app/hooks/useAppConstants";

export type NowPlayingTab = "links" | "lyrics" | "waveform";

const sourcesSupportingDetailsTabs: Partial<Record<MediaSourceClass, NowPlayingTab[]>> = {
    "stream.media": ["links", "lyrics", "waveform"],
    "stream.service.airplay": ["links", "lyrics"],
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
    const { colors } = useMantineTheme();
    const { APP_ALT_FONTFACE } = useAppConstants();
    const { activeTab } = useAppSelector((state: RootState) => state.userSettings.nowPlaying);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);
    const [getTrack, getTrackResult] = useLazyGetTrackByIdQuery();
    const [trackYearAndGenre, setTrackYearAndGenre] = useState<string | undefined>(undefined);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        currentTrackTitle: {
            fontFamily: APP_ALT_FONTFACE,
            lineHeight: 0.9,
            height: "1.7rem",
        },
    }))();

    /**
     *
     */
    useEffect(() => {
        setTrackYearAndGenre(undefined);
        currentTrackId && getTrack(currentTrackId);
    }, [currentTrackId, getTrack]);

    /**
     *
     */
    useEffect(() => {
        if (getTrackResult.isSuccess) {
            const track = getTrackResult.data as Track;
            const year = track.date && yearFromDate(track.date);
            let genre =
                track.genre !== "Unknown" && track.genre !== "(Unknown Genre)"
                    ? track.genre?.toLocaleUpperCase()
                    : undefined;

            let result = [year, genre].filter((value) => value !== undefined).join(" • ");

            setTrackYearAndGenre(result);
        }
    }, [getTrackResult]);

    // --------------------------------------------------------------------------------------------

    if (streamerPower === "off") {
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

    return (
        <Flex gap={30} pt={7}>
            {/* LHS stack: Album art, playhead, etc */}
            <Stack miw={albumArtWidth} maw={albumArtWidth}>
                <Stack spacing="xs">
                    <Flex justify="space-between">
                        <MediaSourceBadge showSource={true} />

                        {trackYearAndGenre && (
                            <Text size="xs" color="grey" weight="bold">
                                {trackYearAndGenre}
                            </Text>
                        )}
                    </Flex>

                    <Stack>
                        <AlbumArt artUri={currentTrack.art_url} size={albumArtWidth} radius={5} />
                        {playStatus === "pause" && <PlaybackPaused />}
                    </Stack>

                    <NowPlaying showAlbumDetails={false} />
                </Stack>
            </Stack>

            {/* RHS stack: Track name, album, artist, and tabs */}
            <Stack spacing="lg" sx={{ flexGrow: 1 }}>
                <Stack spacing={5}>
                    <Box mih={40} w="fit-content">
                        <Text size={34} weight="bold" className={dynamicClasses.currentTrackTitle}>
                            {currentTrack.title || " "}
                        </Text>
                    </Box>

                    {(currentSource?.class === "stream.media" ||
                        currentTrack.artist ||
                        currentTrack.album) && (
                        <FieldValueList
                            fieldValues={{
                                Artist: currentTrack.artist,
                                Album: currentTrack.album,
                            }}
                            keySize={16}
                            valueSize={16}
                            keyFontFamily={APP_ALT_FONTFACE}
                            valueFontFamily={APP_ALT_FONTFACE}
                            valueColor={colors.dark[2]}
                        />
                    )}
                </Stack>

                {/* Tabs */}

                {tabsToDisplay &&
                    (currentTrackId || (currentTrack.artist && currentTrack.title)) && (
                        <Tabs
                            value={activeTab}
                            onTabChange={(tabName) =>
                                dispatch(setNowPlayingActiveTab(tabName as NowPlayingTab))
                            }
                            variant="pills"
                            styles={(theme) => ({
                                tabLabel: {
                                    fontWeight: "bold",
                                    fontSize: 13,
                                    letterSpacing: 0.3,
                                },
                            })}
                        >
                            <Tabs.List mb={20}>
                                {tabsToDisplay.includes("lyrics") && (
                                    <Tabs.Tab value="lyrics">LYRICS</Tabs.Tab>
                                )}
                                {tabsToDisplay.includes("waveform") && (
                                    <Tabs.Tab value="waveform">WAVEFORM</Tabs.Tab>
                                )}
                                {tabsToDisplay.includes("links") && (
                                    <Tabs.Tab value="links">LINKS</Tabs.Tab>
                                )}
                            </Tabs.List>

                            {tabsToDisplay.includes("lyrics") && (
                                <Tabs.Panel value="lyrics">
                                    <ScrollArea>
                                        {(currentTrackId ||
                                            (currentTrack.artist && currentTrack.title)) && (
                                            <TrackLyrics
                                                trackId={currentTrackId}
                                                artist={currentTrack.artist}
                                                title={currentTrack.title}
                                            />
                                        )}
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
                                        {(currentTrackId ||
                                            (currentTrack.artist && currentTrack.title)) && (
                                            <TrackLinks
                                                trackId={currentTrackId}
                                                artist={currentTrack.artist}
                                                album={currentTrack.album}
                                                title={currentTrack.title}
                                            />
                                        )}
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
