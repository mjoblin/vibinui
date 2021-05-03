const useTransport = () => {
    const next = async () =>
        await fetch("/transport/next", { method: "post" });

    const previous = async () =>
        await fetch("/transport/previous", { method: "post" });

    const pause = async () =>
        await fetch("/transport/pause", { method: "post" });

    const play = async (id) => {
        if (id) {
            await fetch(`/transport/play/${id}`, { method: "post" });
        } else {
            await fetch("/transport/play", { method: "post" });
        }
    }

    const seek = async (target) =>
        await fetch(`/transport/seek?target=${target}`, { method: "post" });

    return { next, previous, pause, play, seek };
};

export default useTransport;
