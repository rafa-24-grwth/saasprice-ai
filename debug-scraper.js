// debug-scraper.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage();
  
  console.log('Going to Figma pricing...');
  await page.goto('https://www.figma.com/pricing/');
  
  // Wait for page to load
  await page.waitForTimeout(5000);
  
  // Take a screenshot
  await page.screenshot({ path: 'figma-pricing.png' });
  
  // Try different selectors
  const selectors = [
    '[data-testid*="price"]',
    '[class*="pricing"]',
    '[class*="price"]',
    '[class*="plan"]',
    'h2',
    'h3',
    'button'
  ];
  
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`Found ${count} elements with selector: ${selector}`);
      const first = await page.locator(selector).first().textContent();
      console.log(`  First text: ${first?.substring(0, 50)}`);
    }
  }
  
  // Get all text content
  const allText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 500);
  });
  
  console.log('\nPage text preview:', allText);
  console.log('\nScreenshot saved as figma-pricing.png');
  
  // Keep browser open for 10 seconds to see
  await page.waitForTimeout(10000);
  await browser.close();
})();