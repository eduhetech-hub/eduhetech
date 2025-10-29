import React from 'react'

const LINKS = [
  'https://otieu.com/4/10070319',
  'https://otieu.com/4/10070318',
  'https://otieu.com/4/10070317',
  'https://otieu.com/4/10070316',
  'https://otieu.com/4/10070315',
  'https://otieu.com/4/10070314',
  'https://otieu.com/4/7667810',
  'https://otieu.com/4/7667811',
  'https://otieu.com/4/7667754',
  'https://otieu.com/4/7667716',
]

export default function Ads(){
  const watchAd = () => {
    const link = LINKS[Math.floor(Math.random()*LINKS.length)]
    window.open(link, '_blank')
    alert('Ad opened in new tab. After 5s call award API to grant +20 EduPoints (placeholder)')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium">Watch Ads</h2>
      <p className="mt-2">Rotate Monetag links and trigger a 5s timer before awarding points.</p>
      <button onClick={watchAd} className="mt-3 px-3 py-2 bg-indigo-600 text-white rounded">Watch Ad (+20)</button>
    </div>
  )
}
