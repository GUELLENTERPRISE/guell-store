import { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Coffee, Utensils, Pizza, Salad } from 'lucide-react';

interface GreetingConfig {
  message: string;
  emoji: string;
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
}

const ContextualGreeting: React.FC = () => {
  const [greeting, setGreeting] = useState<GreetingConfig | null>(null);

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      let greetingConfig: GreetingConfig;

      // Time-based greetings
      if (hour >= 5 && hour < 12) {
        // Morning (5 AM - 12 PM)
        greetingConfig = {
          message: dayOfWeek === 0 || dayOfWeek === 6 
            ? '¡Buenos días! 🌞 ¿Comenzamos el fin de semana con un delicioso desayuno?'
            : '¡Buenos días! ☀️ ¿Qué tal un café y algo rico para empezar el día?',
          emoji: '🌞',
          icon: <Coffee className="w-6 h-6" />,
          backgroundColor: 'bg-gradient-to-r from-yellow-400 to-orange-400',
          textColor: 'text-white'
        };
      } else if (hour >= 12 && hour < 14) {
        // Lunch time (12 PM - 2 PM)
        greetingConfig = {
          message: dayOfWeek === 5 
            ? '¡Viernes de almuerzo! 🍕 ¿Pizza o algo más ligero?'
            : '¡Hora del almuerzo! 🍽️ ¿Qué se te antoja hoy?',
          emoji: '🍽️',
          icon: <Utensils className="w-6 h-6" />,
          backgroundColor: 'bg-gradient-to-r from-orange-400 to-red-400',
          textColor: 'text-white'
        };
      } else if (hour >= 14 && hour < 18) {
        // Afternoon (2 PM - 6 PM)
        greetingConfig = {
          message: dayOfWeek === 5 
            ? '¡Viernes de tarde! 🥗 ¿Un snack saludable para la oficina?'
            : '¡Tarde perfecta! 🥗 ¿Un snack ligero o preparando la cena?',
          emoji: '🥗',
          icon: <Salad className="w-6 h-6" />,
          backgroundColor: 'bg-gradient-to-r from-green-400 to-teal-400',
          textColor: 'text-white'
        };
      } else if (hour >= 18 && hour < 22) {
        // Evening (6 PM - 10 PM)
        greetingConfig = {
          message: dayOfWeek === 5 || dayOfWeek === 6 
            ? '¡Fin de semana! 🍕 ¿Pizza y película o cena con amigos?'
            : '¡Noche perfecta! 🌙 ¿Cena en casa o algo especial?',
          emoji: '🌙',
          icon: <Moon className="w-6 h-6" />,
          backgroundColor: 'bg-gradient-to-r from-purple-400 to-indigo-400',
          textColor: 'text-white'
        };
      } else {
        // Late night (10 PM - 5 AM)
        greetingConfig = {
          message: hour >= 22 && hour <= 23 
            ? '🌙 ¿Antojo nocturno? Te lo llevamos rápido y caliente'
            : hour >= 0 && hour < 3 
            ? '🍕 Madrugadores unidos! ¿Pizza para estudiar o trabajar?'
            : '☀️ ¡Madrugada productiva! Un café y algo rico para empezar',
          emoji: hour >= 22 ? '🌙' : '☀️',
          icon: hour >= 22 ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />,
          backgroundColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
          textColor: 'text-white'
        };
      }

      // Special day-based modifications
      const specialMessages = getSpecialDayMessages(now);
      if (specialMessages) {
        greetingConfig = { ...greetingConfig, ...specialMessages };
      }

      setGreeting(greetingConfig);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getSpecialDayMessages = (date: Date): Partial<GreetingConfig> | null => {
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    // Weekend messages
    if (dayOfWeek === 0) { // Sunday
      return {
        message: '¡Domingo de relax! 🛋️ ¿Comodidad en casa o brunch familiar?',
        emoji: '🛋️',
        backgroundColor: 'bg-gradient-to-r from-pink-400 to-purple-400'
      };
    } else if (dayOfWeek === 6) { // Saturday
      return {
        message: '¡Sábado de disfrutar! 🎉 ¿Comida especial para el fin de semana?',
        emoji: '🎉',
        backgroundColor: 'bg-gradient-to-r from-purple-400 to-pink-400'
      };
    }

    // Special dates (you can expand this)
    if (month === 11 && day === 24) { // Christmas Eve
      return {
        message: '¡Nochebuena! 🎄 Cena especial para compartir en familia',
        emoji: '🎄',
        backgroundColor: 'bg-gradient-to-r from-red-400 to-green-400'
      };
    } else if (month === 11 && day === 31) { // New Year's Eve
      return {
        message: '¡Fin de año! 🎊 ¿Champán y algo delicioso para celebrar?',
        emoji: '🎊',
        backgroundColor: 'bg-gradient-to-r from-yellow-400 to-red-400'
      };
    } else if (month === 1 && day === 1) { // New Year's Day
      return {
        message: '¡Feliz año nuevo! 🎇 ¿Comida saludable para empezar bien?',
        emoji: '🎇',
        backgroundColor: 'bg-gradient-to-r from-green-400 to-blue-400'
      };
    }

    // Sports events (example - you can make this dynamic)
    if (month === 5 && dayOfWeek === 0) { // Sundays in May (example: soccer season)
      return {
        message: '¡Domingo de fútbol! 🏈 ¿Pizza y amigos para el partido?',
        emoji: '🏈',
        backgroundColor: 'bg-gradient-to-r from-green-400 to-blue-400'
      };
    }

    return null;
  };

  if (!greeting) return null;

  return (
    <div className={`${greeting.backgroundColor} ${greeting.textColor} rounded-2xl p-6 mb-6 shadow-lg transform transition-all duration-500 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-card bg-opacity-20 rounded-full p-3">
            {greeting.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {greeting.message}
            </h2>
            <p className="text-sm opacity-90">
              Delivery en 25-45 min • Calidad garantizada
            </p>
          </div>
        </div>
        
        <div className="text-4xl animate-bounce">
          {greeting.emoji}
        </div>
      </div>
      
      {/* Additional contextual info */}
      <div className="mt-4 flex items-center gap-4 text-sm opacity-90">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Abierto ahora</span>
        </div>
        <div className="flex items-center gap-1">
          <Pizza className="w-4 h-4" />
          <span>50+ restaurantes</span>
        </div>
        <div className="flex items-center gap-1">
          <Utensils className="w-4 h-4" />
          <span>Calidad premium</span>
        </div>
      </div>
    </div>
  );
};

export default ContextualGreeting;
