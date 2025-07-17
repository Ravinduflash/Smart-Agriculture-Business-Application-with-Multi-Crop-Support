import React, { useState, useEffect, useRef, useContext } from 'react';
import { IconHelp, IconClose, IconSend } from '../constants';
import { getSmartHelpDeskResponse } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';
import Spinner from './Spinner';
import GeminiResponseDisplay from './GeminiResponseDisplay';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SmartHelpDeskProps {
  className?: string;
}

const SmartHelpDesk: React.FC<SmartHelpDeskProps> = ({ className = '' }) => {
  const { t, currentLanguage } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreMadeQuestions, setShowPreMadeQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-made questions for quick assistance
  const preMadeQuestions = [
    t('smartHelpDesk.preMadeQuestions.question1') || 'How do I interpret soil moisture readings?',
    t('smartHelpDesk.preMadeQuestions.question2') || 'What should I do if temperature is too high?',
    t('smartHelpDesk.preMadeQuestions.question3') || 'How often should I water my crops?',
    t('smartHelpDesk.preMadeQuestions.question4') || 'What do the NPK soil values mean?',
    t('smartHelpDesk.preMadeQuestions.question5') || 'Why is monitoring soil pH important?',
    t('smartHelpDesk.preMadeQuestions.question6') || 'Tell me about the IoT Sensors page.',
  ];

  // Fallback questions if translation keys don't exist
  const fallbackQuestions = [
    'How do I interpret soil moisture readings?',
    'What should I do if temperature is too high?',
    'How often should I water my crops?',
    'What do the NPK soil values mean?',
    'Why is monitoring soil pH important?',
    'Tell me about the IoT Sensors page.',
  ];

  // Use fallback questions if translations failed (i.e., if any translated question still contains the key)
  const actualQuestions = preMadeQuestions.some(q => q.includes('smartHelpDesk.preMadeQuestions.'))
    ? fallbackQuestions
    : preMadeQuestions;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: t('smartHelpDesk.welcomeMessage') || 'Welcome to Smart Help Desk! How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, t]);

  const handleQuestionClick = async (question: string) => {
    await sendMessage(question);
    setShowPreMadeQuestions(false);
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await getSmartHelpDeskResponse(messageText, currentLanguage, t);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse || t('smartHelpDesk.error.noResponse') || 'I apologize, but I cannot provide a response at this time.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('smartHelpDesk.error.generalError') || 'I apologize, but I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
    setShowPreMadeQuestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
  };

  const resetChat = () => {
    setMessages([]);
    setShowPreMadeQuestions(true);
    setInputValue('');
  };

  return (
    <div className={`fixed z-50 ${className}`}>
      {/* Floating Action Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleChat();
        }}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50"
        aria-label={t('smartHelpDesk.openChat') || 'Open Smart Help Desk'}
      >
        <IconHelp className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-40">
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg">
                {t('smartHelpDesk.title') || 'Smart Help Desk'}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetChat}
                className="text-white hover:text-gray-200 transition-colors text-sm"
                aria-label={t('smartHelpDesk.resetChat') || 'Reset chat'}
              >
                {t('smartHelpDesk.reset') || 'Reset'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleChat();
                }}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label={t('smartHelpDesk.closeChat') || 'Close chat'}
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isUser ? (
                    <p className="text-sm">{message.text}</p>
                  ) : (
                    <GeminiResponseDisplay response={message.text} className="text-sm" />
                  )}
                  <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString(currentLanguage, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Pre-made Questions */}
            {showPreMadeQuestions && messages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  {t('smartHelpDesk.suggestedQuestions') || 'Suggested Questions:'}
                </p>
                <div className="space-y-2">
                  {actualQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question)}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors"
                      disabled={isLoading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Spinner size="sm" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('smartHelpDesk.inputPlaceholder') || 'Type your question...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('smartHelpDesk.sendMessage') || 'Send message'}
              >
                <IconSend className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartHelpDesk;
