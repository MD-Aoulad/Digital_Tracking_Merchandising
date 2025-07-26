/**
 * Premium Retail Operations Dashboard - Login Page
 * 
 * Investor-grade visualization showcasing ROI, efficiency gains,
 * cost savings, and business impact for retail stakeholders.
 * 
 * Features:
 * - Real-time revenue tracking and projections
 * - Cost savings visualization with live calculations
 * - Workforce efficiency metrics and KPIs
 * - Interactive store performance analytics
 * - Animated business impact demonstrations
 * - Professional investor presentation design
 * 
 * @author UI/UX Expert Team
 * @version 4.2.0 - Investor Edition (Realistic Icons)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Store, 
  Truck, 
  Clock,
  CheckCircle,
  BarChart3,
  Target,
  Zap,
  Star,
  ShoppingCart,
  Building2,
  PieChart,
  Activity,
  Award,
  TrendingDown,
  Calendar,
  MapPin,
  Package,
  Route,
  Warehouse,
  ShoppingBag,
  Box,
  Palette,
  Coffee,
  Car,
  Home,
  Briefcase,
  Heart,
  Shield
} from 'lucide-react';
import LoginForm from '../components/Auth/LoginForm';

// Premium retail data for investor presentation
const RETAIL_METRICS = {
  totalRevenue: 2847000,
  costSavings: 427000,
  efficiencyGain: 34.5,
  storesOptimized: 127,
  workforceSize: 2847,
  deliveryRoutes: 89,
  customerSatisfaction: 96.8,
  operationalEfficiency: 98.5,
  roi: 156.7,
  timeSaved: 2840
};

// Store performance data
const STORE_PERFORMANCE = [
  { name: 'Berlin Central', revenue: 284000, efficiency: 98.2, savings: 42000, trend: 'up' },
  { name: 'Munich Premium', revenue: 312000, efficiency: 97.8, savings: 38000, trend: 'up' },
  { name: 'Hamburg Harbor', revenue: 198000, efficiency: 96.5, savings: 29000, trend: 'up' },
  { name: 'Cologne Business', revenue: 156000, efficiency: 95.9, savings: 22000, trend: 'up' },
  { name: 'Frankfurt Finance', revenue: 134000, efficiency: 94.2, savings: 18000, trend: 'up' }
];

// Real-time delivery data with corrected amounts
const DELIVERY_DATA = [
  { route: 'Berlin → Hamburg', packages: 284, efficiency: 98.5, savings: 4200, distance: '280km' },
  { route: 'Munich → Stuttgart', packages: 198, efficiency: 97.2, savings: 3100, distance: '220km' },
  { route: 'Cologne → Düsseldorf', packages: 156, efficiency: 96.8, savings: 2400, distance: '40km' },
  { route: 'Frankfurt → Cologne', packages: 134, efficiency: 95.4, savings: 1900, distance: '180km' }
];

// German cities with business metrics and better positioning
const GERMAN_CITIES = [
  { name: 'Berlin', x: 82, y: 22, revenue: 284000, efficiency: 98.2, stores: 12, color: '#3B82F6', type: 'warehouse' },
  { name: 'Hamburg', x: 72, y: 12, revenue: 198000, efficiency: 96.5, stores: 8, color: '#10B981', type: 'warehouse' },
  { name: 'Munich', x: 88, y: 75, revenue: 312000, efficiency: 97.8, stores: 15, color: '#F59E0B', type: 'store' },
  { name: 'Cologne', x: 58, y: 42, revenue: 156000, efficiency: 95.9, stores: 10, color: '#8B5CF6', type: 'store' },
  { name: 'Frankfurt', x: 68, y: 48, revenue: 134000, efficiency: 94.2, stores: 9, color: '#EF4444', type: 'warehouse' },
  { name: 'Stuttgart', x: 72, y: 68, revenue: 98000, efficiency: 93.8, stores: 7, color: '#06B6D4', type: 'store' },
  { name: 'Düsseldorf', x: 62, y: 38, revenue: 89000, efficiency: 92.5, stores: 6, color: '#84CC16', type: 'store' },
  { name: 'Dortmund', x: 52, y: 32, revenue: 76000, efficiency: 91.2, stores: 5, color: '#F97316', type: 'warehouse' },
  { name: 'Essen', x: 55, y: 35, revenue: 67000, efficiency: 90.8, stores: 4, color: '#EC4899', type: 'store' },
  { name: 'Leipzig', x: 78, y: 32, revenue: 54000, efficiency: 89.5, stores: 6, color: '#6366F1', type: 'store' }
];

const Login: React.FC = () => {
  const [currentMetric, setCurrentMetric] = useState(0);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [revenueCounter, setRevenueCounter] = useState(0);
  const [savingsCounter, setSavingsCounter] = useState(0);
  const [efficiencyCounter, setEfficiencyCounter] = useState(0);
  const [deliveryTrucks, setDeliveryTrucks] = useState<Array<{
    id: number;
    from: string;
    to: string;
    progress: number;
    packages: number;
    revenue: number;
  }>>([]);
  const [floatingElements, setFloatingElements] = useState<Array<{
    id: number;
    type: 'warehouse' | 'store' | 'package' | 'truck' | 'euro' | 'star' | 'zap' | 'trend' | 'shopping' | 'box';
    x: number;
    y: number;
    value: number;
    delay: number;
  }>>([]);

  // Animate revenue counter
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenueCounter(prev => {
        if (prev < RETAIL_METRICS.totalRevenue) {
          return prev + Math.ceil(RETAIL_METRICS.totalRevenue / 100);
        }
        return RETAIL_METRICS.totalRevenue;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Animate savings counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSavingsCounter(prev => {
        if (prev < RETAIL_METRICS.costSavings) {
          return prev + Math.ceil(RETAIL_METRICS.costSavings / 100);
        }
        return RETAIL_METRICS.costSavings;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Animate efficiency counter
  useEffect(() => {
    const interval = setInterval(() => {
      setEfficiencyCounter(prev => {
        if (prev < RETAIL_METRICS.efficiencyGain) {
          return prev + 0.5;
        }
        return RETAIL_METRICS.efficiencyGain;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Generate delivery trucks with revenue data
  useEffect(() => {
    const interval = setInterval(() => {
      if (deliveryTrucks.length < 4) {
        const route = DELIVERY_DATA[Math.floor(Math.random() * DELIVERY_DATA.length)];
        const newTruck = {
          id: Date.now(),
          from: route.route.split(' → ')[0],
          to: route.route.split(' → ')[1],
          progress: 0,
          packages: route.packages,
          revenue: route.savings
        };
        setDeliveryTrucks(prev => [...prev, newTruck]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [deliveryTrucks.length]);

  // Animate delivery trucks
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryTrucks(prev => 
        prev.map(truck => ({
          ...truck,
          progress: Math.min(100, truck.progress + 1)
        })).filter(truck => truck.progress < 100)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Generate floating retail elements
  useEffect(() => {
    const interval = setInterval(() => {
      if (floatingElements.length < 8) {
        const types: Array<'warehouse' | 'store' | 'package' | 'truck' | 'euro' | 'star' | 'zap' | 'trend' | 'shopping' | 'box'> = [
          'warehouse', 'store', 'package', 'truck', 'euro', 'star', 'zap', 'trend', 'shopping', 'box'
        ];
        const newElement = {
          id: Date.now(),
          type: types[Math.floor(Math.random() * types.length)],
          x: Math.random() * 70 + 15, // Avoid edges
          y: Math.random() * 50 + 25, // Avoid edges
          value: Math.floor(Math.random() * 3000) + 500,
          delay: Math.random() * 2
        };
        setFloatingElements(prev => [...prev, newElement]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [floatingElements.length]);

  // Remove floating elements after animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingElements(prev => prev.slice(-6));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Rotate through key metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric(prev => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getCityCoordinates = (cityName: string) => {
    return GERMAN_CITIES.find(city => city.name === cityName);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderFloatingElement = (element: {
    id: number;
    type: 'warehouse' | 'store' | 'package' | 'truck' | 'euro' | 'star' | 'zap' | 'trend' | 'shopping' | 'box';
    x: number;
    y: number;
    value: number;
    delay: number;
  }) => {
    const icons = {
      warehouse: Warehouse,
      store: Store,
      package: Package,
      truck: Truck,
      euro: DollarSign,
      star: Star,
      zap: Zap,
      trend: TrendingUp,
      shopping: ShoppingBag,
      box: Box
    };
    const Icon = icons[element.type];
    const colors = {
      warehouse: 'text-blue-500',
      store: 'text-green-500',
      package: 'text-purple-500',
      truck: 'text-yellow-500',
      euro: 'text-green-400',
      star: 'text-yellow-400',
      zap: 'text-orange-400',
      trend: 'text-emerald-400',
      shopping: 'text-pink-400',
      box: 'text-indigo-400'
    };

    const labels = {
      warehouse: 'Warehouse',
      store: 'Store',
      package: 'Package',
      truck: 'Delivery',
      euro: 'Revenue',
      star: 'Premium',
      zap: 'Express',
      trend: 'Growth',
      shopping: 'Retail',
      box: 'Inventory'
    };

    return (
      <motion.div
        key={element.id}
        className="absolute pointer-events-none"
        style={{ left: `${element.x}%`, top: `${element.y}%` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1, 1.2, 1],
          opacity: [0, 1, 0.8, 0],
          y: [0, -30, -60, -90]
        }}
        transition={{ 
          duration: 4, 
          delay: element.delay,
          ease: "easeOut"
        }}
        onAnimationComplete={() => {
          setFloatingElements(prev => prev.filter(el => el.id !== element.id));
        }}
      >
        <div className="flex flex-col items-center">
          <Icon className={`w-5 h-5 ${colors[element.type]} drop-shadow-lg`} />
          <div className="text-xs text-white font-bold mt-1 bg-black/70 px-2 py-1 rounded whitespace-nowrap">
            {labels[element.type]}
          </div>
          <div className="text-xs text-white font-bold mt-1 bg-black/70 px-2 py-1 rounded whitespace-nowrap">
            +{formatCurrency(element.value)}
          </div>
        </div>
      </motion.div>
    );
  };

  const getMetricData = (index: number) => {
    const metrics = [
      { label: 'Total Revenue', value: formatCurrency(revenueCounter), icon: DollarSign, color: 'text-green-400' },
      { label: 'Cost Savings', value: formatCurrency(savingsCounter), icon: TrendingUp, color: 'text-blue-400' },
      { label: 'Efficiency Gain', value: `${efficiencyCounter.toFixed(1)}%`, icon: Target, color: 'text-purple-400' },
      { label: 'ROI', value: `${RETAIL_METRICS.roi}%`, icon: Award, color: 'text-yellow-400' }
    ];
    return metrics[index];
  };

  const getCityIcon = (cityType: string) => {
    return cityType === 'warehouse' ? Warehouse : Store;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex">
      {/* Left Side - Premium Retail Dashboard */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
              backgroundSize: '60px 60px'
            }} />
          </div>
          
          {/* Animated Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Floating Revenue Particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full p-6 flex flex-col">
          {/* Premium Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Building2 className="w-7 h-7 text-blue-300" />
                <span>Workforce Manager Pro</span>
              </h1>
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">LIVE</span>
              </div>
            </div>
            <p className="text-blue-200 text-base">Enterprise Retail Operations Platform</p>
            <p className="text-gray-400 text-sm">Real-time analytics • Cost optimization • Revenue growth</p>
          </motion.div>

          {/* Key Metrics Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-4"
          >
            {/* Featured Metric */}
            <motion.div
              key={currentMetric}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-3 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white/10 ${getMetricData(currentMetric).color}`}>
                    {React.createElement(getMetricData(currentMetric).icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{getMetricData(currentMetric).label}</p>
                    <p className="text-xl font-bold text-white">{getMetricData(currentMetric).value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-medium">↑ +12.5%</p>
                  <p className="text-white/60 text-xs">vs last month</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-blue-300" />
                <div>
                  <p className="text-lg font-bold text-white">{RETAIL_METRICS.storesOptimized}</p>
                  <p className="text-blue-200 text-xs">Stores Optimized</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-300" />
                <div>
                  <p className="text-lg font-bold text-white">{RETAIL_METRICS.workforceSize.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs">Workforce Size</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Business Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex-1 relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>German Retail Network</span>
              </h3>
              <div className="flex items-center space-x-2 text-green-300 text-xs">
                <Activity className="w-4 h-4" />
                <span>Real-time Data</span>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-full min-h-[380px]">
              {/* SVG Container for Routes */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Revenue Flow Lines */}
                {DELIVERY_DATA.map((route, index) => {
                  const fromCity = getCityCoordinates(route.route.split(' → ')[0]);
                  const toCity = getCityCoordinates(route.route.split(' → ')[1]);
                  if (!fromCity || !toCity) return null;

                  const isActive = activeRoute === route.route;
                  const strokeColor = isActive ? '#10B981' : '#6B7280';
                  const strokeWidth = isActive ? 3 : 1;

                  return (
                    <g key={route.route}>
                      <motion.line
                        x1={`${fromCity.x}%`}
                        y1={`${fromCity.y}%`}
                        x2={`${toCity.x}%`}
                        y2={`${toCity.y}%`}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isActive ? '5,5' : 'none'}
                        className="transition-all duration-300 cursor-pointer"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        onMouseEnter={() => setActiveRoute(route.route)}
                        onMouseLeave={() => setActiveRoute(null)}
                      />
                      
                      {isActive && (
                        <motion.text
                          x={`${(fromCity.x + toCity.x) / 2}%`}
                          y={`${(fromCity.y + toCity.y) / 2}%`}
                          textAnchor="middle"
                          className="text-xs font-medium fill-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {formatCurrency(route.savings)}
                        </motion.text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Delivery Trucks with Revenue */}
              {deliveryTrucks.map(truck => {
                const fromCity = getCityCoordinates(truck.from);
                const toCity = getCityCoordinates(truck.to);
                if (!fromCity || !toCity) return null;

                const x = fromCity.x + (toCity.x - fromCity.x) * (truck.progress / 100);
                const y = fromCity.y + (toCity.y - fromCity.y) * (truck.progress / 100);

                return (
                  <motion.div
                    key={truck.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-2 shadow-lg border-2 border-yellow-300">
                      <Truck className="w-4 h-4 text-yellow-900" />
                    </div>
                    <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                      {formatCurrency(truck.revenue)}
                    </div>
                  </motion.div>
                );
              })}

              {/* Floating Retail Elements */}
              {floatingElements.map(renderFloatingElement)}

              {/* Cities with Revenue Data */}
              {GERMAN_CITIES.map((city, index) => {
                const isHovered = hoveredCity === city.name;
                const isActive = activeRoute?.includes(city.name);
                const CityIcon = getCityIcon(city.type);

                return (
                  <motion.div
                    key={city.name}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: `${city.x}%`, top: `${city.y}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.3 }}
                    onMouseEnter={() => setHoveredCity(city.name)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    {/* City Icon with Revenue Ring */}
                    <motion.div
                      className={`w-6 h-6 rounded-lg border-2 border-white shadow-lg relative flex items-center justify-center ${
                        isHovered ? 'scale-150' : 'scale-100'
                      } transition-all duration-300`}
                      style={{ backgroundColor: city.color }}
                      animate={{
                        boxShadow: isHovered 
                          ? '0 0 25px rgba(59, 130, 246, 0.8)' 
                          : '0 4px 8px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <CityIcon className="w-3 h-3 text-white" />
                      
                      {/* Revenue Ring */}
                      <motion.div
                        className="absolute inset-0 rounded-lg border-2 border-green-400"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 0, 0.8]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      />
                    </motion.div>

                    {/* City Label with Revenue */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-900 to-purple-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap z-20 border border-white/20"
                        >
                          <div className="text-center">
                            <div className="font-bold text-base flex items-center justify-center space-x-1">
                              <CityIcon className="w-3 h-3" />
                              <span>{city.name}</span>
                            </div>
                            <div className="text-green-400 font-bold text-base">{formatCurrency(city.revenue)}</div>
                            <div className="text-xs text-gray-300">{city.stores} {city.type}s • {city.efficiency}% efficiency</div>
                          </div>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-900 rotate-45 border-l border-t border-white/20"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Business Impact Legend */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/20">
              <div className="flex items-center space-x-3 text-white text-xs">
                <div className="flex items-center space-x-2">
                  <Warehouse className="w-3 h-3 text-blue-400" />
                  <span>Warehouses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Store className="w-3 h-3 text-green-400" />
                  <span>Stores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-3 h-3 text-yellow-400" />
                  <span>Deliveries</span>
                </div>
              </div>
            </div>

            {/* ROI Indicator */}
            <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-2 border border-green-300/30">
              <div className="flex items-center space-x-2 text-green-300 text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>ROI: {RETAIL_METRICS.roi}%</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Business Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-3 grid grid-cols-3 gap-2 text-white/80 text-xs"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>98.5% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{RETAIL_METRICS.timeSaved}h Saved</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>ISO 27001</span>
            </div>
          </motion.div>
        </div>

        {/* Premium Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-16 right-16 opacity-30"
        >
          <DollarSign className="w-16 h-16 text-green-400" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-16 right-12 opacity-30"
        >
          <TrendingUp className="w-12 h-12 text-blue-400" />
        </motion.div>

        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 right-6 opacity-20"
        >
          <Award className="w-20 h-20 text-yellow-400" />
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
