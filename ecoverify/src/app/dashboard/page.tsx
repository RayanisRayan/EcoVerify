'use client';
import { useRouter } from 'next/navigation';
import ComputeCard from "../components/computecard";
import Notifications from "../components/notification";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  TimeScale
);

if (!process.env.NEXT_PUBLIC_FLASK_SERVER_URL) {
  throw new Error('Flask server URL not configured');
}

interface Recording {
  timestamp: string;
  metadata: {
    company: string;
    location: string;
    uuid: string;
  };
  sensor_data: {
    temp_ampent: number;
    temp_object: number;
    pressure: number;
    humidity: number;
    gas_res: number;
    nh3_raw: number;
    co_raw: number;
    TVOC: number;
    no2_raw: number;
  };
}

interface Device {
  deviceID: string;
  location: string;
}

interface PredictionRequest {
  temp_ampent: number;
  temp_object: number;
  pressure: number;
  humidity: number;
  gas_res: number;
  nh3_raw: number;
  co_raw: number;
  Tvoc: number;
  no2_raw: number;
}

const sensorFields = [
  { value: "timestamp", label: "Timestamp" },
  { value: "temp_ampent", label: "Temperature (Ambient)" },
  { value: "temp_object", label: "Temperature (Object)" },
  { value: "pressure", label: "Pressure" },
  { value: "humidity", label: "Humidity" },
  { value: "gas_res", label: "Gas Resistance" },
  { value: "nh3_raw", label: "NH3" },
  { value: "co_raw", label: "CO" },
  { value: "TVOC", label: "TVOC" },
  { value: "no2_raw", label: "NO2" },
];

function getFieldValue(record: Recording, field: string) {
  if (field === "timestamp") return record.timestamp;
  return record.sensor_data[field as keyof typeof record.sensor_data];
}

async function getDevices(company: string): Promise<Device[]> {
  try {
    const response = await fetch(
      `/api/devices?company=${encodeURIComponent(company)}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch devices");
    }

    return data.devices;
  } catch (error) {
    console.error("Error fetching devices:", (error as Error).message);
    return [];
  }
}

async function getLatestRecording(
  company: string,
  device: string
): Promise<Recording | null> {
  try {
    const response = await fetch(
      `/api/recording?company=${encodeURIComponent(
        company
      )}&device=${encodeURIComponent(device)}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch data");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching latest recording:", (error as Error).message);
    return null;
  }
}

