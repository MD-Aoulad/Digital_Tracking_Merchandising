import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Download, 
  Upload, 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Save,
  Eye,
  EyeOff,
  Calculator,
  Clock,
  Car,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock function to geocode addresses (replace with real geocoding in production)
const mockGeocode = async (csvData: string[]): Promise<{
  lat: number; 
  lng: number; 
  address: string;
  name: string;
  type: string;
  priority: string;
  visitDuration: number;
  frequency: number;
}[]> => {
  // For demo, randomize points within Germany's bounding box
  return csvData.map((line, i) => {
    const [name, address, type = 'Supermarket', priority = 'Medium', duration = '4', freq = '7'] = line.split(',').map(s => s.trim());
    return {
      name,
      address,
      type,
      priority,
      visitDuration: parseInt(duration) || 4,
      frequency: parseInt(freq) || 7,
      lat: 51 + Math.random() * 3 - 1.5, // 49.5 to 52.5
      lng: 10 + Math.random() * 6 - 3,   // 7 to 13
    };
  });
};

// Template CSV content
const templateCsv = 'Store Name,Address,Store Type,Priority,Expected Visit Duration (hours),Visit Frequency (days)\nStore 1,Alexanderplatz 1 Berlin,Supermarket,High,4,7\nStore 2,Marienplatz 8 Munich,Convenience Store,Medium,2,14\nStore 3,Königsallee 1 Düsseldorf,Department Store,High,6,7';

// Store types and their characteristics
const storeTypes = {
  'Supermarket': { color: '#3B82F6', visitDuration: 4, frequency: 7 },
  'Convenience Store': { color: '#10B981', visitDuration: 2, frequency: 14 },
  'Department Store': { color: '#F59E0B', visitDuration: 6, frequency: 7 },
  'Specialty Store': { color: '#8B5CF6', visitDuration: 3, frequency: 10 },
  'Hypermarket': { color: '#EF4444', visitDuration: 8, frequency: 5 }
};

// Priority levels
const priorities = {
  'High': { color: '#EF4444', weight: 3 },
  'Medium': { color: '#F59E0B', weight: 2 },
  'Low': { color: '#10B981', weight: 1 }
};

