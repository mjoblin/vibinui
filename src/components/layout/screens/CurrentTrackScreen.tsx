import React, { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ActionIcon,
    Box,
    Center,
    createStyles,
    Flex,
    Loader,
    ScrollArea,
    Stack,
    Tabs,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue, useWindowEvent } from "@mantine/hooks";
import { IconPlayerPlay } from "@tabler/icons";

import { RootState } from "../../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/useInterval";
import { setArtistsScrollToCurrentOnScreenEnter } from "../../../app/store/internalSlice";
import {
    setArtistsActiveCollection,
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
    setCurrentTrackActiveTab,
} from "../../../app/store/userSettingsSlice";
import { usePlayMutation } from "../../../app/services/vibinTransport";
import { useLazyGetTrackByIdQuery } from "../../../app/services/vibinTracks";
import TrackArt from "../../features/tracks/TrackArt";
import FieldValueList from "../../shared/dataDisplay/FieldValueList";
import CurrentMediaControls from "../../app/playbackControls/CurrentMediaControls";
import TrackLinks from "../../features/currentTrack/TrackLinks";
import TrackLyrics from "../../features/currentTrack/TrackLyrics";
import Waveform from "../../features/currentTrack/Waveform";
import SadLabel from "../../shared/textDisplay/SadLabel";
import StandbyMode from "../../shared/buttons/StandbyMode";
import MediaActionsButton from "../../shared/buttons/MediaActionsButton";
import MediaSourceBadge from "../../shared/dataDisplay/MediaSourceBadge";
import { yearFromDate } from "../../../app/utils";
import { MediaSourceClass, Track } from "../../../app/types";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";

export type CurrentTrackTab = "links" | "lyrics" | "waveform";

