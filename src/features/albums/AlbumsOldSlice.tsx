import React from "react";
import type { RootState } from "../../app/store";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { decrement, increment } from "./albumsSlice";

export function AlbumsOldSlice() {
    const count = useAppSelector((state: RootState) => state.albums.value);
    const dispatch = useAppDispatch();

    return (
        <div>
            <div>
                <button
                    aria-label="Increment value"
                    onClick={() => dispatch(increment())}
                >
                    Increment
                </button>
                <span>{count}</span>
                <button
                    aria-label="Decrement value"
                    onClick={() => dispatch(decrement())}
                >
                    Decrement
                </button>
            </div>
        </div>
    );
}
