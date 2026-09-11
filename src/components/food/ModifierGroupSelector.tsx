import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModifierGroup, FoodModifier } from '@/types/food';

interface ModifierGroupSelectorProps {
  group: ModifierGroup;
  selectedOptions: { [groupId: string]: FoodModifier[] };
  onSelectionChange: (groupId: string, selected: FoodModifier[]) => void;
  disabled?: boolean;
}

const ModifierGroupSelector: React.FC<ModifierGroupSelectorProps> = ({ 
  group, 
  selectedOptions, 
  onSelectionChange,
  disabled = false 
}) => {
  const currentSelection = selectedOptions[group.id] || [];

  const handleSingleChoice = (modifier: FoodModifier) => {
    onSelectionChange(group.id, [modifier]);
  };

  const handleMultiChoice = (modifier: FoodModifier) => {
    const isSelected = currentSelection.some(m => m.id === modifier.id);
    let newSelection: FoodModifier[];

    if (isSelected) {
      newSelection = currentSelection.filter(m => m.id !== modifier.id);
    } else {
      if (group.maxSelections && currentSelection.length >= group.maxSelections) {
        // Remove the first selected item to make room
        const [first, ...rest] = currentSelection;
        newSelection = [...rest, modifier];
      } else {
        newSelection = [...currentSelection, modifier];
      }
    }

    onSelectionChange(group.id, newSelection);
  };

  const isOptionSelected = (modifier: FoodModifier): boolean => {
    return currentSelection.some(m => m.id === modifier.id);
  };

  const getSelectionCount = (): number => {
    return currentSelection.length;
  };

  const getSelectionRequired = (): boolean => {
    if (group.minSelections) {
      return getSelectionCount() < group.minSelections;
    }
    return group.required && getSelectionCount() === 0;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">{group.name}</h3>
          <div className="flex items-center gap-2">
            {group.required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {group.type === 'single-choice' 
                ? 'Choose one' 
                : group.maxSelections 
                  ? `Choose up to ${group.maxSelections}` 
                  : 'Choose any'
              }
            </span>
          </div>
        </div>

        {group.type === 'single-choice' ? (
          <div className="space-y-2">
            {group.options.map((modifier) => (
              <div
                key={modifier.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isOptionSelected(modifier)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-background'
                }`}
                onClick={() => !disabled && handleSingleChoice(modifier)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isOptionSelected(modifier)
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {isOptionSelected(modifier) && (
                      <div className="w-2 h-2 bg-card rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{modifier.name}</div>
                    {modifier.price > 0 && (
                      <div className="text-sm text-orange-600">
                        +${modifier.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {group.options.map((modifier) => (
              <div
                key={modifier.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isOptionSelected(modifier)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-background'
                }`}
                onClick={() => !disabled && handleMultiChoice(modifier)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isOptionSelected(modifier)
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {isOptionSelected(modifier) && (
                      <div className="w-2 h-2 bg-card rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{modifier.name}</div>
                    {modifier.price > 0 && (
                      <div className="text-sm text-orange-600">
                        +${modifier.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {getSelectionRequired() && (
          <div className="mt-3 text-sm text-red-600 font-medium">
            Please select at least {group.minSelections} option{group.minSelections! > 1 ? 's' : ''}
          </div>
        )}

        {group.maxSelections && getSelectionCount() > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {getSelectionCount()} of {group.maxSelections} selected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModifierGroupSelector;
