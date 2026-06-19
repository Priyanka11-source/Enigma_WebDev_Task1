import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Shield, Mail, Lock, User, Terminal, Layers } from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error("Name is required");
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      console.error("Auth action failed:", err);
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = "This email is already in use.";
      } else if (err.code === 'auth/weak-password') {
        message = "The password must be at least 6 characters.";
      } else if (err.code === 'auth/invalid-credential') {
        message = "Incorrect email address or password.";
      } else if (err.code === 'auth/missing-password') {
        message = "Please enter your password.";
      } else if (err.code === 'auth/operation-not-allowed') {
        message = (
          <span className="block leading-relaxed">
            <strong className="block mb-1">Email/Password Login Disabled:</strong>
            Email/Password authentication has not been enabled for your Firebase project. To enable it, please visit the{' '}
            <a 
              href="https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/providers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-bold text-rose-800 hover:text-rose-950 inline-flex items-center"
            >
              Firebase Console &rarr;
            </a>{' '}
            and enable "Email/Password" in the Sign-in method tab. Alternatively, use <strong>Google Sign-In</strong> below.
          </span>
        );
      } else if (err.code === 'auth/admin-restricted-operation') {
        message = (
          <span className="block leading-relaxed">
            <strong className="block mb-1">Signup Restrained by Admin:</strong>
            User account creation is restricted in your Firebase settings. Please sign in with <strong>Google Sign-In</strong> below, or ensure "Enable create (sign up)" is enabled under User actions in your{' '}
            <a 
              href="https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/settings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-bold text-rose-800 hover:text-rose-950 inline-flex items-center"
            >
              Firebase Auth Settings &rarr;
            </a>.
          </span>
        );
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInAnonymously(auth);
      onAuthSuccess();
    } catch (err) {
      console.error(err);
      let message = "Failed to sign in anonymously. Please try creating an account.";
      if (err.code === 'auth/operation-not-allowed') {
        message = (
          <span className="block leading-relaxed">
            <strong className="block mb-1">Anonymous Login Disabled:</strong>
            Anonymous sign-in has not been enabled for your Firebase project. To enable it, please visit the{' '}
            <a 
              href="https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/providers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-bold text-rose-800 hover:text-rose-950 inline-flex items-center"
            >
              Firebase Console &rarr;
            </a>{' '}
            and enable "Anonymous" in the Sign-in method tab. Alternatively, use <strong>Google Sign-In</strong> below.
          </span>
        );
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      let message = err.message;
      if (err.code === 'auth/operation-not-allowed') {
        message = (
          <span className="block leading-relaxed">
            <strong className="block mb-1">Google Login Disabled:</strong>
            Google Sign-In has not been enabled for your Firebase project. Please go to the{' '}
            <a 
              href="https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/providers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-bold text-rose-800 hover:text-rose-950 inline-flex items-center"
            >
              Firebase Console &rarr;
            </a>{' '}
            and click "Add new provider" then select "Google".
          </span>
        );
      } else if (err.code === 'auth/popup-blocked') {
        message = "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = "The sign-in popup was closed before completing authentication. Please try again.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#010205] px-4 py-12 relative overflow-hidden" id="auth-page">
      {/* Sleek space-themed background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.18)_0%,transparent_60%)] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-14 h-14 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-fuchsia-500/30 blur-md animate-pulse"></div>
            <div className="absolute inset-0 rounded-2xl border border-cyan-500/50 bg-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.65)]">
              <Layers className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.85)]" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold font-mono tracking-[0.15em] text-white flex items-center gap-2">
            CODEXGATE <span className="text-[10px] bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black px-2.5 py-0.5 border border-cyan-500/40 rounded-full font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]">WORKSPACE</span>
          </h1>
          <p className="text-slate-400 text-[10px] mt-2 text-center font-bold font-mono uppercase tracking-wider max-w-xs opacity-90">
            Advanced CS Study Workstation & AI Oracle
          </p>
        </div>

        <div className="bg-[#0a1124]/96 backdrop-blur-md rounded-2xl p-8 border-[1.5px] border-cyan-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.35)]">
          <div className="flex border-b border-white/10 pb-3 mb-6">
            <button
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 text-center font-bold text-xs uppercase tracking-wider pb-2.5 border-b-2 transition-all cursor-pointer ${
                !isRegistering 
                  ? 'text-cyan-400 border-cyan-400 font-extrabold filter drop-shadow-[0_0_8px_rgba(6,182,212,0.65)]' 
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 text-center font-bold text-xs uppercase tracking-wider pb-2.5 border-b-2 transition-all cursor-pointer ${
                isRegistering 
                  ? 'text-cyan-400 border-cyan-400 font-extrabold filter drop-shadow-[0_0_8px_rgba(6,182,212,0.65)]' 
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-[9.5px] font-extrabold font-mono text-slate-300 uppercase tracking-widest mb-1.5 filter drop-shadow-[0_0_1px_rgba(255,255,255,0.05)]">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alan Turing"
                    className="w-full bg-slate-950 border border-cyan-500/25 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans text-xs font-semibold shadow-inner"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9.5px] font-extrabold font-mono text-slate-300 uppercase tracking-widest mb-1.5 filter drop-shadow-[0_0_1px_rgba(255,255,255,0.05)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-slate-950 border border-cyan-500/25 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans text-xs font-semibold shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9.5px] font-extrabold font-mono text-slate-300 uppercase tracking-widest mb-1.5 filter drop-shadow-[0_0_1px_rgba(255,255,255,0.05)]">
                Passwords Keys
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-cyan-500/25 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans text-xs font-semibold shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber-cyan font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.45)] hover:shadow-[0_0_22px_rgba(6,182,212,0.7)] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-widest"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  {isRegistering ? 'Initialize Environment' : 'Authenticate Console'}
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[9px] font-mono uppercase tracking-widest font-black">Or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-cyan-500/20 hover:border-cyan-500/40 text-slate-200 font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs mb-3 font-sans active:scale-[0.98]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="100%" height="100%">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.43-1.06-.98-1.06-1.51z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-200">Sign In with Google</span>
          </button>

          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full bg-transparent hover:bg-cyan-950/15 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-extrabold py-2.5 px-4 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-mono tracking-wider active:scale-[0.98]"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            ANONYMOUS ENVIRONMENT
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-400 mt-6 font-bold font-mono tracking-widest flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>SECURE SYSTEM ACCESS v2.5 / LIVE_DATABASE</span>
        </div>
      </div>
    </div>
  );
}
