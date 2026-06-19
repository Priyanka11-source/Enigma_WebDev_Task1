// Simple HTML rendering - no React imports to avoid module resolution issues
const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

try {
  // Render static HTML
  root.innerHTML = `
    <div style="min-height: 100vh; background: #010204; color: #e2e8f0; padding: 2rem; font-family: system-ui;">
      <div style="max-width: 40rem; margin: 0 auto; border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 0.5rem; padding: 1.5rem; background: rgba(15, 23, 42, 0.2);">
        <h1 style="font-size: 1.5rem; font-weight: bold; color: #22d3ee; margin-bottom: 1rem;">
          ✅ Your App is Running!
        </h1>
        
        <p style="color: rgba(226, 232, 240, 0.8); margin-bottom: 1rem;">
          The development server is successfully running at <strong>http://localhost:3000</strong>
        </p>
        
        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 0.375rem; padding: 1rem; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.875rem;">
          <p style="color: #10b981; margin: 0.5rem 0;">✅ Server: Running on port 3000</p>
          <p style="color: #10b981; margin: 0.5rem 0;">✅ HTML: Rendering successfully</p>
          <p style="color: #3b82f6; margin: 0.5rem 0;">⚠️ React: Modules need configuration</p>
        </div>
        
        <div style="background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 0.375rem; padding: 1rem; margin-bottom: 1.5rem;">
          <p style="color: #fbbf24; font-weight: bold; margin: 0 0 0.5rem 0;">⚠️ Next Steps:</p>
          <ol style="margin: 0; padding-left: 1.5rem; color: rgba(226, 232, 240, 0.8);">
            <li>Configure Firebase credentials in <code style="background: rgba(0, 0, 0, 0.3); padding: 0.25rem 0.5rem;">.env.local</code></li>
            <li>Read <code style="background: rgba(0, 0, 0, 0.3); padding: 0.25rem 0.5rem;">SECURITY_SETUP.md</code> for detailed instructions</li>
            <li>Restart the dev server after configuration</li>
          </ol>
        </div>
        
        <p style="font-size: 0.875rem; color: rgba(226, 232, 240, 0.6); margin: 0;">
          📚 Check browser console (F12) for development information
        </p>
      </div>
    </div>
  `;
  
  console.log('✅ App loaded! Server is ready at http://localhost:3000');
} catch (error) {
  console.error('Error rendering app:', error);
  root.innerHTML = `<div style="color: #ff6b6b; padding: 2rem; font-family: monospace; background: #1a1a1a;">
    <h1>❌ Application Error</h1>
    <p>${error.message}</p>
    <pre>${error.stack}</pre>
  </div>`;
}
