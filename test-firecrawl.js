// test-firecrawl.js
async function testFirecrawl() {
  // Put your key in quotes - it's a string!
  const FIRECRAWL_API_KEY = 'fc-a51497d08e1e497099a6d953d86ceecb'; 
  
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://stripe.com/pricing',
      pageOptions: {
        includeMarkdown: true,
        waitFor: 2000
      }
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Firecrawl working!');
    console.log('Title:', data.data?.metadata?.title);
    console.log('Found content length:', data.data?.markdown?.length);
  } else {
    console.log('❌ Error:', data);
  }
}

testFirecrawl();