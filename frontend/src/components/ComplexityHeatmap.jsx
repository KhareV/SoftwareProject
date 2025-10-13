import { motion } from "framer-motion";
import { useState } from "react";

/**
 * Complexity Heatmap Component
 * Visualizes code complexity across files using color intensity
 */
export default function ComplexityHeatmap({ data }) {
  const [selectedCell, setSelectedCell] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-light-200 py-8">
        No complexity data available
      </div>
    );
  }

  // Get complexity color
  const getComplexityColor = (complexity) => {
    if (complexity <= 5) return "bg-green-500";
    if (complexity <= 10) return "bg-yellow-500";
    if (complexity <= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get opacity based on value
  const getOpacity = (complexity) => {
    const normalized = Math.min(complexity / 30, 1);
    return normalized * 0.7 + 0.3; // Range from 30% to 100% opacity
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-light-200">Low (1-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-light-200">Moderate (6-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-light-200">High (11-20)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-light-200">Very High (20+)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-8 gap-2">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            onMouseEnter={() => setSelectedCell(item)}
            onMouseLeave={() => setSelectedCell(null)}
            className={`
              relative aspect-square rounded cursor-pointer
              ${getComplexityColor(item.complexity)}
              transition-all duration-200
            `}
            style={{ opacity: getOpacity(item.complexity) }}
          >
            {selectedCell === item && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
              >
                <div className="bg-dark-100 border border-light-200/20 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
                  <div className="font-semibold">{item.file || item.name}</div>
                  <div className="text-light-200">
                    Complexity: {item.complexity}
                  </div>
                  {item.functions && (
                    <div className="text-light-200 text-xs">
                      {item.functions} functions
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected Info */}
      {selectedCell && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-300 rounded-lg p-4 border border-light-200/20"
        >
          <h4 className="font-semibold text-white mb-2">
            {selectedCell.file || selectedCell.name}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-light-200">Complexity:</span>
              <span className="ml-2 font-semibold text-white">
                {selectedCell.complexity}
              </span>
            </div>
            {selectedCell.functions && (
              <div>
                <span className="text-light-200">Functions:</span>
                <span className="ml-2 font-semibold text-white">
                  {selectedCell.functions}
                </span>
              </div>
            )}
            {selectedCell.lines && (
              <div>
                <span className="text-light-200">Lines:</span>
                <span className="ml-2 font-semibold text-white">
                  {selectedCell.lines}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
