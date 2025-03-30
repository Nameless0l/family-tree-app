'use client';

import React from 'react';

interface MarkmapOptionsProps {
  onDirectionChange: (direction: 'right' | 'down' | 'left' | 'up') => void;
  currentDirection: 'right' | 'down' | 'left' | 'up';
  onNodeDistanceChange: (distance: number) => void;
  currentNodeDistance: number;
}

const MarkmapOptions: React.FC<MarkmapOptionsProps> = ({
  onDirectionChange,
  currentDirection,
  onNodeDistanceChange,
  currentNodeDistance
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-3">Options d'affichage</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Orientation de l'arbre
          </label>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${
                currentDirection === 'right' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => onDirectionChange('right')}
            >
              Horizontal →
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentDirection === 'down' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => onDirectionChange('down')}
            >
              Vertical ↓
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentDirection === 'left' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => onDirectionChange('left')}
            >
              Horizontal ←
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentDirection === 'up' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => onDirectionChange('up')}
            >
              Vertical ↑
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Espacement entre les nœuds: {currentNodeDistance}
          </label>
          <input
            type="range"
            min="30"
            max="150"
            step="10"
            value={currentNodeDistance}
            onChange={(e) => onNodeDistanceChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>Astuce: Vous pouvez zoomer avec la molette de la souris et déplacer l'arbre en maintenant le clic gauche.</p>
      </div>
    </div>
  );
};

export default MarkmapOptions;