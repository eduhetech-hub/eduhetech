import React from 'react'

export default function Quiz(){
  const startAdGate = () => {
    // redirect/open Monetag link with timer, then call award API
    const link = 'https://otieu.com/4/10070319'
    window.open(link, '_blank')
    alert('Open monetag link in new tab. After 5s you should call award API to grant +50 EduPoints (placeholder)')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium">Quiz</h2>
      <div className="mt-4">
        <p>5-question quiz placeholder.</p>
        <button onClick={startAdGate} className="mt-3 px-3 py-2 bg-green-600 text-white rounded">View Result (opens Monetag)</button>
      </div>
    </div>
  )
}
