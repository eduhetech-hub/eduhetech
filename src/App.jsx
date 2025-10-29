import React from 'react'

export default function App(){
  return (
    <div className="min-h-screen bg-sky-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold text-blue-700">EduHeTech (Firebase Starter)</h1>
        <p className="mt-2 text-sm text-slate-600">Firebase + Vercel serverless starter. Branch: feature/firebase-starter</p>
        <div className="mt-6 space-x-3">
          <a href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded">Dashboard</a>
          <a href="/lessons" className="px-4 py-2 bg-white border border-slate-200 rounded">Lessons</a>
          <a href="/quiz" className="px-4 py-2 bg-white border border-slate-200 rounded">Quiz</a>
          <a href="/ads" className="px-4 py-2 bg-white border border-slate-200 rounded">Ads</a>
        </div>
      </div>
    </div>
  )
}
