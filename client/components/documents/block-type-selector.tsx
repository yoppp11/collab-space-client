'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image,
  FileText,
} from 'lucide-react';
import { BlockType } from '@/lib/types/document';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface BlockTypeSelectorProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const blockTypes: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <Type className="h-4 w-4" /> },
  { type: 'heading1', label: 'Heading 1', icon: <Heading1 className="h-4 w-4" /> },
  { type: 'heading2', label: 'Heading 2', icon: <Heading2 className="h-4 w-4" /> },
  { type: 'heading3', label: 'Heading 3', icon: <Heading3 className="h-4 w-4" /> },
  { type: 'bullet_list', label: 'Bullet List', icon: <List className="h-4 w-4" /> },
  { type: 'numbered_list', label: 'Numbered List', icon: <ListOrdered className="h-4 w-4" /> },
  { type: 'todo', label: 'To-do List', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" /> },
  { type: 'code', label: 'Code', icon: <Code className="h-4 w-4" /> },
  { type: 'callout', label: 'Callout', icon: <FileText className="h-4 w-4" /> },
  { type: 'divider', label: 'Divider', icon: <span className="h-[2px] w-4 bg-border" /> },
  { type: 'image', label: 'Image', icon: <Image className="h-4 w-4" /> },
];

export function BlockTypeSelector({ onSelect, onClose }: BlockTypeSelectorProps) {
  const [search, setSearch] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute z-50 mt-2 w-72"
    >
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search block types..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Basic Blocks">
            {blockTypes.map((blockType) => (
              <CommandItem
                key={blockType.type}
                onSelect={() => {
                  onSelect(blockType.type);
                  onClose();
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                {blockType.icon}
                <span>{blockType.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </motion.div>
  );
}
