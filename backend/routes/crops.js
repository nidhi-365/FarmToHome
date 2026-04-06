import express from 'express';
import { protect, farmerOnly } from '../middleware/auth.js';
import CropRecommendation from '../models/CropRecommendation.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/recommend', protect, farmerOnly, async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id);
    const { soilType, climate, region } = farmer;

    const currentMonth = new Date().getMonth();
    const festivalMap = { 0: 'Pongal', 7: 'Onam', 9: 'Diwali', 10: 'Diwali' };
    const upcomingFestival = festivalMap[currentMonth] || null;

    let query = {};
    if (soilType) query.soilTypes = soilType;
    if (climate) query.climates = climate;

    let crops = await CropRecommendation.find(query);

    // If no crops match the farmer's profile, return all crops
    if (crops.length === 0) {
      crops = await CropRecommendation.find({});
    }

    // Boost festival-demand crops
    if (upcomingFestival) {
      crops = crops.sort((a, b) => {
        const aHas = a.festivalDemand.includes(upcomingFestival) ? -1 : 1;
        const bHas = b.festivalDemand.includes(upcomingFestival) ? -1 : 1;
        return aHas - bHas;
      });
    }

    res.json({ crops, upcomingFestival });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/fertilizers', protect, farmerOnly, async (req, res) => {
  try {
    const crop = await CropRecommendation.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ fertilizers: crop.fertilizers, growingTips: crop.growingTips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed endpoint
router.post('/seed', async (req, res) => {
  await CropRecommendation.deleteMany();

  const crops = [

    // ─── LOAMY ───
    {
      name: 'Tomato',
      soilTypes: ['Loamy', 'Sandy Loam'],
      climates: ['Tropical', 'Semi-Arid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 75,
      festivalDemand: ['Pongal', 'Diwali'],
      baseMarketPrice: 40,
      demandLevel: 'High',
      fertilizers: [
        { name: 'NPK 19-19-19', dosage: '5g/L', timing: 'Every 2 weeks' },
        { name: 'Calcium Nitrate', dosage: '2g/L', timing: 'During flowering' }
      ],
      growingTips: [
        'Stake plants at 30cm height',
        'Water consistently to prevent blossom end rot',
        'Prune suckers weekly'
      ]
    },

    {
      name: 'Wheat',
      soilTypes: ['Loamy', 'Alluvial', 'Black Cotton'],
      climates: ['Semi-Arid', 'Sub-Tropical', 'Arid'],
      regions: [],
      growthDurationDays: 120,
      festivalDemand: ['Pongal', 'Diwali'],
      baseMarketPrice: 22,
      demandLevel: 'High',
      fertilizers: [
        { name: 'Urea', dosage: '120kg/hectare', timing: 'Split — sowing and tillering' },
        { name: 'DAP', dosage: '60kg/hectare', timing: 'At sowing' }
      ],
      growingTips: [
        'Sow in rows 20cm apart',
        'Irrigate at crown root stage',
        'Apply fungicide if rust appears'
      ]
    },

    {
      name: 'Maize',
      soilTypes: ['Loamy', 'Sandy Loam', 'Alluvial'],
      climates: ['Tropical', 'Sub-Tropical', 'Humid'],
      regions: [],
      growthDurationDays: 90,
      festivalDemand: ['Onam', 'Diwali'],
      baseMarketPrice: 18,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'NPK 10-26-26', dosage: '200kg/hectare', timing: 'At sowing' },
        { name: 'Urea', dosage: '100kg/hectare', timing: 'Top dress at knee height' }
      ],
      growingTips: [
        'Plant in blocks for better pollination',
        'Thin to one plant per 30cm after germination',
        'Hill up soil around base at 6 weeks'
      ]
    },

    // ─── SANDY LOAM ───
    {
      name: 'Onion',
      soilTypes: ['Sandy Loam', 'Loamy', 'Alluvial'],
      climates: ['Semi-Arid', 'Tropical', 'Arid'],
      regions: [],
      growthDurationDays: 90,
      festivalDemand: ['Diwali'],
      baseMarketPrice: 25,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'NPK 10-26-26', dosage: '250kg/hectare', timing: 'Basal dose' },
        { name: 'Sulphur', dosage: '20kg/hectare', timing: 'At bulb formation' }
      ],
      growingTips: [
        'Stop irrigation 2 weeks before harvest',
        'Cure bulbs in shade for 2-3 weeks',
        'Plant on raised beds for better drainage'
      ]
    },

    {
      name: 'Groundnut',
      soilTypes: ['Sandy Loam', 'Red Laterite', 'Loamy'],
      climates: ['Tropical', 'Semi-Arid', 'Arid'],
      regions: [],
      growthDurationDays: 110,
      festivalDemand: ['Pongal', 'Diwali'],
      baseMarketPrice: 55,
      demandLevel: 'High',
      fertilizers: [
        { name: 'Gypsum', dosage: '400kg/hectare', timing: 'At pegging stage' },
        { name: 'DAP', dosage: '100kg/hectare', timing: 'At sowing' }
      ],
      growingTips: [
        'Inoculate seeds with Rhizobium before sowing',
        'Apply gypsum at flowering for pod fill',
        'Harvest when leaves turn yellow'
      ]
    },

    {
      name: 'Carrot',
      soilTypes: ['Sandy Loam', 'Loamy'],
      climates: ['Sub-Tropical', 'Semi-Arid', 'Arid'],
      regions: [],
      growthDurationDays: 80,
      festivalDemand: ['Diwali', 'Pongal'],
      baseMarketPrice: 30,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'NPK 12-32-16', dosage: '150kg/hectare', timing: 'Basal dose' },
        { name: 'Potassium Sulphate', dosage: '50kg/hectare', timing: 'At root development' }
      ],
      growingTips: [
        'Loosen soil to 30cm depth before sowing',
        'Thin seedlings to 8cm spacing',
        'Avoid fresh manure — causes forked roots'
      ]
    },

    // ─── CLAY ───
    {
      name: 'Rice',
      soilTypes: ['Clay', 'Loamy', 'Alluvial'],
      climates: ['Tropical', 'Humid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 120,
      festivalDemand: ['Pongal', 'Onam'],
      baseMarketPrice: 35,
      demandLevel: 'High',
      fertilizers: [
        { name: 'Urea', dosage: '120kg/hectare', timing: 'Split into 3 applications' },
        { name: 'DAP', dosage: '60kg/hectare', timing: 'At transplanting' }
      ],
      growingTips: [
        'Maintain 5cm water level during growth',
        'Drain field 2 weeks before harvest',
        'Use SRI method for better yield'
      ]
    },

    {
      name: 'Sugarcane',
      soilTypes: ['Clay', 'Black Cotton', 'Alluvial', 'Loamy'],
      climates: ['Tropical', 'Humid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 365,
      festivalDemand: ['Pongal', 'Onam', 'Diwali'],
      baseMarketPrice: 28,
      demandLevel: 'High',
      fertilizers: [
        { name: 'Urea', dosage: '250kg/hectare', timing: 'Split — 3 times in first year' },
        { name: 'Potassium Chloride', dosage: '120kg/hectare', timing: 'At planting' }
      ],
      growingTips: [
        'Use two-budded setts for planting',
        'Earthing up at 45 days improves anchorage',
        'Trash mulching conserves moisture'
      ]
    },

    {
      name: 'Brinjal',
      soilTypes: ['Clay', 'Loamy', 'Black Cotton'],
      climates: ['Tropical', 'Humid', 'Semi-Arid'],
      regions: [],
      growthDurationDays: 70,
      festivalDemand: ['Onam', 'Pongal'],
      baseMarketPrice: 20,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'NPK 17-17-17', dosage: '200kg/hectare', timing: 'Basal + top dress' },
        { name: 'Boron', dosage: '1g/L spray', timing: 'At flowering' }
      ],
      growingTips: [
        'Stake plants when 30cm tall',
        'Pick fruits before they over-mature',
        'Use yellow sticky traps for whitefly control'
      ]
    },

    // ─── ALLUVIAL ───
    {
      name: 'Banana',
      soilTypes: ['Alluvial', 'Loamy', 'Sandy Loam'],
      climates: ['Tropical', 'Humid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 300,
      festivalDemand: ['Pongal', 'Diwali', 'Onam'],
      baseMarketPrice: 30,
      demandLevel: 'High',
      fertilizers: [
        { name: 'Potassium Sulphate', dosage: '300g/plant', timing: 'Monthly' },
        { name: 'Compost', dosage: '10kg/plant', timing: 'At planting' }
      ],
      growingTips: [
        'Remove excess suckers, keep 1-2 per plant',
        'Bunch cover with blue polybag at emergence',
        'Irrigate every 3-4 days in dry season'
      ]
    },

    {
      name: 'Mustard',
      soilTypes: ['Alluvial', 'Loamy', 'Sandy Loam'],
      climates: ['Semi-Arid', 'Arid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 90,
      festivalDemand: ['Pongal', 'Diwali'],
      baseMarketPrice: 50,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'Urea', dosage: '80kg/hectare', timing: 'Half at sowing, half at branching' },
        { name: 'Sulphur', dosage: '30kg/hectare', timing: 'At sowing' }
      ],
      growingTips: [
        'Sow in rows 30cm apart',
        'Thin to 10cm between plants',
        'Harvest when 75% pods turn golden'
      ]
    },

    {
      name: 'Potato',
      soilTypes: ['Alluvial', 'Sandy Loam', 'Loamy'],
      climates: ['Sub-Tropical', 'Semi-Arid', 'Humid'],
      regions: [],
      growthDurationDays: 90,
      festivalDemand: ['Diwali', 'Pongal'],
      baseMarketPrice: 20,
      demandLevel: 'High',
      fertilizers: [
        { name: 'NPK 10-26-26', dosage: '300kg/hectare', timing: 'At planting' },
        { name: 'Urea', dosage: '80kg/hectare', timing: 'At earthing up' }
      ],
      growingTips: [
        'Plant certified seed tubers only',
        'Earth up when plants are 20cm tall',
        'Stop irrigation 2 weeks before harvest'
      ]
    },

    // ─── BLACK COTTON ───
    {
      name: 'Cotton',
      soilTypes: ['Black Cotton', 'Alluvial', 'Clay'],
      climates: ['Semi-Arid', 'Arid', 'Tropical'],
      regions: [],
      growthDurationDays: 180,
      festivalDemand: ['Diwali'],
      baseMarketPrice: 60,
      demandLevel: 'High',
      fertilizers: [
        { name: 'DAP', dosage: '100kg/hectare', timing: 'At sowing' },
        { name: 'Potassium Chloride', dosage: '80kg/hectare', timing: 'At squaring stage' }
      ],
      growingTips: [
        'Sow after first monsoon rain',
        'Top pruning at 6 weeks increases branching',
        'Monitor for bollworm from 45 days'
      ]
    },

    {
      name: 'Soybean',
      soilTypes: ['Black Cotton', 'Loamy', 'Clay'],
      climates: ['Semi-Arid', 'Humid', 'Tropical'],
      regions: [],
      growthDurationDays: 100,
      festivalDemand: ['Onam', 'Diwali'],
      baseMarketPrice: 40,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'DAP', dosage: '150kg/hectare', timing: 'Basal dose at sowing' },
        { name: 'Rhizobium inoculant', dosage: 'Seed treatment', timing: 'Before sowing' }
      ],
      growingTips: [
        'Inoculate with Rhizobium for nitrogen fixation',
        'Avoid waterlogging — provide drainage channels',
        'Harvest when 95% pods turn brown'
      ]
    },

    {
      name: 'Jowar (Sorghum)',
      soilTypes: ['Black Cotton', 'Red Laterite', 'Sandy Loam'],
      climates: ['Arid', 'Semi-Arid', 'Tropical'],
      regions: [],
      growthDurationDays: 110,
      festivalDemand: ['Pongal'],
      baseMarketPrice: 20,
      demandLevel: 'Low',
      fertilizers: [
        { name: 'Urea', dosage: '80kg/hectare', timing: 'Split — sowing and 30 days' },
        { name: 'SSP', dosage: '100kg/hectare', timing: 'At sowing' }
      ],
      growingTips: [
        'Drought tolerant — minimal irrigation needed',
        'Thin to 15cm between plants after 2 weeks',
        'Birds are major pest — use netting near harvest'
      ]
    },

    // ─── RED LATERITE ───
    {
      name: 'Cashew',
      soilTypes: ['Red Laterite', 'Sandy Loam'],
      climates: ['Tropical', 'Humid', 'Semi-Arid'],
      regions: [],
      growthDurationDays: 730,
      festivalDemand: ['Onam', 'Pongal'],
      baseMarketPrice: 120,
      demandLevel: 'High',
      fertilizers: [
        { name: 'NPK 13-0-45', dosage: '500g/tree', timing: 'Post-harvest and pre-flowering' },
        { name: 'Compost', dosage: '25kg/tree', timing: 'Annually before monsoon' }
      ],
      growingTips: [
        'Prune dead branches after harvest season',
        'Apply copper fungicide during flowering',
        'Collect fallen nuts daily to avoid aflatoxin'
      ]
    },

    {
      name: 'Tapioca (Cassava)',
      soilTypes: ['Red Laterite', 'Sandy Loam', 'Loamy'],
      climates: ['Tropical', 'Humid'],
      regions: [],
      growthDurationDays: 270,
      festivalDemand: ['Onam'],
      baseMarketPrice: 12,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'NPK 10-10-10', dosage: '250kg/hectare', timing: 'Split — planting and 90 days' },
        { name: 'Magnesium Sulphate', dosage: '25kg/hectare', timing: 'At 60 days' }
      ],
      growingTips: [
        'Plant stem cuttings 20cm long at 45 degree angle',
        'Weed 3 times in first 3 months',
        'Harvest at 8-10 months for best starch content'
      ]
    },

    {
      name: 'Pineapple',
      soilTypes: ['Red Laterite', 'Sandy Loam'],
      climates: ['Tropical', 'Humid'],
      regions: [],
      growthDurationDays: 540,
      festivalDemand: ['Onam', 'Pongal'],
      baseMarketPrice: 35,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'Urea', dosage: '8g/plant', timing: 'Every 2 months' },
        { name: 'Potassium Sulphate', dosage: '10g/plant', timing: 'At fruit initiation' }
      ],
      growingTips: [
        'Plant suckers or slips at 30cm spacing',
        'Mulch with black polythene to suppress weeds',
        'Force flowering with ethephon spray at 14 months'
      ]
    },

    // ─── ARID SPECIFIC ───
    {
      name: 'Pearl Millet (Bajra)',
      soilTypes: ['Sandy Loam', 'Red Laterite', 'Black Cotton'],
      climates: ['Arid', 'Semi-Arid'],
      regions: [],
      growthDurationDays: 75,
      festivalDemand: ['Pongal'],
      baseMarketPrice: 18,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'Urea', dosage: '60kg/hectare', timing: 'Half at sowing, half at 30 days' },
        { name: 'SSP', dosage: '75kg/hectare', timing: 'At sowing' }
      ],
      growingTips: [
        'Extremely drought tolerant crop',
        'Sow at onset of monsoon for rainfed crop',
        'Thin to 10-15cm spacing after 2 weeks'
      ]
    },

    {
      name: 'Cluster Bean (Guar)',
      soilTypes: ['Sandy Loam', 'Alluvial', 'Black Cotton'],
      climates: ['Arid', 'Semi-Arid', 'Tropical'],
      regions: [],
      growthDurationDays: 90,
      festivalDemand: ['Diwali'],
      baseMarketPrice: 35,
      demandLevel: 'Low',
      fertilizers: [
        { name: 'DAP', dosage: '50kg/hectare', timing: 'At sowing' },
        { name: 'Rhizobium inoculant', dosage: 'Seed treatment', timing: 'Before sowing' }
      ],
      growingTips: [
        'Needs very little water — ideal for dry regions',
        'Fix nitrogen naturally — good rotation crop',
        'Harvest pods every 3-4 days for vegetable use'
      ]
    },

    // ─── HUMID SPECIFIC ───
    {
      name: 'Black Pepper',
      soilTypes: ['Red Laterite', 'Loamy', 'Clay'],
      climates: ['Humid', 'Tropical'],
      regions: [],
      growthDurationDays: 730,
      festivalDemand: ['Onam', 'Diwali'],
      baseMarketPrice: 400,
      demandLevel: 'High',
      fertilizers: [
        { name: 'NPK 10-10-10', dosage: '500g/vine', timing: 'Twice a year' },
        { name: 'Compost', dosage: '5kg/vine', timing: 'Before monsoon' }
      ],
      growingTips: [
        'Train on live support tree like silver oak',
        'Apply Bordeaux mixture to prevent Phytophthora',
        'Harvest spikes when a few berries turn red'
      ]
    },

    {
      name: 'Coconut',
      soilTypes: ['Alluvial', 'Sandy Loam', 'Red Laterite', 'Loamy'],
      climates: ['Tropical', 'Humid'],
      regions: [],
      growthDurationDays: 2190,
      festivalDemand: ['Pongal', 'Onam', 'Diwali'],
      baseMarketPrice: 25,
      demandLevel: 'High',
      fertilizers: [
        { name: 'NPK 13-0-45', dosage: '1kg/tree', timing: 'Twice a year' },
        { name: 'Compost', dosage: '50kg/tree', timing: 'Annually before monsoon' }
      ],
      growingTips: [
        'Apply green leaves as mulch in basin',
        'Fertigate through drip for young palms',
        'Monitor for rhinoceros beetle — use pheromone traps'
      ]
    },

    // ─── SUB-TROPICAL ───
    {
      name: 'Mango',
      soilTypes: ['Alluvial', 'Loamy', 'Red Laterite', 'Sandy Loam'],
      climates: ['Tropical', 'Sub-Tropical', 'Semi-Arid'],
      regions: [],
      growthDurationDays: 1460,
      festivalDemand: ['Pongal', 'Onam'],
      baseMarketPrice: 80,
      demandLevel: 'High',
      fertilizers: [
        { name: 'NPK 10-10-10', dosage: '1kg/tree/year of age', timing: 'Post harvest and pre-flowering' },
        { name: 'Compost', dosage: '50kg/tree', timing: 'Annually' }
      ],
      growingTips: [
        'Withhold irrigation in Nov-Dec to induce flowering',
        'Spray potassium nitrate 1% to force uniform flowering',
        'Thin fruits at marble stage for bigger size'
      ]
    },

    {
      name: 'Chickpea (Chana)',
      soilTypes: ['Black Cotton', 'Alluvial', 'Sandy Loam', 'Loamy'],
      climates: ['Semi-Arid', 'Arid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 100,
      festivalDemand: ['Pongal', 'Diwali'],
      baseMarketPrice: 55,
      demandLevel: 'High',
      fertilizers: [
        { name: 'DAP', dosage: '100kg/hectare', timing: 'At sowing' },
        { name: 'Sulphur', dosage: '20kg/hectare', timing: 'At sowing' }
      ],
      growingTips: [
        'Inoculate with Mesorhizobium for nitrogen fixation',
        'One or two irrigations at flowering and pod fill',
        'Avoid excess nitrogen — promotes leaf growth over pods'
      ]
    },

    {
      name: 'Turmeric',
      soilTypes: ['Loamy', 'Alluvial', 'Red Laterite', 'Clay'],
      climates: ['Tropical', 'Humid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 270,
      festivalDemand: ['Pongal', 'Onam', 'Diwali'],
      baseMarketPrice: 90,
      demandLevel: 'High',
      fertilizers: [
        { name: 'FYM', dosage: '40 tonnes/hectare', timing: 'At land preparation' },
        { name: 'NPK 60-50-120', dosage: 'kg/hectare', timing: 'Split — planting, 45 and 90 days' }
      ],
      growingTips: [
        'Plant rhizomes in April-May before monsoon',
        'Mulch with green leaves immediately after planting',
        'Harvest when leaves and stem turn yellow-brown'
      ]
    },

    {
      name: 'Okra (Bhindi)',
      soilTypes: ['Loamy', 'Sandy Loam', 'Black Cotton', 'Alluvial'],
      climates: ['Tropical', 'Semi-Arid', 'Humid', 'Sub-Tropical'],
      regions: [],
      growthDurationDays: 55,
      festivalDemand: ['Onam', 'Pongal'],
      baseMarketPrice: 30,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'NPK 17-17-17', dosage: '150kg/hectare', timing: 'Basal dose' },
        { name: 'Urea', dosage: '50kg/hectare', timing: 'Top dress at 30 days' }
      ],
      growingTips: [
        'Harvest pods at 5-7cm length every 2 days',
        'Soak seeds 24 hours before sowing for better germination',
        'Use drip irrigation for water efficiency'
      ]
    },

    {
      name: 'Spinach',
      soilTypes: ['Loamy', 'Alluvial', 'Sandy Loam', 'Clay'],
      climates: ['Sub-Tropical', 'Semi-Arid', 'Humid'],
      regions: [],
      growthDurationDays: 40,
      festivalDemand: ['Pongal', 'Diwali'],
      baseMarketPrice: 25,
      demandLevel: 'Medium',
      fertilizers: [
        { name: 'Urea', dosage: '60kg/hectare', timing: 'Split — sowing and 20 days' },
        { name: 'FYM', dosage: '15 tonnes/hectare', timing: 'Before sowing' }
      ],
      growingTips: [
        'Sow thickly and thin to 8cm after germination',
        'Harvest outer leaves first for continuous yield',
        'Avoid waterlogging — causes root rot'
      ]
    },

  ];

  await CropRecommendation.insertMany(crops);
  res.json({ message: `Seeded ${crops.length} crops successfully` });
});

export default router;