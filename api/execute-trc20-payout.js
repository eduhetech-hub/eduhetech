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
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed')
    const idToken = req.headers.authorization && req.headers.authorization.split('Bearer ')[1]
    if (!idToken) return res.status(401).json({ error: 'Missing ID token' })

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    // check admin claim
    const userRecord = await admin.auth().getUser(uid)
    if (!userRecord.customClaims || !userRecord.customClaims.admin) return res.status(403).json({ error: 'Admin only' })

    const { toAddress, amountUsdt, payoutId } = req.body || {}
    if (!payoutId) return res.status(400).json({ error: 'Missing payoutId' })

    const payoutRef = db.collection('payouts').doc(payoutId)
    const payoutDoc = await payoutRef.get()
    if (!payoutDoc.exists) return res.status(404).json({ error: 'Payout not found' })
    const payout = payoutDoc.data()
    if (payout.status !== 'pending') return res.status(400).json({ error: 'Payout must be pending to sign' })

    // TronWeb setup for testnet (Nile)
    const fullNode = process.env.TRON_FULL_NODE_URL || 'https://api.nileex.io'
    const solidityNode = process.env.TRON_SOLID_NODE_URL || 'https://api.nileex.io'
    const eventServer = process.env.TRON_EVENT_SERVER_URL || 'https://api.nileex.io'
    const privateKey = process.env.TRON_PRIVATE_KEY || ''

    if (!privateKey) return res.status(500).json({ error: 'TRON_PRIVATE_KEY not configured' })

    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey)

    const USDT_NILE_ADDRESS = process.env.TRON_USDT_CONTRACT_ADDRESS || ''
    if (!USDT_NILE_ADDRESS) return res.status(500).json({ error: 'TRON_USDT_CONTRACT_ADDRESS not configured' })

    const decimals = parseInt(process.env.TRON_USDT_DECIMALS || '6', 10)
    const sendAmount = BigInt(Math.floor(parseFloat(payout.amountUsd) * Math.pow(10, decimals)))

    const ownerAddress = tronWeb.address.fromPrivateKey(privateKey)

    const params = [
      { type: 'address', value: payout.toAddress },
      { type: 'uint256', value: sendAmount.toString() },
    ]

    const feeLimit = Number(process.env.TRON_FEE_LIMIT || '1000000000')
    const result = await tronWeb.transactionBuilder.triggerSmartContract(
      USDT_NILE_ADDRESS,
      'transfer(address,uint256)',
      { feeLimit },
      params,
      ownerAddress
    )

    if (!result || !result.transaction) {
      return res.status(500).json({ error: 'Failed to create transaction' })
    }

    const unsignedTx = result.transaction
    const signedTx = await tronWeb.trx.sign(unsignedTx, privateKey)

    await payoutRef.update({ status: 'signed', signedTx, signedAt: new Date().toISOString(), signedBy: uid })

    return res.status(200).json({ success: true, signedTx })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}