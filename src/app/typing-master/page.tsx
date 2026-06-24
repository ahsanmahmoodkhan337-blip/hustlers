'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock,
  Award,
  User,
  LogOut,
  LineChart,
  CheckCircle,
  AlertTriangle,
  VolumeX,
  Gauge,
  Check,
  BookOpen
} from 'lucide-react'
import { getScenarios, getStudentStats, submitTypingStat } from '../actions'
import dynamic from 'next/dynamic'

const StatsCharts = dynamic(() => import('./components/StatsCharts'), { ssr: false })

type Scenario = {
  id: string
  title: string
  description: string | null
  audioUrl: string
  transcript: string
  difficulty: string
  createdAt: string
}

type UserStat = {
  id: string
  caseName: string
  wpm: number
  accuracy: number
  passed: boolean
  createdAt: string
}

export default function TypingMasterHub() {
  // Student Session State
  const [student, setStudent] = useState<{ id: string; name: string; phone: string } | null>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [statsHistory, setStatsHistory] = useState<UserStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Typing Practice Test Core Engine States
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [typedText, setTypedText] = useState('')
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [isTestFinished, setIsTestFinished] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes standard countdown
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)

  // HTML5 Native Audio State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [audioVolume, setAudioVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)

  // Modal State
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [isSavingStat, startSavingStatTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll transcript container as user types
  useEffect(() => {
    if (transcriptContainerRef.current) {
      const activeChar = transcriptContainerRef.current.querySelector('.bg-sky-100')
      if (activeChar) {
        activeChar.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }
    }
  }, [typedText])

  // 1. Load Student Session from Cookies & Fetch Database Elements
  useEffect(() => {
    const cookies = document.cookie.split('; ')
    const studentIdCookie = cookies.find((row) => row.startsWith('student_id='))
    const studentPhoneCookie = cookies.find((row) => row.startsWith('student_phone='))
    const studentNameCookie = cookies.find((row) => row.startsWith('student_name='))

    if (!studentIdCookie || !studentPhoneCookie || !studentNameCookie) {
      // Not logged in or expired, send to landing page
      window.location.href = '/'
      return
    }

    const currentStudent = {
      id: studentIdCookie.split('=')[1],
      phone: studentPhoneCookie.split('=')[1],
      name: decodeURIComponent(studentNameCookie.split('=')[1]),
    }
    setStudent(currentStudent)

    // Load scenarios and stats from actions
    const loadData = async () => {
      try {
        const dbScenarios = await getScenarios()
        const dbStats = await getStudentStats(currentStudent.id)

        setScenarios(dbScenarios)
        setStatsHistory(dbStats as unknown as UserStat[])
        
        if (dbScenarios.length > 0) {
          setSelectedScenario(dbScenarios[0])
        }
      } catch (err) {
        console.error('Error loading database info:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 2. Typing Core Engine Calculations on Input Changes
  const handleTypingInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isTestFinished) return

    const input = e.target.value
    const transcript = selectedScenario?.transcript || ''

    // Prevent typing past the transcript length
    if (input.length > transcript.length) return

    // Start timer on first keystroke
    if (!isTestStarted) {
      setIsTestStarted(true)
      setStartTime(Date.now())
      startTimer()
      if (audioRef.current && !isAudioPlaying) {
        audioRef.current.play().catch(() => {})
        setIsAudioPlaying(true)
      }
    }

    setTypedText(input)

    // Calculate real-time character accuracy
    let correctChars = 0
    for (let i = 0; i < input.length; i++) {
      if (input[i] === transcript[i]) {
        correctChars++
      }
    }

    const currentAccuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100
    setAccuracy(currentAccuracy)

    // Calculate real-time WPM
    // Formula: WPM = (correct_chars / 5) / (minutes_elapsed)
    const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 0
    const elapsedMinutes = elapsedSeconds / 60

    if (elapsedMinutes > 0) {
      const currentWpm = Math.round((correctChars / 5) / elapsedMinutes)
      setWpm(currentWpm)
    }

    // Automatically check if typing completed
    if (input.length === transcript.length) {
      finishTypingTest()
    }
  }

  // Focus typing container on click
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // 3. Timer Controls
  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          finishTypingTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const finishTypingTest = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    setIsTestFinished(true)
    setIsAudioPlaying(false)

    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Final calculations
    const transcript = selectedScenario?.transcript || ''
    let correctChars = 0
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === transcript[i]) {
        correctChars++
      }
    }

    const finalAccuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 0
    const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 180
    const finalWpm = Math.round((correctChars / 5) / (elapsedSeconds / 60))

    setWpm(finalWpm)
    setAccuracy(finalAccuracy)
    setShowResultsModal(true)
  }

  // Reset the interactive practice layout
  const handleReset = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    setTypedText('')
    setIsTestStarted(false)
    setIsTestFinished(false)
    setTimeRemaining(180)
    setWpm(0)
    setAccuracy(100)
    setStartTime(null)
    setIsAudioPlaying(false)
    setSaveSuccess(false)
    setShowResultsModal(false)
    setAudioCurrentTime(0)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    setTimeout(() => {
      focusInput()
    }, 50)
  }

  // Handle Changing Selected Clinical Scenario
  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setTypedText('')
    setIsTestStarted(false)
    setIsTestFinished(false)
    setTimeRemaining(180)
    setWpm(0)
    setAccuracy(100)
    setStartTime(null)
    setIsAudioPlaying(false)
    setSaveSuccess(false)
    setShowResultsModal(false)
    setAudioCurrentTime(0)
    setAudioDuration(0)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = scenario.audioUrl
      audioRef.current.load()
      audioRef.current.playbackRate = playbackRate
      audioRef.current.volume = audioVolume
    }

    setTimeout(() => {
      focusInput()
    }, 50)
  }

  // 4. Audio Control Utilities
  const toggleAudio = () => {
    if (!audioRef.current) return

    if (isAudioPlaying) {
      audioRef.current.pause()
      setIsAudioPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsAudioPlaying(true)
      // Focus typing on play click
      focusInput()
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setAudioVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  // 5. Save Practice Stat Session to Database via Server Action
  const handleSaveStats = () => {
    if (!student || !selectedScenario) return

    const passesBaseline = wpm >= 40 && accuracy >= 95

    startSavingStatTransition(async () => {
      const response = await submitTypingStat({
        accessRequestId: student.id,
        caseName: selectedScenario.title,
        wpm,
        accuracy,
        passed: passesBaseline,
      })

      if (response.success) {
        setSaveSuccess(true)
        // Refresh history list
        const updatedStats = await getStudentStats(student.id)
        setStatsHistory(updatedStats as unknown as UserStat[])
      }
    })
  }

  // 6. Sign Out
  const handleSignOut = () => {
    // Expire cookies
    document.cookie = 'student_phone=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'student_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'student_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    window.location.href = '/'
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration)
    }
  }

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setAudioCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const formatAudioTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const minutes = Math.floor(secs / 60)
    const seconds = Math.floor(secs % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // Clean intervals on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [])

  // Render formatting for the target characters typing visual overlay
  const renderTranscriptCharacters = () => {
    const transcript = selectedScenario?.transcript || ''

    return (
      <div className="relative text-lg leading-relaxed font-mono tracking-wide text-slate-400 select-none text-left h-72 overflow-y-auto border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-inner">
        {transcript.split('').map((char, index) => {
          let className = 'transition-all duration-75'
          const isTyped = index < typedText.length
          const isCorrect = isTyped && typedText[index] === char
          const isActive = index === typedText.length

          if (isTyped) {
            className += isCorrect ? ' text-sky-600 font-semibold' : ' text-red-500 bg-red-100 font-bold'
          }

          if (isActive) {
            className += ' bg-sky-100 border-l border-sky-600 animate-pulse text-sky-900 font-extrabold px-0.5 rounded-xs'
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          )
        })}
      </div>
    )
  }

  // Calculate historic metrics
  const totalAttempts = statsHistory.length
  const passedAttempts = statsHistory.filter((s) => s.passed).length
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
  const maxWpm = totalAttempts > 0 ? Math.max(...statsHistory.map((s) => s.wpm)) : 0
  const avgWpm = totalAttempts > 0 ? Math.round(statsHistory.reduce((acc, s) => acc + s.wpm, 0) / totalAttempts) : 0
  const avgAccuracy =
    totalAttempts > 0 ? Math.round(statsHistory.reduce((acc, s) => acc + s.accuracy, 0) / totalAttempts) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Activity className="h-10 w-10 text-sky-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Validating medical scribe security token...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 p-2 rounded-lg text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-500 tracking-wider uppercase">Official Practice Portal</span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                www.healthcarehustlers.org
              </span>
            </div>
          </div>

          {student && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <User className="h-4 w-4 text-sky-600" />
                <span className="font-semibold text-slate-800">{student.name}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 text-xs font-mono">{student.phone}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-500 hover:text-red-600 text-sm font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CORE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TOP INTRO CARD */}
        <div className="bg-gradient-to-r from-sky-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Approved Scribe Clinical Practice Suite</h2>
            <p className="text-sky-100 text-sm leading-relaxed max-w-xl">
              Listen to native dictations, practice rapid-transcription medical terms, and record your metrics directly to bypass the 40 WPM benchmark!
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <span className="block text-2xl font-extrabold text-teal-400">{maxWpm}</span>
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Best WPM</span>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <span className="block text-2xl font-extrabold text-sky-300">{avgWpm}</span>
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Avg WPM</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SCENARIO SELECTION (LEFT 3 COLS) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-sky-600" />
                <span>Select Medical Case</span>
              </h3>
              <div className="space-y-2.5">
                {scenarios.map((scenario) => {
                  const isSelected = selectedScenario?.id === scenario.id
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioChange(scenario)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full mb-1">
                        <span className={`font-bold ${isSelected ? 'text-sky-700' : 'text-slate-800'}`}>
                          {scenario.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            scenario.difficulty === 'Easy'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : scenario.difficulty === 'Medium'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {scenario.difficulty}
                        </span>
                      </div>
                      {scenario.description && (
                        <p className="text-slate-500 line-clamp-2 text-[11px] mt-1 leading-normal">
                          {scenario.description}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* TRANSCRIPTION ENGINE WORKSPACE (LEFT-CENTER 9 COLS) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* CURRENT SCENARIO INFO */}
              {selectedScenario && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedScenario.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{selectedScenario.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 rounded-full shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Timer: {timeRemaining}s</span>
                  </div>
                </div>
              )}

              {/* HTML5 AUDIO DICTATION CONTROLLER */}
              {selectedScenario && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                  {/* HIDDEN NATIVE AUDIO */}
                  <audio
                    ref={audioRef}
                    src={selectedScenario.audioUrl}
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onDurationChange={handleLoadedMetadata}
                    loop={false}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Primary Play Button */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={toggleAudio}
                        className="bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-full transition-all flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        {isAudioPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">HTML5 Clinical Audio Dictation</span>
                        <span className="text-[11px] text-slate-500">Press play to begin dictation or type below to auto-start</span>
                      </div>
                    </div>

                    {/* Speed Scrubber (Pro Feature) */}
                    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider">Speed:</span>
                      {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handlePlaybackRateChange(rate)}
                          className={`px-2 py-1 rounded-sm font-bold transition-all ${
                            playbackRate === rate
                              ? 'bg-sky-100 text-sky-700'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>

                    {/* Volume Scrubber */}
                    <div className="flex items-center space-x-2">
                      <button onClick={toggleMute} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        {isMuted || audioVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : audioVolume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-sky-600"
                      />
                    </div>
                  </div>

                  {/* Seek Bar / Scrub Control */}
                  <div className="border-t border-slate-200 pt-3 flex items-center space-x-3 text-xs font-mono text-slate-500">
                    <span className="w-8 text-left">{formatAudioTime(audioCurrentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 100}
                      step="0.1"
                      value={audioCurrentTime}
                      onChange={handleAudioSeek}
                      className="flex-1 h-1 bg-slate-200 rounded-lg cursor-pointer accent-sky-600"
                    />
                    <span className="w-8 text-right">{formatAudioTime(audioDuration)}</span>
                  </div>
                </div>
              )}

              {/* REAL-TIME HIGHLIGHTED TRANSCRIPT MATCH OVERLAY */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Dictation Script
                </label>
                {renderTranscriptCharacters()}
              </div>

              {/* HIDDEN CAPTURE INTERFACE & INTERACTIVE TYPE AREA */}
              <div className="space-y-4 relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Scribe Transcription Input (Type script exactly here)
                </label>
                <div
                  onClick={focusInput}
                  className={`relative min-h-28 p-4 rounded-xl border border-slate-300 bg-white transition-all text-slate-800 font-mono text-base text-left outline-hidden cursor-text ${
                    isTestStarted && !isTestFinished ? 'ring-1 ring-sky-600 border-sky-600' : ''
                  }`}
                >
                  {/* Real-time typing matches go here */}
                  {typedText || <span className="text-slate-400 font-sans italic">Click here to begin typing as soon as dictation plays...</span>}

                  {/* Typing input itself is styled hidden but captures key events cleanly */}
                  <textarea
                    ref={inputRef}
                    value={typedText}
                    onChange={handleTypingInput}
                    disabled={isTestFinished}
                    className="absolute inset-0 opacity-0 cursor-text resize-none w-full h-full p-4 font-mono text-base outline-hidden"
                    style={{ zIndex: 10 }}
                    placeholder="Type..."
                  />
                </div>

                {/* Reset button */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-6 text-slate-500 font-semibold">
                    <span className="flex items-center space-x-1.5">
                      <Gauge className="h-4 w-4 text-sky-600" />
                      <span>Live Speed: <strong className="text-sky-600 text-sm font-bold">{wpm}</strong> WPM</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Accuracy: <strong className="text-emerald-600 text-sm font-bold">{accuracy}</strong>%</span>
                    </span>
                  </div>

                  <button
                    onClick={handleReset}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg transition-all flex items-center space-x-2 font-bold cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Typing Test</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS DASHBOARD SECTION */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-sky-600" />
                <span>Scribe Progress Dashboard</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualize and track historical WPM metrics. Be sure to hit and log at least 40 WPM to exceed base scribe competency requirements.
              </p>
            </div>
            {totalAttempts > 0 && (
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                passRate >= 70
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Baseline Pass Rate: {passRate}%
              </div>
            )}
          </div>

          {/* HISTORICAL KPI TOTALS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
              <span className="text-3xl font-extrabold text-slate-800">{totalAttempts}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Best Speed</span>
              <span className="text-3xl font-extrabold text-sky-600">{maxWpm} WPM</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Speed</span>
              <span className="text-3xl font-extrabold text-slate-700">{avgWpm} WPM</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
              <span className="text-3xl font-extrabold text-emerald-600">{avgAccuracy}%</span>
            </div>
          </div>

          {/* VISUAL TREND CHARTS */}
          {statsHistory.length > 0 && <StatsCharts stats={statsHistory} />}

          {/* STATS TABLE */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Medical Case</th>
                  <th className="py-3 px-4">Speed (WPM)</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Passed Baseline?</th>
                  <th className="py-3 px-4">Date Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statsHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium italic">
                      No sessions saved yet. Run and complete a practice test above, then save your metrics!
                    </td>
                  </tr>
                ) : (
                  statsHistory.map((stat) => (
                    <tr key={stat.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{stat.caseName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-600">{stat.wpm} WPM</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{stat.accuracy}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          stat.passed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span>{stat.passed ? 'PASSED (40+ WPM)' : 'FAILED'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(stat.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* RESULTS MODAL */}
      {showResultsModal && selectedScenario && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-6 p-8 relative animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="bg-sky-100 text-sky-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Transcription Test Complete</h3>
              <p className="text-xs text-slate-500 font-medium">{selectedScenario.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Speed Recorded</span>
                <span className="text-3xl font-extrabold text-sky-600">{wpm} WPM</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Accuracy</span>
                <span className="text-3xl font-extrabold text-emerald-600">{accuracy}%</span>
              </div>
            </div>

            {/* Benchmark Analysis banner */}
            <div className={`p-4 rounded-xl border text-sm flex items-start space-x-3 leading-relaxed ${
              wpm >= 40 && accuracy >= 95
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {wpm >= 40 && accuracy >= 95 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">PASSED Scribe Competency Baseline!</span>
                    <p className="text-xs text-emerald-700 mt-1">Excellent speed and spelling logic. Your typing results qualify for clinical hospital scribe entry-level tiers.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">FAILED Scribe Competency Baseline</span>
                    <p className="text-xs text-amber-700 mt-1">
                      Healthcare units look for a minimum of <strong className="font-bold">40 WPM</strong> with <strong className="font-bold">95% accuracy</strong>. Please reset, adjust audio speeds, and try again!
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Saving Stat action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 border border-slate-200 hover:bg-slate-50 font-bold py-3 px-4 rounded-lg text-sm text-slate-700 transition-all text-center cursor-pointer"
              >
                Practice Again
              </button>

              <button
                disabled={isSavingStat || saveSuccess}
                onClick={handleSaveStats}
                className={`flex-1 font-bold py-3 px-4 rounded-lg text-sm transition-all text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-100 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-300'
                }`}
              >
                {isSavingStat ? (
                  <span>Saving Session...</span>
                ) : saveSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Session Logged!</span>
                  </>
                ) : (
                  <span>Log Session Stats</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
