import { useState, useEffect } from 'react'
import './VideoPlayer.css'

import { getAppSetting } from '../lib/queries'

function VideoPlayer() {
    const [videoUrl, setVideoUrl] = useState('')
    const [isYouTube, setIsYouTube] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadVideoUrl() {
            const url = await getAppSetting('home_video_url')
            if (url) {
                setVideoUrl(url)
                setIsYouTube(url.includes('youtube.com') || url.includes('youtu.be'))
            } else {
                // 기본값
                const defaultUrl = 'https://youtu.be/F0sfWC0fi8o'
                setVideoUrl(defaultUrl)
                setIsYouTube(true)
            }
            setLoading(false)
        }
        loadVideoUrl()
    }, [])

    // YouTube URL을 임베드 형식으로 변환
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return ''

        // 이미 embed URL인 경우
        if (url.includes('/embed/')) return url

        // youtu.be 형식
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0]
            return `https://www.youtube.com/embed/${videoId}`
        }

        // youtube.com/watch?v= 형식
        if (url.includes('watch?v=')) {
            const videoId = url.split('watch?v=')[1].split('&')[0]
            return `https://www.youtube.com/embed/${videoId}`
        }

        return url
    }

    if (loading) {
        return (
            <div className="video-player-card loading">
                <div className="loading-spinner">🎬</div>
                <p>동영상 로딩 중...</p>
            </div>
        )
    }

    if (!videoUrl) {
        return null // 동영상 URL이 없으면 아무것도 표시하지 않음
    }

    return (
        <div className="video-player-card">
            <div className="video-container">
                {isYouTube ? (
                    <iframe
                        src={`${getYouTubeEmbedUrl(videoUrl)}?autoplay=0&mute=1&controls=1&rel=0`}
                        title="교회 소개 영상"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="video-iframe"
                    />
                ) : (
                    <video
                        src={videoUrl}
                        controls
                        className="video-element"
                        preload="metadata"
                    >
                        브라우저가 비디오 재생을 지원하지 않습니다.
                    </video>
                )}
            </div>
        </div>
    )
}

export default VideoPlayer
