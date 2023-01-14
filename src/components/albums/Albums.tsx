import React, { FC } from "react";

import { useGetAlbumsQuery, useLazyGetTracksQuery } from "../../app/services/vibinBase";
import { usePlayMutation } from "../../app/services/vibinTransport";
import { Track } from "../../app/types";

const Albums: FC = () => {
    const { data, error, isLoading } = useGetAlbumsQuery();
    const [ getTracks, getTracksResult ] = useLazyGetTracksQuery();
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
                            <button onClick={() => getTracks(album.id)}>Tracks</button>
                            {album.title}
                        </div>
                    ))}

                    {
                        getTracksResult.data?.map((track: Track) => <>{track.title}</>)
                    }
                </>
            ) : null}
        </div>
    );
}

export default Albums;
