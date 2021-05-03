const usePlaylist = () => {
    const playId = async (id) =>
        await fetch(`/playlist/play/id/${id}`, { method: "post" });

    const playIndex = async (index) =>
        await fetch(`/playlist/play/index/${index}`, { method: "post" });

    return { playId, playIndex };
};

export default usePlaylist;
