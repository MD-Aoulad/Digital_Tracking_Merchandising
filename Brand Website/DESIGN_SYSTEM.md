# Design System Documentation
## Brand Website - Apple-Inspired Modern Design

**Design System Version**: 1.0  
**Last Updated**: July 27, 2025  
**Inspiration**: Apple.com modern design language  
**Animation Framework**: Framer Motion  

---

## 🎨 **Design Philosophy**

### **Core Design Principles**
1. **Simplicity**: Clean, uncluttered interfaces
2. **Clarity**: Clear hierarchy and communication
3. **Elegance**: Sophisticated visual design
4. **Accessibility**: Inclusive design for all users
5. **Performance**: Smooth, responsive interactions

### **Brand Identity**
- **Modern**: Contemporary design language
- **Professional**: Enterprise-grade appearance
- **Trustworthy**: Security and reliability focus
- **Innovative**: Cutting-edge technology showcase

---

## 🎨 **Color System**

### **Primary Colors**
```css
/* Apple-inspired Color Palette */
:root {
  /* Primary Colors */
  --primary-blue: #007AFF;      /* Apple Blue */
  --primary-green: #34C759;     /* Apple Green */
  --primary-red: #FF3B30;       /* Apple Red */
  --primary-orange: #FF9500;    /* Apple Orange */
  --primary-purple: #AF52DE;    /* Apple Purple */
  
  /* Neutral Colors */
  --white: #FFFFFF;
  --light-gray: #F5F5F7;
  --medium-gray: #8E8E93;
  --dark-gray: #1D1D1F;
  --black: #000000;
  
  /* Semantic Colors */
  --success: #34C759;
  --warning: #FF9500;
  --error: #FF3B30;
  --info: #007AFF;
}
```

### **Color Usage Guidelines**

#### **Primary Blue (#007AFF)**
- Primary buttons and CTAs
- Links and interactive elements
- Brand highlights
- Active states

#### **Primary Green (#34C759)**
- Success states
- Positive actions
- Progress indicators
- Confirmation messages

#### **Primary Red (#FF3B30)**
- Error states
- Destructive actions
- Warning messages
- Critical alerts

#### **Neutral Grays**
- Background colors
- Text colors
- Borders and dividers
- Disabled states

---

## 📝 **Typography**

### **Font Stack**
```css
/* Font Family */
:root {
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
}
```

### **Type Scale**
```css
/* Typography Scale */
:root {
  /* Display */
  --text-display-1: 3.5rem;    /* 56px */
  --text-display-2: 3rem;      /* 48px */
  --text-display-3: 2.5rem;    /* 40px */
  
  /* Headings */
  --text-h1: 2rem;             /* 32px */
  --text-h2: 1.75rem;          /* 28px */
  --text-h3: 1.5rem;           /* 24px */
  --text-h4: 1.25rem;          /* 20px */
  --text-h5: 1.125rem;         /* 18px */
  --text-h6: 1rem;             /* 16px */
  
  /* Body */
  --text-body-large: 1.125rem; /* 18px */
  --text-body: 1rem;           /* 16px */
  --text-body-small: 0.875rem; /* 14px */
  --text-caption: 0.75rem;     /* 12px */
}
```

