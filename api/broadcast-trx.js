const TronWeb = require('tronweb')
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
    if (req.method !== 'POST') return res.status(405).send('Method not allowed')
    const idToken = req.headers.authorization && req.headers.authorization.split('Bearer ')[1]
    if (!idToken) return res.status(401).json({ error: 'Missing ID token' })

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid
    const userRecord = await admin.auth().getUser(uid)
    if (!userRecord.customClaims || !userRecord.customClaims.admin) return res.status(403).json({ error: 'Admin only' })

    const { payoutId } = req.body || {}
    if (!payoutId) return res.status(400).json({ error: 'Missing payoutId' })

    const payoutRef = db.collection('payouts').doc(payoutId)
    const payoutDoc = await payoutRef.get()
    if (!payoutDoc.exists) return res.status(404).json({ error: 'Payout not found' })
    const payout = payoutDoc.data()
    if (payout.status !== 'signed' || !payout.signedTx) return res.status(400).json({ error: 'Payout must be in signed state with signedTx' })

    const fullNode = process.env.TRON_FULL_NODE_URL || 'https://api.nileex.io'
    const tronWeb = new TronWeb(fullNode)

    // signedTx is the object produced by tronWeb.trx.sign()
    const signedTx = payout.signedTx

    const resp = await tronWeb.trx.sendRawTransaction(signedTx)
    if (!resp || resp.result === false) return res.status(500).json({ error: 'Broadcast failed', resp })

    const txId = resp.txid || resp

    await payoutRef.update({ status: 'paid', txId, broadcastedAt: new Date().toISOString(), broadcastedBy: uid })

    return res.status(200).json({ success: true, txId, resp })
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}