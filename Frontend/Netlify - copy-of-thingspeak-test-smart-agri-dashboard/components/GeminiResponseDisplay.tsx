
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
      // Wrap ReactMarkdown in a div and apply prose classes to the div
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{response.replace(/^```json\s*|```\s*$/g, '')}</ReactMarkdown>
        </div>
      );
    }
    if (typeof response === 'object') {
      return <pre className="whitespace-pre-wrap text-sm">{formatJson(response)}</pre>;
    }
    return <p>Unsupported response format.</p>;
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 ${className}`}>
      {renderContent()}
    </div>
  );
};

export default GeminiResponseDisplay;
