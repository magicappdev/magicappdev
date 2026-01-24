# Frontend Design Skill - Responsive UI Components

## Overview

This skill provides comprehensive capabilities for creating modern, responsive, flat/material-inspired UI components with dark/light mode support. It enables the design and implementation of user interfaces that are easy to extend and adapt across the MagicAppDev ecosystem.

## Tech Stack

- **Design System**: Flat/Material-inspired design language
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI)
- **Theming**: Light/Dark mode support
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance
- **Animation**: Framer Motion for smooth transitions

## Capabilities

### 1. Design System Implementation

- Create consistent design language across applications
- Implement flat/material-inspired components
- Set up design tokens and theme variables
- Create component libraries for reuse
- Implement design system documentation

### 2. Responsive UI Development

- Implement mobile-first responsive design
- Create adaptive layouts for different screen sizes
- Implement responsive typography
- Set up responsive breakpoints
- Test and optimize for various devices

### 3. Theme Management

- Implement light/dark mode switching
- Create theme-aware components
- Set up theme context and providers
- Implement theme persistence
- Create customizable theme options

### 4. Component Development

- Build reusable UI components
- Implement component composition patterns
- Create accessible components
- Implement component documentation
- Set up component testing

### 5. Animation & Transitions

- Implement smooth animations with Framer Motion
- Create loading states and transitions
- Implement hover and focus effects
- Set up page transitions
- Create micro-interactions

### 6. Accessibility

- Implement WCAG-compliant components
- Set up keyboard navigation
- Implement ARIA attributes
- Create accessible color schemes
- Test with screen readers

## Implementation Examples

### Theme-Aware Button Component

```typescript
// components/ui/Button.tsx
import { cva } from 'class-variance-authority';
import { useTheme } from '@/contexts/ThemeContext';

export const buttonVariants = cva(
  'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  const { theme } = useTheme();

  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
```

### Responsive Layout Component

```typescript
// components/ui/ResponsiveLayout.tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function ResponsiveLayout({ children }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <div className="w-full h-full">
      {isMobile ? (
        <div className="flex flex-col">{children}</div>
      ) : isTablet ? (
        <div className="grid grid-cols-2 gap-4">{children}</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">{children}</div>
      )}
    </div>
  );
}
```

### Theme Context Implementation

```typescript
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('auto');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        setIsDark(mediaQuery.matches);
      }
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    if (theme === 'light') {
      setIsDark(false);
    } else if (theme === 'dark') {
      setIsDark(true);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

## Best Practices

1. **Consistency**: Maintain consistent design language across components
2. **Responsive**: Always design with mobile-first approach
3. **Accessibility**: Ensure all components are accessible
4. **Performance**: Optimize components for performance
5. **Documentation**: Document all components and design decisions
6. **Testing**: Test components across different devices and browsers

## Integration with MagicAppDev

- Use the shared design system across web and mobile applications
- Leverage Tailwind CSS for consistent styling
- Implement theme context for consistent theming
- Use Shadcn/UI components for consistent UI patterns
- Follow the responsive design guidelines

## Next Steps

- Create comprehensive design system documentation
- Implement more advanced animation patterns
- Add more customizable theme options
- Implement component testing framework
- Create design system showcase page

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [MagicAppDev Design Agends](Agends.md)
