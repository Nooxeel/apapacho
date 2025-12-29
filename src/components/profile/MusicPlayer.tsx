'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface MusicTrack {
  id: string
  youtubeUrl: string
  youtubeId: string
  title: string
  artist?: string
  thumbnail: string
  order: number
}

interface MusicPlayerProps {
  tracks: MusicTrack[]
  autoPlay?: boolean
  accentColor?: string
  className?: string
}

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

export function MusicPlayer({ 
  tracks, 
  autoPlay = true, 
  accentColor = '#d946ef',
  className 
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [volume, setVolume] = useState(30)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [showPlayer, setShowPlayer] = useState(true)
  const [needsInteraction, setNeedsInteraction] = useState(false)
  
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const currentTrack = tracks[currentTrackIndex]

  // Load YouTube IFrame API
  useEffect(() => {
    if (!tracks.length) return

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    // Load the API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  const initPlayer = useCallback(() => {
    if (!currentTrack || playerRef.current) return

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '1',
      width: '1',
      videoId: currentTrack.youtubeId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    })
  }, [currentTrack, autoPlay])

  const onPlayerReady = (event: YT.PlayerEvent) => {
    setIsReady(true)
    event.target.setVolume(volume)
    
    // Try to get duration
    const dur = event.target.getDuration()
    if (dur > 0) {
      setDuration(dur)
    }
    
    // Try to play - if blocked by browser, we'll show a play button
    event.target.playVideo()
  }

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true)
      setNeedsInteraction(false)
      setDuration(playerRef.current?.getDuration() || 0)

      // Clear any existing interval before creating new one
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }

      // Update progress
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime())
        }
      }, 1000)
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false)
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
        progressInterval.current = null
      }
      // If paused at 0:00 and we tried to autoplay, browser blocked it
      if (playerRef.current?.getCurrentTime() === 0 && autoPlay) {
        setNeedsInteraction(true)
      }
    } else if (event.data === window.YT.PlayerState.UNSTARTED) {
      // Video hasn't started - might need user interaction
      setNeedsInteraction(true)
    } else if (event.data === window.YT.PlayerState.ENDED) {
      // Play next track or loop back to first
      handleNext()
    }
  }

  const onPlayerError = (event: YT.OnErrorEvent) => {
    console.error('YouTube player error:', event.data)
    // Try next track on error
    handleNext()
  }

  // Reinitialize player when track changes
  useEffect(() => {
    if (isReady && playerRef.current && currentTrack) {
      playerRef.current.loadVideoById(currentTrack.youtubeId)
      if (isPlaying) {
        playerRef.current.playVideo()
      }
    }
  }, [currentTrackIndex, currentTrack])

  // Update volume when changed
  useEffect(() => {
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(volume)
    }
  }, [volume, isReady])

  const handlePlayPause = () => {
    if (!playerRef.current) return

    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
  }

  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (playerRef.current) {
      playerRef.current.seekTo(time, true)
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!tracks.length || !showPlayer) return null

  return (
    <>
      {/* YouTube Player - positioned off-screen but not hidden */}
      <div 
        id="youtube-player" 
        className="fixed"
        style={{ 
          width: '1px', 
          height: '1px', 
          top: '-100px', 
          left: '-100px',
          opacity: 0,
          pointerEvents: 'none'
        }} 
      />
      
      {/* Music Player UI */}
      <div
        ref={containerRef}
        className={cn(
          'w-full rounded-2xl transition-all duration-300',
          isMinimized ? 'h-14' : 'auto',
          className
        )}
      >
        <div 
          className="rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl"
          style={{ 
            backgroundColor: 'rgba(15, 15, 20, 0.9)',
            boxShadow: `0 0 20px ${accentColor}30`
          }}
        >
          {/* Header with minimize/close buttons */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: isPlaying ? '#22c55e' : '#ef4444' }}
              />
              {!isMinimized && (
                <span className="text-sm font-medium text-white">
                  {isPlaying ? 'Reproduciendo' : 'Pausado'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMinimized ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  )}
                </svg>
              </button>
              <button
                onClick={() => setShowPlayer(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Cerrar"
              >
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Click to play banner when autoplay is blocked */}
              {needsInteraction && !isPlaying && (
                <button
                  onClick={handlePlayPause}
                  className="w-full p-3 text-center text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border-b border-white/10"
                >
                  🔊 Haz clic para reproducir música
                </button>
              )}

              {/* Current Track Info */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
                    {currentTrack?.thumbnail && (
                      <img
                        src={currentTrack.thumbnail}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="flex items-end gap-0.5 h-4">
                          <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms', height: '60%' }} />
                          <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '150ms', height: '100%' }} />
                          <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '300ms', height: '40%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {currentTrack?.title || 'Sin título'}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {currentTrack?.artist || 'Artista desconocido'}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {currentTrackIndex + 1} / {tracks.length}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${accentColor} ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 0%)`
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-white/40">{formatTime(currentTime)}</span>
                    <span className="text-xs text-white/40">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={handlePrevious}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    disabled={tracks.length <= 1}
                  >
                    <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="p-3 rounded-full hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    disabled={tracks.length <= 1}
                  >
                    <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 mt-4">
                  <button 
                    onClick={() => setVolume(volume === 0 ? 30 : 0)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      {volume === 0 ? (
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      ) : (
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      )}
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${accentColor} ${volume}%, rgba(255,255,255,0.1) 0%)`
                    }}
                  />
                </div>

                {/* Track List */}
                {tracks.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40 mb-2">Lista ({tracks.length} canciones - Loop)</p>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {tracks.map((track, index) => (
                        <button
                          key={track.id}
                          onClick={() => setCurrentTrackIndex(index)}
                          className={cn(
                            'w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left',
                            index === currentTrackIndex
                              ? 'text-white'
                              : 'hover:bg-white/5 text-white/60'
                          )}
                          style={index === currentTrackIndex ? { backgroundColor: `${accentColor}30` } : {}}
                        >
                          <img 
                            src={track.thumbnail} 
                            alt="" 
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{track.title}</span>
                            {track.artist && (
                              <span className="text-xs text-white/40 truncate block">{track.artist}</span>
                            )}
                          </div>
                          {index === currentTrackIndex && isPlaying && (
                            <div className="flex items-end gap-0.5 h-3">
                              <div className="w-0.5 bg-white animate-bounce" style={{ animationDelay: '0ms', height: '60%' }} />
                              <div className="w-0.5 bg-white animate-bounce" style={{ animationDelay: '150ms', height: '100%' }} />
                              <div className="w-0.5 bg-white animate-bounce" style={{ animationDelay: '300ms', height: '40%' }} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Minimized state - just show play button */}
          {isMinimized && (
            <div className="p-2 flex justify-center">
              <button
                onClick={handlePlayPause}
                className="p-2 rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: accentColor }}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
