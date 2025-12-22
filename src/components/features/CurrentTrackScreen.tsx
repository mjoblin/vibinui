import React, { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ActionIcon,
    Box,
    Center,
    createStyles,
    Flex,
    Loader,
    LoadingOverlay,
    ScrollArea,
    Stack,
    Tabs,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue, useTimeout, useWindowEvent } from "@mantine/hooks";
import { IconPlayerPlay } from "@tabler/icons-react";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { useAppStatus } from "../../app/hooks/useAppStatus";
import { MediaSourceClass, Preset, Track } from "../../app/types";
import { yearFromDate } from "../../app/utils";
import { setArtistsScrollToCurrentOnScreenEnter } from "../../app/store/internalSlice";
import {
    setArtistsActiveCollection,
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
    setCurrentTrackActiveTab,
} from "../../app/store/userSettingsSlice";
import { usePlayMutation, useTogglePlaybackMutation } from "../../app/services/vibinTransport";
import { useLazyGetTrackByIdQuery } from "../../app/services/vibinTracks";
import BufferingLoader from "../shared/textDisplay/BufferingLoader";
import MediaArt from "../shared/mediaDisplay/MediaArt";
import FieldValueList from "../shared/dataDisplay/FieldValueList";
import CurrentMediaControls from "../shared/playbackControls/CurrentMediaControls";
import TrackLinks from "../shared/mediaDisplay/TrackLinks";
import TrackLyrics from "../shared/mediaDisplay/TrackLyrics";
import TrackWaveform from "../shared/mediaDisplay/TrackWaveform";
import SystemPower from "../shared/buttons/SystemPower";
import MediaActionsButton from "../shared/buttons/MediaActionsButton";
import MediaSourceBadge from "../shared/dataDisplay/MediaSourceBadge";
import FavoriteIndicator from "../shared/buttons/FavoriteIndicator";

// ================================================================================================
// Current Track screen.
//
// Contains:
//  - LHS:
//      - Current Media Source
//      - Currently-playing media year and genre
//      - Currently-playing media art
//      - Playhead
//      - Media actions button
//  - RHS:
//      - Currently-playing media summary
//      - Tabs for more information on currently-playing media
//          - Lyrics
//          - Waveform
//          - Links
// ================================================================================================

export type CurrentTrackTab = "links" | "lyrics" | "waveform";

// Some sources can have additional information displayed for what's currently playing.
// e.g. stream.media is local media, which supports waveforms as well as links and lyrics.
// stream.radio is more limited and can show the main track info but no details tabs as not
// enough information is available for those tabs to be populated.
const sourcesSupportingDisplayDetails: Partial<Record<MediaSourceClass, CurrentTrackTab[]>> = {
    "digital.usb": ["links", "lyrics"], // unconfirmed
    "stream.media": ["links", "lyrics", "waveform"],
    "stream.radio": [],
    "stream.service.airplay": ["links", "lyrics"],
    "stream.service.cast": ["links", "lyrics"], // unconfirmed
    "stream.service.roon": ["links", "lyrics"], // unconfirmed
    "stream.service.spotify": ["links", "lyrics"], // unconfirmed
    "stream.service.tidal": ["links", "lyrics"], // unconfirmed
};

const albumArtWidth = 300;

const useStyles = createStyles((theme) => ({
    pausedStatusContainer: {
        position: "absolute",
        zIndex: 9, // TODO: Remove reliance on zIndex when MediaArt no longer uses zIndex
        width: albumArtWidth,
        height: albumArtWidth,
        borderRadius: 5,
        backgroundColor: "rgb(0, 0, 0, 0.75)",
    },
}));

/**
 * Overlay with a Play button to resume track playback.
 */
