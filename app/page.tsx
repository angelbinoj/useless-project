'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PoopMoodApp() {
  const [mood, setMood] = useState('')
  const [result, setResult] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [tissues, setTissues] = useState<Array<{ id: number; x: number; delay: number }>>([])
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; delay: number }>>([])
  const [showSparkles, setShowSparkles] = useState(false)
  const [flushAnimation, setFlushAnimation] = useState(false)
  const [currentBgMusic, setCurrentBgMusic] = useState<HTMLAudioElement | null>(null)
  const [backgroundTissues, setBackgroundTissues] = useState<Array<{ id: number; x: number; delay: number; size: number; duration: number }>>([])
  
  const flushSoundRef = useRef<HTMLAudioElement>(null)
  const fartSoundRef = useRef<HTMLAudioElement>(null)
  const bgMusicRefs = useRef<{[key: string]: HTMLAudioElement}>({})

  const poopResponses = {
    happy: [
      "Happy Poop! Smooth like butter 🧈💩",
      "Joyful dump detected! 😄🚽",
      "Sunshine and rainbows poop! 🌈💩",
      "Cheerful chocolate logs! 🍫💩"
    ],
    sad: [
      "Sad Poop... kinda emotional 💔💩",
      "Tiny tears and toilet fears 😢🧻",
      "Melancholy movements 😭💩",
      "Blue poop blues 💙💩"
    ],
    angry: [
      "Explosive Poop! Take cover! 💣💩",
      "Rage flush incoming! 🔥🚽",
      "Furious fiber fury! 😤💩",
      "Volcanic bowel eruption! 🌋💩"
    ],
    lazy: [
      "Slow and sleepy poop 😴",
      "Lazy logs just chilling... 🐢💩",
      "Snooze and schmooze 💤💩",
      "Couch potato poop 🥔💩"
    ],
    romantic: [
      "Love-filled poop 💘💩",
      "Romantic release 💕🚽",
      "Cupid's calling card 💘💩",
      "Sweet surrender 💖💩"
    ]
  }

  const moodEmojis = {
    happy: "😄",
    sad: "😢", 
    angry: "😡",
    lazy: "😴",
    romantic: "😍"
  }

  const moodColors = {
    happy: "from-yellow-200 to-orange-200",
    sad: "from-blue-200 to-indigo-200",
    angry: "from-red-200 to-pink-200", 
    lazy: "from-purple-200 to-indigo-200",
    romantic: "from-pink-200 to-rose-200"
  }

  // Audio file extensions mapping
  const audioExtensions = {
    happy: 'wav',
    sad: 'wav',
    angry: 'mp3',
    lazy: 'mp3',
    romantic: 'wav'
  }

  useEffect(() => {
    // Initialize background music refs with error handling
    Object.keys(poopResponses).forEach(moodKey => {
      try {
        const extension = audioExtensions[moodKey as keyof typeof audioExtensions]
        const audio = new Audio(`/sounds/${moodKey}-bg.${extension}`)
        audio.loop = false // Changed from true to false
        audio.volume = 0.3
        audio.addEventListener('error', (e) => {
          console.log(`Background music ${moodKey} failed to load:`, e)
        })
        bgMusicRefs.current[moodKey] = audio
      } catch (error) {
        console.log(`Failed to create audio for ${moodKey}:`, error)
      }
    })

    // Create continuous background tissue animation
    const createBackgroundTissues = () => {
      const newBackgroundTissues = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        size: 0.8 + Math.random() * 0.7, // Random size between 0.8 and 1.5
        duration: 8 + Math.random() * 4 // Random duration between 8-12 seconds
      }))
      setBackgroundTissues(newBackgroundTissues)
    }

    createBackgroundTissues()
    
    // Recreate background tissues every 10 seconds
    const backgroundInterval = setInterval(createBackgroundTissues, 10000)

    return () => {
      clearInterval(backgroundInterval)
      // Cleanup audio on unmount
      Object.values(bgMusicRefs.current).forEach(audio => {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch (error) {
          console.log('Audio cleanup error:', error)
        }
      })
    }
  }, [])

  const createTissues = () => {
    const newTissues = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 2
    }))
    setTissues(newTissues)
    
    setTimeout(() => setTissues([]), 4000)
  }

  const createBubbles = () => {
    const newBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5
    }))
    setBubbles(newBubbles)
    
    setTimeout(() => setBubbles([]), 3000)
  }

  const playBackgroundMusic = (selectedMood: string) => {
    try {
      // Stop current background music if playing
      if (currentBgMusic) {
        currentBgMusic.pause()
        currentBgMusic.currentTime = 0
      }

      // Play new background music once
      const newBgMusic = bgMusicRefs.current[selectedMood]
      if (newBgMusic) {
        newBgMusic.currentTime = 0 // Reset to beginning
        newBgMusic.play().catch(e => console.log('Background music play failed:', e))
        setCurrentBgMusic(newBgMusic)
        
        // Clear currentBgMusic when the audio ends
        newBgMusic.addEventListener('ended', () => {
          setCurrentBgMusic(null)
        }, { once: true })
      }
    } catch (error) {
      console.log('Background music error:', error)
    }
  }

  const playFlushSound = () => {
    if (flushSoundRef.current) {
      flushSoundRef.current.currentTime = 0
      flushSoundRef.current.play().catch(e => console.log('Flush sound play failed:', e))
    }
    
    // Reset mood selection and stop background music
    setMood('')
    setShowResult(false)
    setResult('')
    
    // Stop current background music
    if (currentBgMusic) {
      currentBgMusic.pause()
      currentBgMusic.currentTime = 0
      setCurrentBgMusic(null)
    }
    
    setFlushAnimation(true)
    createTissues()
    createBubbles()
    setShowSparkles(true)
    
    setTimeout(() => {
      setFlushAnimation(false)
      setShowSparkles(false)
    }, 2000)
  }

  const playFartSound = () => {
    if (fartSoundRef.current) {
      fartSoundRef.current.currentTime = 0
      fartSoundRef.current.play().catch(e => console.log('Fart sound play failed:', e))
    }
  }

  const handleMoodChange = (selectedMood: string) => {
    setMood(selectedMood)
    playBackgroundMusic(selectedMood)
  }

  const analyzePoop = () => {
    if (!mood) {
      setResult("👉 Please select your mood!")
      setShowResult(true)
      return
    }

    const options = poopResponses[mood as keyof typeof poopResponses]
    const randomResponse = options[Math.floor(Math.random() * options.length)]
    setResult(randomResponse)
    setShowResult(true)
    
    playFartSound()
    
    setTimeout(() => {
      setShowSparkles(true)
      setTimeout(() => setShowSparkles(false), 1500)
    }, 500)
  }

  const shareResult = async () => {
    try {
      await navigator.clipboard.writeText(`💩 Poop Mood: ${result}`)
      alert("Poop Mood copied! Paste it anywhere 💩📤")
    } catch (err) {
      console.log('Copy failed:', err)
    }
  }

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`💩 Poop Mood: ${result}\nTry yours at our poop mood analyzer!`)
    const url = `https://wa.me/?text=${message}`
    window.open(url, '_blank')
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${mood ? moodColors[mood as keyof typeof moodColors] : 'from-orange-100 to-orange-200'} text-center p-10 relative overflow-hidden transition-all duration-1000`}>
      
      {/* Background Large Floating Tissues */}
      {backgroundTissues.map((tissue) => (
        <div
          key={tissue.id}
          className="fixed text-8xl animate-background-tissue-drift pointer-events-none opacity-20 z-0"
          style={{
            left: `${tissue.x}%`,
            animationDelay: `${tissue.delay}s`,
            animationDuration: `${tissue.duration}s`,
            fontSize: `${tissue.size * 8}rem`,
            bottom: '-100px'
          }}
        >
          🧻
        </div>
      ))}

      {/* Additional Large Floating Tissues */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`large-tissue-${i}`}
          className="fixed text-9xl animate-large-tissue-float pointer-events-none opacity-15 z-0"
          style={{
            left: `${(i * 25) + Math.random() * 20}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${8 + i}s`,
            bottom: '-150px'
          }}
        >
          🧻
        </div>
      ))}
      
      {/* Floating Tissues Animation (from flush) */}
      {tissues.map((tissue) => (
        <div
          key={tissue.id}
          className="absolute text-4xl animate-tissue-fall pointer-events-none z-20"
          style={{
            left: `${tissue.x}%`,
            animationDelay: `${tissue.delay}s`,
            top: '-50px'
          }}
        >
          🧻
        </div>
      ))}

      {/* Floating Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute text-2xl animate-bubble-float pointer-events-none opacity-70"
          style={{
            left: `${bubble.x}%`,
            animationDelay: `${bubble.delay}s`,
            bottom: '10%'
          }}
        >
          💨
        </div>
      ))}

      {/* Sparkles Effect */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400 text-2xl animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-6xl font-bold text-amber-800 mb-8 animate-bounce-slow drop-shadow-lg">
          🚽 What's My Poop Mood? 💩
        </h1>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-amber-200 relative">
          
          {/* Custom Mood Selector */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-amber-800 mb-4">Select Your Current Mood:</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(moodEmojis).map(([moodKey, emoji]) => (
                <div
                  key={moodKey}
                  className={`mood-option ${mood === moodKey ? 'selected' : ''} ${mood === moodKey ? 'animate-mood-glow' : ''}`}
                  onClick={() => handleMoodChange(moodKey)}
                >
                  <div className="flex items-center justify-center gap-3 text-lg font-semibold">
                    <span className="text-3xl">{emoji}</span>
                    <span className="capitalize">{moodKey}</span>
                    {mood === moodKey && <span className="text-2xl">🎵</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <Button
              onClick={analyzePoop}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xl px-10 py-5 rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-lg font-bold"
            >
              Reveal My Poop Mood 💩
            </Button>

            <Button
              onClick={playFlushSound}
              className={`bg-blue-600 hover:bg-blue-700 text-white text-xl px-8 py-5 rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-lg font-bold ${flushAnimation ? 'animate-flush-swirl' : ''}`}
            >
              🚽 Flush!
            </Button>
          </div>

          {showResult && (
            <div className="mt-8 animate-fade-in">
              <div className="text-8xl mb-4 animate-poop-wiggle">💩</div>
              <div className="text-2xl font-bold text-amber-800 bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl border-3 border-yellow-300 shadow-lg">
                {result}
              </div>
              
              <div className="flex gap-4 justify-center mt-6">
                <Button
                  onClick={shareResult}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  📋 Copy Result
                </Button>
                <Button
                  onClick={shareWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  🟢 Share on WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-8 text-5xl">
          <div className="animate-spin-slow">🧻</div>
          <div className="animate-bounce-slow">🚽</div>
          <div className="animate-pulse">💩</div>
          <div className="animate-spin-slow">🧻</div>
        </div>

        {/* Music Indicator */}
        {mood && (
          <div className="mt-4 text-amber-700 font-semibold">
            🎵 Playing {mood} mood music 🎵
          </div>
        )}
      </div>

      {/* Audio Elements */}
      <audio ref={flushSoundRef} preload="auto">
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/toilet-flush-3-zawh86ZDxdbe0cHFSr1PmfmVqZE7il.mp3" type="audio/mpeg" />
      </audio>
      
      <audio ref={fartSoundRef} preload="auto">
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart-01-3nMjjixZlyUlhopP0N0q48L9zZPQyg.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}
