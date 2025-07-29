import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  KNOWLEDGE_CATEGORIES, 
  searchKnowledgeBase, 
  getRelatedTopics,
  KnowledgeItem 
} from '../services/appKnowledgeBase';
import { processSmartFarmingQuery } from '../services/helpContentService';
import GeminiResponseDisplay from './GeminiResponseDisplay';
import { LanguageContext } from '../contexts/LanguageContext';
import { LanguageCode } from '../constants';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  relatedTopics?: KnowledgeItem[];
  suggestedQuestions?: string[];
}

const SmartHelpDesk: React.FC = () => {
  const { currentLanguage, t } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Language-aware quick action buttons
  const getQuickActions = () => [
    { id: 'add-crop', text: t('smartHelpDesk.quickActions.addCrop') || 'How to add new crop?', icon: '🌱' },
    { id: 'crop-recommendations', text: t('smartHelpDesk.quickActions.cropRecommendations') || 'Get AI crop recommendations', icon: '🎯' },
    { id: 'train-ml-models', text: t('smartHelpDesk.quickActions.trainModels') || 'Train ML models', icon: '🤖' },
    { id: 'check-sensors', text: t('smartHelpDesk.quickActions.checkSensors') || 'Check sensor readings', icon: '📊' },
    { id: 'setup-alerts', text: t('smartHelpDesk.quickActions.setupAlerts') || 'Setup smart alerts', icon: '🔔' },
    { id: 'troubleshoot', text: t('smartHelpDesk.quickActions.troubleshoot') || 'Troubleshoot issues', icon: '🔧' }
  ];

  // Get welcome message in current language
  const getWelcomeMessage = (): Message => {
    let welcomeText = '';
    let suggestedQuestions: string[] = [];

    // Language-specific welcome messages
    switch (currentLanguage) {
      case 'si':
        welcomeText = `🤖 **ස්මාර්ට් කෘෂිකර්ම AI සහායකයාට සාදරයෙන් පිළිගනිමු!**\n\nමම Google Gemini AI මගින් බලගන්වන අතර ඔබේ ස්මාර්ට් කෘෂිකර්ම යෙදුම සඳහා විශේෂයෙන් පුහුණු කර ඇත. මට පහත දැක්වෙන අයිතමවල සඳහා බුද්ධිමත්, සන්දර්භය දැන ගත් උපකාර සැපයිය හැක:\n\n• 🌱 **බෝග එකතු කිරීම සහ කළමනාකරණය**\n• 🎯 **AI බලයෙන් යුත් බෝග නිර්දේශ**\n• 📊 **සංවේදක කියවීම් වටහා ගැනීම**\n• 📈 **විශ්ලේෂණ සහ වාර්තා භාවිතය**\n• 🔔 **ස්මාර්ට් අනතුරු ඇඟවීම් සකසා ගැනීම**\n• 🤖 **රෝග හඳුනාගැනීම වැනි AI විශේෂාංග**\n• ⚙️ **සැකසුම් වින්‍යාස කිරීම**\n• 🔧 **ගැටලු නිරාකරණය**\n\nඔබේ යෙදුම ගැන ඕනෑම දෙයක් මගෙන් අසන්න - මම ස්වභාවික භාෂාව තේරුම් ගන්නා අතර **විස්තරාත්මක, ප්‍රායෝගික මග පෙන්වීම** සැපයිය හැක!`;
        
        suggestedQuestions = [
          'මට බෝග නිර්දේශ ලබා ගන්නේ කෙසේද?',
          'යෙදුමේ ඇති ML ආකෘති මොනවාද?',
          'ස්වයංක්‍රීය වාරිමාර්ගය සකසන්නේ කෙසේද?',
          'AI සහ custom නිර්දේශ අතර වෙනස කියන්න'
        ];
        break;

      case 'ta':
        welcomeText = `🤖 **ஸ்மார்ட் விவசாய AI உதவியாளருக்கு வரவேற்கிறோம்!**\n\nநான் Google Gemini AI ஆல் இயக்கப்படுகிறேன் மற்றும் உங்கள் ஸ்மார்ட் விவசாய பயன்பாட்டிற்காக குறிப்பாக பயிற்சி பெற்றுள்ளேன். நான் பின்வரும் விஷயங்களில் அறிவார்ந்த, சூழல் அறிந்த உதவியை வழங்க முடியும்:\n\n• 🌱 **பயிர்களைச் சேர்த்தல் மற்றும் நிர்வகித்தல்**\n• 🎯 **AI-இயங்கும் பயிர் பரிந்துரைகள்**\n• 📊 **சென்சார் வாசிப்புகளைப் புரிந்துகொள்ளுதல்**\n• 📈 **பகுப்பாய்வு மற்றும் அறிக்கைகளைப் பயன்படுத்துதல்**\n• 🔔 **ஸ்மார்ட் எச்சரிக்கைகளை அமைத்தல்**\n• 🤖 **நோய் கண்டறிதல் போன்ற AI அம்சங்கள்**\n• ⚙️ **அமைப்புகளை கட்டமைத்தல்**\n• 🔧 **சிக்கல்களை தீர்த்தல்**\n\nஉங்கள் பயன்பாட்டைப் பற்றி எதையும் என்னிடம் கேளுங்கள் - நான் இயற்கையான மொழியைப் புரிந்துகொண்டு **விரிவான, நடைமுறை வழிகாட்டுதலை** வழங்க முடியும்!`;
        
        suggestedQuestions = [
          'பயிர் பரிந்துரைகளை எப்படி பெறுவது?',
          'பயன்பாட்டில் என்ன ML மாதிரிகள் உள்ளன?',
          'தானியங்கி நீர்ப்பாசனத்தை எப்படி அமைப்பது?',
          'AI மற்றும் தனிப்பயன் பரிந்துரைகளுக்கு இடையேயான வேறுபாட்டைக் காட்டுங்கள்'
        ];
        break;

      default: // English
        welcomeText = t('smartHelpDesk.welcomeMessage') || 
          `🤖 **Welcome to Smart Agriculture AI Assistant!**\n\nI'm powered by Google Gemini AI and trained specifically on your Smart Agriculture application. I can provide intelligent, context-aware help with:\n\n• 🌱 **Adding and managing crops**\n• 🎯 **AI-powered crop recommendations**\n• 📊 **Understanding sensor readings**\n• 📈 **Using analytics and reports**\n• 🔔 **Setting up smart alerts**\n• 🤖 **AI features like disease detection**\n• ⚙️ **Configuring settings**\n• 🔧 **Troubleshooting issues**\n\nAsk me anything about your app - I understand natural language and can provide **detailed, practical guidance**!`;
        
        suggestedQuestions = [
          t('smartHelpDesk.suggestedQuestions.cropRecommendations') || 'How do I get crop recommendations?',
          t('smartHelpDesk.suggestedQuestions.mlModels') || 'What ML models are available in the app?',
          t('smartHelpDesk.suggestedQuestions.irrigation') || 'How to set up automated irrigation?',
          t('smartHelpDesk.suggestedQuestions.aiVsCustom') || 'Show me the difference between AI and custom recommendations'
        ];
    }

    return {
      id: 'welcome',
      text: welcomeText,
      isUser: false,
      timestamp: new Date(),
      suggestedQuestions
    };
  };

  // Reset messages when language changes
  useEffect(() => {
    if (messages.length === 0 || messages[0].id === 'welcome') {
      setMessages([getWelcomeMessage()]);
    }
  }, [currentLanguage]); // Re-run when language changes

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      // Get initial knowledge base results
      const knowledgeResults = searchKnowledgeBase(text);
      const relatedTopics = getRelatedTopics(text, 3);
      
      // Process with enhanced Smart Farming service that includes language context
      const response = await processSmartFarmingQuery(text, {
        knowledgeBaseResults: knowledgeResults,
        userLanguage: currentLanguage, // Pass current language to AI service
        previousConversation: messages.slice(-5) // Last 5 messages for context
      });

      // Language-aware suggested questions
      const getSuggestedQuestions = (): string[] => {
        switch (currentLanguage) {
          case 'si':
            return [
              'මගේ බෝගවල වර්ධනය අධීක්ෂණය කරන්නේ කෙසේද?',
              'ස්මාර්ට් වාරිමාර්ගය සකසන්නේ කෙසේද?',
              'සංවේදක දත්ත විශ්ලේෂණය කරන්නේ කෙසේද?'
            ];
          case 'ta':
            return [
              'என் பயிர்களின் வளர்ச்சியை எப்படி கண்காணிப்பது?',
              'ஸ்மார்ட் நீர்ப்பாசனத்தை எப்படி அமைப்பது?',
              'சென்சார் தரவை எப்படி பகுப்பாய்வு செய்வது?'
            ];
          default:
            return [
              'How do I monitor my crop growth?',
              'How to set up smart irrigation?',
              'How to analyze sensor data?'
            ];
        }
      };

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date(),
        relatedTopics: relatedTopics.length > 0 ? relatedTopics : undefined,
        suggestedQuestions: getSuggestedQuestions()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Error message in current language
      let errorMessage = '';
      switch (currentLanguage) {
        case 'si':
          errorMessage = 'සමාවන්න, ඔබේ පණිවිඩය සැකසීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.';
          break;
        case 'ta':
          errorMessage = 'மன්னிக்கவும், உங்கள் செய்தியைச் செயலாக்குவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.';
          break;
        default:
          errorMessage = 'Sorry, there was an error processing your message. Please try again.';
      }

      const errorBotMessage: Message = {
        id: `error-${Date.now()}`,
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: { id: string; text: string }) => {
    handleSendMessage(action.text);
  };

  const clearChat = () => {
    setMessages([getWelcomeMessage()]); // Reset with welcome message in current language
    setShowQuickActions(true);
  };

  // Get localized UI text
  const getUIText = () => {
    switch (currentLanguage) {
      case 'si':
        return {
          title: 'ස්මාර්ට් කෘෂිකර්ම AI සහායකයා',
          subtitle: 'Google Gemini AI මගින් බලගන්වයි',
          quickHelp: 'ඉක්මන් උපකාර:',
          placeholder: 'ඔබේ ස්මාර්ට් කෘෂිකර්ම යෙදුම ගැන ඕනෑම දෙයක් අසන්න...',
          thinking: 'සිතමින්...',
          clearChat: 'චැට් එක හිස් කරන්න',
          close: 'වසන්න'
        };
      case 'ta':
        return {
          title: 'ஸ்மார்ட் விவசாய AI உதவியாளர்',
          subtitle: 'Google Gemini AI ஆல் இயக்கப்படுகிறது',
          quickHelp: 'விரைவு உதவி:',
          placeholder: 'உங்கள் ஸ்மார்ட் விவசாய பயன்பாட்டைப் பற்றி எதையும் கேளுங்கள்...',
          thinking: 'சிந்தித்துக்கொண்டிருக்கிறேன்...',
          clearChat: 'அரட்டையை அழிக்கவும்',
          close: 'மூடு'
        };
      default:
        return {
          title: t('smartHelpDesk.title') || 'Smart Agriculture AI Assistant',
          subtitle: t('smartHelpDesk.subtitle') || 'Powered by Google Gemini AI',
          quickHelp: t('smartHelpDesk.quickHelp') || 'Quick Help:',
          placeholder: t('smartHelpDesk.placeholder') || 'Ask me anything about your Smart Agriculture app...',
          thinking: t('smartHelpDesk.thinking') || 'Thinking...',
          clearChat: t('smartHelpDesk.clearChat') || 'Clear chat',
          close: t('smartHelpDesk.close') || 'Close'
        };
    }
  };

  const uiText = getUIText();
  const quickActions = getQuickActions();

  if (!isOpen) {
    return (
      <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center min-h-[48px] min-w-[48px]"
          title={uiText.title}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:w-96 max-w-[calc(100vw-1rem)] h-[calc(100vh-4rem)] sm:h-[32rem] max-h-[calc(100vh-4rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs sm:text-sm">🤖</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-xs sm:text-sm truncate">{uiText.title}</h3>
            <p className="text-xs opacity-90 truncate">{uiText.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={clearChat}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center"
            title={uiText.clearChat}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center"
            title={uiText.close}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg break-words ${
              message.isUser 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {message.isUser ? (
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.text}</p>
              ) : (
                <GeminiResponseDisplay response={message.text} className="text-xs sm:text-sm" />
              )}
              
              {/* Related Topics */}
              {message.relatedTopics && message.relatedTopics.length > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Related Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.relatedTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSendMessage(topic.question)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors break-words min-h-[28px]"
                      >
                        {topic.question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">You might also ask:</p>
                  <div className="space-y-1">
                    {message.suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(question)}
                        className="block text-xs text-left bg-gray-50 text-gray-700 px-2 py-2 rounded hover:bg-gray-100 transition-colors w-full break-words min-h-[32px]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1 sm:mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-500"></div>
                <span className="text-xs sm:text-sm text-gray-600">{uiText.thinking}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="p-2 sm:p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">{uiText.quickHelp}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-white text-gray-700 px-2 sm:px-3 py-2 rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1 justify-center sm:justify-start min-h-[40px] break-words"
              >
                <span className="text-sm flex-shrink-0">{action.icon}</span>
                <span className="text-center sm:text-left break-words">{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-2 sm:p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={uiText.placeholder}
            className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-xs sm:text-sm text-gray-900 min-h-[40px]"
            disabled={isLoading}
            style={{ fontSize: '16px' }} // Prevent iOS zoom
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
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