const PlaybackPaused: FC = () => {
    const activeTransportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions,
    );
    const [playPlayback] = usePlayMutation();
    const [togglePlayback] = useTogglePlaybackMutation();
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
                onClick={() =>
                    activeTransportActions.includes("toggle_playback")
                        ? togglePlayback()
                        : playPlayback()
                }
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
    const { APP_ALT_FONTFACE, SCREEN_LOADING_PT, BUFFERING_AUDIO_NOTIFY_DELAY } = useAppGlobals();
    const { isLocalMediaActive } = useAppStatus();
    const { activeTab } = useAppSelector((state: RootState) => state.userSettings.currentTrack);
    const albumById = useAppSelector((state: RootState) => state.mediaGroups.albumById);
    const artistByName = useAppSelector((state: RootState) => state.mediaGroups.artistByName);
    const [currentTrack, setCurrentTrack] = useState<Track | undefined>(undefined);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id,
    );
    const presets = useAppSelector((state: RootState) => state.presets.presets);
    const streamerPower = useAppSelector((state: RootState) => state.system.streamer.power);
    const streamerDisplay = useAppSelector((state: RootState) => state.system.streamer.display);
    const currentSource = useAppSelector(
        (state: RootState) => state.system.streamer.sources?.active,
    );
    const currentPlaybackTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const [debouncedPlayStatus] = useDebouncedValue(playStatus, 1000);
    const [getTrack, getTrackResult] = useLazyGetTrackByIdQuery();
    const [trackYearAndGenre, setTrackYearAndGenre] = useState<string | undefined>(undefined);
    const [activePreset, setActivePreset] = useState<Preset | undefined>(undefined);
    const [tabContentHeight, setTabContentHeight] = useState<number>(300);
    const tabListRef = useRef<HTMLDivElement>(null);
    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
    const [preparingForDisplay, setPreparingForDisplay] = useState<boolean>(true);
    const [showBuffering, setShowBuffering] = useState<boolean>(false);
    const { start: startBufferTimeout, clear: clearBufferTimeout } = useTimeout(
        () => setShowBuffering(true),
        BUFFERING_AUDIO_NOTIFY_DELAY,
    );

    const { classes: dynamicClasses } = createStyles((theme) => ({
        currentTrackTitle: {
            fontFamily: APP_ALT_FONTFACE,
            fontWeight: "bold",
            lineHeight: 0.9,
            minHeight: "1.7rem",
            "&:hover": isLocalMediaActive
                ? {
                      cursor: "pointer",
                  }
                : {},
        },
    }))();

    /**
     * If the playStatus has been "buffering" for at least BUFFERING_AUDIO_NOTIFY_DELAY ms, then
     * display a "buffering" overlay.
     */
    useEffect(() => {
        if (playStatus === "buffering") {
            startBufferTimeout();
        } else {
            clearBufferTimeout();
            setShowBuffering(false);
        }
    }, [playStatus, startBufferTimeout, clearBufferTimeout]);

    /**
     * Whenever the currently-playing Track changes, either request the Track's details from the
     * backend (for local media with a Track Id); or (for other sources like AirPlay) "fake" a
     * currentTrack from the information known.
     */
    useEffect(() => {
        setTrackYearAndGenre(undefined);

        if (currentTrackId) {
            getTrack(currentTrackId);
        } else if (currentPlaybackTrack) {
            // currentPlaybackTrack gets populated from sources like AirPlay. When it looks like
            // a currentPlaybackTrack is available (and the currentTrackId -- from a local media
            // source -- is not), then a "fake" Track is created. This is fine so long as nothing
            // down the line is expecting any keys that aren't being provided here.
            setCurrentTrack({
                artist: currentPlaybackTrack.artist,
                album: currentPlaybackTrack.album,
                title: currentPlaybackTrack.title,
                art_url: currentPlaybackTrack.art_url,
                album_art_uri: currentPlaybackTrack.art_url,
            } as Track);

            setPreparingForDisplay(false);
        }
    }, [currentTrackId, currentPlaybackTrack, getTrack]);

    /**
     * When a new Track's details have been retrieved from the backend (for local media), update
     * the currentTrack state.
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
     * Manage setting the height available to display the tab contents (lyrics, etc). This is used
     * later by the <ScrollArea> component.
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

    /**
     * Keep track of which Preset is currently playing (if any).
     */
    useEffect(() => setActivePreset(presets.find((preset) => preset.is_playing)), [presets]);

    // --------------------------------------------------------------------------------------------

    const windowResizeHandler = (event: UIEvent) =>
        event.target && setWindowHeight((event.target as Window).innerHeight);

    useWindowEvent("resize", windowResizeHandler);

    // AirPlay sets the play status to "paused" between tracks, which makes the UI briefly display
    // an awkward paused state.
    const playStatusDisplay =
        currentSource?.class === "stream.service.airplay" ? debouncedPlayStatus : playStatus;

    // --------------------------------------------------------------------------------------------

    if (streamerPower !== "on") {
        return (
            <Box pt={35}>
                <SystemPower label="streamer is in standby mode" />
            </Box>
        );
    }

    if ((!currentTrackId && !currentPlaybackTrack) || preparingForDisplay) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    // The system is playing, but the current source is not one flagged as a source which supports
    // the display of additional track details.
    if (
        playStatusDisplay === "ready" ||
        playStatusDisplay === "not_ready" ||
        !currentSource ||
        !currentTrack ||
        !Object.keys(sourcesSupportingDisplayDetails).includes(currentSource.class)
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
                <Flex align="center" gap={10}>
                    <Text size={16} weight="bold" miw="fit-content">
                        {`Nothing currently playing${currentSource ? " from" : ""}`}
                    </Text>
                    {currentSource && <MediaSourceBadge />}
                </Flex>
            </Center>
        );
    }

    const tabsToDisplay = currentSource
        ? sourcesSupportingDisplayDetails[currentSource.class]
        : undefined;

    // --------------------------------------------------------------------------------------------

    return (
        <Flex gap={30} pt={7} pb={10}>
            <LoadingOverlay
                visible={showBuffering}
                loader={<BufferingLoader />}
                overlayBlur={0.7}
                overlayOpacity={0.9}
            />

            {/* LHS stack: Album art, playhead, etc ------------------------------------------- */}

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
                        <MediaArt media={currentTrack} size={albumArtWidth} showControls={false} />
                        {(playStatusDisplay === "pause" || playStatusDisplay === "stop") && (
                            <PlaybackPaused />
                        )}
                    </Stack>

                    <CurrentMediaControls />
                </Stack>

                {/* Media actions button */}
                {isLocalMediaActive && (
                    <MediaActionsButton
                        media={currentTrack}
                        size="sm"
                        enabledActions={{
                            Details: ["all"],
                            Favorites: ["all"],
                            Navigation: ["all"],
                        }}
                    />
                )}

                {activePreset && (
                    <MediaActionsButton
                        media={activePreset}
                        size="sm"
                        enabledActions={{
                            Details: ["ViewArt"],
                            Favorites: [],
                            Navigation: [],
                        }}
                    />
                )}
            </Stack>

            {/* RHS stack --------------------------------------------------------------------- */}

            {/* Radio shows device display information (falling back on track if possible) */}
            {/* This makes assumptions about the existence of StreamMagic's display "line1"/etc */}
            {currentSource.class === "stream.radio" && (
                <Stack spacing={10}>
                    <Text size={34} className={dynamicClasses.currentTrackTitle}>
                        {streamerDisplay?.line1 || currentTrack.title}
                    </Text>
                    <Stack spacing={10}>
                        <Text size={24} weight="bold">
                            {streamerDisplay?.line2 || currentTrack.artist}
                        </Text>
                        <Text size={24}>{streamerDisplay?.line3}</Text>
                    </Stack>
                </Stack>
            )}

            {/* Local media, AirPlay, etc, shows track name, album, artist, and tabs */}
            {currentSource.class !== "stream.radio" && (
                <Stack spacing="lg" sx={{ flexGrow: 1 }}>
                    <Stack spacing={5}>
                        <Flex gap={10} justify="space-between" align="center">
                            <Box mih={40} w="fit-content">
                                <Tooltip
                                    disabled={!isLocalMediaActive}
                                    label="View Track in Artists screen"
                                    position="bottom"
                                >
                                    <Text
                                        size={34}
                                        className={dynamicClasses.currentTrackTitle}
                                        onClick={() => {
                                            if (!isLocalMediaActive) {
                                                return;
                                            }

                                            // TODO: Clarify how best to configure the Artists screen for
                                            //  navigation purposes. This code is duplicated elsewhere (like
                                            //  <MediaActionsButton> and <PlaylistEntryActionsButton>) and is
                                            //  overly verbose.
                                            dispatch(setArtistsActiveCollection("all"));
                                            dispatch(
                                                setArtistsSelectedArtist(
                                                    artistByName[currentTrack.artist],
                                                ),
                                            );
                                            dispatch(
                                                setArtistsSelectedAlbum(
                                                    albumById[currentTrack.albumId],
                                                ),
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
                            <FavoriteIndicator media={currentTrack} size="1.2rem" />
                        </Flex>

                        {(isLocalMediaActive || currentTrack.artist || currentTrack.album) && (
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
                                            <TrackWaveform
                                                trackId={currentTrackId}
                                                width={2048}
                                                height={700}
                                            />
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
            )}
        </Flex>
    );
};

export default CurrentTrackScreen;
