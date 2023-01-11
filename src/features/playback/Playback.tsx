import React from "react";

import type { RootState } from "../../app/store";
import { useAppSelector } from "../../app/hooks";

export function Playback() {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const audioSources = useAppSelector((state: RootState) => state.playback.audio_sources);
    const playheadPosition = useAppSelector(
        (state: RootState) => state.playback.playhead.position_normalized
    );

    return (
        <div>
            <div>Playback: {playStatus || "unknown"}</div>
            <div>Pos: {playheadPosition.toFixed(4)}</div>
            <div>
                Audio Sources:{" "}
                {Object.keys(audioSources).map((sourceId: any) => (
                    <div key={sourceId}>
                        <div>{sourceId}</div>
                        <div>{audioSources[sourceId]}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
