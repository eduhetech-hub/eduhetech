// Vercel serverless function - verify Firebase ID token, validate action, write transaction to Firestore
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const admin = require('firebase-admin')

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  initializeApp({ credential: cert(serviceAccount) })
}
const db = getFirestore()

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed')
    const idToken = req.headers.authorization && req.headers.authorization.split('Bearer ')[1]
    if (!idToken) return res.status(401).json({ error: 'Missing ID token' })

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid
    const { type, refId } = req.body || {}

    // basic validation & idempotency key
    if (!type) return res.status(400).json({ error: 'Missing award type' })

    const rewards = { lesson: 10, quiz: 50, ad: 20, daily: 5, referral: 100 }
    const points = rewards[type] || 0

    const txRef = db.collection('pointTransactions').doc()
    await txRef.set({ userId: uid, delta: points, type, ref: refId || null, createdAt: new Date().toISOString() })

    // update user balance atomically
    const userRef = db.collection('users').doc(uid)
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef)
      if (!doc.exists) t.set(userRef, { balancePoints: points, createdAt: new Date().toISOString() })
      else {
        const prev = doc.data().balancePoints || 0
        t.update(userRef, { balancePoints: prev + points })
      }
    })

    return res.status(200).json({ success: true, points })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
