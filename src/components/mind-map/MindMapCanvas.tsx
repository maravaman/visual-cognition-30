import React, { useState, useRef, useCallback } from 'react';
import { Plus, Move, Type, Palette, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export interface MindMapNode {
  id: string;
  x: number;
  y: number;
  text: string;
  type: 'primary' | 'secondary' | 'accent' | 'default';
  connections: string[];
  isEditing?: boolean;
}

interface MindMapCanvasProps {
  mindMap?: {
    id: string;
    name: string;
    nodes: MindMapNode[];
  };
  onSave?: (mindMap: { name: string; nodes: MindMapNode[] }) => void;
}

export default function MindMapCanvas({ mindMap, onSave }: MindMapCanvasProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>(mindMap?.nodes || [
    {
      id: '1',
      x: 400,
      y: 300,
      text: 'Central Idea',
      type: 'primary',
      connections: []
    }
  ]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = useCallback((type: MindMapNode['type'] = 'default') => {
    const newNode: MindMapNode = {
      id: Date.now().toString(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      text: 'New Idea',
      type,
      connections: [],
      isEditing: true
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<MindMapNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (isConnecting) {
      if (connectionStart === nodeId) {
        setIsConnecting(false);
        setConnectionStart(null);
      } else if (connectionStart) {
        // Create connection
        setNodes(prev => prev.map(node => {
          if (node.id === connectionStart) {
            return {
              ...node,
              connections: [...node.connections, nodeId]
            };
          }
          return node;
        }));
        setIsConnecting(false);
        setConnectionStart(null);
      } else {
        setConnectionStart(nodeId);
      }
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nodeElement = e.currentTarget as HTMLElement;
    const nodeRect = nodeElement.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - nodeRect.left,
      y: e.clientY - nodeRect.top
    });
    setDraggedNode(nodeId);
  }, [isConnecting, connectionStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    updateNode(draggedNode, { x: Math.max(0, x), y: Math.max(0, y) });
  }, [draggedNode, dragOffset, updateNode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        name: mindMap?.name || 'Untitled Mind Map',
        nodes
      });
    }
  }, [nodes, mindMap?.name, onSave]);

  const getNodeCenter = (node: MindMapNode) => ({
    x: node.x + 100,
    y: node.y + 40
  });

  const renderConnection = (fromId: string, toId: string) => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    
    if (!fromNode || !toNode) return null;

    const from = getNodeCenter(fromNode);
    const to = getNodeCenter(toNode);

    // Create a curved path
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const controlOffset = 50;
    
    const path = `M ${from.x} ${from.y} Q ${midX} ${midY - controlOffset} ${to.x} ${to.y}`;

    return (
      <path
        key={`${fromId}-${toId}`}
        d={path}
        className="connection-line"
        markerEnd="url(#arrowhead)"
      />
    );
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Toolbar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Card className="flex items-center gap-2 p-2 shadow-elevated bg-card/95 backdrop-blur-sm">
          <Button
            size="sm"
            onClick={() => addNode('primary')}
            className="toolbar-button"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => addNode('secondary')}
            className="toolbar-button"
          >
            <Type className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setIsConnecting(!isConnecting)}
            className={`toolbar-button ${isConnecting ? 'bg-primary text-primary-foreground' : ''}`}
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => addNode('accent')}
            className="toolbar-button"
          >
            <Palette className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            size="sm"
            onClick={handleSave}
            className="toolbar-button"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="toolbar-button"
          >
            <Download className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 mind-map-canvas relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="hsl(var(--muted-foreground))"
              />
            </marker>
          </defs>
          {nodes.map(node =>
            node.connections.map(targetId =>
              renderConnection(node.id, targetId)
            )
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute cursor-pointer select-none ${
              draggedNode === node.id ? 'z-20' : 'z-10'
            }`}
            style={{
              left: node.x,
              top: node.y,
              transform: draggedNode === node.id ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onDoubleClick={() => updateNode(node.id, { isEditing: true })}
          >
            <div
              className={`
                node-base w-48 h-20 p-4 flex items-center justify-center text-center
                ${node.type === 'primary' ? 'node-primary' : ''}
                ${node.type === 'secondary' ? 'node-secondary' : ''}
                ${node.type === 'accent' ? 'node-accent' : ''}
                ${draggedNode === node.id ? 'node-hover' : ''}
                ${isConnecting && connectionStart === node.id ? 'ring-2 ring-primary' : ''}
                hover:node-hover
              `}
            >
              {node.isEditing ? (
                <Input
                  value={node.text}
                  onChange={(e) => updateNode(node.id, { text: e.target.value })}
                  onBlur={() => updateNode(node.id, { isEditing: false })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateNode(node.id, { isEditing: false });
                    }
                    if (e.key === 'Delete' && e.ctrlKey) {
                      deleteNode(node.id);
                    }
                  }}
                  className="text-center bg-transparent border-none text-inherit font-medium"
                  autoFocus
                />
              ) : (
                <span className="font-medium">{node.text}</span>
              )}
            </div>
          </div>
        ))}

        {/* Connection indicator */}
        {isConnecting && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
            Click nodes to connect them
          </div>
        )}
      </div>
    </div>
  );
}