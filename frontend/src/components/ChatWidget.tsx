import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Trash2, Languages, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const ChatWidget: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  const { user, activeRole } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStudent = activeRole === 'STUDENT';
  const isDept = activeRole === 'DEPARTMENT';

  // Toggle Language within Chat Widget
  const toggleChatLanguage = () => {
    changeLanguage(language === 'en' ? 'kn' : 'en');
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen]);

  // Initial greeting based on role and language
  useEffect(() => {
    let greeting = '';
    if (language === 'en') {
      if (isStudent) {
        greeting = `Hello ${user?.name || 'Student'}! I am your AI study assistant. Ask me to analyze your mock scores, get study tips, or review calendar exams.`;
      } else if (isDept) {
        greeting = `Greetings Officer ${user?.name || 'Dr. Ramesh Rao'}! How can I assist you with taluk-level dropout risk indexes or intervention logs today?`;
      } else {
        greeting = 'Hello! I am Seva Helper. How can I assist you with Kannada Seva analytics today?';
      }
    } else {
      if (isStudent) {
        greeting = `ನಮಸ್ಕಾರ ${user?.name || 'ವಿದ್ಯಾರ್ಥಿ'}! ನಾನು ನಿಮ್ಮ ಎಐ ಅಧ್ಯಯನ ಸಹಾಯಕ. ನಿಮ್ಮ ಪರೀಕ್ಷಾ ಅಂಕಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಅಥವಾ ಅಧ್ಯಯನ ಸಲಹೆ ಪಡೆಯಲು ಕೇಳಿ.`;
      } else if (isDept) {
        greeting = `ನಮಸ್ಕಾರ ಅಧಿಕಾರಿಗಳೇ ${user?.name || 'ಡಾ. ರಮೇಶ್ ರಾವ್'}! ತಾಲೂಕು ಮಟ್ಟದ ಗೈರುಹಾಜರಿ ಅಥವಾ ಮಧ್ಯಸ್ಥಿಕೆ ವರದಿಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`;
      } else {
        greeting = 'ನಮಸ್ಕಾರ! ನಾನು ಸೇವಾ ಸಹಾಯಕಿ. ಕನ್ನಡ ಸೇವಾ ವಿಶ್ಲೇಷಣೆಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?';
      }
    }

    setChatHistory([
      {
        role: 'model',
        content: greeting
      }
    ]);
  }, [language, activeRole, user]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || message;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setMessage('');
    
    // Add user message to history
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      // Injects system context regarding student scores or department metrics
      let systemPrompt = '';
      if (isStudent) {
        systemPrompt = `[System Context: Logged in Student Shivshakti. Chemistry: 75%, Physics: 82%, Math: 90%]. `;
      } else if (isDept) {
        systemPrompt = `[System Context: Logged in Department Officer. Mapped 8 districts. Risk levels: Chamarajanagar & Bangalore High risk, Shimoga/Udupi low risk]. `;
      }

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: systemPrompt + userMsg,
          history: updatedHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        throw new Error('Chatbot backend unreachable');
      }
    } catch (err: any) {
      console.warn("Chat API Fallback active:", err);
      // Context aware mock replies
      setTimeout(() => {
        let reply = '';
        if (language === 'en') {
          if (userMsg.toLowerCase().includes('score') || userMsg.toLowerCase().includes('study')) {
            reply = `🤖 **Personalized Study Advice**\nBased on your logged grades, your Math is excellent (90%), but Chemistry needs work (75%). Focus on revising Chemical Equations in Mock quizzes today.`;
          } else if (userMsg.toLowerCase().includes('risk') || userMsg.toLowerCase().includes('district')) {
            reply = `📊 **District Risk Profile**\nCurrently, Bangalore and Chamarajanagar show a critical dropout risk level (>80%). I suggest reviewing the High-Risk Checklist on your dashboard and deploying Bilingual Bridge kits.`;
          } else {
            reply = `I am Seva Helper. I understand you asked: "${userMsg}". Let me know if you want to inspect mock score logs, quiz configurations, or district attendance curves.`;
          }
        } else {
          if (userMsg.toLowerCase().includes('score') || userMsg.toLowerCase().includes('study') || userMsg.toLowerCase().includes('ಅಂಕ')) {
            reply = `🤖 **ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸಲಹೆ**\nನಿಮ್ಮ ದಾಖಲಾದ ಅಂಕಗಳ ಪ್ರಕಾರ, ಗಣಿತದಲ್ಲಿ ಉತ್ತಮ ಸಾಧನೆ ಮಾಡಿದ್ದೀರಿ (90%), ಆದರೆ ರಸಾಯನಶಾಸ್ತ್ರದಲ್ಲಿ (75%) ಸುಧಾರಣೆ ಅಗತ್ಯವಿದೆ.`;
          } else if (userMsg.toLowerCase().includes('risk') || userMsg.toLowerCase().includes('ಗೈರು')) {
            reply = `📊 **ಜಿಲ್ಲಾ ಗಂಡಾಂತರ ವರದಿ**\nಪ್ರಸ್ತುತ ಚಾಮರಾಜನಗರ ಮತ್ತು ಬೆಂಗಳೂರು ಜಿಲ್ಲೆಗಳಲ್ಲಿ ದಾಖಲಾತಿ ಇಳಿಕೆ ಪ್ರಮಾಣ ಹೆಚ್ಚಿದೆ (&gt;80%). ತಾಲೂಕು ಪಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.`;
          } else {
            reply = `ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ. ಇನ್ನೂ ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಬೇಕಿದ್ದಲ್ಲಿ ಕೇಳಿ.`;
          }
        }
        setChatHistory(prev => [...prev, { role: 'model', content: reply }]);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setChatHistory([
      {
        role: 'model',
        content: language === 'en'
          ? 'Chat cleared. How can I help you?'
          : 'ಚಾಟ್ ಅಳಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?'
      }
    ]);
  };

  const handleSuggestionClick = (text: string) => {
    handleSend(text);
  };

  const suggestions = isStudent 
    ? (language === 'en' 
        ? ['Analyze my mock scores', 'Chemistry study recommendations', 'Show calendar dates']
        : ['ನನ್ನ ಅಂಕಗಳ ವಿಶ್ಲೇಷಣೆ', 'ರಸಾಯನಶಾಸ್ತ್ರ ಅಧ್ಯಯನ ಸಲಹೆಗಳು', 'ಪರೀಕ್ಷಾ ಕ್ಯಾಲೆಂಡರ್ ತೋರಿಸು'])
    : (language === 'en'
        ? ['Summarize district risk ratings', 'How does Taluk risk look?', 'Check intervention board']
        : ['ಜಿಲ್ಲಾ ಗಂಡಾಂತರ ವರದಿ', 'ತಾಲೂಕು ಮಟ್ಟದ ವಿಶ್ಲೇಷಣೆ', 'ಸಕ್ರಿಯ ಮಧ್ಯಸ್ಥಿಕೆ ಬೋರ್ಡ್']);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Button with purple glowing border */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#a855f7] to-[#00e5ff] text-white px-5 py-3.5 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] active:scale-95 transition-all duration-300 cursor-pointer border border-white/20"
        >
          <MessageSquare className="h-5.5 w-5.5" />
          <span className="text-xs font-extrabold tracking-widest uppercase">ಸಹಾಯ | AI Helper</span>
        </button>
      )}

      {/* Chat Box Drawer (dark glass-morphism) */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] glass-morphism rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 origin-bottom-right border border-white/10">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-950/90 to-cyan-950/90 p-4 text-white flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-xs leading-none">Seva AI Assistant</h3>
                <span className="text-[9px] text-slate-400 mt-1 block">Contextual Bilingual Helper</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* i18n switcher in Chat */}
              <button
                onClick={toggleChatLanguage}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                title="Switch Language"
              >
                <Languages className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                title="Clear Chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#05050f]/80">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none shadow shadow-purple-500/10'
                      : 'bg-[#0d0d1f] text-slate-200 rounded-tl-none border border-white/5 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed font-sans">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#0d0d1f] text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 shadow-sm flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {!isLoading && (
            <div className="px-3 py-2 bg-[#0d0d1f] flex flex-wrap gap-1.5 border-t border-white/5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-[9px] font-bold bg-[#05050f] border border-white/5 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center space-x-0.5"
                >
                  <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 bg-[#0d0d1f] border-t border-white/5 flex items-center space-x-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask AI in English or ಕನ್ನಡ..."
              className="flex-1 bg-[#05050f] border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyan-400 text-white placeholder-slate-600"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black disabled:bg-white/5 disabled:text-slate-600 transition-all cursor-pointer flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
