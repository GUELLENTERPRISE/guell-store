import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const icon = theme === 'dark' ? (
    <Moon className="h-4 w-4" />
  ) : theme === 'light' ? (
    <Sun className="h-4 w-4" />
  ) : (
    <Clock className="h-4 w-4" />
  )

  const label = theme === 'dark' ? 'Modo oscuro'
    : theme === 'light' ? 'Modo claro'
    : 'Automático'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      title={label}
      aria-label={`Tema actual: ${label}. Clic para cambiar`}
      className="flex items-center gap-2"
    >
      {icon}
    </Button>
  )
}