### **Font Weights**
```css
/* Font Weights */
:root {
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### **Typography Usage**

#### **Display Text**
- Hero headlines
- Section titles
- Feature announcements
- Large call-to-actions

#### **Headings**
- Page titles
- Section headers
- Card titles
- Navigation labels

#### **Body Text**
- Main content
- Descriptions
- Explanatory text
- Form labels

#### **Caption Text**
- Metadata
- Timestamps
- Small labels
- Secondary information

---

## 📐 **Spacing System**

### **Spacing Scale**
```css
/* Spacing Scale (8px base) */
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  --space-4xl: 6rem;     /* 96px */
}
```

### **Layout Spacing**
```css
/* Layout Spacing */
:root {
  --container-padding: var(--space-lg);
  --section-spacing: var(--space-4xl);
  --component-spacing: var(--space-xl);
  --element-spacing: var(--space-md);
}
```

---

## 🎭 **Animation System**

### **Animation Principles**
1. **Purposeful**: Every animation serves a function
2. **Smooth**: 60fps performance target
3. **Natural**: Human-like motion curves
4. **Responsive**: Adapts to user preferences
5. **Accessible**: Respects motion preferences

### **Animation Curves**
```typescript
// Framer Motion Animation Curves
const animationCurves = {
  // Easing Curves
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.55, 0.055, 0.675, 0.19],
  easeInOut: [0.645, 0.045, 0.355, 1],
  
  // Spring Curves
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30
  },
  
  // Custom Curves
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275]
};
```

### **Animation Types**

#### **Page Transitions**
```typescript
// Page Transition Animation
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" }
};
```

#### **Scroll Animations**
```typescript
// Scroll Trigger Animation
const scrollAnimation = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};
```

#### **Hover Animations**
```typescript
// Hover Animation
const hoverAnimation = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  whileTap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};
```

#### **Loading Animations**
```typescript
// Loading Animation
const loadingAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};
```

---

## 🧩 **Component Library**

### **Button Components**

#### **Primary Button**
```typescript
// Primary Button Component
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false
}) => {
  return (
    <motion.button
      className={`
        bg-primary-blue text-white font-medium rounded-lg
        hover:bg-blue-600 focus:ring-4 focus:ring-blue-200
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${size === 'sm' ? 'px-4 py-2 text-sm' : ''}
        ${size === 'md' ? 'px-6 py-3 text-base' : ''}
        ${size === 'lg' ? 'px-8 py-4 text-lg' : ''}
        ${fullWidth ? 'w-full' : ''}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
};
```

#### **Secondary Button**
```typescript
// Secondary Button Component
const SecondaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false
}) => {
  return (
    <motion.button
      className={`
        bg-white text-primary-blue border-2 border-primary-blue
        font-medium rounded-lg hover:bg-blue-50
        focus:ring-4 focus:ring-blue-200
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${size === 'sm' ? 'px-4 py-2 text-sm' : ''}
        ${size === 'md' ? 'px-6 py-3 text-base' : ''}
        ${size === 'lg' ? 'px-8 py-4 text-lg' : ''}
        ${fullWidth ? 'w-full' : ''}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-primary-blue border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
};
```

### **Card Components**

#### **Feature Card**
```typescript
// Feature Card Component
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  link
}) => {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-primary-blue bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-dark-gray">{title}</h3>
      </div>
      <p className="text-medium-gray leading-relaxed mb-4">{description}</p>
      {link && (
        <a
          href={link}
          className="text-primary-blue font-medium hover:text-blue-600 transition-colors duration-200"
        >
          Learn more →
        </a>
      )}
    </motion.div>
  );
};
```

#### **Testimonial Card**
```typescript
// Testimonial Card Component
interface TestimonialCardProps {
  quote: string;
  author: string;
  position: string;
  company: string;
  avatar: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  position,
  company,
  avatar
}) => {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mb-4">
        <svg className="w-8 h-8 text-primary-blue mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
        <p className="text-dark-gray leading-relaxed italic">"{quote}"</p>
      </div>
      <div className="flex items-center">
        <img
          src={avatar}
          alt={author}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <p className="font-semibold text-dark-gray">{author}</p>
          <p className="text-sm text-medium-gray">{position} at {company}</p>
        </div>
      </div>
    </motion.div>
  );
};
```

### **Form Components**

#### **Input Field**
```typescript
// Input Field Component
interface InputFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-dark-gray mb-2">
        {label} {required && <span className="text-primary-red">*</span>}
      </label>
      <motion.input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-4 py-3 border rounded-lg focus:ring-4 focus:ring-blue-200
          transition-colors duration-200
          ${error 
            ? 'border-primary-red focus:border-primary-red' 
            : 'border-gray-300 focus:border-primary-blue'
          }
        `}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      />
      {error && (
        <motion.p
          className="text-sm text-primary-red mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
```

---

## 📱 **Responsive Design**

### **Breakpoint System**
```css
/* Responsive Breakpoints */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### **Mobile-First Approach**
```css
/* Mobile-First CSS Example */
.container {
  padding: var(--space-md);
  max-width: 100%;
}

@media (min-width: 768px) {
  .container {
    padding: var(--space-lg);
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--space-xl);
    max-width: 1024px;
  }
}
```

### **Responsive Typography**
```css
/* Responsive Typography */
.hero-title {
  font-size: 2rem;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 4rem;
  }
}
```

---

## ♿ **Accessibility**

### **Accessibility Standards**
- **WCAG 2.1 AA**: Minimum compliance level
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio
- **Motion Preferences**: Respect user motion preferences

### **Accessibility Features**
```typescript
// Accessibility Helper Functions
const getAriaLabel = (element: string, context?: string) => {
  return context ? `${element} ${context}` : element;
};

const getFocusableElements = (container: HTMLElement) => {
  return container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
};

// Reduced Motion Support
const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
```

---

## 🎯 **Performance Guidelines**

### **Animation Performance**
- Use `transform` and `opacity` for animations
- Avoid animating layout properties
- Use `will-change` sparingly
- Implement `requestAnimationFrame` for custom animations

### **Image Optimization**
- Use Next.js Image component
- Implement lazy loading
- Provide multiple image sizes
- Use WebP format with fallbacks

### **Code Splitting**
- Implement dynamic imports
- Use React.lazy for component splitting
- Optimize bundle sizes
- Monitor Core Web Vitals

---

**This design system provides a comprehensive foundation for creating a modern, accessible, and performant brand website that follows Apple's design principles while maintaining enterprise-grade functionality.** 