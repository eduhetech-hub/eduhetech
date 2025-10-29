import React from 'react'

export default function Lessons(){
  const handleComplete = async () => {
    // call /api/award to award +10 points (client must pass idToken)
    alert('This will call the award API to grant +10 EduPoints (placeholder)')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium">Lessons</h2>
      <div className="mt-4 border rounded p-4 bg-white">
        <h3 className="font-semibold">Intro to Tech</h3>
        <p className="mt-2 text-sm">Category: Tech & Digital Skills</p>
        <button onClick={handleComplete} className="mt-3 px-3 py-2 bg-blue-600 text-white rounded">Mark as Completed (+10)</button>
      </div>
    </div>
  )
}
