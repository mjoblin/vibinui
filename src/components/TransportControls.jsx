import React from "react";
import Slider from "rc-slider";

import "./TransportControls.css";

import useTransport from "../hooks/useTransport";

function TransportControls() {
    const [currentTime, setCurrentTime] = React.useState(0);

    const transport = useTransport();

    return (
        <div>
            <div>
                <button onClick={() => transport.next()}>Next</button>
                <button onClick={() => transport.previous()}>Previous</button>
                <button onClick={() => transport.pause()}>Pause</button>
                <button onClick={() => transport.play()}>Play</button>
            </div>

            <div style={{ width: "100%", marginTop: "15px", marginBottom: "15px" }}>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(e.target.value)}
                    onMouseUp={() => {
                        const currentTimeFloat = currentTime / 100;
                        console.log(`time: ${currentTime} -> ${currentTimeFloat}`);
                        transport.seek(currentTimeFloat);
                    }}
                    className="timeslider"
                    id="myRange"
                />
            </div>
        </div>
    );
}

export default TransportControls;