const sourcesSupportingDetailsTabs: Partial<Record<MediaSourceClass, CurrentTrackTab[]>> = {
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

const CurrentTrackScreen: FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { colors } = useMantineTheme();
    const { APP_ALT_FONTFACE, SCREEN_LOADING_PT } = useAppGlobals();
    const { activeTab } = useAppSelector((state: RootState) => state.userSettings.currentTrack);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const albumById = useAppSelector((state: RootState) => state.mediaGroups.albumById);
    const artistByName = useAppSelector((state: RootState) => state.mediaGroups.artistByName);
    const [currentTrack, setCurrentTrack] = useState<Track | undefined>(undefined);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);
    const currentPlaybackTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const [debouncedPlayStatus] = useDebouncedValue(playStatus, 1000);
    const [getTrack, getTrackResult] = useLazyGetTrackByIdQuery();
    const [trackYearAndGenre, setTrackYearAndGenre] = useState<string | undefined>(undefined);
    const [tabContentHeight, setTabContentHeight] = useState<number>(300);
    const tabListRef = useRef<HTMLDivElement>(null);
    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
    const [preparingForDisplay, setPreparingForDisplay] = useState<boolean>(true);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        currentTrackTitle: {
            fontFamily: APP_ALT_FONTFACE,
            lineHeight: 0.9,
            minHeight: "1.7rem",
            "&:hover": {
                cursor: "pointer",
            },
        },
    }))();

    /**
     *
     */
    useEffect(() => {
        setTrackYearAndGenre(undefined);

        if (currentTrackId) {
            getTrack(currentTrackId);
        } else if (currentPlaybackTrack) {
            // currentPlaybackTrack gets populated from sources like Airplay. When it looks like
            // a currentPlaybackTrack is available (and the currentTrackId -- from a local media
            // source -- is not), then a "fake" Track is created. This is fine so long as nothing
            // down the line is expecting any keys that aren't being provided here.
            setCurrentTrack({
                artist: currentPlaybackTrack.artist,
                album: currentPlaybackTrack.artist,
                title: currentPlaybackTrack.title,
                art_url: currentPlaybackTrack.art_url,
                album_art_uri: currentPlaybackTrack.art_url,
            } as Track);

            setPreparingForDisplay(false);
        }
    }, [currentTrackId, currentPlaybackTrack, getTrack]);

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

            setCurrentTrack(track);
            setPreparingForDisplay(false);
            setTrackYearAndGenre(result);
        }
    }, [getTrackResult]);

    /**
     *
     */
    useEffect(() => {
        if (!tabListRef?.current || !currentTrack) {
            return;
        }

        const tabListBottomMargin = 20;
        const bottomPadding = 20;

        const tabViewportTop = tabListRef.current.getBoundingClientRect().bottom;

        const tabContentHeight =
            windowHeight - tabViewportTop - (tabListBottomMargin + bottomPadding);

        setTabContentHeight(tabContentHeight);
    }, [tabListRef, currentTrack, windowHeight]);

    const windowResizeHandler = (event: UIEvent) =>
        event.target && setWindowHeight((event.target as Window).innerHeight);
    
    useWindowEvent("resize", windowResizeHandler);

    // Airplay sets the play status to "paused" between tracks, which makes the UI briefly display
    // an awkward paused state.
    const playStatusDisplay =
        currentSource?.class === "stream.service.airplay" ? debouncedPlayStatus : playStatus;

    // --------------------------------------------------------------------------------------------

    if (streamerPower === "off") {
        return <StandbyMode />;
    }
    
    if ((!currentTrackId && !currentPlaybackTrack) || preparingForDisplay) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    if (
        playStatusDisplay === "ready" ||
        !currentSource ||
        !currentTrack ||
        !Object.keys(sourcesSupportingDetailsTabs).includes(currentSource.class)
    ) {
        return playStatusDisplay === "play" ? (
            <Center pt="xl">
                <Flex gap={10} align="center">
                    <Text size={16} weight="bold">
                        Currently playing from
                    </Text>
                    <MediaSourceBadge />
                </Flex>
            </Center>
        ) : (
            <Center pt="xl">
                <SadLabel label="Nothing is currently playing" />
            </Center>
        );
    }

    const tabsToDisplay = currentSource
        ? sourcesSupportingDetailsTabs[currentSource.class]
        : undefined;
    
    return (
        <Flex gap={30} pt={7} pb={10}>
            {/* LHS stack: Album art, playhead, etc */}
            <Stack miw={albumArtWidth} maw={albumArtWidth} spacing={20} align="flex-end">
                <Stack spacing="xs">
                    <Flex justify="space-between" align="flex-end">
                        <MediaSourceBadge showSource={true} />

                        {trackYearAndGenre && (
                            <Text size="xs" color="grey" weight="bold">
                                {trackYearAndGenre}
                            </Text>
                        )}
                    </Flex>

                    <Stack>
                        <TrackArt
                            track={currentTrack}
                            size={albumArtWidth}
                            radius={5}
                            hidePlayButton
                            showControls={false}
                            enabledActions={{
                                Favorites: ["all"],
                                Navigation: ["ViewCurrentInArtists", "ViewInAlbums"],
                                Playlist: ["all"],
                            }}
                        />
                        {playStatusDisplay === "pause" && <PlaybackPaused />}
                    </Stack>

                    <CurrentMediaControls />
                </Stack>

                {/* Track actions button */}
                {currentSource.class === "stream.media" && (
                    <Flex gap={10} align="center">
                        <MediaActionsButton
                            mediaType="track"
                            media={currentTrack}
                            size={"md"}
                            enabledActions={{
                                Details: ["all"],
                                Favorites: ["all"],
                                Navigation: ["all"],
                            }}
                        />
                    </Flex>
                )}
            </Stack>

            {/* RHS stack: Track name, album, artist, and tabs */}
            <Stack spacing="lg" sx={{ flexGrow: 1 }}>
                <Stack spacing={5}>
                    <Box mih={40} w="fit-content">
                        <Tooltip label="View Track in Artists screen" position="bottom">
                            <Text
                                size={34}
                                weight="bold"
                                className={dynamicClasses.currentTrackTitle}
                                onClick={() => {
                                    // TODO: Clarify how best to configure the Artists screen for
                                    //  navigation purposes. This code is duplicated elsewhere (like
                                    //  <MediaActionsButton> and <PlaylistEntryActionsButton>) and is
                                    //  overly verbose.
                                    dispatch(setArtistsActiveCollection("all"));
                                    dispatch(
                                        setArtistsSelectedArtist(artistByName[currentTrack.artist])
                                    );
                                    dispatch(
                                        setArtistsSelectedAlbum(albumById[currentTrack.parentId])
                                    );
                                    dispatch(setArtistsSelectedTrack(currentTrack));
                                    dispatch(setArtistsScrollToCurrentOnScreenEnter(true));

                                    navigate("/ui/artists");
                                }}
                            >
                                {currentTrack.title || " "}
                            </Text>
                        </Tooltip>
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
                            sx={{ flexGrow: 1 }}
                            value={activeTab}
                            onTabChange={(tabName) =>
                                dispatch(setCurrentTrackActiveTab(tabName as CurrentTrackTab))
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
                            <Tabs.List ref={tabListRef} mb={20}>
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
                                    <ScrollArea h={tabContentHeight}>
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
                                    <ScrollArea h={tabContentHeight}>
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
                                    <ScrollArea h={tabContentHeight}>
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

export default CurrentTrackScreen;