const SimulationPage: React.FC = () => {
  // Core state
  const [numPeople, setNumPeople] = useState(3);
  const [storeData, setStoreData] = useState<{
    lat: number; 
    lng: number; 
    address: string;
    name: string;
    type: string;
    priority: string;
    visitDuration: number;
    frequency: number;
  }[]>([]);
  const [assignments, setAssignments] = useState<Record<number, {
    lat: number; 
    lng: number; 
    address: string;
    name: string;
    type: string;
    priority: string;
    visitDuration: number;
    frequency: number;
  }[]>>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Planning features state
  const [showRoutes, setShowRoutes] = useState(false);
  const [showCoverageAreas, setShowCoverageAreas] = useState(true);
  const [assignmentAlgorithm, setAssignmentAlgorithm] = useState<'round-robin' | 'geographic' | 'workload-balanced'>('geographic');
  const [maxTravelTime, setMaxTravelTime] = useState(60); // minutes
  const [workHoursPerDay, setWorkHoursPerDay] = useState(8);
  const [travelSpeed, setTravelSpeed] = useState(50); // km/h
  const [showMetrics, setShowMetrics] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<Array<{
    id: string;
    name: string;
    numPeople: number;
    assignments: Record<number, any[]>;
    metrics: any;
  }>>([]);

  // Download template handler
  const handleDownloadTemplate = () => {
    const blob = new Blob([templateCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const text = await file.text();
    const lines = text.split('\n').slice(1).filter(Boolean);
    const geocoded = await mockGeocode(lines);
    setStoreData(geocoded);
    setLoading(false);
  };

  // Assign stores to people based on selected algorithm
  React.useEffect(() => {
    if (storeData.length && numPeople > 0) {
      const newAssignments: Record<number, typeof storeData> = {};
      for (let i = 0; i < numPeople; i++) newAssignments[i] = [];
      
      if (assignmentAlgorithm === 'round-robin') {
        storeData.forEach((store, idx) => {
          newAssignments[idx % numPeople].push(store);
        });
      } else if (assignmentAlgorithm === 'geographic') {
        // Simple geographic clustering (in production, use proper clustering algorithms)
        const sortedStores = [...storeData].sort((a, b) => a.lat - b.lat);
        sortedStores.forEach((store, idx) => {
          newAssignments[idx % numPeople].push(store);
        });
      } else if (assignmentAlgorithm === 'workload-balanced') {
        // Balance by total work hours
        const sortedStores = [...storeData].sort((a, b) => b.visitDuration - a.visitDuration);
        sortedStores.forEach((store, idx) => {
          newAssignments[idx % numPeople].push(store);
        });
      }
      
      setAssignments(newAssignments);
    }
  }, [storeData, numPeople, assignmentAlgorithm]);

  // Color palette for people
  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  // Calculate metrics for the current assignment
  const calculateMetrics = () => {
    if (!storeData.length || !numPeople) return null;
    
    const totalStores = storeData.length;
    const totalWorkHours = storeData.reduce((sum, store) => sum + store.visitDuration, 0);
    const avgStoresPerPerson = totalStores / numPeople;
    const avgWorkHoursPerPerson = totalWorkHours / numPeople;
    
    const workloadDistribution = Object.values(assignments).map(stores => 
      stores.reduce((sum, store) => sum + store.visitDuration, 0)
    );
    const maxWorkload = Math.max(...workloadDistribution);
    const minWorkload = Math.min(...workloadDistribution);
    const workloadBalance = ((maxWorkload - minWorkload) / avgWorkHoursPerPerson) * 100;
    
    return {
      totalStores,
      totalWorkHours,
      avgStoresPerPerson,
      avgWorkHoursPerPerson,
      workloadBalance,
      maxWorkload,
      minWorkload
    };
  };

  const metrics = calculateMetrics();

  // Save current scenario
  const handleSaveScenario = () => {
    const scenarioName = prompt('Enter scenario name:');
    if (!scenarioName) return;
    
    const newScenario = {
      id: Date.now().toString(),
      name: scenarioName,
      numPeople,
      assignments,
      metrics
    };
    setSavedScenarios(prev => [...prev, newScenario]);
  };

  // Load saved scenario
  const handleLoadScenario = (scenario: typeof savedScenarios[0]) => {
    setNumPeople(scenario.numPeople);
    setAssignments(scenario.assignments);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Coverage Simulation</h1>
        <p className="text-gray-600">Plan optimal store coverage and hiring decisions with advanced analytics</p>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Data Input Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Data Input
          </h3>
          <div className="space-y-4">
            <button 
              onClick={handleDownloadTemplate} 
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Store CSV
            </button>
            {loading && (
              <div className="flex items-center text-blue-600">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing addresses...
              </div>
            )}
          </div>
        </div>

        {/* Planning Parameters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Planning Parameters
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
              <input 
                type="number" 
                min={1} 
                max={20} 
                value={numPeople} 
                onChange={e => setNumPeople(Number(e.target.value))} 
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Algorithm</label>
              <select 
                value={assignmentAlgorithm} 
                onChange={e => setAssignmentAlgorithm(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="round-robin">Round Robin</option>
                <option value="geographic">Geographic Clustering</option>
                <option value="workload-balanced">Workload Balanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Travel Time (min)</label>
              <input 
                type="number" 
                value={maxTravelTime} 
                onChange={e => setMaxTravelTime(Number(e.target.value))} 
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Hours/Day</label>
              <input 
                type="number" 
                value={workHoursPerDay} 
                onChange={e => setWorkHoursPerDay(Number(e.target.value))} 
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Map Controls
          </h3>
          <div className="space-y-4">
            <button 
              onClick={() => setShowCoverageAreas(!showCoverageAreas)}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                showCoverageAreas ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {showCoverageAreas ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              Coverage Areas
            </button>
            <button 
              onClick={() => setShowRoutes(!showRoutes)}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                showRoutes ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Car className="w-4 h-4 mr-2" />
              Show Routes
            </button>
            <button 
              onClick={() => setShowMetrics(!showMetrics)}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                showMetrics ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Show Metrics
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
        <div className="h-[600px] w-full">
          <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {Object.entries(assignments).map(([personIdx, stores]) => (
              stores.map((store, i) => (
                <Marker key={store.address + i} position={[store.lat, store.lng]}>
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold">{store.name}</h4>
                      <p className="text-sm text-gray-600">{store.address}</p>
                      <p className="text-sm"><strong>Type:</strong> {store.type}</p>
                      <p className="text-sm"><strong>Priority:</strong> {store.priority}</p>
                      <p className="text-sm"><strong>Duration:</strong> {store.visitDuration}h</p>
                      <p className="text-sm"><strong>Frequency:</strong> {store.frequency} days</p>
                      <p className="text-sm"><strong>Assigned to:</strong> Person {Number(personIdx) + 1}</p>
                    </div>
                  </Popup>
                  {showCoverageAreas && (
                    <Circle 
                      center={[store.lat, store.lng]} 
                      radius={5000} 
                      pathOptions={{ 
                        color: colors[Number(personIdx) % colors.length], 
                        fillColor: colors[Number(personIdx) % colors.length], 
                        fillOpacity: 0.2 
                      }} 
                    />
                  )}
                </Marker>
              ))
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Metrics and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Panel */}
        {showMetrics && metrics && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalStores}</div>
                <div className="text-sm text-gray-600">Total Stores</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{metrics.totalWorkHours}h</div>
                <div className="text-sm text-gray-600">Total Work Hours</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{metrics.avgStoresPerPerson.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Stores/Person</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{metrics.avgWorkHoursPerPerson.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Avg Hours/Person</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Workload Balance:</span>
                <span className={`text-sm font-bold ${
                  metrics.workloadBalance < 20 ? 'text-green-600' : 
                  metrics.workloadBalance < 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.workloadBalance.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {metrics.workloadBalance < 20 ? 'Excellent balance' : 
                 metrics.workloadBalance < 40 ? 'Good balance' : 'Needs improvement'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleSaveScenario}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Scenario
            </button>
            <button 
              onClick={() => window.print()}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
            <button 
              onClick={() => {
                setStoreData([]);
                setAssignments({});
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Simulation
            </button>
          </div>

          {/* Saved Scenarios */}
          {savedScenarios.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Saved Scenarios</h4>
              <div className="space-y-2">
                {savedScenarios.map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => handleLoadScenario(scenario)}
                    className="w-full text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-xs text-gray-600">
                      {scenario.numPeople} people • {scenario.metrics?.totalStores} stores
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-blue-900">How to Use This Planning Tool</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h3 className="font-medium mb-2">1. Data Preparation</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>Download the template CSV file</li>
              <li>Fill in store details: name, address, type, priority</li>
              <li>Specify visit duration and frequency</li>
              <li>Upload your completed CSV file</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">2. Planning Parameters</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>Set the number of people to hire</li>
              <li>Choose assignment algorithm</li>
              <li>Configure travel and work constraints</li>
              <li>Adjust map visualization options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage; 