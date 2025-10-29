const { initializeApp, cert } = require('firebase-admin/app')
const admin = require('firebase-admin')
const { getFirestore } = require('firebase-admin/firestore')

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  initializeApp({ credential: cert(serviceAccount) })
}
const db = getFirestore()

module.exports = async (req, res) => {
  try{
    if (req.method !== 'GET') return res.status(405).send('Method not allowed')
    const idToken = req.headers.authorization && req.headers.authorization.split('Bearer ')[1]
    if (!idToken) return res.status(401).json({ error: 'Missing ID token' })

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid
    const userRecord = await admin.auth().getUser(uid)
    if (!userRecord.customClaims || !userRecord.customClaims.admin) return res.status(403).json({ error: 'Admin only' })

    const snapshot = await db.collection('payouts').orderBy('requestedAt', 'desc').limit(200).get()
    const payouts = []
    snapshot.forEach(doc => payouts.push({ id: doc.id, ...doc.data() }))
    return res.status(200).json({ payouts })
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}