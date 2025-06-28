const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const { iconSizes, splashSizes } = require('./config')

function cleanOutput (folder) {
  fs.readdirSync(folder).forEach(f => fs.unlinkSync(path.join(folder, f)))
}

async function generateIcons (inputPath, outputFolder) {
  for (const size of iconSizes) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputFolder, `icon-${size}x${size}.png`))
  }
}

async function generateSplash (icon384Path, outputFolder) {
  for (const [width, height] of splashSizes) {
    const maxLogoWidth = Math.floor(width * 0.8)
    const maxLogoHeight = Math.floor(height * 0.5)

    const resizedLogoBuffer = await sharp(icon384Path)
      .resize({
        width: maxLogoWidth,
        height: maxLogoHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer()

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedLogoBuffer, gravity: 'center' }])
      .png()
      .toFile(path.join(outputFolder, `splash-${width}x${height}.png`))
  }
}

module.exports = {
  cleanOutput,
  generateIcons,
  generateSplash
}
