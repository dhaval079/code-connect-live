import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Bot, MessageSquare, Users, Sparkles, 
  Code, Gift, Terminal, Zap, Check
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  status: string;
  role: string;
}
interface AISuggestion {
  id: number;
  type: string;
  content: string;
  code: string;
}

interface Message {
  id: number;
  user: string;
  content: string;
}
const EnhancedInteractiveDemo = () => {
  const [demoState, setDemoState] = useState('initial');
  const [code, setCode] = useState(`// Let's build something amazing together\nfunction optimizeCode() {\n  // Start coding...\n}`);
  const [messages, setMessages] = useState<Message[]>([]);
 
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const controls = useAnimation();
  const editorRef = useRef(null);

  // Synthetic typing effect
  const typeCode = async (finalCode:any) => {
    const chars = finalCode.split('');
    let currentCode = '';
    
    for (const char of chars) {
      currentCode += char;
      setCode(currentCode);
      // Variable delay for more natural typing
      await new Promise(r => setTimeout(r, Math.random() * 10 + 30));
    }
  };

  // Demo sequence with enhanced interactions
  useEffect(() => {
    const demoSequence = async () => {
      // Initial setup
      setDemoState('connecting');
      await controls.start({ opacity: 1, y: 0 });
      
      // User 1 joins
      setActiveUsers([
        { id: 1, name: 'Sarah Chen', status: 'active', role: 'Frontend Dev' },
        { id: 2, name: 'Alex Rivera', status: 'active', role: 'Backend Dev' }
      ]);
      
      // Start coding
      setDemoState('coding');
      await typeCode(`function optimizePerformance(code: string) {
  // Analyze code structure
  const analysis = analyzeComplexity(code);
  
  // Apply optimizations
  return applyBestPractices(analysis);
}`);

      // AI Assistant suggestion
      setDemoState('ai-suggesting');
      setAiSuggestions([{
        id: 1,
        type: 'improvement',
        content: 'Consider adding error handling for invalid inputs',
        code: `function optimizePerformance(code: string) {
  if (!code) throw new Error('Code input required');
  
  // Analyze code structure
  const analysis = analyzeComplexity(code);
  
  // Apply optimizations
  return applyBestPractices(analysis);
}`,
      }]);

      // User 2 joins
      await new Promise(r => setTimeout(r, 1000));
      setActiveUsers(prev => [...prev, 
        { id: 2, name: 'Alex Rivera', status: 'active', role: 'Backend Dev' }
      ]);

      // Chat interaction
      setDemoState('collaborating');
      setMessages([
        { id: 1, user: 'Sarah Chen', content: 'Added base optimization function' },
        { id: 2, user: 'Alex Rivera', content: 'Good catch by AI on error handling' },
        { id: 3, user: 'AI Assistant', content: 'Would you like some improvements' },
      ]);

      // Reset and loop
      await new Promise(r => setTimeout(r, 3000));
      setDemoState('initial');
      demoSequence();
    };

    demoSequence();
  }, []);

  return (
    <div className="relative max-w-4xl max-h-2xl mx-auto mt-36 mb-36">
      {/* Main Container */}
      <motion.div
        className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
      >
        {/* Feature Navigation */}
        <div className="border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {[
                { icon: Code, label: 'Editor', state: 'coding' },
                { icon: Bot, label: 'AI Assistant', state: 'ai-suggesting' },
                { icon: Users, label: 'Collaboration', state: 'collaborating' },
                { icon: Terminal, label: 'Console', state: 'debugging' }
              ].map((feature) => (
                <motion.div
                  key={feature.label}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer
                    ${demoState === feature.state ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <feature.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Active Users */}
            <div className="flex items-center space-x-2">
              {activeUsers.map((user) => (
                <motion.div
                  key={user.id}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-green-500 absolute -top-0.5 -right-0.5" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                      <span className="text-xs font-bold text-white flex items-center justify-center h-full">
                        {user.name[0]}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-slate-300">{user.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6 p-6 h-[600px]">
          {/* Code Editor */}
          <div className="col-span-2 relative">
            <motion.div
              ref={editorRef}
              className="h-full bg-slate-950 rounded-xl p-6 font-mono text-sm overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Editor Chrome */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-900">
                    <Gift className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400">main</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="px-3 py-1 rounded-md bg-blue-400/10 text-blue-400 text-xs"
                    animate={{
                      opacity: demoState === 'coding' ? 1 : 0.5
                    }}
                  >
                    <Zap className="w-4 h-4 inline-block mr-1" />
                    Live Collaboration
                  </motion.div>
                </div>
              </div>

              {/* Code Area */}
              <pre className="relative text-slate-300">
                <code>{code}</code>

                {/* Typing Indicator */}
                {demoState === 'coding' && (
                  <motion.div
                    className="absolute bottom-4 right-4 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-xs text-blue-400">typing...</span>
                  </motion.div>
                )}
              </pre>
            </motion.div>

            {/* AI Suggestions Overlay */}
            <AnimatePresence>
              {demoState === 'ai-suggesting' && (
                <motion.div
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {aiSuggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 mb-4 max-w-sm"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <Bot className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">AI Suggestion</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{suggestion.content}</p>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm flex items-center space-x-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Apply</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat & Collaboration Panel */}
          <div className="space-y-6">
            {/* Team Chat */}
            <motion.div
              className="h-1/2 bg-slate-950 rounded-xl p-4"
              animate={{
                borderColor: demoState === 'collaborating' ? 'rgba(59, 130, 246, 0.5)' : 'transparent'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-slate-200">Team Chat</span>
                </div>
                <motion.div
                  className="px-2 py-1 rounded-md bg-slate-900 text-xs text-slate-400"
                  animate={{
                    opacity: messages.length > 0 ? 1 : 0.5
                  }}
                >
                  {messages.length} messages
                </motion.div>
              </div>

              <div className="space-y-4 h-[calc(100%-4rem)] overflow-y-auto">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{message.user[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-slate-300">{message.user}</span>
                          <span className="text-xs text-slate-500">just now</span>
                        </div>
                        <p className="text-sm text-slate-400">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              className="h-1/2 bg-slate-950 rounded-xl p-4"
              animate={{
                borderColor: demoState === 'debugging' ? 'rgba(59, 130, 246, 0.5)' : 'transparent'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-slate-200">Activity</span>
                </div>
              </div>

              <div className="space-y-2">
                {activeUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{user.name[0]}</span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 
                          ${user.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.status === 'active' && (
                        <motion.div
                          className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs"
                          animate={{
                            scale: [1, 1.05, 1],
                            transition: { duration: 2, repeat: Infinity }
                          }}
                        >
                          Active
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Connection Status */}
              <motion.div
                className="flex items-center space-x-2"
                animate={{
                  color: demoState === 'connecting' ? '#60A5FA' : '#34D399'
                }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  animate={{
                    backgroundColor: demoState === 'connecting' ? '#60A5FA' : '#34D399',
                    scale: [1, 1.2, 1],
                    transition: { duration: 2, repeat: Infinity }
                  }}
                />
                <span className="text-sm">
                  {demoState === 'connecting' ? 'Connecting...' : 'Connected'}
                </span>
              </motion.div>

              {/* Active Features */}
              <div className="flex items-center space-x-4">
                {[
                  { icon: Code, label: 'Editor' },
                  { icon: Bot, label: 'AI' },
                  { icon: Users, label: 'Team' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-1 text-slate-400"
                    whileHover={{ color: '#60A5FA' }}
                  >
                    <feature.icon className="w-4 h-4" />
                    <span className="text-xs">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Real-time Indicators */}
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center space-x-2 text-slate-400"
                animate={{
                  opacity: demoState === 'coding' ? 1 : 0.5
                }}
              >
                <Zap className="w-4 h-4" />
                <span className="text-xs">Real-time sync enabled</span>
              </motion.div>

              <motion.div
                className="flex items-center space-x-2 text-slate-400"
                animate={{
                  opacity: demoState === 'ai-suggesting' ? 1 : 0.5
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">AI Assistant active</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Highlights */}
      <AnimatePresence>
        {demoState !== 'initial' && (
          <motion.div
            className="absolute -bottom-22 left-1.5 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center space-x-8">
              {[
                { state: 'coding', icon: Code, label: 'Real-time Editing' },
                { state: 'ai-suggesting', icon: Bot, label: 'AI Assistance' },
                { state: 'collaborating', icon: Users, label: 'Team Collaboration' },
                { state: 'debugging', icon: Terminal, label: 'Live Debugging' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full
                    ${demoState === feature.state ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}
                  animate={{
                    scale: demoState === feature.state ? 1.1 : 1,
                    opacity: demoState === feature.state ? 1 : 0.7
                  }}
                >
                  <feature.icon className="w-4 h-4" />
                  <span className="text-sm">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedInteractiveDemo;