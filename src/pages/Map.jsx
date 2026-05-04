import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import { ArrowLeft, Navigation, Navigation2, RefreshCw, Search, X, LocateFixed } from 'lucide-react';
import { machinesAPI } from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix Leaflet's default icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Modern Glowing Pin for Smart Bins
const getBinIcon = (isSelected) => new L.DivIcon({
  className: 'custom-bin-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute inset-0 w-10 h-10 bg-green-500 rounded-full opacity-20 ${isSelected ? 'animate-ping' : ''}"></div>
      <div class="relative w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-green-500 flex items-center justify-center transition-all ${isSelected ? 'scale-125 border-4' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// User Location Icon (Blue Dot)
const userIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: '<div class="relative"><div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div><div class="absolute -inset-2 w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-ping"></div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Helper to center map
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    setTimeout(() => map.invalidateSize(), 100);
  }, [center, zoom, map]);
  return null;
};

// Distance calculator (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
};

const MapComponent = () => {
  const navigate = useNavigate();
  const { darkMode } = useAuth();
  const [machines, setMachines] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([34.8817, -1.3167]);
  const [userPos, setUserPos] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Sleek Map Tiles
  const tileUrl = darkMode 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  // Filter machines based on search
  const filteredMachines = useMemo(() => {
    if (!searchQuery) return machines;
    return machines.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [machines, searchQuery]);

  const mapHeight = "100vh";

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const data = await machinesAPI.getAll();
      setMachines(data);
      if (data.length > 0 && !selectedBin) {
        setSelectedBin(data[0]);
        // Only center if user position isn't already found
        if (!userPos) setCenter([data[0].lat, data[0].lng]);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement de la carte');
    } finally {
      setLoading(false);
    }
  };

  const locateUser = (isManual = true) => {
    if (!navigator.geolocation) {
      if (isManual) toast.error("La géolocalisation n'est pas supportée");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const pos = [latitude, longitude];
        setUserPos(pos);
        setCenter(pos);
        if (isManual) toast.success("Position actualisée");
      },
      () => {
        if (isManual) toast.error("Impossible d'accéder à votre position");
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchMachines();
    locateUser(false);
  }, []);

  const handleSelectMachine = (bin) => {
    setSelectedBin(bin);
    setCenter([bin.lat, bin.lng]);
    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <div className="flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-950 overflow-hidden" style={{ height: mapHeight }}>
      
      {/* Top Floating UI */}
      <div className="absolute top-6 left-6 right-6 z-[500] flex flex-col gap-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="pointer-events-auto w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          
          <div className="pointer-events-auto flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg p-1">
            <div className="px-4 py-2 font-bold text-xs tracking-wide text-gray-900 dark:text-white flex items-center gap-2 uppercase">
              <Navigation className="w-4 h-4 text-green-500" />
              TLEMCEN, DZ
            </div>
          </div>

          <button onClick={fetchMachines} className="pointer-events-auto w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className={`w-5 h-5 text-gray-700 dark:text-gray-200 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="pointer-events-auto relative max-w-md mx-auto w-full">
          <div className="relative group">
            <input 
              type="text"
              placeholder="Chercher une borne de recyclage..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-transparent focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm font-medium text-gray-900 dark:text-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto no-scrollbar animate-slide-up z-30">
              {filteredMachines.length > 0 ? (
                filteredMachines.map(bin => (
                  <button
                    key={bin.id}
                    onClick={() => handleSelectMachine(bin)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left border-b border-gray-50 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <Navigation2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{bin.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{bin.address}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400 font-medium">Aucun résultat trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-green-50 dark:bg-gray-950">
        <MapContainer 
          center={center} 
          zoom={15} 
          zoomControl={false}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'transparent' }}
        >
          <ChangeView center={center} zoom={15} />
          <TileLayer
            attribution='&copy; CARTO'
            url={tileUrl}
          />
          
          {/* User Location Marker */}
          {userPos && (
            <>
              <Marker position={userPos} icon={userIcon} />
              <Circle 
                center={userPos} 
                radius={200} 
                pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, stroke: false }} 
              />
            </>
          )}

          {/* Machine Markers */}
          {filteredMachines.map((bin) => (
            <Marker 
              key={bin.id} 
              position={[bin.lat, bin.lng]} 
              icon={getBinIcon(selectedBin?.id === bin.id)}
              eventHandlers={{
                click: () => handleSelectMachine(bin),
              }}
            />
          ))}
        </MapContainer>

        {/* Floating Action Buttons Side */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[500]">
          <button 
            onClick={() => locateUser(true)}
            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-90 transition-all border border-gray-100 dark:border-gray-700 pointer-events-auto"
          >
            <LocateFixed className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Bottom Card for Selected Bin */}
      {selectedBin && (
        <div className="absolute bottom-20 left-0 right-0 z-[500] px-4 pb-4 animate-slide-up pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] pointer-events-auto border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1 leading-tight">{selectedBin.name}</h2>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${selectedBin.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  {selectedBin.address}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-100 dark:border-green-900/40 shadow-sm">
                  <Navigation2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                {userPos && (
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    À {calculateDistance(userPos[0], userPos[1], selectedBin.lat, selectedBin.lng)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-900/30">
                <p className="text-[9px] font-black text-gray-400 mb-1 tracking-[0.2em] uppercase">TYPE DE BAC</p>
                <p className="text-lg font-black text-gray-900 dark:text-white capitalize">{selectedBin.type}</p>
              </div>
              <div className="border border-green-100 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                <p className="text-[9px] font-black text-green-500 mb-1 tracking-[0.2em] uppercase">GAINS</p>
                <p className="text-lg font-black text-green-600 dark:text-green-400">10-20 <span className="text-xs font-bold opacity-70">DA</span></p>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              leftIcon={Navigation} 
              className="w-full shadow-eco-lg h-14 text-sm font-black tracking-widest uppercase"
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedBin.lat},${selectedBin.lng}`, '_blank')}
            >
              Lancer l'itinéraire
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
