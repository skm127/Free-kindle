const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Navigating to Google Drive folder...');
  await page.goto('https://drive.google.com/drive/u/0/folders/15EwYfbQSy8lfjqvP4q5YnUPaECFTnVhv', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for file elements...');
  // Wait for the grid or list of files to render
  try {
    await page.waitForSelector('c-wiz[data-item-id]', { timeout: 10000 });
  } catch (e) {
    console.log('Timeout waiting for data-item-id. Trying to extract from page source...');
  }
  
  // Extract file names and IDs from DOM
  const files = await page.evaluate(() => {
    const items = document.querySelectorAll('c-wiz[data-item-id]');
    const results = [];
    items.forEach(item => {
      const id = item.getAttribute('data-item-id');
      const nameEl = item.querySelector('[aria-label]');
      let name = nameEl ? nameEl.getAttribute('aria-label') : '';
      
      // Clean up aria-label (usually "File name.pdf, File")
      if (name.includes(',')) {
        name = name.substring(0, name.lastIndexOf(',')).trim();
      }
      
      if (id && name && !results.some(r => r.id === id)) {
        results.push({ id, name });
      }
    });
    return results;
  });
  
  console.log(`Found ${files.length} files from DOM.`);
  
  if (files.length === 0) {
    console.log('Attempting to parse window._docs_x or script tags...');
    // Fallback: Dump page HTML to let us inspect it if DOM extraction fails
    const html = await page.content();
    fs.writeFileSync('gdrive_dump.html', html);
    console.log('Dumped HTML to gdrive_dump.html');
  } else {
    fs.writeFileSync('gdrive_books.json', JSON.stringify(files, null, 2));
    console.log('Saved to gdrive_books.json');
  }

  await browser.close();
})();
