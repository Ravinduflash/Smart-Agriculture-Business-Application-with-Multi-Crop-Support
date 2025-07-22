
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface GeminiResponseDisplayProps {
  response: string | object | null;
  className?: string;
}

const GeminiResponseDisplay: React.FC<GeminiResponseDisplayProps> = ({ response, className = '' }) => {
  if (!response) return null;

  const formatJson = (jsonObj: object) => {
    try {
      return JSON.stringify(jsonObj, null, 2);
    } catch (error) {
      console.error("Error formatting JSON:", error);
      return "Invalid JSON object";
    }
  };

  const renderContent = () => {
    if (typeof response === 'string') {
      // Enhanced markdown rendering with better styling
      return (
        <div className="chatbot-response prose prose-sm max-w-none prose-headings:text-gray-800 prose-strong:text-gray-900 prose-strong:font-bold prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700">
          <ReactMarkdown
            components={{
              // Custom strong/bold component to ensure proper rendering
              strong: ({ children }) => (
                <span className="font-bold text-gray-900">{children}</span>
              ),
              // Custom paragraph component with proper spacing
              p: ({ children }) => (
                <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>
              ),
              // Custom heading components
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-gray-800 mb-3 mt-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold text-gray-800 mb-3 mt-4">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-bold text-gray-800 mb-2 mt-3">{children}</h3>
              ),
              // Custom list components
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed">{children}</li>
              ),
              // Custom code components
              code: ({ children, className }) => {
                const isInlineCode = !className;
                return isInlineCode ? (
                  <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                    <code className="text-sm font-mono text-gray-800">{children}</code>
                  </pre>
                );
              }
            }}
          >
            {response.replace(/^```json\s*|```\s*$/g, '')}
          </ReactMarkdown>
        </div>
      );
    }
    if (typeof response === 'object') {
      return <pre className="whitespace-pre-wrap text-sm">{formatJson(response)}</pre>;
    }
    return <p>Unsupported response format.</p>;
  };

  return (
    <div className={`${className}`}>
      {renderContent()}
    </div>
  );
};

export default GeminiResponseDisplay;
