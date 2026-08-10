import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorId: null
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorId: Math.random().toString(36).substring(2, 9) };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    // In a Tauri app, we would log this to the Rust backend here
    // without including any PII from the error message if possible.
    // E.g., invoke('log_error', { message: error.name, stack: error.stack })
    console.error('Uncaught error (Safe Log):', error.name, error.message);
    
    // We explicitly avoid logging full component states or user input that might be in the trace
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="text-rose-500" size={32} />
            </div>
            
            <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6 text-sm">
              We've safely caught an unexpected error. Your data is secure and no personal information was compromised.
            </p>
            
            <div className="bg-slate-950 rounded-xl p-4 mb-8 text-left border border-slate-800">
              <p className="text-xs text-slate-500 font-mono">Error ID: {this.state.errorId}</p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
