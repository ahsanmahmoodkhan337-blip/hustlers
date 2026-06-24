'use client'

import React, { useState, useTransition } from 'react'
import {
  Activity,
  CreditCard,
  ShieldCheck,
  Award,
  ArrowRight,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react'
import { submitAccessRequest, studentLogin } from './actions'

// Triggering redeploy to fix audio 404s
// Healthcare Hustlers Typing Master - Production Build
export default function LandingPage() {
  // Navigation & Scroll states
  const [activeTab, setActiveTab] = useState<'request' | 'login'>('request')

  // Access Request Form state
  const [requestForm, setRequestForm] = useState({
    studentName: '',
    studentPhone: '',
    studentEmail: '',
    paymentMethod: 'EasyPaisa',
    transactionId: ''
  })
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isPendingRequest, startRequestTransition] = useTransition()

  // Scribe Login state
  const [loginPhone, setLoginPhone] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isPendingLogin, startLoginTransition] = useTransition()

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRequestSuccess(null)
    setRequestError(null)

    if (
      !requestForm.studentName ||
      !requestForm.studentPhone ||
      !requestForm.studentEmail ||
      !requestForm.transactionId
    ) {
      setRequestError('Please fill out all 5 fields of the access request form.')
      return
    }

    startRequestTransition(async () => {
      const response = await submitAccessRequest({
        studentName: requestForm.studentName,
        studentPhone: requestForm.studentPhone,
        studentEmail: requestForm.studentEmail,
        paymentMethod: requestForm.paymentMethod,
        transactionId: requestForm.transactionId
      })

      if (response.success) {
        setRequestSuccess(response.message)
        // Reset form
        setRequestForm({
          studentName: '',
          studentPhone: '',
          studentEmail: '',
          paymentMethod: 'EasyPaisa',
          transactionId: ''
        })
      } else {
        setRequestError(response.message)
      }
    })
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    if (!loginPhone) {
      setLoginError('Please enter your phone number.')
      return
    }

    startLoginTransition(async () => {
      const response = await studentLogin(loginPhone)

      if (response.success && response.data) {
        // Set cookies on login
        document.cookie = `student_phone=${response.data.phone}; path=/; max-age=86400`
        document.cookie = `student_name=${encodeURIComponent(response.data.name)}; path=/; max-age=86400`
        document.cookie = `student_id=${response.data.id}; path=/; max-age=86400`

        // Forward to practice page
        window.location.href = '/typing-master'
      } else {
        setLoginError(response.message)
      }
    })
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-sky-600 p-2 rounded-lg text-white">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Educational Practice Portal</span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                www.healthcarehustlers.org
              </span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('value-proposition')} className="hover:text-sky-600 transition-colors">
              Why 40 WPM?
            </button>
            <button onClick={() => scrollToSection('payment-instructions')} className="hover:text-sky-600 transition-colors">
              Payment Guide
            </button>
            <button onClick={() => { scrollToSection('portal'); setActiveTab('request') }} className="hover:text-sky-600 transition-colors">
              Request Access
            </button>
            <button onClick={() => { scrollToSection('portal'); setActiveTab('login') }} className="hover:text-sky-600 transition-colors">
              Student Login
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => { scrollToSection('portal'); setActiveTab('login') }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-4 py-2 rounded-md transition-all shadow-xs"
            >
              Enter Practice Hub
            </button>
            <a
              href="/admin"
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold uppercase tracking-wider"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-950 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-800/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-semibold text-sky-400">
              <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping"></span>
              <span>Exclusive Access Scribe Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Master Clinical Dictation. <br />
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                Exceed 40 WPM easily.
              </span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto lg:mx-0">
              Gated educational typing master engineered exclusively for healthcare scribes. Train your hands on complex terminology, multi-speaker accents, and native cardiac/pediatric clinical voice recordings.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={() => { scrollToSection('portal'); setActiveTab('request') }}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 py-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group text-base"
              >
                <span>Request Access Portal</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('value-proposition')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold px-8 py-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-base"
              >
                <span>Learn More</span>
              </button>
            </div>
          </div>

          {/* QUICK HERO LOGIC MODAL */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Clock className="text-sky-400 h-5 w-5" />
                <span>Typing Baseline Goals</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-500/20 text-red-400 p-1.5 rounded-md">
                      <span className="font-bold text-xs">❌ &lt;40</span>
                    </div>
                    <span className="text-sm text-slate-300">Untrained Scribe</span>
                  </div>
                  <span className="text-sm font-semibold text-red-400">Failed / Gated</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="bg-sky-500/20 text-sky-400 p-1.5 rounded-md">
                      <span className="font-bold text-xs">💪 40+</span>
                    </div>
                    <span className="text-sm text-slate-300">Industry Standard Baseline</span>
                  </div>
                  <span className="text-sm font-semibold text-sky-400">Minimum Competency</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/10 border border-teal-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-md">
                      <span className="font-bold text-xs">🏆 60+</span>
                    </div>
                    <span className="text-sm text-white font-medium">Healthcare Hustler Elite</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">Highly Employable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section id="value-proposition" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Why Is General Typing Practice Not Enough?
            </h2>
            <div className="h-1.5 w-24 bg-sky-600 mx-auto rounded-full"></div>
            <p className="text-slate-500 text-lg">
              Generic platforms evaluate typing based on standard literature. Real-world medical transcription requires scribes to parse difficult medical jargon in real time under strict deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4 relative">
              <div className="bg-sky-100 text-sky-600 h-12 w-12 rounded-lg flex items-center justify-center font-bold text-xl">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900">Complex Terminology</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dictations include words like <span className="font-semibold text-sky-700 italic">&ldquo;Lisinopril&rdquo;</span>, <span className="font-semibold text-sky-700 italic">&ldquo;leukocytosis&rdquo;</span>, and <span className="font-semibold text-sky-700 italic">&ldquo;auscultation&rdquo;</span>. Missing a letter in medical documentation isn&apos;t just a typo&mdash;it is a patient risk.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="bg-teal-100 text-teal-600 h-12 w-12 rounded-lg flex items-center justify-center font-bold text-xl">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900">Accents and Rapid Pacing</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Practicing with our native, real-world audio recordings teaches your brain to type as doctors talk—varying pacing, rapid instructions, accents, and high ambient background noise.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="bg-indigo-100 text-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center font-bold text-xl">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900">The 40 WPM Scribe Gate</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Virtually all transcription outsourcing networks and hospital units enforce a hard 40 WPM typing gate. Training with audio-aligned transcription scripts is the fastest route to bypass it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VERBATIM PAYMENT INSTRUCTIONS */}
      <section id="payment-instructions" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Verification & Payment Setup Details
            </h2>
            <div className="h-1.5 w-24 bg-sky-600 mx-auto rounded-full"></div>
            <p className="text-slate-500 text-lg">
              To practice on this gated premium platform, please transfer your registration fee to any option below and enter your exact Transaction ID in the Access Request Form.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* BANK ISLAMI */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 relative shadow-xs flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Bank Transfer
                  </div>
                  <CreditCard className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Bank Islami</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">Bank Name</span>
                    <span className="text-slate-900 font-medium">Bank Islami Pakistan LTD.</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">Account Title</span>
                    <span className="text-slate-900 font-semibold text-right">Ahsan Mahmood Khan</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">Account Number</span>
                    <span className="text-sky-700 font-bold tracking-wider">PK98BKIP0303800235070201</span>
                  </p>
                  <p className="flex justify-between pb-2">
                    <span className="font-semibold text-slate-500">Amount</span>
                    <span className="text-slate-900 font-medium">$1 / 300 PKR</span>
                  </p>
                </div>
              </div>
              <div className="mt-8 bg-sky-50 text-sky-700 p-4 rounded-xl text-xs font-semibold leading-relaxed border border-sky-100">
                ⚠️ Transfer the enrollment fee of $1 / 300 PKR and capture your electronic transaction bank receipt.
              </div>
            </div>

            {/* EASYPAISA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 relative shadow-xs flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Mobile Wallet
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">EasyPaisa</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">Account Name</span>
                    <span className="text-slate-900 font-semibold">Ahsan Mahmood Khan</span>
                  </p>
                  <p className="flex justify-between pb-2">
                    <span className="font-semibold text-slate-500">Account Number</span>
                    <span className="text-emerald-700 font-bold tracking-wider">03105265337</span>
                  </p>
                </div>
              </div>
              <div className="mt-8 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-xs font-semibold leading-relaxed border border-emerald-100">
                ⚠️ Transfer $1 / 300 PKR to the wallet and enter the unique ID generated by EasyPaisa in the transaction field.
              </div>
            </div>

            {/* PAYPAL */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 relative shadow-xs flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    International Credit
                  </div>
                  <Award className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">PayPal</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">Account Title</span>
                    <span className="text-indigo-700 font-semibold">Ahsan Mahmood Khan</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">Account Number</span>
                    <span className="text-indigo-700 font-bold">333591114926</span>
                  </p>
                  <p className="flex justify-between pb-2">
                    <span className="font-semibold text-slate-500">Routing Number</span>
                    <span className="text-slate-900 font-medium">031101279</span>
                  </p>
                </div>
              </div>
              <div className="mt-8 bg-indigo-50 text-indigo-700 p-4 rounded-xl text-xs font-semibold leading-relaxed border border-indigo-100">
                ⚠️ International registration fee is $1 USD. Provide the generated PayPal receipt ID as your Transaction ID.
              </div>
            </div>
          </div>

          {/* STEP BY STEP PAYMENT GUIDE & WHATSAPP SLIP VERIFICATION */}
          <div className="mt-12 bg-sky-50/50 border border-sky-200 rounded-2xl p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-xs text-left animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="bg-sky-600 text-white text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold">Step-By-Step Setup Guide</span>
                  <span>How to Complete Your Enrollment</span>
                </h3>
                <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 font-medium">
                  <li>Send <strong className="text-sky-700">1$ / 300 PKR</strong> to any payment option given above.</li>
                  <li>Fill in all your details in the <strong className="text-sky-700">Request Access</strong> form below.</li>
                  <li>Send your payment confirmation/receipt slip to the WhatsApp verification desk.</li>
                  <li>Your login ID will be approved and activated within <strong className="text-sky-700">24 hours</strong>.</li>
                </ol>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center space-y-3 shadow-xs shrink-0 max-w-xs w-full">
                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support & Verification</h4>
                  <p className="text-sm font-bold text-slate-800">WhatsApp Dispatch Desk</p>
                </div>
                <a
                  href="https://api.whatsapp.com/send/?phone=923350340888&text&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-900/10 w-full"
                >
                  <span>Send Receipt Slip</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
                <span className="text-[10px] text-slate-400 font-medium">For Login & Confirmation assistance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL: REQUEST ACCESS & LOGIN */}
      <section id="portal" className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* TABS SELECTOR */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => { setActiveTab('request'); setRequestError(null); setRequestSuccess(null) }}
                className={`flex-1 py-4 text-center font-bold text-sm sm:text-base border-b-2 transition-all ${
                  activeTab === 'request'
                    ? 'border-sky-600 text-sky-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Request Educational Access
              </button>
              <button
                onClick={() => { setActiveTab('login'); setLoginError(null) }}
                className={`flex-1 py-4 text-center font-bold text-sm sm:text-base border-b-2 transition-all ${
                  activeTab === 'login'
                    ? 'border-sky-600 text-sky-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Scribe Student Login
              </button>
            </div>

            <div className="p-8">
              {/* ACCESS REQUEST FORM */}
              {activeTab === 'request' && (
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Access Request Form</h3>
                    <p className="text-sm text-slate-500">
                      Submit your correct payment verification details to get your phone number approved for typing test practice.
                    </p>
                  </div>

                  {requestSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-start space-x-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Submission Confirmed!</span>
                        <p className="mt-1">{requestSuccess}</p>
                      </div>
                    </div>
                  )}

                  {requestError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start space-x-3 text-sm">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                      <div>
                        <span className="font-bold">Submission Failed</span>
                        <p className="mt-1">{requestError}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* studentName */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Student Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Muhammad Bilal"
                          value={requestForm.studentName}
                          onChange={(e) => setRequestForm({ ...requestForm, studentName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 bg-white"
                        />
                      </div>
                    </div>

                    {/* studentPhone */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Phone Number (Login ID)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 03105265337"
                          value={requestForm.studentPhone}
                          onChange={(e) => setRequestForm({ ...requestForm, studentPhone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 bg-white"
                        />
                      </div>
                    </div>

                    {/* studentEmail */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. bilal@example.com"
                          value={requestForm.studentEmail}
                          onChange={(e) => setRequestForm({ ...requestForm, studentEmail: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 bg-white"
                        />
                      </div>
                    </div>

                    {/* paymentMethod */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Payment Method Used
                      </label>
                      <select
                        value={requestForm.paymentMethod}
                        onChange={(e) => setRequestForm({ ...requestForm, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 bg-white"
                      >
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Bank Islami">Bank Islami</option>
                        <option value="PayPal">PayPal</option>
                      </select>
                    </div>

                    {/* transactionId */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Unique Transaction ID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TXN-EP-9988 or Bank Ref No."
                        value={requestForm.transactionId}
                        onChange={(e) => setRequestForm({ ...requestForm, transactionId: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPendingRequest}
                    className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                  >
                    {isPendingRequest ? (
                      <span>Verifying details...</span>
                    ) : (
                      <>
                        <span>Submit Access Request</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SCRIBE student LOGIN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-md mx-auto py-4">
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-bold text-slate-900">Student Scribe Login</h3>
                    <p className="text-sm text-slate-500">
                      Enter your unique phone number used during registration to verify your approved credentials.
                    </p>
                  </div>

                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start space-x-3 text-sm">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                      <div>
                        <span className="font-bold">Access Denied</span>
                        <p className="mt-1">{loginError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Student Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 03105265337"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 bg-white text-lg tracking-wide font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPendingLogin}
                    className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                  >
                    {isPendingLogin ? (
                      <span>Validating Account...</span>
                    ) : (
                      <>
                        <span>Validate & Enter Practice Hub</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('request')}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                    >
                      Need to register? Submit payment details first &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-white">
              <Activity className="h-5 w-5 text-sky-500" />
              <span className="font-bold tracking-tight">Healthcare Hustlers</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              A specialized, gated educational typing practice master designed exclusively for medical scribes. Elevate accuracy, typing speed, and professional documentation readiness.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Gated Access Support</h4>
            <p className="text-xs leading-relaxed">
              Have questions regarding payment or approval delays? Reach out directly:
              <br />
              <span className="text-sky-400 font-bold">billing@healthcarehustlers.com</span>
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Platform Assurance</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              🔒 High-fidelity manual payment verification audit trail. Stats are held in a secure local SQLite database aligned with individual student phones.
            </p>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Healthcare Hustlers. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
