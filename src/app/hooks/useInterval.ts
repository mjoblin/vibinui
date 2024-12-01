import { useEffect, useRef } from "react";

// ================================================================================================
// Taken from:
//  https://overreacted.io/making-setinterval-declarative-with-react-hooks/
//
// TODO: Can this be replaced with Mantine's useInterval hook.
// ================================================================================================
export const useInterval = (callback: any, delay: number) => {
    // TODO: Fix typing of callback.
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            // @ts-ignore
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};
