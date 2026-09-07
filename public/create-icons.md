# Icon Generation Instructions

To create the PWA icons, you need to generate PNG files from the SVG favicon:

1. **Convert SVG to PNG using an online tool:**
   - Visit: https://cloudconvert.com/svg-to-png
   - Upload `public/favicon.svg`
   - Export as 192x192 PNG and save as `public/icon-192.png`
   - Export as 512x512 PNG and save as `public/icon-512.png`

2. **Or use a command-line tool:**
   ```bash
   # Using ImageMagick (if installed)
   convert public/favicon.svg -resize 192x192 public/icon-192.png
   convert public/favicon.svg -resize 512x512 public/icon-512.png
   ```

3. **Or use a Node.js library:**
   ```bash
   npm install sharp svg2img
   node scripts/generate-icons.js
   ```

After generating the icons, the PWA will be fully functional with proper app icons.