import { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Square, Circle, MousePointer, Type, ArrowRight, Trash2 } from 'lucide-react';

export function DiagramEditor({ initialData, onChange, className = '' }) {
  const [elements, setElements] = useState(initialData?.elements || []);
  const [selectedTool, setSelectedTool] = useState('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentElement, setCurrentElement] = useState(null);
  const canvasRef = useRef(null);

  // Notify parent when elements change
  useEffect(() => {
    onChange?.({ elements });
  }, [elements, onChange]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool === 'select') {
      // Handle selection logic
      const element = findElementAtPosition(x, y);
      setCurrentElement(element);
    } else {
      // Start drawing
      setIsDrawing(true);
      setStartPoint({ x, y });
      
      const newElement = createElement(selectedTool, x, y, x, y);
      setCurrentElement(newElement);
      setElements(prev => [...prev, newElement]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update the current element being drawn
    if (currentElement) {
      const updatedElement = {
        ...currentElement,
        x2: x,
        y2: y,
      };
      
      setCurrentElement(updatedElement);
      setElements(prev => {
        const newElements = [...prev];
        newElements[newElements.length - 1] = updatedElement;
        return newElements;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentElement(null);
  };

  const createElement = (type, x1, y1, x2, y2) => {
    const id = Date.now().toString();
    
    switch (type) {
      case 'rectangle':
        return { id, type, x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
      case 'circle':
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return { id, type, x: x1, y: y1, radius };
      case 'arrow':
        return { id, type, x1, y1, x2, y2 };
      case 'text':
        return { id, type, x: x1, y: y1, text: 'Double click to edit' };
      default:
        return null;
    }
  };

  const findElementAtPosition = (x, y) => {
    // Simple hit testing - in a real app, you'd want more sophisticated collision detection
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (isPointInElement(x, y, element)) {
        return element;
      }
    }
    return null;
  };

  const isPointInElement = (x, y, element) => {
    if (!element) return false;
    
    switch (element.type) {
      case 'rectangle':
        return (
          x >= element.x &&
          x <= element.x + element.width &&
          y >= element.y &&
          y <= element.y + element.height
        );
      case 'circle':
        const distance = Math.sqrt(
          Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2)
        );
        return distance <= element.radius;
      default:
        return false;
    }
  };

  const renderElement = (element) => {
    if (!element) return null;
    
    switch (element.type) {
      case 'rectangle':
        return (
          <rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill="none"
            stroke="#4a90e2"
            strokeWidth="2"
          />
        );
      case 'circle':
        return (
          <circle
            key={element.id}
            cx={element.x}
            cy={element.y}
            r={element.radius}
            fill="none"
            stroke="#4a90e2"
            strokeWidth="2"
          />
        );
      case 'arrow':
        return (
          <line
            key={element.id}
            x1={element.x1}
            y1={element.y1}
            x2={element.x2}
            y2={element.y2}
            stroke="#4a90e2"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        );
      case 'text':
        return (
          <text
            key={element.id}
            x={element.x}
            y={element.y}
            fill="#ffffff"
            style={{ userSelect: 'none' }}
          >
            {element.text}
          </text>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative h-full ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-gray-800 p-2 rounded-md shadow-lg">
        <Button
          variant={selectedTool === 'select' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSelectedTool('select')}
          title="Select"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedTool === 'rectangle' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSelectedTool('rectangle')}
          title="Rectangle"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedTool === 'circle' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSelectedTool('circle')}
          title="Circle"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedTool === 'arrow' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSelectedTool('arrow')}
          title="Arrow"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedTool === 'text' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSelectedTool('text')}
          title="Text"
        >
          <Type className="h-4 w-4" />
        </Button>
        <div className="h-px bg-gray-600 my-1"></div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setElements([])}
          title="Clear All"
          className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full bg-gray-900 rounded-md"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg className="w-full h-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#4a90e2" />
            </marker>
          </defs>
          {elements.map(renderElement)}
        </svg>
      </div>
    </div>
  );
}
