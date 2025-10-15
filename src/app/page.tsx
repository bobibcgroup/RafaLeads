'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to a sample dashboard token for demo purposes
    // In production, this would redirect to a login page or token input
    router.push('/dashboard/demo-token-123');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative z-10 text-center">
        <div className="glassmorphism-card p-12 rounded-xl max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-effect">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold gradient-text mb-4">
            AiRafa Leads Dashboard
          </h1>
          
          <p className="text-slate-300 mb-6">
            Futuristic real-time leads dashboard for AI clinic consultants
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-slate-500">
          <p>Access requires a valid dashboard token</p>
        </div>
      </div>
    </div>
  );
}
