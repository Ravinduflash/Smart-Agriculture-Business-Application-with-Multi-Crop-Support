import React, { useState, useEffect, useRef } from 'react';
import { 
  KNOWLEDGE_CATEGORIES, 
  searchKnowledgeBase, 
  getRelatedTopics,
  KnowledgeItem 
} from '../services/appKnowledgeBase';
import { processSmartFarmingQuery } from '../services/helpContentService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  relatedTopics?: KnowledgeItem[];
  suggestedQuestions?: string[];
}

const SmartHelpDesk: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick action buttons for common questions
  const quickActions = [
    { id: 'add-crop', text: 'How to add new crop?', icon: '🌱' },
    { id: 'crop-recommendations', text: 'Get AI crop recommendations', icon: '🎯' },
    { id: 'train-ml-models', text: 'Train ML models', icon: '🤖' },
    { id: 'check-sensors', text: 'Check sensor readings', icon: '�' },
    { id: 'setup-alerts', text: 'Setup smart alerts', icon: '🔔' },
    { id: 'troubleshoot', text: 'Troubleshoot issues', icon: '�' }
  ];

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: `🤖 Welcome to Smart Agriculture AI Assistant!\n\nI'm powered by Google Gemini AI and trained specifically on your Smart Agriculture application. I can provide intelligent, context-aware help with:\n\n• 🌱 Adding and managing crops\n• 🎯 AI-powered crop recommendations\n• 📊 Understanding sensor readings\n• 📈 Using analytics and reports\n• 🔔 Setting up smart alerts\n• 🤖 AI features like disease detection\n• ⚙️ Configuring settings\n• 🔧 Troubleshooting issues\n\nAsk me anything about your app - I understand natural language and can provide detailed, practical guidance!`,
        isUser: false,
        timestamp: new Date(),
        suggestedQuestions: [
          'How do I get crop recommendations?',
          'What ML models are available in the app?',
          'How to set up automated irrigation?',
          'Show me the difference between AI and custom recommendations'
        ]
      }]);
    }
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced response generation with Google Gemini AI integration
  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      // Get current context for better AI responses
      const contextData = {
        currentPage: window.location.pathname,
        timestamp: new Date().toISOString(),
        userQuery: userMessage,
        appSection: getCurrentAppSection()
      };

      // Use Google Gemini AI for intelligent responses
      const aiResponse = await processSmartFarmingQuery(userMessage, contextData);
      
      // Add emoji and formatting for better user experience
      const formattedResponse = formatAIResponse(aiResponse);
      
      return formattedResponse;
    } catch (error) {
      console.error('Gemini AI Error:', error);
      
      // Fallback to knowledge base if AI fails
      const knowledgeResults = searchKnowledgeBase(userMessage);
      
      if (knowledgeResults.length > 0) {
        const bestMatch = knowledgeResults[0];
        return `🤖 **From Knowledge Base:**\n\n${bestMatch.answer}\n\n💡 **Category:** ${KNOWLEDGE_CATEGORIES[bestMatch.category as keyof typeof KNOWLEDGE_CATEGORIES]}\n\n⚠️ *Note: AI assistance temporarily unavailable, using local knowledge base.*`;
      }

      // Ultimate fallback
      return `🤖 I'm having trouble accessing the AI system right now, but I can help you with these topics:\n\n🌱 **Crop Management**: Adding crops, tracking growth stages, harvest planning\n📊 **IoT Sensors**: Soil moisture, temperature, humidity, NPK levels monitoring\n📈 **Analytics**: Farm performance reports, historical data analysis\n🤖 **AI Features**: Disease detection, farming recommendations\n🔔 **Notifications**: Setting up alerts and managing notifications\n⚙️ **Settings**: Configuring your farm profile and preferences\n\nPlease try asking a more specific question, or check your internet connection and try again!`;
    }
  };

  // Helper function to get current app section
  const getCurrentAppSection = (): string => {
    const path = window.location.pathname;
    if (path.includes('crop-management')) return 'crop-management';
    if (path.includes('iot-sensors')) return 'sensors';
    if (path.includes('analytics')) return 'analytics';
    if (path.includes('ml-models')) return 'ml-models';
    if (path.includes('notifications')) return 'notifications';
    if (path.includes('settings')) return 'settings';
    return 'dashboard';
  };

  // Helper function to format AI responses
  const formatAIResponse = (response: string): string => {
    // Add appropriate emoji based on content
    let formattedResponse = response;
    
    // Add emoji indicators for different types of content
    if (response.includes('crop') || response.includes('plant')) {
      formattedResponse = `🌱 ${formattedResponse}`;
    } else if (response.includes('sensor') || response.includes('monitoring')) {
      formattedResponse = `📊 ${formattedResponse}`;
    } else if (response.includes('AI') || response.includes('machine learning')) {
      formattedResponse = `🤖 ${formattedResponse}`;
    } else if (response.includes('alert') || response.includes('notification')) {
      formattedResponse = `🔔 ${formattedResponse}`;
    } else if (response.includes('analytics') || response.includes('report')) {
      formattedResponse = `📈 ${formattedResponse}`;
    } else {
      formattedResponse = `🤖 ${formattedResponse}`;
    }

    return formattedResponse;
  };

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      // Search knowledge base for related topics
      const knowledgeResults = searchKnowledgeBase(message);
      const relatedTopics = knowledgeResults.length > 0 ? getRelatedTopics(knowledgeResults[0]) : [];

      const response = await generateResponse(message);
      
      // Generate suggested follow-up questions
      const suggestedQuestions = generateSuggestedQuestions(message, knowledgeResults);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date(),
        relatedTopics,
        suggestedQuestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again or ask about specific app features like crop management, sensor monitoring, or analytics.',
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestedQuestions = (userMessage: string, knowledgeResults: KnowledgeItem[]): string[] => {
    const suggestions: string[] = [];
    
    // Add related questions from knowledge base
    if (knowledgeResults.length > 0) {
      const relatedTopics = getRelatedTopics(knowledgeResults[0]);
      suggestions.push(...relatedTopics.map(topic => topic.question));
    }

    // Add contextual suggestions based on message content
    if (userMessage.toLowerCase().includes('crop')) {
      suggestions.push('How do I track crop growth stages?', 'How to set up crop alerts?');
    }
    if (userMessage.toLowerCase().includes('sensor')) {
      suggestions.push('How to calibrate sensors?', 'Why are sensors showing N/A?');
    }
    if (userMessage.toLowerCase().includes('irrigation')) {
      suggestions.push('How to set up automated irrigation?', 'How to monitor soil moisture?');
    }

    return [...new Set(suggestions)].slice(0, 4); // Remove duplicates and limit to 4
  };

  const handleQuickAction = (action: { id: string; text: string }) => {
    handleSendMessage(action.text);
  };

  const clearChat = () => {
    setMessages([]);
    setShowQuickActions(true);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          title="Smart Help Desk"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-sm">Smart Agriculture AI Assistant</h3>
            <p className="text-xs opacity-90">Powered by Google Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.isUser 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              
              {/* Related Topics */}
              {message.relatedTopics && message.relatedTopics.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Related Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.relatedTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSendMessage(topic.question)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        {topic.question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">You might also ask:</p>
                  <div className="space-y-1">
                    {message.suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(question)}
                        className="block text-xs text-left bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors w-full"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">Quick Help:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-white text-gray-700 px-3 py-2 rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <span>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your Smart Agriculture app..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartHelpDesk;
