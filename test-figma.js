// test-figma.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Going to Figma pricing...');
  await page.goto('https://www.figma.com/pricing/');
  
  // Handle cookie banner if present
  try {
    await page.click('button:has-text("Opt-Out")', { timeout: 2000 });
    console.log('Dismissed cookie banner');
  } catch (e) {
    // Cookie banner might not be there
  }
  
  // Wait for content
  await page.waitForTimeout(3000);
  
  // Extract pricing data
  const pricingData = await page.evaluate(() => {
    const plans = [];
    
    // Find all elements with price class
    const priceElements = document.querySelectorAll('[class*="price"]');
    priceElements.forEach(el => {
      const text = el.textContent || '';
      if (text.includes('$')) {
        // Look for the parent card/container
        let parent = el.parentElement;
        while (parent && !parent.querySelector('h3')) {
          parent = parent.parentElement;
        }
        
        if (parent) {
          const planName = parent.querySelector('h3')?.textContent || 'Unknown';
          plans.push({
            name: planName,
            price: text,
            element: el.className
          });
        }
      }
    });
    
    return plans;
  });
  
  console.log('Found pricing plans:', pricingData);
  
  await browser.close();
})();