"use client";

interface VideoPopupProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    videoId: string;
}

export default function VideoPopup({
    open,
    setOpen,
    videoId,
}: VideoPopupProps) {
    if (!open) return null;

    return (
        <div className="video_popup">
            <div
                className="video_overlay"
                onClick={() => setOpen(false)}
            ></div>

            <div className="video_content">
                <button
                    className="close_btn"
                    onClick={() => setOpen(false)}
                >
                    ✕
                </button>

                <iframe
                    width="100%"
                    height="400"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
            </div>
        </div>
    );
}