from flask import Flask, render_template_string
from flask_socketio import SocketIO
import traci
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

HTML = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; overflow: hidden; }
        #map { height: calc(100vh - 60px); width: 100%; }
        
        .metrics-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.95));
            padding: 10px 20px;
            display: flex;
            justify-content: space-around;
            z-index: 1000;
            color: white;
            height: 60px;
            align-items: center;
        }
        
        .metric {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
        }
        
        .metric-label {
            font-size: 10px;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .metric-value {
            font-size: 20px;
            font-weight: bold;
        }
        
        .controls {
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            padding: 8px 18px;
            border-radius: 30px;
            display: flex;
            gap: 10px;
        }
        
        .btn {
            background: none;
            border: 2px solid white;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn:hover {
            background: white;
            color: black;
            transform: scale(1.1);
        }
        
        .btn.active {
            background: #4CAF50;
            border-color: #4CAF50;
        }
        
        .traffic-light-line {
            width: 30px;
            height: 4px;
            border-radius: 2px;
            box-shadow: 0 0 10px currentColor;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <div class="controls">
        <button class="btn" id="playBtn" onclick="togglePlay()">▶</button>
        <button class="btn" onclick="resetSim()">↻</button>
        <button class="btn" id="speedBtn" onclick="speedUp()">1x</button>
    </div>
    
    <div class="metrics-bar">
        <div class="metric">
            <div class="metric-label">Vehicles</div>
            <div class="metric-value" id="vehicle-count" style="color:#FFD700;">0</div>
        </div>
        <div class="metric">
            <div class="metric-label">Avg Speed</div>
            <div class="metric-value" id="avg-speed" style="color:#4facfe;">0</div>
        </div>
        <div class="metric">
            <div class="metric-label">Waiting</div>
            <div class="metric-value" id="waiting" style="color:#f5576c;">0</div>
        </div>
        <div class="metric">
            <div class="metric-label">Time</div>
            <div class="metric-value" id="sim-time" style="color:#38ef7d;">0s</div>
        </div>
        <div class="metric">
            <div class="metric-label">Signals</div>
            <div class="metric-value" id="signals" style="color:#00ff00;">0</div>
        </div>
    </div>
    
    <script>
        var map = L.map('map', {
            zoomControl: true,
            attributionControl: false
        }).setView([52.520, 13.405], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        var vehicles = {};
        var trafficLights = {};
        var socket = io();
        var isPlaying = false;
        var playSpeed = 1;
        
        function getVehicleSVG(type, angle) {
            var svg = '';
            var color = '';
            var width = 20;
            var height = 10;
            
            if(type === 'passenger') {
                color = '#FFD700';
                width = 18;
                height = 10;
                svg = `<svg width="${width}" height="${height}" style="transform: rotate(${angle}deg);">
                    <rect x="2" y="2" width="14" height="6" rx="2" fill="${color}" stroke="#FF8C00" stroke-width="1"/>
                    <rect x="4" y="3" width="4" height="2" fill="#87CEEB" opacity="0.8"/>
                    <rect x="10" y="3" width="4" height="2" fill="#87CEEB" opacity="0.8"/>
                </svg>`;
            } else if(type === 'truck') {
                color = '#8B4513';
                width = 26;
                height = 12;
                svg = `<svg width="${width}" height="${height}" style="transform: rotate(${angle}deg);">
                    <rect x="2" y="2" width="22" height="8" rx="1" fill="${color}" stroke="#3E2723" stroke-width="1"/>
                    <rect x="16" y="3" width="5" height="3" fill="#654321"/>
                    <rect x="4" y="3" width="10" height="4" fill="#A0522D"/>
                </svg>`;
            } else if(type === 'bus') {
                color = '#FF6347';
                width = 30;
                height = 12;
                svg = `<svg width="${width}" height="${height}" style="transform: rotate(${angle}deg);">
                    <rect x="2" y="2" width="26" height="8" rx="2" fill="${color}" stroke="#DC143C" stroke-width="1"/>
                    <rect x="4" y="3" width="3" height="3" fill="#87CEEB" opacity="0.7"/>
                    <rect x="9" y="3" width="3" height="3" fill="#87CEEB" opacity="0.7"/>
                    <rect x="14" y="3" width="3" height="3" fill="#87CEEB" opacity="0.7"/>
                    <rect x="19" y="3" width="3" height="3" fill="#87CEEB" opacity="0.7"/>
                </svg>`;
            } else if(type === 'motorcycle') {
                color = '#4169E1';
                width = 14;
                height = 8;
                svg = `<svg width="${width}" height="${height}" style="transform: rotate(${angle}deg);">
                    <rect x="3" y="3" width="8" height="2" rx="1" fill="${color}" stroke="#0000CD" stroke-width="1"/>
                    <circle cx="4" cy="5" r="2" fill="#333"/>
                    <circle cx="10" cy="5" r="2" fill="#333"/>
                </svg>`;
            } else if(type === 'ambulance') {
                color = '#FFFFFF';
                width = 22;
                height = 11;
                svg = `<svg width="${width}" height="${height}" style="transform: rotate(${angle}deg);">
                    <rect x="2" y="2" width="18" height="7" rx="2" fill="${color}" stroke="#FF0000" stroke-width="2"/>
                    <rect x="10" y="4" width="1" height="3" fill="#FF0000"/>
                    <rect x="8" y="5" width="5" height="1" fill="#FF0000"/>
                    <rect x="4" y="3" width="3" height="2" fill="#87CEEB" opacity="0.6"/>
                </svg>`;
            }
            
            return svg;
        }
        
        socket.on('update', function(data) {
            document.getElementById('vehicle-count').textContent = Object.keys(data.vehicles || {}).length;
            document.getElementById('avg-speed').textContent = data.avg_speed + ' km/h';
            document.getElementById('waiting').textContent = data.waiting;
            document.getElementById('sim-time').textContent = data.time + 's';
            document.getElementById('signals').textContent = Object.keys(data.traffic_lights || {}).length;
            
            // Update vehicles
            for(var id in data.vehicles) {
                var veh = data.vehicles[id];
                var lon = veh.pos[0];
                var lat = veh.pos[1];
                var angle = veh.angle - 90; // Adjust for proper orientation
                var type = veh.type;
                
                if(!vehicles[id]) {
                    var icon = L.divIcon({
                        html: getVehicleSVG(type, angle),
                        className: '',
                        iconSize: [30, 15],
                        iconAnchor: [15, 7.5]
                    });
                    vehicles[id] = L.marker([lat, lon], {icon: icon}).addTo(map);
                } else {
                    var icon = L.divIcon({
                        html: getVehicleSVG(type, angle),
                        className: '',
                        iconSize: [30, 15],
                        iconAnchor: [15, 7.5]
                    });
                    vehicles[id].setIcon(icon);
                    vehicles[id].setLatLng([lat, lon]);
                }
            }
            
            for(var id in vehicles) {
                if(!data.vehicles[id]) {
                    map.removeLayer(vehicles[id]);
                    delete vehicles[id];
                }
            }
            
            // Update traffic lights as lines
            for(var tlId in data.traffic_lights) {
                var tl = data.traffic_lights[tlId];
                var lon = tl.pos[0];
                var lat = tl.pos[1];
                var state = tl.state;
                var angle = tl.angle || 0;
                
                var color = state === 'green' ? '#00ff00' : (state === 'yellow' ? '#ffff00' : '#ff0000');
                
                if(!trafficLights[tlId]) {
                    var icon = L.divIcon({
                        html: `<div class="traffic-light-line" style="background: ${color}; color: ${color}; transform: rotate(${angle}deg);"></div>`,
                        className: '',
                        iconSize: [30, 4],
                        iconAnchor: [15, 2]
                    });
                    trafficLights[tlId] = L.marker([lat, lon], {icon: icon, zIndexOffset: 1000}).addTo(map);
                } else {
                    var icon = L.divIcon({
                        html: `<div class="traffic-light-line" style="background: ${color}; color: ${color}; transform: rotate(${angle}deg);"></div>`,
                        className: '',
                        iconSize: [30, 4],
                        iconAnchor: [15, 2]
                    });
                    trafficLights[tlId].setIcon(icon);
                }
            }
        });
        
        function togglePlay() {
            isPlaying = !isPlaying;
            var btn = document.getElementById('playBtn');
            
            if(isPlaying) {
                btn.textContent = '⏸';
                btn.classList.add('active');
                socket.emit('start');
            } else {
                btn.textContent = '▶';
                btn.classList.remove('active');
                socket.emit('pause');
            }
        }
        
        function resetSim() {
            socket.emit('reset');
            for(var id in vehicles) map.removeLayer(vehicles[id]);
            for(var id in trafficLights) map.removeLayer(trafficLights[id]);
            vehicles = {};
            trafficLights = {};
            isPlaying = false;
            document.getElementById('playBtn').textContent = '▶';
            document.getElementById('playBtn').classList.remove('active');
        }
        
        function speedUp() {
            playSpeed = playSpeed >= 3 ? 0.5 : playSpeed + 0.5;
            socket.emit('speed', {speed: playSpeed});
            document.getElementById('speedBtn').textContent = playSpeed + 'x';
        }
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML)

simulation_running = False
simulation_paused = False
simulation_speed = 0.1

def get_vehicle_type(vtype):
    vtype_lower = vtype.lower()
    if 'truck' in vtype_lower or 'trailer' in vtype_lower:
        return 'truck'
    elif 'bus' in vtype_lower:
        return 'bus'
    elif 'motorcycle' in vtype_lower or 'bike' in vtype_lower or 'moped' in vtype_lower:
        return 'motorcycle'
    elif 'ambulance' in vtype_lower or 'emergency' in vtype_lower:
        return 'ambulance'
    else:
        return 'passenger'

def get_traffic_light_state(state):
    if 'G' in state or 'g' in state:
        return 'green'
    elif 'y' in state or 'Y' in state:
        return 'yellow'
    else:
        return 'red'

def get_network_bounds():
    """Get network boundaries from SUMO"""
    try:
        boundary = traci.simulation.getNetBoundary()
        # boundary returns ((min_x, min_y), (max_x, max_y))
        min_x, min_y = boundary[0]
        max_x, max_y = boundary[1]
        
        # Convert to geo coordinates
        sw_lon, sw_lat = traci.simulation.convertGeo(min_x, min_y)
        ne_lon, ne_lat = traci.simulation.convertGeo(max_x, max_y)
        
        return {
            'southwest': [sw_lat, sw_lon],
            'northeast': [ne_lat, ne_lon],
            'center': [(sw_lat + ne_lat) / 2, (sw_lon + ne_lon) / 2]
        }
    except:
        return None

def run_sumo():
    global simulation_running, simulation_paused
    print("Starting SUMO simulation...")
    traci.start(["sumo", "-c", r"C:\Projects\FDRL-Traffic\FDRL\sumo_files\Berlin\osm.sumocfg"])
    
    step = 0
    while step < 7200 and simulation_running:
        if not simulation_paused:
            traci.simulationStep()
            vehicles = {}
            traffic_lights = {}
            total_speed = 0
            waiting = 0
            count = 0
            
            # Get vehicles
            for v in traci.vehicle.getIDList():
                try:
                    x, y = traci.vehicle.getPosition(v)
                    lon, lat = traci.simulation.convertGeo(x, y)
                    angle = traci.vehicle.getAngle(v)
                    vtype = traci.vehicle.getTypeID(v)
                    speed = traci.vehicle.getSpeed(v)
                    
                    vehicles[v] = {
                        'pos': [lon, lat],
                        'angle': angle,
                        'type': get_vehicle_type(vtype)
                    }
                    
                    total_speed += speed * 3.6
                    if speed < 0.1:
                        waiting += 1
                    count += 1
                except:
                    pass
            
            # Get traffic lights with lane angle
            for tl_id in traci.trafficlight.getIDList():
                try:
                    links = traci.trafficlight.getControlledLinks(tl_id)
                    if links:
                        lane = links[0][0][0]
                        shape = traci.lane.getShape(lane)
                        x, y = shape[-1]  # End of lane
                        lon, lat = traci.simulation.convertGeo(x, y)
                        state = traci.trafficlight.getRedYellowGreenState(tl_id)
                        
                        # Calculate lane angle
                        if len(shape) >= 2:
                            import math
                            x1, y1 = shape[-2]
                            x2, y2 = shape[-1]
                            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
                        else:
                            angle = 0
                        
                        traffic_lights[tl_id] = {
                            'pos': [lon, lat],
                            'state': get_traffic_light_state(state),
                            'angle': angle
                        }
                except:
                    pass
            
            avg_speed = int(total_speed / count) if count > 0 else 0
            
            socketio.emit('update', {
                'vehicles': vehicles,
                'traffic_lights': traffic_lights,
                'time': step,
                'avg_speed': avg_speed,
                'waiting': waiting
            })
            step += 1
        
        time.sleep(simulation_speed)
    
    traci.close()
    simulation_running = False
    print("Simulation finished")

@socketio.on('start')
def handle_start():
    global simulation_running, simulation_paused
    simulation_paused = False
    if not simulation_running:
        simulation_running = True
        threading.Thread(target=run_sumo, daemon=True).start()

@socketio.on('pause')
def handle_pause():
    global simulation_paused
    simulation_paused = True

@socketio.on('reset')
def handle_reset():
    global simulation_running
    simulation_running = False

@socketio.on('speed')
def handle_speed(data):
    global simulation_speed
    simulation_speed = 0.1 / data['speed']

@app.route('/api/bounds')
def get_bounds():
    if simulation_running:
        bounds = get_network_bounds()
        return jsonify(bounds)
    return jsonify({'error': 'Simulation not running'})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
