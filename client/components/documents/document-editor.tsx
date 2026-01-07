'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, MoreHorizontal, Trash } from 'lucide-react';
import { Block, BlockType } from '@/lib/types/document';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BlockTypeSelector } from './block-type-selector';

interface DocumentEditorProps {
  documentId: string;
  blocks: Block[];
}

let blockIdCounter = 0;

export function DocumentEditor({ documentId, blocks }: DocumentEditorProps) {
  const [localBlocks, setLocalBlocks] = useState<Block[]>(blocks);
  const [showTypeSelectorIndex, setShowTypeSelectorIndex] = useState<number | null>(null);

  const handleAddBlock = (index: number, type: BlockType = 'text') => {
    blockIdCounter += 1;
    const newBlock: Block = {
      id: `temp-${blockIdCounter}`,
      document: documentId,
      type,
      content: { text: '' },
      properties: {},
      position: index + 1,
      level: 0,
      lft: 0,
      rght: 0,
      tree_id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedBlocks = [...localBlocks];
    updatedBlocks.splice(index + 1, 0, newBlock);
    setLocalBlocks(updatedBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    const updatedBlocks = localBlocks.filter((_, i) => i !== index);
    setLocalBlocks(updatedBlocks);
  };

  const handleBlockChange = (index: number, content: string) => {
    const updatedBlocks = [...localBlocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      content: { ...updatedBlocks[index].content, text: content },
    };
    setLocalBlocks(updatedBlocks);
  };

  const handleBlockTypeChange = (index: number, type: BlockType) => {
    const updatedBlocks = [...localBlocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      type,
    };
    setLocalBlocks(updatedBlocks);
    setShowTypeSelectorIndex(null);
  };

  const getBlockPlaceholder = (type: BlockType) => {
    const placeholders: Record<BlockType, string> = {
      text: 'Type / for commands',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      bullet_list: 'List item',
      numbered_list: 'List item',
      todo: 'To-do',
      toggle: 'Toggle',
      quote: 'Quote',
      divider: '',
      callout: 'Callout',
      code: 'Code',
      image: 'Image URL',
      video: 'Video URL',
      file: 'File URL',
      embed: 'Embed URL',
      table: 'Table',
      column: 'Column',
      link_to_page: 'Link to page',
    };
    return placeholders[type] || 'Type something...';
  };

  const getBlockClassName = (type: BlockType) => {
    const classNames: Record<BlockType, string> = {
      text: 'text-base',
      heading1: 'text-4xl font-bold',
      heading2: 'text-3xl font-bold',
      heading3: 'text-2xl font-semibold',
      bullet_list: 'text-base pl-6',
      numbered_list: 'text-base pl-6',
      todo: 'text-base flex items-center gap-2',
      toggle: 'text-base',
      quote: 'text-base border-l-4 border-primary pl-4 italic',
      divider: 'border-t my-4',
      callout: 'text-base bg-muted p-4 rounded-lg',
      code: 'text-sm font-mono bg-muted p-4 rounded-lg',
      image: 'text-base',
      video: 'text-base',
      file: 'text-base',
      embed: 'text-base',
      table: 'text-base',
      column: 'text-base',
      link_to_page: 'text-base text-primary',
    };
    return classNames[type] || 'text-base';
  };

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {localBlocks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4"
          >
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground"
              onClick={() => handleAddBlock(-1)}
            >
              <Plus className="h-4 w-4" />
              Add a block
            </Button>
          </motion.div>
        ) : (
          localBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              className="group relative"
            >
              <div className="flex items-start gap-2">
                {/* Block Handle */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 pt-3">
                  <button className="p-1 hover:bg-accent rounded">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    className="p-1 hover:bg-accent rounded"
                    onClick={() => handleAddBlock(index)}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Block Content */}
                <div className="flex-1 min-w-0">
                  {block.type === 'divider' ? (
                    <hr className="my-4 border-border" />
                  ) : (
                    <Textarea
                      value={String(block.content.text ?? '')}
                      onChange={(e) => handleBlockChange(index, e.target.value)}
                      onFocus={() => setShowTypeSelectorIndex(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddBlock(index);
                        }
                        if (e.key === 'Backspace' && String(block.content.text ?? '') === '') {
                          e.preventDefault();
                          handleDeleteBlock(index);
                        }
                        if (e.key === '/' && String(block.content.text ?? '') === '') {
                          setShowTypeSelectorIndex(index);
                        }
                      }}
                      placeholder={getBlockPlaceholder(block.type)}
                      className={`${getBlockClassName(
                        block.type
                      )} resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-11 p-3`}
                      rows={1}
                    />
                  )}

                  {/* Block Type Selector */}
                  {showTypeSelectorIndex === index && (
                    <BlockTypeSelector
                      onSelect={(type) => handleBlockTypeChange(index, type)}
                      onClose={() => setShowTypeSelectorIndex(null)}
                    />
                  )}
                </div>

                {/* Block Actions */}
                <div className="opacity-0 group-hover:opacity-100 pt-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowTypeSelectorIndex(index)}>
                        Turn into
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteBlock(index)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {localBlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-2"
        >
          <Button
            variant="ghost"
            className="gap-2 text-muted-foreground opacity-0 hover:opacity-100 transition-opacity"
            onClick={() => handleAddBlock(localBlocks.length - 1)}
          >
            <Plus className="h-4 w-4" />
            Add a block
          </Button>
        </motion.div>
      )}
    </div>
  );
}
