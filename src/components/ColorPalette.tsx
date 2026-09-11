import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Check } from 'lucide-react';

interface ColorPaletteProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  title?: string;
}

const predefinedColors = [
  { name: 'Red', value: '#FF0000', hex: '#FF0000' },
  { name: 'Blue', value: '#0000FF', hex: '#0000FF' },
  { name: 'Green', value: '#00FF00', hex: '#00FF00' },
  { name: 'Yellow', value: '#FFFF00', hex: '#FFFF00' },
  { name: 'Orange', value: '#FFA500', hex: '#FFA500' },
  { name: 'Purple', value: '#800080', hex: '#800080' },
  { name: 'Pink', value: '#FFC0CB', hex: '#FFC0CB' },
  { name: 'Brown', value: '#964B00', hex: '#964B00' },
  { name: 'Black', value: '#000000', hex: '#000000' },
  { name: 'White', value: '#FFFFFF', hex: '#FFFFFF' },
  { name: 'Gray', value: '#808080', hex: '#808080' },
  { name: 'Navy', value: '#000080', hex: '#000080' },
  { name: 'Teal', value: '#008080', hex: '#008080' },
  { name: 'Maroon', value: '#800000', hex: '#800000' },
  { name: 'Olive', value: '#808000', hex: '#808000' },
  { name: 'Lime', value: '#00FF00', hex: '#00FF00' },
  { name: 'Aqua', value: '#00FFFF', hex: '#00FFFF' },
  { name: 'Fuchsia', value: '#FF00FF', hex: '#FF00FF' },
  { name: 'Silver', value: '#C0C0C0', hex: '#C0C0C0' },
  { name: 'Gold', value: '#FFD700', hex: '#FFD700' },
];

const ColorPalette: React.FC<ColorPaletteProps> = ({ 
  selectedColor, 
  onColorSelect, 
  title = "Select Color" 
}) => {
  const [customColor, setCustomColor] = useState('');

  const handleCustomColorSubmit = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      onColorSelect(customColor);
      setCustomColor('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predefined Colors */}
        <div className="grid grid-cols-5 gap-2">
          {predefinedColors.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              className="h-12 p-1 relative group"
              onClick={() => onColorSelect(color.value)}
            >
              <div
                className="w-full h-full rounded border-2 border-gray-300 group-hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color.hex }}
              />
              {selectedColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {color.name}
              </div>
            </Button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="space-y-2 pt-4 border-t">
          <label className="text-sm font-medium">Custom Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={customColor || '#000000'}
              onChange={(e) => setCustomColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <Button 
              onClick={handleCustomColorSubmit}
              disabled={!customColor || !/^#[0-9A-F]{6}$/i.test(customColor)}
              size="sm"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Selected Color Display */}
        {selectedColor && (
          <div className="flex items-center gap-2 p-2 bg-background rounded">
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm font-mono">{selectedColor}</span>
            <Badge variant="secondary" className="text-xs">
              {predefinedColors.find(c => c.value === selectedColor)?.name || 'Custom'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorPalette;
