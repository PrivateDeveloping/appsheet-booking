import { useState } from 'react';
import { ChevronDown, ChevronUp, FileSpreadsheet, Code, Globe, Shield, Workflow, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const appsScriptCode = `// Google Apps Script - Booking System Backend
// Deploy this as a Web App to get your API URL

const SHEET_NAME = 'Bookings';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'availability') {
    return getAvailability();
  }
  
  return jsonResponse({ success: false, error: 'Invalid action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'book') {
      return bookDate(data);
    }
    
    return jsonResponse({ success: false, error: 'Invalid action' });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function getAvailability() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const dates = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    dates.push({
      date: row[0],
      status: row[1] || 'available',
      bookedBy: row[2] || null,
      bookedAt: row[3] || null
    });
  }
  
  return jsonResponse({ success: true, data: { dates } });
}

function bookDate(data) {
  const { date, name, email } = data;
  
  if (!date || !name || !email) {
    return jsonResponse({ success: false, error: 'Missing required fields' });
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const dataRange = sheet.getDataRange().getValues();
  
  // Find the row with this date
  let rowIndex = -1;
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === date) {
      rowIndex = i + 1; // +1 because sheets are 1-indexed
      
      // Check if already booked
      if (dataRange[i][1] === 'booked') {
        return jsonResponse({ 
          success: false, 
          error: 'This date is already booked' 
        });
      }
      break;
    }
  }
  
  if (rowIndex === -1) {
    return jsonResponse({ success: false, error: 'Date not found' });
  }
  
  // Use lock to prevent race conditions
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    // Re-check availability after acquiring lock
    const currentStatus = sheet.getRange(rowIndex, 2).getValue();
    if (currentStatus === 'booked') {
      return jsonResponse({ 
        success: false, 
        error: 'This date was just booked by someone else' 
      });
    }
    
    // Update the row
    const timestamp = new Date().toISOString();
    sheet.getRange(rowIndex, 2).setValue('booked');
    sheet.getRange(rowIndex, 3).setValue(name);
    sheet.getRange(rowIndex, 4).setValue(email);
    sheet.getRange(rowIndex, 5).setValue(timestamp);
    
    return jsonResponse({ 
      success: true, 
      message: 'Booking confirmed!',
      data: { 
        booking: { 
          date, 
          status: 'booked', 
          bookedBy: name 
        } 
      } 
    });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper function to initialize the sheet with dates
function initializeSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    newSheet.appendRow(['Date', 'Status', 'BookedBy', 'Email', 'BookedAt']);
    
    // Add next 30 days as available
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      newSheet.appendRow([dateStr, 'available', '', '', '']);
    }
  }
}`;

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-foreground">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-card">{children}</div>}
    </div>
  );
}

function CodeBlock({ code, language = 'javascript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function SetupGuide() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Setup Guide</h2>
        <p className="text-muted-foreground">
          Follow these steps to connect your Google Sheets backend
        </p>
      </div>

      <Section
        title="1. Google Sheet Structure"
        icon={<FileSpreadsheet className="w-5 h-5 text-primary" />}
        defaultOpen
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a Google Sheet with a sheet named "Bookings" with these columns:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Column</th>
                  <th className="border border-border p-2 text-left">Description</th>
                  <th className="border border-border p-2 text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-mono">A: Date</td>
                  <td className="border border-border p-2">Date in YYYY-MM-DD format</td>
                  <td className="border border-border p-2">2024-12-15</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">B: Status</td>
                  <td className="border border-border p-2">"available" or "booked"</td>
                  <td className="border border-border p-2">available</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">C: BookedBy</td>
                  <td className="border border-border p-2">Name of person who booked</td>
                  <td className="border border-border p-2">John Doe</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">D: Email</td>
                  <td className="border border-border p-2">Email of person who booked</td>
                  <td className="border border-border p-2">john@example.com</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">E: BookedAt</td>
                  <td className="border border-border p-2">Timestamp of booking</td>
                  <td className="border border-border p-2">2024-12-10T14:30:00Z</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section
        title="2. Google Apps Script Code"
        icon={<Code className="w-5 h-5 text-primary" />}
      >
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open your Google Sheet</li>
            <li>Go to Extensions → Apps Script</li>
            <li>Delete any existing code and paste this:</li>
          </ol>
          <CodeBlock code={appsScriptCode} />
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground" start={4}>
            <li>Save the script (Ctrl+S)</li>
            <li>Run the <code className="bg-muted px-1 rounded">initializeSheet</code> function once to set up your sheet</li>
          </ol>
        </div>
      </Section>

      <Section
        title="3. Deploy as Web App"
        icon={<Globe className="w-5 h-5 text-primary" />}
      >
        <div className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
            <li>In Apps Script, click <strong>Deploy → New deployment</strong></li>
            <li>Click the gear icon and select <strong>Web app</strong></li>
            <li>Set these options:
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Description: "Booking API"</li>
                <li>Execute as: <strong>Me</strong></li>
                <li>Who has access: <strong>Anyone</strong></li>
              </ul>
            </li>
            <li>Click <strong>Deploy</strong> and authorize the app</li>
            <li>Copy the <strong>Web app URL</strong> - this is your API endpoint</li>
            <li>Update the <code className="bg-muted px-1 rounded">API_URL</code> in <code className="bg-muted px-1 rounded">src/hooks/useBooking.ts</code></li>
          </ol>
        </div>
      </Section>

      <Section
        title="4. Security Considerations"
        icon={<Shield className="w-5 h-5 text-primary" />}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Why Apps Script is Required</h4>
            <p className="text-sm text-muted-foreground">
              React runs in the browser, and browsers cannot directly access Google Sheets due to CORS restrictions 
              and authentication requirements. Apps Script acts as a secure serverless middleware that:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
              <li>Authenticates with Google Sheets on your behalf</li>
              <li>Handles CORS headers for browser requests</li>
              <li>Validates and sanitizes input data</li>
              <li>Prevents unauthorized modifications to your data</li>
            </ul>
          </div>
          <div className="p-3 bg-accent/50 border border-accent-foreground/10 rounded-lg">
            <p className="text-sm text-accent-foreground">
              <strong>Note:</strong> The "Anyone" access setting means anyone with the URL can call your API. 
              For production, consider adding API key validation or other authentication.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="5. Architecture & Limitations"
        icon={<Workflow className="w-5 h-5 text-primary" />}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Data Flow</h4>
            <div className="flex items-center justify-center gap-4 py-4 text-sm">
              <span className="px-3 py-2 bg-primary/10 text-primary rounded-lg">React App</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-2 bg-primary/10 text-primary rounded-lg">Apps Script</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-2 bg-primary/10 text-primary rounded-lg">Google Sheets</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Limitations</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
              <li><strong>Quota:</strong> Apps Script has daily quotas (20,000 URL fetches, 6 min execution time)</li>
              <li><strong>Speed:</strong> Cold starts can take 1-3 seconds</li>
              <li><strong>Race conditions:</strong> The script uses LockService, but under extreme load, conflicts are possible</li>
              <li><strong>Scale:</strong> Best for ~100-1000 bookings/day; beyond that, use a real backend</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">When to Use a Real Backend</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
              <li>High traffic ({">"} 1000 requests/day)</li>
              <li>Complex business logic or integrations</li>
              <li>Real-time updates needed (use WebSockets)</li>
              <li>Strict latency requirements ({"<"} 200ms)</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
