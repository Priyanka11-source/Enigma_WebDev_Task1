// Simple HTML rendering - no React imports to avoid module resolution issues
const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

try {
  // Render static HTML
  root.innerHTML = `
    <div style="min-height: 100vh; background: #010204; color: #e2e8f0; padding: 2rem; font-family: system-ui;">
      <div style="max-width: 50rem; margin: 0 auto;">
        <div style="border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 0.5rem; padding: 2rem; background: rgba(15, 23, 42, 0.2);">
          <h1 style="font-size: 1.75rem; font-weight: bold; color: #22d3ee; margin-bottom: 1.5rem;">
            🚀 Welcome to Your App!
          </h1>
          
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.375rem; padding: 1rem; margin-bottom: 2rem;">
            <p style="color: #10b981; font-weight: bold; margin: 0;">✅ App is Running Successfully!</p>
            <p style="color: rgba(226, 232, 240, 0.8); margin: 0.5rem 0 0 0;">Server: <strong>http://localhost:3000</strong></p>
          </div>
          
          <div style="background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 0.375rem; padding: 1.5rem; margin-bottom: 2rem;">
            <p style="color: #fbbf24; font-weight: bold; font-size: 1.1rem; margin: 0 0 1rem 0;">⚡ Quick Setup (5 minutes)</p>
            
            <div style="display: grid; gap: 1rem;">
              <!-- Firebase Setup -->
              <div style="background: rgba(0, 0, 0, 0.3); border-left: 3px solid #3b82f6; padding: 1rem; border-radius: 0.375rem;">
                <p style="color: #60a5fa; font-weight: bold; margin: 0 0 0.5rem 0;">1. Get Firebase API Key</p>
                <p style="color: rgba(226, 232, 240, 0.7); margin: 0 0 0.75rem 0; font-size: 0.9rem;">
                  Project: <code style="background: rgba(0, 0, 0, 0.5); padding: 0.2rem 0.5rem;">enduring-stage-5dzmz</code>
                </p>
                <a href="https://console.firebase.google.com/project/enduring-stage-5dzmz/settings/general" target="_blank" style="display: inline-block; background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none; font-weight: 500;">
                  → Open Firebase Console
                </a>
                <p style="color: rgba(226, 232, 240, 0.6); margin: 0.75rem 0 0 0; font-size: 0.85rem;">
                  Copy the <strong>Web API Key</strong> from Project Settings
                </p>
              </div>
              
              <!-- Gemini Setup -->
              <div style="background: rgba(0, 0, 0, 0.3); border-left: 3px solid #f59e0b; padding: 1rem; border-radius: 0.375rem;">
                <p style="color: #fbbf24; font-weight: bold; margin: 0 0 0.5rem 0;">2. Get Gemini API Key</p>
                <a href="https://makersuite.google.com/app/apikey" target="_blank" style="display: inline-block; background: #f59e0b; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none; font-weight: 500;">
                  → Get Gemini API Key
                </a>
                <p style="color: rgba(226, 232, 240, 0.6); margin: 0.75rem 0 0 0; font-size: 0.85rem;">
                  Create or copy your existing API key
                </p>
              </div>
              
              <!-- Update .env.local -->
              <div style="background: rgba(0, 0, 0, 0.3); border-left: 3px solid #ec4899; padding: 1rem; border-radius: 0.375rem;">
                <p style="color: #ec4899; font-weight: bold; margin: 0 0 0.5rem 0;">3. Update .env.local</p>
                <p style="color: rgba(226, 232, 240, 0.7); margin: 0 0 0.75rem 0; font-size: 0.85rem;">
                  Open the file in your project folder:
                </p>
                <code style="display: block; background: rgba(0, 0, 0, 0.5); padding: 0.75rem; border-radius: 0.25rem; overflow-x: auto; color: #10b981; font-family: monospace; font-size: 0.85rem; margin-bottom: 0.75rem;">
VITE_FIREBASE_API_KEY=<span style="color: #fbbf24;">your_api_key_here</span>
GEMINI_API_KEY=<span style="color: #fbbf24;">your_gemini_key_here</span>
                </code>
                <p style="color: rgba(226, 232, 240, 0.6); margin: 0; font-size: 0.85rem;">
                  Replace the values with your actual credentials
                </p>
              </div>
              
              <!-- Restart Server -->
              <div style="background: rgba(0, 0, 0, 0.3); border-left: 3px solid #10b981; padding: 1rem; border-radius: 0.375rem;">
                <p style="color: #10b981; font-weight: bold; margin: 0 0 0.5rem 0;">4. Restart the Server</p>
                <p style="color: rgba(226, 232, 240, 0.7); margin: 0 0 0.75rem 0; font-size: 0.85rem;">
                  Stop the current server (Ctrl+C) and run:
                </p>
                <code style="display: block; background: rgba(0, 0, 0, 0.5); padding: 0.75rem; border-radius: 0.25rem; color: #10b981; font-family: monospace; font-weight: bold;">
npm run dev
                </code>
              </div>
            </div>
          </div>
          
          <div style="background: rgba(30, 41, 59, 0.5); rounded: 0.375rem; padding: 1rem; border-top: 1px solid rgba(34, 211, 238, 0.2);">
            <p style="color: rgba(226, 232, 240, 0.8); margin: 0; font-size: 0.9rem;">
              <strong>📚 Need detailed help?</strong> Check <code style="background: rgba(0, 0, 0, 0.3); padding: 0.2rem 0.5rem;">SECURITY_SETUP.md</code> in your project folder
            </p>
          </div>
        </div>
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
