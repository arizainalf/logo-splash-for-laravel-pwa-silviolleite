const express = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const archiver = require('archiver')

const {
  cleanOutput,
  generateIcons,
  generateSplash
} = require('../utils/imageUtils')

const router = express.Router()

// Ensure folders
;['uploads', 'public/output'].forEach(folder => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'logo.png')
})
const upload = multer({ storage })

router.get('/', (req, res) => {
  res.render('index')
})

router.post('/generate', upload.single('logo'), async (req, res) => {
  try {
    const inputPath = req.file.path
    const outputFolder = path.join(__dirname, '../public/output')
    cleanOutput(outputFolder)

    await generateIcons(inputPath, outputFolder)
    const icon384Path = path.join(outputFolder, 'icon-384x384.png')
    await generateSplash(icon384Path, outputFolder)

    res.redirect('/output')
  } catch (err) {
    console.error(err)
    res.send('❌ Error generating images.')
  }
})

router.get('/output', (req, res) => {
  const outputFolder = path.join(__dirname, '../public/output')
  fs.readdir(outputFolder, (err, files) => {
    if (err) return res.send('❌ Error reading output.')
    const images = files.filter(f => f.endsWith('.png')).sort()
    res.render('output', { images })
  })
})

router.post('/download-zip', (req, res) => {
  const { files } = req.body
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).send('No files selected.')
  }

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="selected_images.zip"'
  })

  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.pipe(res)

  files.forEach(file => {
    const filePath = path.join(__dirname, '../public/output', file)
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file })
    }
  })

  archive.finalize()
})

module.exports = router
