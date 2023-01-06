import * as React from "react";
import { useGetAlbumsQuery } from "../../services/vibin";

export function Albums() {
    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading } = useGetAlbumsQuery("FOO");
    // Individual hooks are also accessible under the generated endpoints:
    // const { data, error, isLoading } = pokemonApi.endpoints.getPokemonByName.useQuery('bulbasaur')

    return (
        <div className="Albums">
            {error ? (
                <>Oh no, there was an error</>
            ) : isLoading ? (
                <>Loading...</>
            ) : data ? (
                <>
                    {data.map(album => <div key={album.id}>{album.title}</div>)}
                </>
            ) : null}
        </div>
    );
}
