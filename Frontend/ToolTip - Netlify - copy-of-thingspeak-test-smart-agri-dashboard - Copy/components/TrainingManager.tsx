import React, { useState, useEffect } from 'react';
import { 
  APP_KNOWLEDGE_BASE, 
  KNOWLEDGE_CATEGORIES, 
  KnowledgeItem 
} from '../services/appKnowledgeBase';

interface TrainingManagerProps {
  onClose: () => void;
}

const TrainingManager: React.FC<TrainingManagerProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    keywords: '',
    relatedTopics: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });

  // Filter knowledge base
  const filteredKnowledge = APP_KNOWLEDGE_BASE.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: KnowledgeItem = {
      id: editingItem?.id || `custom-${Date.now()}`,
      category: formData.category,
      question: formData.question,
      answer: formData.answer,
      keywords: formData.keywords.split(',').map(k => k.trim()),
      relatedTopics: formData.relatedTopics.split(',').map(t => t.trim()),
      difficulty: formData.difficulty
    };

    if (editingItem) {
      // Update existing item
      const index = APP_KNOWLEDGE_BASE.findIndex(item => item.id === editingItem.id);
      if (index !== -1) {
        APP_KNOWLEDGE_BASE[index] = newItem;
      }
    } else {
      // Add new item
      APP_KNOWLEDGE_BASE.push(newItem);
    }

    // Reset form
    setFormData({
      question: '',
      answer: '',
      category: '',
      keywords: '',
      relatedTopics: '',
      difficulty: 'beginner'
    });
    setIsAddingNew(false);
    setEditingItem(null);
  };

  // Handle edit
  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      keywords: item.keywords.join(', '),
      relatedTopics: item.relatedTopics.join(', '),
      difficulty: item.difficulty
    });
    setIsAddingNew(true);
  };

  // Handle delete
  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this knowledge item?')) {
      const index = APP_KNOWLEDGE_BASE.findIndex(item => item.id === itemId);
      if (index !== -1) {
        APP_KNOWLEDGE_BASE.splice(index, 1);
      }
    }
  };

  // Export knowledge base
  const exportKnowledge = () => {
    const dataStr = JSON.stringify(APP_KNOWLEDGE_BASE, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'smart_agriculture_knowledge_base.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Common questions suggestions
  const suggestionTemplates = [
    {
      category: 'crop-management',
      question: 'How do I delete a crop from the system?',
      answer: 'To delete a crop:\n1. Go to Crop Management\n2. Find the crop in your list\n3. Click the three dots menu\n4. Select "Delete Crop"\n5. Confirm deletion\n\nNote: This will remove all associated data including growth records and sensor links.',
      keywords: ['delete crop', 'remove crop', 'crop management']
    },
    {
      category: 'sensors',
      question: 'How do I add a new sensor to the system?',
      answer: 'To add a new sensor:\n1. Go to IoT Sensors section\n2. Click "Add New Sensor"\n3. Select sensor type (temperature, humidity, soil moisture, etc.)\n4. Configure sensor settings\n5. Test connection\n6. Save sensor configuration\n\nThe sensor will start collecting data immediately.',
      keywords: ['add sensor', 'new sensor', 'sensor setup']
    },
    {
      category: 'analytics',
      question: 'How do I compare yields between different crops?',
      answer: 'To compare crop yields:\n1. Go to Analytics & Reports\n2. Select "Comparative Analysis"\n3. Choose crops to compare\n4. Select time period\n5. View side-by-side comparison charts\n6. Export comparison report\n\nThis helps identify best performing crops and optimization opportunities.',
      keywords: ['compare yields', 'crop comparison', 'yield analysis']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🧠 Smart Agriculture Knowledge Base Manager</h2>
              <p className="text-blue-100 mt-1">Train your chatbot with app-specific knowledge</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Panel - Knowledge List */}
          <div className="w-2/3 p-6 border-r border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Knowledge Base ({APP_KNOWLEDGE_BASE.length} items)</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ➕ Add New
                </button>
                <button
                  onClick={exportKnowledge}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📥 Export
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4 mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {Object.entries(KNOWLEDGE_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search knowledge..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Knowledge Items */}
            <div className="space-y-4 h-[400px] overflow-y-auto">
              {filteredKnowledge.map((item) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {KNOWLEDGE_CATEGORIES[item.category as keyof typeof KNOWLEDGE_CATEGORIES]}
                        </span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {item.difficulty}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{item.question}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.answer}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.map((keyword, index) => (
                          <span key={index} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Add/Edit Form */}
          <div className="w-1/3 p-6">
            {isAddingNew ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {editingItem ? 'Edit Knowledge Item' : 'Add New Knowledge Item'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingItem(null);
                      setFormData({
                        question: '',
                        answer: '',
                        category: '',
                        keywords: '',
                        relatedTopics: '',
                        difficulty: 'beginner'
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    rows={6}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.entries(KNOWLEDGE_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    placeholder="crop, management, add, new"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Topics (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.relatedTopics}
                    onChange={(e) => setFormData({...formData, relatedTopics: e.target.value})}
                    placeholder="crop-tracking, harvest-planning"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingItem ? 'Update Knowledge Item' : 'Add Knowledge Item'}
                </button>
              </form>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Add Suggestions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Here are some common questions you might want to add to your knowledge base:
                </p>
                <div className="space-y-3">
                  {suggestionTemplates.map((template, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-sm text-gray-800 mb-1">{template.question}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.answer}</p>
                      <button
                        onClick={() => {
                          setFormData({
                            question: template.question,
                            answer: template.answer,
                            category: template.category,
                            keywords: template.keywords.join(', '),
                            relatedTopics: '',
                            difficulty: 'beginner'
                          });
                          setIsAddingNew(true);
                        }}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingManager;
