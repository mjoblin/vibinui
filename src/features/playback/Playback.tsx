import React from "react";

import type { RootState } from "../../app/store";
import { useAppSelector } from "../../app/hooks";

export function Playback() {
    const playStatus = useAppSelector(
        (state: RootState) => state.playback.play_status
    );

    const audioSources = useAppSelector(
        (state: RootState) => state.playback.audio_sources
    );

    return (
        <div>
            <div>Playback: {playStatus || "unknown"}</div>
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
