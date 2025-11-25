import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import * as LucideIcons from 'lucide-react';

// Get all icon names from lucide-react
const allIcons = Object.keys(LucideIcons).filter(
  (key) => 
    key !== 'createLucideIcon' &&
    !key.endsWith('Icon') && // Exclude duplicate Icon suffix versions
    key[0] === key[0].toUpperCase() // Must start with uppercase
);

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string | null;
}

export function IconPicker({ open, onOpenChange, onSelect, currentIcon }: IconPickerProps) {
  const handleSelect = (iconName: string) => {
    onSelect(`lucide:${iconName}`);
    onOpenChange(false);
  };

  console.log('IconPicker - Total icons available:', allIcons.length);
  console.log('IconPicker - First 5 icons:', allIcons.slice(0, 5));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-6"
        style={{ 
          maxWidth: '90vw', 
          width: '90vw', 
          maxHeight: '85vh', 
          height: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full pr-4">
            {allIcons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No icons loaded. Total keys: {Object.keys(LucideIcons).length}
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2 pb-4">
                {allIcons.map((iconName) => {
              const IconComponent = (LucideIcons as any)[iconName];
              const isSelected = currentIcon === `lucide:${iconName}`;
              
              return (
                <button
                  key={iconName}
                  onClick={() => handleSelect(iconName)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg border-2 
                    transition-all hover:border-pink-500 hover:bg-pink-50
                    ${isSelected ? 'border-pink-500 bg-pink-100' : 'border-gray-200'}
                  `}
                  title={iconName}
                >
                  <IconComponent className="w-6 h-6 mb-1" />
                  <span className="text-[9px] text-gray-600 text-center leading-tight line-clamp-2">
                    {iconName}
                  </span>
                </button>
              );
            })}
          </div>
            )}
        </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
