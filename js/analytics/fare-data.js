/**
 * AEROOPS: Fare Analytics & Sorting Data Architecture (Stage 5)
 *
 * Interfaces with AeroDataStore flight records and provides deterministic
 * benchmark test vectors for Range Query Trees (Segment Tree, Fenwick Tree)
 * and Sorting Algorithms (Merge Sort, Quick Sort, Heap Sort).
 */

(function (window) {
  'use strict';

  const PRESETS = {
    random: [
      { id: 'F101', flightId: 'AI-201', flightName: 'Air India', source: 'DEL', destination: 'BOM', fare: 4500 },
      { id: 'F102', flightId: '6E-405', flightName: 'IndiGo', source: 'BOM', destination: 'BLR', fare: 3200 },
      { id: 'F103', flightId: 'SG-811', flightName: 'SpiceJet', source: 'DEL', destination: 'CCU', fare: 5800 },
      { id: 'F104', flightId: 'UK-955', flightName: 'Vistara', source: 'BOM', destination: 'GOI', fare: 2900 },
      { id: 'F105', flightId: 'QP-112', flightName: 'Akasa Air', source: 'BLR', destination: 'HYD', fare: 1850 },
      { id: 'F106', flightId: 'AI-504', flightName: 'Air India', source: 'DEL', destination: 'MAA', fare: 6200 },
      { id: 'F107', flightId: '6E-602', flightName: 'IndiGo', source: 'HYD', destination: 'BOM', fare: 3600 },
      { id: 'F108', flightId: 'UK-720', flightName: 'Vistara', source: 'DEL', destination: 'DXB', fare: 9400 },
      { id: 'F109', flightId: 'SG-303', flightName: 'SpiceJet', source: 'BOM', destination: 'PNQ', fare: 2100 },
      { id: 'F110', flightId: '6E-909', flightName: 'IndiGo', source: 'BLR', destination: 'DEL', fare: 4950 }
    ],
    sorted: [
      { id: 'S1', flightId: 'QP-101', flightName: 'Akasa Air', source: 'BLR', destination: 'HYD', fare: 1800 },
      { id: 'S2', flightId: 'SG-102', flightName: 'SpiceJet', source: 'BOM', destination: 'PNQ', fare: 2400 },
      { id: 'S3', flightId: 'UK-103', flightName: 'Vistara', source: 'BOM', destination: 'GOI', fare: 3100 },
      { id: 'S4', flightId: '6E-104', flightName: 'IndiGo', source: 'BOM', destination: 'BLR', fare: 3800 },
      { id: 'S5', flightId: 'AI-105', flightName: 'Air India', source: 'DEL', destination: 'BOM', fare: 4500 },
      { id: 'S6', flightId: '6E-106', flightName: 'IndiGo', source: 'BLR', destination: 'DEL', fare: 5200 },
      { id: 'S7', flightId: 'SG-107', flightName: 'SpiceJet', source: 'DEL', destination: 'CCU', fare: 6100 },
      { id: 'S8', flightId: 'AI-108', flightName: 'Air India', source: 'DEL', destination: 'MAA', fare: 7300 },
      { id: 'S9', flightId: '6E-109', flightName: 'IndiGo', source: 'DEL', destination: 'BOM', fare: 8200 },
      { id: 'S10', flightId: 'UK-110', flightName: 'Vistara', source: 'DEL', destination: 'LHR', fare: 9500 }
    ],
    reversed: [
      { id: 'R1', flightId: 'UK-110', flightName: 'Vistara', source: 'DEL', destination: 'LHR', fare: 9500 },
      { id: 'R2', flightId: '6E-109', flightName: 'IndiGo', source: 'DEL', destination: 'BOM', fare: 8200 },
      { id: 'R3', flightId: 'AI-108', flightName: 'Air India', source: 'DEL', destination: 'MAA', fare: 7300 },
      { id: 'R4', flightId: 'SG-107', flightName: 'SpiceJet', source: 'DEL', destination: 'CCU', fare: 6100 },
      { id: 'R5', flightId: '6E-106', flightName: 'IndiGo', source: 'BLR', destination: 'DEL', fare: 5200 },
      { id: 'R6', flightId: 'AI-105', flightName: 'Air India', source: 'DEL', destination: 'BOM', fare: 4500 },
      { id: 'R7', flightId: '6E-104', flightName: 'IndiGo', source: 'BOM', destination: 'BLR', fare: 3800 },
      { id: 'R8', flightId: 'UK-103', flightName: 'Vistara', source: 'BOM', destination: 'GOI', fare: 3100 },
      { id: 'R9', flightId: 'SG-102', flightName: 'SpiceJet', source: 'BOM', destination: 'PNQ', fare: 2400 },
      { id: 'R10', flightId: 'QP-101', flightName: 'Akasa Air', source: 'BLR', destination: 'HYD', fare: 1800 }
    ],
    duplicates: [
      { id: 'D1', flightId: 'AI-301', flightName: 'Air India', source: 'DEL', destination: 'BOM', fare: 3500 },
      { id: 'D2', flightId: '6E-302', flightName: 'IndiGo', source: 'BOM', destination: 'BLR', fare: 5200 },
      { id: 'D3', flightId: 'SG-303', flightName: 'SpiceJet', source: 'DEL', destination: 'CCU', fare: 3500 },
      { id: 'D4', flightId: 'UK-304', flightName: 'Vistara', source: 'BLR', destination: 'HYD', fare: 7100 },
      { id: 'D5', flightId: 'QP-305', flightName: 'Akasa Air', source: 'BOM', destination: 'GOI', fare: 5200 },
      { id: 'D6', flightId: 'AI-306', flightName: 'Air India', source: 'DEL', destination: 'MAA', fare: 2200 },
      { id: 'D7', flightId: '6E-307', flightName: 'IndiGo', source: 'HYD', destination: 'BOM', fare: 3500 },
      { id: 'D8', flightId: 'UK-308', flightName: 'Vistara', source: 'DEL', destination: 'DXB', fare: 8800 },
      { id: 'D9', flightId: 'SG-309', flightName: 'SpiceJet', source: 'BOM', destination: 'PNQ', fare: 5200 },
      { id: 'D10', flightId: '6E-310', flightName: 'IndiGo', source: 'BLR', destination: 'DEL', fare: 3500 }
    ],
    mountain: [
      { id: 'M1', flightId: 'QP-201', flightName: 'Akasa Air', source: 'BLR', destination: 'HYD', fare: 1900 },
      { id: 'M2', flightId: 'SG-202', flightName: 'SpiceJet', source: 'BOM', destination: 'PNQ', fare: 3400 },
      { id: 'M3', flightId: '6E-203', flightName: 'IndiGo', source: 'BOM', destination: 'BLR', fare: 5600 },
      { id: 'M4', flightId: 'AI-204', flightName: 'Air India', source: 'DEL', destination: 'BOM', fare: 7800 },
      { id: 'M5', flightId: 'UK-205', flightName: 'Vistara', source: 'DEL', destination: 'LHR', fare: 9600 },
      { id: 'M6', flightId: 'UK-206', flightName: 'Vistara', source: 'DEL', destination: 'DXB', fare: 8900 },
      { id: 'M7', flightId: 'AI-207', flightName: 'Air India', source: 'DEL', destination: 'MAA', fare: 6500 },
      { id: 'M8', flightId: '6E-208', flightName: 'IndiGo', source: 'DEL', destination: 'CCU', fare: 4600 },
      { id: 'M9', flightId: 'SG-209', flightName: 'SpiceJet', source: 'BOM', destination: 'GOI', fare: 3100 },
      { id: 'M10', flightId: 'QP-210', flightName: 'Akasa Air', source: 'HYD', destination: 'BOM', fare: 2100 }
    ]
  };

  const AeroFareData = {
    /**
     * Retrieve flights for a given dataset name or 'fleet' (live from AeroDataStore)
     */
    getDataset: function (name) {
      if (name === 'fleet') {
        if (window.AeroDataStore && typeof window.AeroDataStore.getFlights === 'function') {
          const fleet = window.AeroDataStore.getFlights();
          if (fleet && fleet.length > 0) {
            return fleet.map(function (f, idx) {
              return {
                id: f.id || ('FL-' + (idx + 1)),
                flightId: f.flightId || f.id || ('F-' + (idx + 1)),
                flightName: f.flightName || 'Commercial Flight',
                source: f.source || 'DEP',
                destination: f.destination || 'ARR',
                fare: Number(f.fare) || 3000
              };
            });
          }
        }
        return this.getDataset('random');
      }

      const preset = PRESETS[name] || PRESETS.random;
      return JSON.parse(JSON.stringify(preset));
    },

    /**
     * Extracts array of fare numbers [f0, f1, f2, ...]
     */
    getFareArray: function (items) {
      if (!Array.isArray(items)) return [];
      return items.map(function (item) {
        return typeof item === 'number' ? item : Number(item.fare);
      });
    },

    /**
     * Generates a custom randomized dataset of size N
     */
    generateRandomDataset: function (size, minFare, maxFare) {
      const n = Math.max(3, Math.min(size || 10, 30));
      const min = minFare || 1500;
      const max = maxFare || 9500;
      const airlines = ['Air India', 'IndiGo', 'Vistara', 'SpiceJet', 'Akasa Air'];
      const prefixes = ['AI', '6E', 'UK', 'SG', 'QP'];
      const cities = ['DEL', 'BOM', 'BLR', 'HYD', 'CCU', 'MAA', 'GOI', 'PNQ', 'AMD', 'COK'];

      const result = [];
      for (let i = 0; i < n; i++) {
        const airIdx = i % airlines.length;
        const sIdx = i % cities.length;
        const dIdx = (i + 3) % cities.length;
        // Fare rounded to nearest 50
        const fare = Math.round((min + Math.random() * (max - min)) / 50) * 50;

        result.push({
          id: 'GEN-' + (i + 1),
          flightId: prefixes[airIdx] + '-' + (100 + i * 15),
          flightName: airlines[airIdx],
          source: cities[sIdx],
          destination: cities[dIdx],
          fare: fare
        });
      }
      return result;
    }
  };

  window.AeroFareData = AeroFareData;

})(typeof window !== 'undefined' ? window : global);
