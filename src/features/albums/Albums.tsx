import * as React from "react";
import { useGetAlbumsQuery } from "../../services/vibinBase";
import { usePlayMutation } from "../../services/vibinTransport";

export function Albums() {
    const { data, error, isLoading } = useGetAlbumsQuery();
    const [ play ] = usePlayMutation();

    return (
        <div className="Albums">
            {error ? (
                <>Oh no, there was an error</>
            ) : isLoading ? (
                <>Loading...</>
            ) : data ? (
                <>
                    {data.map((album) => (
                        <div key={album.id}>
                            <button onClick={() => play(album.id)}>Play</button>
                            {album.title}
                        </div>
                    ))}
                </>
            ) : null}
        </div>
    );
}
