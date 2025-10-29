import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'

export default function AdminProtectedRoute({ children }){
  const auth = getAuth()
  const [allowed, setAllowed] = useState(null)

  useEffect(()=>{
    let mounted = true
    async function check(){
      const user = auth.currentUser
      if(!user) return setAllowed(false)
      const tokenRes = await user.getIdTokenResult(true)
      const isAdmin = !!tokenRes.claims.admin
      if(mounted) setAllowed(isAdmin)
    }
    check()
    return ()=>{ mounted=false }
  },[])

  if(allowed === null) return <div className="p-4">Checking admin...</div>
  if(!allowed) return <div className="p-4 text-red-600">Access denied. Admins only.</div>
  return <>{children}</>
}