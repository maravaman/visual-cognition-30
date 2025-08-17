import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Plus, Calendar, Edit, Trash2 } from 'lucide-react';
import { MindMapNode } from './MindMapCanvas';

interface MindMap {
  id: string;
  name: string;
  description?: string;
  nodes: MindMapNode[];
  createdAt: Date;
  updatedAt: Date;
}

interface MindMapListProps {
  mindMaps: MindMap[];
  onSelect: (mindMap: MindMap) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function MindMapList({ mindMaps, onSelect, onCreate, onDelete }: MindMapListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getNodeCount = (nodes: MindMapNode[]) => {
    return nodes.length;
  };

  const getConnectionCount = (nodes: MindMapNode[]) => {
    return nodes.reduce((count, node) => count + node.connections.length, 0);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-white shadow-node">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mind Maps</h1>
              <p className="text-muted-foreground">Create and organize your visual thoughts</p>
            </div>
          </div>
          <Button 
            onClick={onCreate}
            className="bg-gradient-primary hover:shadow-elevated hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>

        {/* Mind Maps Grid */}
        {mindMaps.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 rounded-full bg-muted inline-block mb-4">
              <Brain className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No mind maps yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first mind map to start organizing your ideas
            </p>
            <Button 
              onClick={onCreate}
              className="bg-gradient-primary hover:shadow-elevated hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Mind Map
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mindMaps.map((mindMap) => (
              <Card 
                key={mindMap.id}
                className="hover:shadow-elevated hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => onSelect(mindMap)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors">
                        {mindMap.name}
                      </CardTitle>
                      {mindMap.description && (
                        <CardDescription className="text-sm">
                          {mindMap.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(mindMap.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-node-primary"></div>
                        {getNodeCount(mindMap.nodes)} nodes
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-node-secondary"></div>
                        {getConnectionCount(mindMap.nodes)} connections
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="h-20 bg-canvas-background rounded-lg p-2 relative overflow-hidden">
                      {mindMap.nodes.slice(0, 4).map((node, index) => (
                        <div
                          key={node.id}
                          className={`
                            absolute w-8 h-4 rounded text-xs flex items-center justify-center text-white text-[8px] font-medium
                            ${node.type === 'primary' ? 'bg-gradient-primary' : ''}
                            ${node.type === 'secondary' ? 'bg-gradient-secondary' : ''}
                            ${node.type === 'accent' ? 'bg-gradient-accent' : ''}
                            ${node.type === 'default' ? 'bg-muted' : ''}
                          `}
                          style={{
                            left: `${10 + (index * 15)}%`,
                            top: `${20 + (index * 20)}%`,
                          }}
                        >
                          {node.text.slice(0, 3)}
                        </div>
                      ))}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Updated {formatDate(mindMap.updatedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}