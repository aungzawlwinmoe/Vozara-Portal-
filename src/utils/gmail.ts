export const getGoogleAuthUrl = (clientId: string, redirectUri: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/gmail.send',
    include_granted_scopes: 'true',
    prompt: 'select_account'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const authenticateWithGoogle = (clientId: string): Promise<{ accessToken: string; expiry: number }> => {
  return new Promise((resolve, reject) => {
    const redirectUri = window.location.origin;
    const authUrl = getGoogleAuthUrl(clientId, redirectUri);
    
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${width},height=${height},top=${top},left=${left}`
    );
    
    if (!popup) {
      reject(new Error('Popup blocked! Please allow popups for Google authentication in your browser settings.'));
      return;
    }
    
    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer);
          reject(new Error('Authentication pop-up was closed before completion.'));
          return;
        }
        
        const currentUrl = popup.location.href;
        
        if (currentUrl.startsWith(redirectUri)) {
          clearInterval(timer);
          const hash = popup.location.hash;
          popup.close();
          
          if (!hash) {
            reject(new Error('No response parameters found in OAuth redirect.'));
            return;
          }
          
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const expiresIn = params.get('expires_in');
          const error = params.get('error');
          
          if (error) {
            reject(new Error(`OAuth Error: ${error}`));
            return;
          }
          
          if (accessToken) {
            const expiry = Date.now() + parseInt(expiresIn || '3600', 10) * 1000;
            resolve({ accessToken, expiry });
          } else {
            reject(new Error('No access token returned from Google.'));
          }
        }
      } catch (e) {
        // Cross-origin access exception is expected while user is completing authentication in popup
      }
    }, 200);
  });
};

export const getGmailUserProfile = async (accessToken: string): Promise<{ emailAddress: string }> => {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Gmail user details.');
  }
  
  return await response.json();
};

export const sendGmailEmail = async (
  accessToken: string,
  { to, from, subject, body }: { to: string; from: string; subject: string; body: string }
): Promise<any> => {
  // Construct RFC-2822 MIME message block
  const rawSubject = `=?utf-8?B?${btoa(encodeURIComponent(subject).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}?=`;
  const mimeLines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${rawSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(encodeURIComponent(body).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
  ];
  
  const mimeMessage = mimeLines.join('\r\n');
  const rawBase64Url = btoa(mimeMessage)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: rawBase64Url
    })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail API send failed: ${errText || response.statusText}`);
  }
  
  return await response.json();
};
