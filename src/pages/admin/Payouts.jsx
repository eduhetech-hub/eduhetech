import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'

export default function AdminPayouts(){
  const auth = getAuth()
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const user = auth.currentUser
        if(!user) throw new Error('Not authenticated')
        const idToken = await user.getIdToken()
        const res = await fetch('/api/list-payouts', {
          method: 'GET',
          headers: { Authorization: `Bearer ${idToken}` }
        })
        if(!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if(mounted) setPayouts(data.payouts || [])
      }catch(err){
        setError(err.message)
      }finally{ setLoading(false) }
    }
    load()
    return ()=>{ mounted=false }
  },[])

  const approveAndSign = async (id) => {
    if(!confirm('Approve and sign this payout? This will create a signed transaction (server signs, does not broadcast).')) return
    try{
      const user = auth.currentUser
      const idToken = await user.getIdToken()
      const res = await fetch('/api/execute-trc20-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ payoutId: id })
      })
      const json = await res.json()
      if(!res.ok) throw new Error(json.error || 'Sign failed')
      alert('Signed transaction created.')
      // refresh list
      location.reload()
    }catch(err){ alert('Error: '+err.message) }
  }

  const broadcast = async (id) => {
    if(!confirm('Broadcast the signed transaction to the Tron testnet? This will send the tx and mark payout as paid.')) return
    try{
      const user = auth.currentUser
      const idToken = await user.getIdToken()
      const res = await fetch('/api/broadcast-trx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ payoutId: id })
      })
      const json = await res.json()
      if(!res.ok) throw new Error(json.error || 'Broadcast failed')
      alert('Broadcast successful. txId: ' + (json.txId || JSON.stringify(json.tx)))
      location.reload()
    }catch(err){ alert('Error: '+err.message) }
  }

  if(loading) return <div className="p-4">Loading...</div>
  if(error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium">Admin — Payouts</h2>
      <div className="mt-4 overflow-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Points</th>
              <th className="px-4 py-2 text-left">Amount (USDT)</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.userId}</td>
                <td className="px-4 py-2">{p.pointsRequested}</td>
                <td className="px-4 py-2">{p.amountUsd}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2 space-x-2">
                  {p.status === 'pending' && <button onClick={()=>approveAndSign(p.id)} className="px-2 py-1 bg-green-600 text-white rounded">Approve & Sign</button>}
                  {p.status === 'signed' && <button onClick={()=>broadcast(p.id)} className="px-2 py-1 bg-blue-600 text-white rounded">Broadcast</button>}
                  <button onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(p.signedTx || {})); alert('signedTx copied') }} className="px-2 py-1 bg-gray-200 rounded">Copy SignedTx</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}