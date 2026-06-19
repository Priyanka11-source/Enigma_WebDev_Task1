import { Terminal } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#010204] text-[#e2e8f0] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="border border-cyan-500/30 rounded-lg p-6 bg-slate-900/20 backdrop-blur">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            Welcome to Your App!
          </h1>
          
          <p className="text-slate-300 mb-4">
            ✅ Server is running and React is rendering!
          </p>
          
          <div className="bg-slate-800/50 rounded p-4 mb-6 font-mono text-sm">
            <p className="text-yellow-400 mb-2">🔧 Configuration Status</p>
            <p className="text-slate-400">To complete setup, you need to:</p>
            <ol className="list-decimal list-inside mt-3 space-y-2 text-slate-300">
              <li>Configure Firebase credentials in <code className="bg-slate-700 px-2 py-1">.env.local</code></li>
              <li>Verify Gemini API key is set</li>
              <li>Review <code className="bg-slate-700 px-2 py-1">SECURITY_SETUP.md</code> for full instructions</li>
            </ol>
          </div>
          
          <div className="bg-cyan-900/20 border border-cyan-500/20 rounded p-4">
            <p className="text-cyan-300 font-semibold mb-2">App Status:</p>
            <ul className="text-sm space-y-1">
              <li>✅ React: Mounted</li>
              <li>✅ Server: Running on port 3000</li>
              <li>⚙️ Firebase: Needs configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
