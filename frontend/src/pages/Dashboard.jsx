import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import ROLE from "@/common/role";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend);

// Colors
const SERVICE_COLORS = ["#4ade80", "#f87171"]; // Green = active, Red = inactive
const USER_COLORS = {
  [ROLE.ADMIN]: "#fbbf24",
  [ROLE.GENERAL]: "#4ade80",
};

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    loginTrend: [],
  });

  const [mapData, setMapData] = useState([]);
  const [relevantStats, setRelevantStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    inactiveProjects: 0,
  });

  // Fetch services stats
  const fetchServiceStats = async () => {
    try {
      const res = await axios.get(SummaryApi.getAllProjects.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });

      if (res.data.success && Array.isArray(res.data.data)) {
        const services = res.data.data;
        const totalServices = services.length;
        const activeServices = services.filter((s) => s.status === "active").length;
        const inactiveServices = totalServices - activeServices;
        setStats((prev) => ({ ...prev, totalServices, activeServices, inactiveServices }));
      } else {
        toast.error("Failed to fetch services data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching services");
    }
  };

  // Fetch relevant experience project stats
  const fetchRelevantProjectStats = async () => {
    try {
      const res = await axios.get(SummaryApi.getAllRelevantProjects.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });

      if (res.data.success && Array.isArray(res.data.data)) {
        const projects = res.data.data;
        const totalProjects = projects.length;
        const activeProjects = projects.filter((p) => p.status === "active").length;
        const inactiveProjects = totalProjects - activeProjects;

        setRelevantStats({ totalProjects, activeProjects, inactiveProjects });
      } else {
        toast.error("Failed to fetch relevant projects data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching relevant projects");
    }
  };

  // Fetch user login trend
  const fetchUserLoginTrend = async () => {
    try {
      const res = await axios.get(SummaryApi.allUser.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });

      if (res.data.success && Array.isArray(res.data.data)) {
        const usersTrend = res.data.data.map((u) => {
          let normalizedRole = ROLE.GENERAL;
          if (u.role && String(u.role).toUpperCase() === ROLE.ADMIN)
            normalizedRole = ROLE.ADMIN;

          const loginCount = Array.isArray(u.logins)
            ? u.logins.length
            : u.loginCount || 0;

          const lastLogin =
            Array.isArray(u.logins) && u.logins.length > 0
              ? u.logins[u.logins.length - 1]
              : {};

          return {
            name: u.name || u.email || "Unknown",
            logins: loginCount,
            role: normalizedRole,
            deviceName: lastLogin.deviceName || "N/A",
            ipAddress: lastLogin.ipAddress || "N/A",
            city: lastLogin.city || "N/A",
            state: lastLogin.state || "N/A",
            country: lastLogin.country || "N/A",
            lat: lastLogin.latitude || null,
            lon: lastLogin.longitude || null,
          };
        });

        setStats((prev) => ({ ...prev, loginTrend: usersTrend }));

        const filteredMapData = usersTrend.filter(
          (u) => u.lat != null && u.lon != null
        );

        setMapData(filteredMapData);
      } else {
        toast.error("Failed to fetch user login trends");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching user login trends");
    }
  };

  useEffect(() => {
    fetchServiceStats();
    fetchRelevantProjectStats();
    fetchUserLoginTrend();
  }, []);

  // Pie chart data
  const serviceData = [
    { name: "Active", value: stats.activeServices },
    { name: "Inactive", value: stats.inactiveServices },
  ];

  const relevantProjectData = [
    { name: "Active", value: relevantStats.activeProjects },
    { name: "Inactive", value: relevantStats.inactiveProjects },
  ];

  // User login bar chart
  const chartData = {
    labels: stats.loginTrend.map((u) => u.name),
    datasets: [
      {
        label: "Logins",
        data: stats.loginTrend.map((u) => u.logins),
        backgroundColor: stats.loginTrend.map(
          (u) => USER_COLORS[u.role] || "#60a5fa"
        ),
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            const user = stats.loginTrend[idx] || {};
            const raw = context.raw != null ? context.raw : 0;
            return `${user.role} : ${raw} logins — Device: ${user.deviceName}, IP: ${user.ipAddress}, Location: ${user.city}, ${user.state}, ${user.country}`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Experience Projects Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-2xl p-5 text-center hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700">Total Experience Projects</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.totalServices}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-5 text-center hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700">Active Projects</h2>
          <p className="text-3xl font-bold text-green-600">{stats.activeServices}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-5 text-center hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700">Inactive Projects</h2>
          <p className="text-3xl font-bold text-red-600">{stats.inactiveServices}</p>
        </div>
      </div>

      {/* Relevant Experience Projects Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-2xl p-5 text-center hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700">Total Relevant Projects</h2>
          <p className="text-3xl font-bold text-blue-600">{relevantStats.totalProjects}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-5 text-center hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700">Active Projects</h2>
          <p className="text-3xl font-bold text-green-600">{relevantStats.activeProjects}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-5 text-center hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700">Inactive Projects</h2>
          <p className="text-3xl font-bold text-red-600">{relevantStats.inactiveProjects}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Services Pie Chart */}
        <div className="bg-white shadow-lg rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Experience Project Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                dataKey="value"
              >
                {serviceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SERVICE_COLORS[index % SERVICE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Relevant Projects Pie Chart */}
        <div className="bg-white shadow-lg rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Relevant Project Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={relevantProjectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                dataKey="value"
              >
                {relevantProjectData.map((entry, index) => (
                  <Cell
                    key={`cell-relevant-${index}`}
                    fill={SERVICE_COLORS[index % SERVICE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Login Trends */}
      <div className="bg-white shadow-lg rounded-2xl p-5 mt-8 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">User Login Trends</h2>
        <div style={{ height: "300px" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-sm bg-yellow-400"></span>
            <span>Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-sm bg-green-400"></span>
            <span>General User</span>
          </div>
        </div>
      </div>

      {/* User Last Login Info Table */}
      <div className="mt-8 bg-white shadow-lg rounded-2xl p-5 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">User Last Login Info</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Role</th>
              <th className="p-2">Device</th>
              <th className="p-2">IP Address</th>
              <th className="p-2">City</th>
              <th className="p-2">State</th>
              <th className="p-2">Country</th>
              <th className="p-2">Logins</th>
            </tr>
          </thead>
          <tbody>
            {stats.loginTrend.map((user, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">{user.deviceName}</td>
                <td className="p-2">{user.ipAddress}</td>
                <td className="p-2">{user.city}</td>
                <td className="p-2">{user.state}</td>
                <td className="p-2">{user.country}</td>
                <td className="p-2">{user.logins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Location Map */}
      <div className="mt-8 bg-white shadow-lg rounded-2xl p-5 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">User Location Map</h2>
        <div className="h-[400px] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={[19.076, 72.8777]}
            zoom={10}                  
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapData.map((user, idx) => (
              <Marker key={idx} position={[Number(user.lat), Number(user.lon)]}>
                <Popup>
                  <strong>{user.name}</strong> <br />
                  {user.city}, {user.state}, {user.country}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
