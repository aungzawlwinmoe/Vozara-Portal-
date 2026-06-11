# Vozarals.com Portal — External Integration Blueprint

This integration blueprint allows you to securely fetch email data (Inboxes, Sent folders, and mail synchronization metrics) from this Vozarals.com compliance portal into your other Google AI Studio or custom web applications.

---

## 🔒 Security & Authentication
By default, the endpoints of this portal run within the unified full-stack server container. To keep credentials hidden, **always execute API queries server-side** in your other AI Studio project (using standard `/api/*` proxies) rather than executing them directly in the browser.

---

## 📦 TypeScript Integration Script

Copy and paste the helper script below into your other project (e.g., as `src/utils/vozaralsClient.ts` or inside `server/vozarals.ts`):

```typescript
/**
 * Vozarals Compliance Mail System Connector
 */

export interface MailMessage {
  id: number;
  seq?: number;
  subject: string;
  from: string;
  fromEmail: string;
  fromName?: string;
  to: string;
  date: string;
  text: string;
  html?: string;
}

export interface MailboxResponse {
  success: boolean;
  messages: MailMessage[];
  resolvedFolder?: string;
  error?: string;
}

export interface PortalStatusResponse {
  success: boolean;
  imapConnected: boolean;
  smtpConnected: boolean;
  error?: string;
}

export class VozaralsPortalClient {
  private baseUrl: string;

  /**
   * Initializes the Vozarals portal connector.
   * @param portalUrl The absolute URL of your Voice/Vozarals portal instance
   * (e.g., "https://ais-dev-ppjtu446fim2t5hyvdbpt7-804579927704.asia-southeast1.run.app")
   */
  constructor(portalUrl: string) {
    // Normalize trailing slash
    this.baseUrl = portalUrl.replace(/\/+$/, "");
  }

  /**
   * Fetches messages from a specified mailbox account and folder.
   * 
   * @param email The target email address (e.g., "support@vozarals.com", "hr@vozarals.com", etc.)
   * @param folder The folder to fetch (typically 'INBOX' or 'Sent')
   */
  async fetchMailbox(
    email: string = "support@vozarals.com", 
    folder: "INBOX" | "Sent" = "INBOX"
  ): Promise<MailboxResponse> {
    const targetEmail = encodeURIComponent(email);
    const targetFolder = encodeURIComponent(folder);
    const targetUrl = `${this.baseUrl}/api/emails/inbox?email=${targetEmail}&folder=${targetFolder}`;

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        messages: [],
        error: err.message || "Unknown error connecting to Vozarals portal service."
      };
    }
  }

  /**
   * Checks the active connection status of the portal's mail server integration.
   */
  async checkPortalStatus(): Promise<PortalStatusResponse> {
    const targetUrl = `${this.baseUrl}/api/emails/status`;

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        imapConnected: false,
        smtpConnected: false,
        error: err.message || "Failed to query portal system integration health."
      };
    }
  }
}
```

---

## ⚡ Integration Usage Examples

### 1. In a backend Express/Vite endpoint of your *other* project:
```typescript
import { VozaralsPortalClient } from "./utils/vozaralsClient";

const client = new VozaralsPortalClient("https://ais-dev-ppjtu446fim2t5hyvdbpt7-804579927704.asia-southeast1.run.app");

// Route handler in your secondary workspace:
app.get("/api/external-vozarals-mail", async (req, res) => {
  const account = (req.query.email as string) || "support@vozarals.com";
  const folder = (req.query.folder as "INBOX" | "Sent") || "INBOX";

  const data = await client.fetchMailbox(account, folder);
  res.json(data);
});
```

### 2. Live Verification Test:
Below is some lightweight, self-executing code you can run on your other app's server to inspect mailbox connection success instantly:
```typescript
async function testSync() {
  const myUrl = "https://ais-dev-ppjtu446fim2t5hyvdbpt7-804579927704.asia-southeast1.run.app";
  const portal = new VozaralsPortalClient(myUrl);

  console.log("=== Checking Connection ===");
  const status = await portal.checkPortalStatus();
  console.log("Portal IMAP Connective Active?:", status.imapConnected);

  console.log("=== Fetching Sent Messages ===");
  const sentResult = await portal.fetchMailbox("support@vozarals.com", "Sent");
  console.log("Discovered Messages Total:", sentResult.messages.length);
  if (sentResult.messages.length > 0) {
    console.log("Sample Active Subject Line:", sentResult.messages[0].subject);
  }
}
```
