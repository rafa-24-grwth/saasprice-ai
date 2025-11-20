import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In production, you'd want to add authentication here
    // For development, this is fine
    
    console.log('🔧 Manual trigger of scheduled scrape...');
    
    // Call the cron endpoint with proper authorization
    const cronUrl = new URL('/api/cron/scheduled-scrape', request.url);
    
    const response = await fetch(cronUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to trigger scheduled scrape',
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled scrape triggered manually',
      result: data
    });

  } catch (error) {
    console.error('Error triggering scheduled scrape:', error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger scheduled scrape',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also create a GET endpoint for easy browser testing
export async function GET(request: NextRequest) {
  // Simple HTML page with a trigger button
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Manual Schedule Trigger</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #0a0a0a;
            color: #fafafa;
          }
          h1 { color: #fafafa; }
          button {
            background: #0070f3;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px 0;
          }
          button:hover { background: #0051cc; }
          button:disabled { 
            background: #333;
            cursor: not-allowed;
          }
          #result {
            margin-top: 20px;
            padding: 20px;
            background: #111;
            border-radius: 8px;
            white-space: pre-wrap;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            border: 1px solid #333;
          }
          .success { border-color: #0f0; color: #0f0; }
          .error { border-color: #f00; color: #f00; }
          .info { color: #888; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>🕐 Manual Schedule Trigger</h1>
        <p class="info">
          This page allows you to manually trigger the scheduled scraping job for testing purposes.
        </p>
        
        <button onclick="triggerSchedule()" id="triggerBtn">
          Trigger Scheduled Scrape
        </button>
        
        <button onclick="checkHealth()" id="healthBtn">
          Check Scraping Health
        </button>
        
        <button onclick="viewLogs()" id="logsBtn">
          View Recent Logs
        </button>
        
        <div id="result"></div>

        <script>
          async function triggerSchedule() {
            const btn = document.getElementById('triggerBtn');
            const result = document.getElementById('result');
            
            btn.disabled = true;
            btn.textContent = 'Triggering...';
            result.textContent = 'Triggering scheduled scrape...';
            result.className = '';
            
            try {
              const response = await fetch('/api/admin/trigger-schedule', {
                method: 'POST',
              });
              
              const data = await response.json();
              
              if (response.ok) {
                result.textContent = JSON.stringify(data, null, 2);
                result.className = 'success';
              } else {
                result.textContent = 'Error: ' + JSON.stringify(data, null, 2);
                result.className = 'error';
              }
            } catch (error) {
              result.textContent = 'Error: ' + error.message;
              result.className = 'error';
            } finally {
              btn.disabled = false;
              btn.textContent = 'Trigger Scheduled Scrape';
            }
          }
          
          async function checkHealth() {
            const btn = document.getElementById('healthBtn');
            const result = document.getElementById('result');
            
            btn.disabled = true;
            result.textContent = 'Checking health...';
            result.className = '';
            
            try {
              // This would call an endpoint to get health metrics
              result.textContent = 'Health check endpoint not implemented yet.\\nTODO: Add /api/admin/health endpoint';
              result.className = 'info';
            } finally {
              btn.disabled = false;
            }
          }
          
          async function viewLogs() {
            const btn = document.getElementById('logsBtn');
            const result = document.getElementById('result');
            
            btn.disabled = true;
            result.textContent = 'Fetching logs...';
            result.className = '';
            
            try {
              // This would call an endpoint to get recent logs
              result.textContent = 'Logs endpoint not implemented yet.\\nTODO: Add /api/admin/logs endpoint';
              result.className = 'info';
            } finally {
              btn.disabled = false;
            }
          }
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}