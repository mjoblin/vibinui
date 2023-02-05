import React, { FC } from "react";
import { Image } from "@mantine/core";

import { MediaId } from "../../app/types";

type WaveformProps = {
    trackId: MediaId;
    width?: number;
    height?: number;
};

const Waveform: FC<WaveformProps> = ({ trackId, width = 800, height = 250 }) => {
    return <Image src={`/tracks/${trackId}/waveform.png?width=${width}&height=${height}`} />;
};

export default Waveform;
