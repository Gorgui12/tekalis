'use client';
import { useState } from 'react';
import { WARNINGS } from '@/lib/solar/constants';
import APPLIANCES from '@/lib/solar/appliances';
import { dailyEnergyWh, simultaneousPowerW, maxSurgeWatts, requiredInverterContinuousW, requiredInverterPeakW, systemVoltageFromVA, batteryCapacityWh, batteryCapacityAh, pvPowerNeededW } from '@/lib/solar/compute';

export default function SolarConfigurator() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('secours');
  const [items, setItems] = useState([]);
  const [autonomy, setAutonomy] = useState(1);
  const [outage, setOutage] = useState(4);

  const Eday = dailyEnergyWh(items.map(i => ({ ...i, w: i.watts, hours: i.hours, duty: i.duty })));
  const Psim = simultaneousPowerW(items.map(i => ({ ...i, w: i.watts })));
  const Psurge = maxSurgeWatts(items.map(i => ({ ...i, w: i.watts, surgeFactor: i.surgeFactor })));
  const InvCont = requiredInverterContinuousW(Psim);
  const InvPeak = requiredInverterPeakW(Psurge);
  const Vsys = systemVoltageFromVA(InvCont > 0 ? InvCont : Psim);
  const days = mode === 'secours' ? (outage / 24) || 0.5 : autonomy;
  const Bwh = batteryCapacityWh(Eday, days > 0 ? days : 1, 0.5, 0.9);
  const Bah = batteryCapacityAh(Bwh, Vsys || 12);
  const PvNeed = pvPowerNeededW(Eday, 5.0, 0.75, 0.9);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-sm text-orange-800 bg-orange-50 border border-orange-200 p-3 rounded">{WARNINGS.indicative}</div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Configurateur de kit solaire</h1>
        <p className="text-sm text-gray-600 mb-4">Interface minimale en phase 3 - à étoffer</p>
      </div>
    </div>
  );
}
