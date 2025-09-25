import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AIBookingAssistant = ({ onBookingCreated, onClose }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const handleInputChange = async (value) => {
    setInput(value);
    
    if (value.length > 10) {
      setLoading(true);
      try {
        const response = await fetch('/api/ai/process-natural-language', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            input: value,
            context: { user_id: user?.id }
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          setAiResponse(result.data);
          setSuggestions(result.data.suggestions || []);
        }
      } catch (error) {
        console.error('AI processing error:', error);
        toast.error('Failed to process your request');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    // Create booking from suggestion
    createBookingFromSuggestion(suggestion);
  };

  const createBookingFromSuggestion = async (suggestion) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          room_id: 1, // Default room, could be improved
          customer_name: aiResponse?.entities?.customer_name || 'AI Booking',
          start_time: `${suggestion.date}T${suggestion.time}:00`,
          end_time: `${suggestion.date}T${new Date(new Date(`${suggestion.date}T${suggestion.time}:00`).getTime() + suggestion.duration * 60000).toISOString().split('T')[1].split('.')[0]}`,
          notes: `AI-suggested booking (${suggestion.reasoning})`
        })
      });

      if (response.ok) {
        toast.success('Booking created successfully!');
        onBookingCreated?.();
        onClose?.();
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      toast.error('Failed to create booking');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🤖 AI Booking Assistant
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your booking needs in natural language:
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g., 'Book a room for John tomorrow at 2 PM for 2 hours' or 'I need a premium room next Friday evening'"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">AI is processing your request...</span>
              </div>
            )}

            {/* AI Response */}
            {aiResponse && !loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">AI Analysis:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Intent:</strong> {aiResponse.intent.replace('_', ' ').toLowerCase()}</p>
                  <p><strong>Confidence:</strong> {(aiResponse.confidence * 100).toFixed(1)}%</p>
                  {aiResponse.reasoning && (
                    <p><strong>Reasoning:</strong> {aiResponse.reasoning}</p>
                  )}
                </div>
                
                {aiResponse.entities && Object.keys(aiResponse.entities).length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-blue-900 mb-1">Extracted Information:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(aiResponse.entities).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key.replace('_', ' ')}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  💡 AI Suggestions:
                </h3>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(suggestion.date).toLocaleDateString()} at {suggestion.time}
                          </div>
                          <div className="text-sm text-gray-600">
                            Duration: {suggestion.duration} minutes
                          </div>
                          <div className="text-sm text-blue-600 mt-1">
                            {suggestion.reasoning}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {(suggestion.confidence * 100).toFixed(0)}% match
                          </div>
                          <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">💬 Try these examples:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• "Book a room for Sarah tomorrow at 3 PM for 1 hour"</div>
                <div>• "I need a premium room next Friday evening"</div>
                <div>• "Reserve any available room this weekend"</div>
                <div>• "Book the VIP room for John next Monday at 7 PM"</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBookingAssistant;
