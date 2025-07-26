/**
 * WhatsApp-Style Emoji Picker Component
 * 
 * Comprehensive emoji picker with:
 * - Categorized emojis (smileys, gestures, objects, etc.)
 * - Search functionality
 * - Recent emojis
 * - Skin tone selection
 * - Quick access to frequently used emojis
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Heart, Smile, ThumbsUp, X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
}

// Emoji categories and data
const EMOJI_CATEGORIES = [
  { id: 'recent', name: 'Recent', icon: <Clock className="w-4 h-4" /> },
  { id: 'smileys', name: 'Smileys', icon: <Smile className="w-4 h-4" /> },
  { id: 'gestures', name: 'Gestures', icon: <ThumbsUp className="w-4 h-4" /> },
  { id: 'objects', name: 'Objects', icon: <Heart className="w-4 h-4" /> },
  { id: 'nature', name: 'Nature', icon: <Heart className="w-4 h-4" /> },
  { id: 'food', name: 'Food', icon: <Heart className="w-4 h-4" /> },
  { id: 'activities', name: 'Activities', icon: <Heart className="w-4 h-4" /> },
  { id: 'travel', name: 'Travel', icon: <Heart className="w-4 h-4" /> },
  { id: 'symbols', name: 'Symbols', icon: <Heart className="w-4 h-4" /> },
  { id: 'flags', name: 'Flags', icon: <Heart className="w-4 h-4" /> }
];

// Emoji data by category
const EMOJI_DATA = {
  recent: ['😀', '👍', '❤️', '😂', '🎉', '🔥', '💯', '👏'],
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '👽',
    '👾', '🤖', '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽'
  ],
  gestures: [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
    '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
    '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
    '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋',
    '🩸', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁'
  ],
  objects: [
    '💎', '🔪', '⚔️', '🛡️', '🔫', '🏹', '🪃', '🪚', '🔧', '🪛',
    '🔩', '⚙️', '🪜', '🪝', '🔗', '⛓️', '🪢', '🧰', '🧲', '🪜',
    '🪝', '🔗', '⛓️', '🪢', '🧰', '🧲', '🪜', '🪝', '🔗', '⛓️',
    '🪢', '🧰', '🧲', '🪜', '🪝', '🔗', '⛓️', '🪢', '🧰', '🧲'
  ],
  nature: [
    '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁',
    '🍂', '🍃', '🌺', '🌸', '💮', '🏵️', '🌻', '🌼', '🌷', '🌹',
    '🥀', '🌻', '🌼', '🌷', '🌹', '🥀', '🌻', '🌼', '🌷', '🌹',
    '🥀', '🌻', '🌼', '🌷', '🌹', '🥀', '🌻', '🌼', '🌷', '🌹'
  ],
  food: [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
    '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬',
    '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠',
    '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞'
  ],
  activities: [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
    '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁',
    '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌',
    '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾'
  ],
  travel: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
    '🚚', '🚛', '🚜', '🛴', '🛵', '🛺', '🚔', '🚍', '🚘', '🚖',
    '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈',
    '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺'
  ],
  symbols: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐'
  ],
  flags: [
    '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱',
    '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩'
  ]
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent emojis from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentEmojis');
    if (saved) {
      setRecentEmojis(JSON.parse(saved));
    }
  }, []);

  // Filter emojis based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const allEmojis = Object.values(EMOJI_DATA).flat();
      const filtered = allEmojis.filter(emoji => 
        emoji.includes(searchQuery) || 
        emoji.charCodeAt(0).toString(16).includes(searchQuery.toLowerCase())
      );
      setFilteredEmojis(filtered);
    } else {
      setFilteredEmojis([]);
    }
  }, [searchQuery]);

  // Handle emoji selection
  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    
    // Add to recent emojis
    const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 8);
    setRecentEmojis(updated);
    localStorage.setItem('recentEmojis', JSON.stringify(updated));
    
    // Clear search if active
    if (searchQuery) {
      setSearchQuery('');
    }
  };

  // Get current emojis to display
  const getCurrentEmojis = () => {
    if (searchQuery.trim()) {
      return filteredEmojis;
    }
    
    if (activeCategory === 'recent') {
      return recentEmojis.length > 0 ? recentEmojis : EMOJI_DATA.smileys.slice(0, 8);
    }
    
    return EMOJI_DATA[activeCategory as keyof typeof EMOJI_DATA] || [];
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div 
      className="bg-white border rounded-lg shadow-lg w-80 max-h-96 overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Emoji</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emoji..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="flex border-b border-gray-200 bg-gray-50">
          {EMOJI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 p-2 text-center hover:bg-gray-100 transition-colors ${
                activeCategory === category.id
                  ? 'bg-white border-b-2 border-blue-500'
                  : 'text-gray-600'
              }`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {getCurrentEmojis().map((emoji, index) => (
            <button
              key={`${activeCategory}-${index}`}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        {searchQuery && filteredEmojis.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No emojis found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Click to select emoji</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker; 