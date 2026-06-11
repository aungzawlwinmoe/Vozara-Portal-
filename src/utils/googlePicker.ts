declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export function loadPickerAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.picker) {
      resolve();
      return;
    }

    if (window.gapi) {
      window.gapi.load('picker', {
        callback: () => {
          resolve();
        },
        onerror: () => {
          reject(new Error('Failed to load Google Picker library'));
        }
      });
    } else {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.defer = true;
      script.async = true;
      script.onload = () => {
        if (window.gapi) {
          window.gapi.load('picker', {
            callback: () => resolve(),
            onerror: () => reject(new Error('Failed to load Google Picker library')),
          });
        } else {
          reject(new Error('gapi object not loaded'));
        }
      };
      script.onerror = () => reject(new Error('gapi script fail'));
      document.body.appendChild(script);
    }
  });
}

export function openGooglePicker(
  accessToken: string,
  onFileSelected: (file: { name: string; sizeBytes: number; url: string; driveId: string }) => void
): void {
  const pickerOrigin =
    window.location.ancestorOrigins &&
    window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  try {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
    view.setIncludeFolders(false);

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          onFileSelected({
            name: file.name,
            sizeBytes: file.sizeBytes || 1048576, // 1 MB fallback size
            url: file.url || `https://drive.google.com/file/d/${file.id}/view`,
            driveId: file.id,
          });
        }
      })
      .setOrigin(pickerOrigin)
      .build();
    
    picker.setVisible(true);
  } catch (error) {
    console.error('Error spawning Google Picker:', error);
    alert('Warning: Google Picker is restricted in strict iframe runtimes. Open in new tab or check console if popup blocks.');
  }
}
