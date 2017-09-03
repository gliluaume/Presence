import express from 'express'

const router = new express.Router()

router.post('/sessions', (req, res) => {
  setTimeout(() => {
    const [prefix] = req.body.email.split('@')
    if (prefix.toLowerCase() === String(req.body.password).toLowerCase()) {
      res.status(201).json({ status: 'authenticated' })
    } else {
      res.status(401).json({ status: 'authentication failed' })
    }
  }, 500)
})

export default router
