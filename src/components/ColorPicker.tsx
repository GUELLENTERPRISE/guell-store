import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPicker = ({ value, onChange, label = "Background Color" }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#eab308',
    '#a855f7', '#f43f5e', '#22c55e', '#64748b'
  ];

  const handleColorChange = (color: string) => {
    // Ensure color starts with #
    const formattedColor = color.startsWith('#') ? color : `#${color}`;
    onChange(formattedColor);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-12 h-10 p-0 border-2"
              style={{ backgroundColor: value }}
            >
              <span className="sr-only">Pick color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div>
                <Label>Preset Colors</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {presetColors.map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className="w-full h-8 p-0"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleColorChange(color);
                        setIsOpen(false);
                      }}
                    >
                      <span className="sr-only">{color}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Custom Color</Label>
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          placeholder="#3b82f6"
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ColorPicker;