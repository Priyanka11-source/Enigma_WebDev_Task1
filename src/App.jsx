import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import { Terminal } from "lucide-react";
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out fail:", error);
    }
  };
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#010204] font-sans" id="loading-spinner">
        <div className="text-center">
          <div className="w-14 h-14 bg-slate-905 border-[1.5px] border-cyan-500/40 rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin shadow-[0_0_25px_rgba(6,182,212,0.45)]">
            <Terminal className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_5px_rgba(6,182,212,0.7)]" />
          </div>
          <h2 className="text-xs font-bold tracking-widest text-[#22d3ee] uppercase font-mono filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse">Initializing Vault...</h2>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#010204] text-[#e2e8f0] selection:bg-cyan-500/20 selection:text-cyan-200" id="main-app">
      {user ? <Dashboard onLogout={handleLogout} /> : <AuthPage onAuthSuccess={() => {
  }} />}
    </div>;
}
