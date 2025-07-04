import { useState } from 'react';
import { Shield, Github, Code, BookOpen } from 'lucide-react';
import { WalletConnection } from './components/WalletConnection';
import { CreateMessage } from './components/CreateMessage';
import { ReadMessage } from './components/ReadMessage';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'read'>('create');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SecureChain Messages</h1>
                  <p className="text-xs text-gray-400">Blockchain-based secure messaging</p>
                </div>
              </div>
              <WalletConnection user={user} onUserChange={setUser} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!user ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-6">
                <Shield className="h-10 w-10 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to SecureChain Messages
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                A demonstration of secure blockchain storage for encrypted messages. 
                Built for Go developers to understand decentralized data storage patterns.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                  <Code className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Asymmetric Encryption</h3>
                  <p className="text-sm text-gray-300">Messages are encrypted using public-key cryptography</p>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                  <Shield className="h-8 w-8 text-purple-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Blockchain Storage</h3>
                  <p className="text-sm text-gray-300">Encrypted data is stored securely on Near blockchain</p>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                  <BookOpen className="h-8 w-8 text-green-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Educational Example</h3>
                  <p className="text-sm text-gray-300">Clean, readable code for learning blockchain patterns</p>
                </div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-white mb-2">Get Started</h3>
                <p className="text-gray-300 mb-4">Connect your Near wallet to begin creating and reading secure messages</p>
                <p className="text-sm text-gray-400">
                  This is a demonstration with mocked blockchain calls. 
                  Real smart contract integration can be added later.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Tab Navigation */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'create'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    Create Message
                  </button>
                  <button
                    onClick={() => setActiveTab('read')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'read'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    Read Message
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'create' ? (
                  <CreateMessage user={user} />
                ) : (
                  <ReadMessage />
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">SecureChain Messages - Educational Demo</span>
              </div>
              <div className="flex items-center space-x-6">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span className="text-sm">View Source</span>
                </a>
                <span className="text-sm text-gray-500">Built for Go developers</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;