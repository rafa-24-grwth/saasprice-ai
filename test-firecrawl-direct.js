// test-firecrawl-direct.js
async function testFirecrawlDirect() {
    const response = await fetch('http://localhost:3000/api/test/firecrawl-direct', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({vendor_slug: 'slack'})
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  }
  testFirecrawlDirect();