async function getHistoricalRecordings(
  company: string,
  device: string,
  limit: number = 10
): Promise<Recording[]> {
  try {
    const response = await fetch(
      `/api/recording/history?company=${encodeURIComponent(company)}&device=${encodeURIComponent(device)}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch historical data");
    }
    return data.data;
  } catch (error) {
    console.error("Error fetching historical data:", (error as Error).message);
    return [];
  }
}

async function getPrediction(sensorData: PredictionRequest): Promise<number | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_SERVER_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sensorData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Prediction request failed: ${errorData}`);
    }

    const data = await response.json();
    return data.prediction;
  } catch (error) {
    console.error('Error getting prediction:', error);
    throw error;
  }
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [devices, setDevices] = useState<Device[]>([]);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Historical data state
  const [historicalData, setHistoricalData] = useState<Recording[]>([]);
  const [xField, setXField] = useState<string>("timestamp");
  const [yField, setYField] = useState<string>("temp_ampent");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchDevices = async () => {
      if (session?.user?.name) {
        const devicesList = await getDevices(session.user.name);
        setDevices(devicesList);
        if (devicesList.length > 0) {
          setSelectedDevice(devicesList[0].deviceID);
        }
      }
    };
    fetchDevices();
  }, [session?.user?.name]);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user && session.user.name && selectedDevice) {
        const latestRecording = await getLatestRecording(
          session.user.name,
          selectedDevice
        );
        if (latestRecording) {
          setRecording(latestRecording);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [session?.user?.name, selectedDevice]);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (recording?.sensor_data) {
        setIsPredicting(true);
        setPredictionError(null);
        try {
          const predictionRequest: PredictionRequest = {
            temp_ampent: recording.sensor_data.temp_ampent,
            temp_object: recording.sensor_data.temp_object,
            pressure: recording.sensor_data.pressure,
            humidity: recording.sensor_data.humidity,
            gas_res: recording.sensor_data.gas_res,
            nh3_raw: recording.sensor_data.nh3_raw,
            co_raw: recording.sensor_data.co_raw,
            Tvoc: recording.sensor_data.TVOC,
            no2_raw: recording.sensor_data.no2_raw,
          };

          const predictionResult = await getPrediction(predictionRequest);
          setPrediction(predictionResult);
        } catch (error) {
          setPredictionError((error as Error).message);
        } finally {
          setIsPredicting(false);
        }
      }
    };

    fetchPrediction();
  }, [recording]);

  // Fetch historical data when device changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (session?.user && session.user.name && selectedDevice) {
        const history = await getHistoricalRecordings(session.user.name, selectedDevice, 10);
        setHistoricalData(history);
      }
    };
    fetchHistory();
  }, [session?.user?.name, selectedDevice]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const smComputes = [
    {
      header: "Temperature (Ambient)",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.temp_ampent}°C` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "Temperature (Object)",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.temp_object}°C` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "Pressure",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.pressure} hPa` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "Humidity",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.humidity}%` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "Gas Resistance",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.gas_res} Ω` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "NH3",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.nh3_raw} ppm` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "CO",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.co_raw} ppm` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "TVOC",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.TVOC} ppb` : "--",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "NO2",
      footer: "+10%",
      main: recording ? `${recording.sensor_data.no2_raw} ppm` : "--",
      increasing: true,
      width: "7.75rem",
    },
  ];

  return (
    <div className="relative flex flex-col mt-[10vh] gap-[3.2675rem] w-full pb-10">
      {status === "authenticated" && (
        <button
          onClick={() => signOut()}
          className="absolute top-[-5vh] right-4 sm:right-8 md:right-12 lg:right-16 bg-gradient-to-r from-[#032221] to-[#2cc295] text-white font-semibold font-['Fira_Sans'] px-4 py-2 rounded-[6.97px] hover:brightness-90 transition duration-150 ease-in-out"
        >
          Sign Out
        </button>
      )}

      <div className="flex justify-center">
        <label className="text-lg font-semibold mr-2 self-center">
          Select Device:
        </label>
        <select
          className="border p-2 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2cc295]"
          value={selectedDevice || ""}
          onChange={(e) => setSelectedDevice(e.target.value)}
          disabled={devices.length === 0 || status !== "authenticated"}
        >
          {devices.length === 0 && status === "authenticated" && (
            <option value="">Loading devices...</option>
          )}
          {devices.map((device) => (
            <option key={device.deviceID} value={device.deviceID}>
              {device.deviceID} - {device.location}
            </option>
          ))}
          {devices.length === 0 && status === "authenticated" && (
            <option value="" disabled>
              No devices found
            </option>
          )}
          {status !== "authenticated" && (
            <option value="" disabled>
              Please sign in
            </option>
          )}
        </select>
      </div>

      <div className="flex justify-center">
        <ComputeCard
          size="md"
          header="Predicted CO2 Level"
          footer={predictionError ? `Error: ${predictionError}` : null}
          main={isPredicting ? "Calculating..." : (prediction ? `${prediction.toFixed(2)} ppm` : "--")}
          increasing={true}
          width="16.25rem"
        />
      </div>

      <div className="flex gap-[5.4375rem] justify-center">
        <div className="w-[501px] h-[306px]">
          <div className="w-[306.76px] h-[27.26px] text-black text-lg font-semibold font-['Fira_Sans']">
            Historical Data analysis
          </div>
          <div className="flex gap-2 mb-2">
            <label>
              X:
              <select
                value={xField}
                onChange={(e) => setXField(e.target.value)}
                className="ml-1 mr-4 border rounded px-1"
              >
                {sensorFields.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Y:
              <select
                value={yField}
                onChange={(e) => setYField(e.target.value)}
                className="ml-1 border rounded px-1"
              >
                {sensorFields
                  .filter((f) => f.value !== xField)
                  .map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div style={{ height: 250 }}>
            <Line
              data={{
                labels: historicalData.map((rec) => getFieldValue(rec, xField)),
                datasets: [
                  {
                    label: `${yField} vs ${xField}`,
                    data: historicalData.map((rec) => getFieldValue(rec, yField)),
                    fill: false,
                    borderColor: "#2cc295",
                    backgroundColor: "#2cc295",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: {
                    type: xField === "timestamp" ? "time" : "category",
                    title: { display: true, text: sensorFields.find(f => f.value === xField)?.label },
                  },
                  y: {
                    title: { display: true, text: sensorFields.find(f => f.value === yField)?.label },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[1.6875rem] mt-[2.090625rem]">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex flex-row gap-[1.6875rem] flex-nowrap"
            >
              {smComputes.slice(row * 3, row * 3 + 3).map((compute, index) => (
                <ComputeCard key={index} size="sm" {...compute} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-[20%]">
        <div className="flex flex-col gap-[1.3rem] justify-center">
          <div className="text-black text-4xl font-semibold font-['Fira_Sans'] leading-[41.83px] w-fit">
            Set Notifications
          </div>
          <div className="text-black/60 text-[0.8125rem] font-normal font-['Fira_Sans'] leading-[20.91px]">
            Customize your alerts based on thresholds
          </div>
        </div>
        <div className="flex flex-col gap-[2rem]">
          <div className="flex flex-col gap-[0.218125rem]">
            <p className="text-black text-xs font-medium font-sans leading-[17.43px]">
              Threshold Level
            </p>
            <input
              type="text"
              className="w-[25rem] h-8 px-[0.63rem] bg-white rounded-md border border-black/10 font-nomral font-sans leading-[1rem] placeholder:text-black/50 focus:outline-none focus:ring-1 focus:ring-black/20"
              placeholder="Enter CO2 Level"
            />
            <div className="text-black/50 text-[10.46px] font-normal font-sans leading-[0.87125rem]">
              ppm
            </div>
          </div>
          <div className="flex flex-col gap-[0.218125rem]">
            <p className="text-black text-xs font-medium font-sans leading-[17.43px]">
              Notification Frequency
            </p>
            <div className="flex gap-[0.4375rem]">
              <Notifications main="Hourly" />
              <Notifications main="Daily" />
              <Notifications main="Weekly" />
            </div>
            <div className="text-black/50 text-[10.46px] font-normal font-sans leading-[0.87125rem]">
              Select frequency
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#032221] to-[#2cc295] rounded-[6.97px] w-fit p-3 text-center text-white font-semibold font-['Fira_Sans'] leading-[20.91px] hover:brightness-90 cursor-pointer">
            <span className="mx-6">Save</span>
          </div>
        </div>
      </div>
    </div>
  );
}
