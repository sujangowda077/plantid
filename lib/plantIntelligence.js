/**
 * Zero-cost plant intelligence engine for Botanica.
 * No external APIs, no paid AI services; all logic is local and rule-based.
 */

const imageFromSearch = (query) => `https://source.unsplash.com/300x180/?${encodeURIComponent(query)}`;

const diseaseCatalog = {
  indoor: [
    {
      name: 'Root Rot',
      symptoms: ['yellow leaves', 'mushy stem', 'soggy soil', 'foul smell', 'wilting'],
      description: 'A fungal condition caused by consistently waterlogged roots.',
      severity: 'severe',
      treatment: [
        'Remove the plant from its pot and trim all black, mushy roots with sterile scissors.',
        'Repot into fresh, well-draining mix and a pot with drainage holes.',
        'Water lightly only when the top layer dries out.'
      ],
      prevention: [
        'Always use drainage holes.',
        'Avoid watering on a fixed schedule without checking soil moisture.',
        'Increase airflow around the plant.'
      ],
      imageSearch: 'houseplant root rot mushy roots'
    },
    {
      name: 'Spider Mite Infestation',
      symptoms: ['webbing', 'tiny dots', 'speckled leaves', 'yellow stippling', 'dry leaves'],
      description: 'Spider mites are sap-sucking pests that thrive in dry indoor air.',
      severity: 'moderate',
      treatment: [
        'Isolate the plant to prevent spread.',
        'Rinse leaves thoroughly, especially leaf undersides.',
        'Apply insecticidal soap every 5-7 days for 3 rounds.'
      ],
      prevention: [
        'Keep humidity moderate to high.',
        'Inspect leaf undersides weekly.',
        'Quarantine new plants for 1-2 weeks.'
      ],
      imageSearch: 'spider mites houseplant leaf webbing'
    },
    {
      name: 'Mealybug Attack',
      symptoms: ['white cotton', 'sticky leaves', 'stunted growth', 'leaf drop', 'clustered bugs'],
      description: 'Mealybugs appear as white cottony clusters and weaken plant vigor.',
      severity: 'moderate',
      treatment: [
        'Dab visible mealybugs with cotton swab dipped in isopropyl alcohol.',
        'Spray neem oil or insecticidal soap on stems and leaf joints.',
        'Repeat treatment weekly until pests are gone.'
      ],
      prevention: [
        'Avoid overfeeding with nitrogen-heavy fertilizer.',
        'Check tight stem nodes regularly.',
        'Keep plant area clean from fallen debris.'
      ],
      imageSearch: 'mealybugs white cotton on houseplant'
    },
    {
      name: 'Bacterial Leaf Spot',
      symptoms: ['brown spots', 'yellow halo', 'wet lesions', 'leaf blight', 'spreading spots'],
      description: 'Bacterial spotting often appears after splashing water and poor airflow.',
      severity: 'moderate',
      treatment: [
        'Prune affected leaves with sterilized shears.',
        'Keep foliage dry and water at soil level only.',
        'Apply a copper-based bactericide if spread continues.'
      ],
      prevention: [
        'Avoid wet foliage overnight.',
        'Space plants for better airflow.',
        'Sterilize tools after pruning.'
      ],
      imageSearch: 'bacterial leaf spot indoor plant'
    },
    {
      name: 'Powdery Mildew',
      symptoms: ['white powder', 'dusty coating', 'distorted leaves', 'curling', 'slow growth'],
      description: 'A fungal disease that creates a white, powdery film on foliage.',
      severity: 'mild',
      treatment: [
        'Remove heavily infected leaves first.',
        'Spray diluted potassium bicarbonate or neem solution.',
        'Improve ventilation and reduce humidity spikes.'
      ],
      prevention: [
        'Do not crowd plants.',
        'Provide bright light and airflow.',
        'Avoid overhead watering.'
      ],
      imageSearch: 'powdery mildew white coating leaves'
    }
  ],
  succulent: [
    {
      name: 'Succulent Root Rot',
      symptoms: ['soft stem', 'black base', 'soggy soil', 'dropping leaves', 'foul smell'],
      description: 'Overwatering causes roots and stem base to decay in succulents.',
      severity: 'severe',
      treatment: [
        'Unpot and cut away all rotten tissue until healthy tissue remains.',
        'Let cuts callus for 1-2 days before repotting in dry cactus mix.',
        'Delay watering for a few days after repotting.'
      ],
      prevention: [
        'Use gritty cactus mix and fast-draining pots.',
        'Water deeply but infrequently.',
        'Reduce watering in winter.'
      ],
      imageSearch: 'succulent root rot black stem base'
    },
    {
      name: 'Sunburn Scorch',
      symptoms: ['bleached patch', 'brown scorch', 'crispy spots', 'sunburn', 'tan lesions'],
      description: 'Sudden harsh direct sun can burn succulent tissue.',
      severity: 'mild',
      treatment: [
        'Move plant to bright indirect light immediately.',
        'Remove badly damaged leaves once new growth appears.',
        'Reintroduce stronger sun gradually over 1-2 weeks.'
      ],
      prevention: [
        'Acclimate plants slowly to direct sunlight.',
        'Avoid midday summer sun for tender species.',
        'Rotate plants for even exposure.'
      ],
      imageSearch: 'succulent sunburn brown patches'
    },
    {
      name: 'Mealybugs on Succulents',
      symptoms: ['white cotton', 'leaf crevices', 'sticky sap', 'stunted rosette', 'bugs'],
      description: 'Mealybugs hide in rosettes and drain plant sap.',
      severity: 'moderate',
      treatment: [
        'Use alcohol swabs to remove visible clusters.',
        'Spray neem oil, focusing on leaf bases and crevices.',
        'Repeat weekly until no signs remain.'
      ],
      prevention: [
        'Inspect new succulents before grouping.',
        'Keep plants in good light to reduce stress.',
        'Avoid excessive nitrogen feeding.'
      ],
      imageSearch: 'mealybugs succulent rosette'
    },
    {
      name: 'Scale Insects',
      symptoms: ['brown bumps', 'sticky honeydew', 'yellow leaves', 'weak growth', 'pests on stem'],
      description: 'Scale insects attach to stems and leaves and are hard to remove.',
      severity: 'moderate',
      treatment: [
        'Gently scrape scale insects with a soft brush.',
        'Apply horticultural oil to smother remaining pests.',
        'Repeat every 7-10 days as needed.'
      ],
      prevention: [
        'Check stems and leaf undersides often.',
        'Isolate infested plants quickly.',
        'Keep dust off leaves for easier inspection.'
      ],
      imageSearch: 'scale insects on succulent stem'
    },
    {
      name: 'Fungal Stem Rot',
      symptoms: ['dark stem', 'soft rot', 'collapse', 'mold', 'base rot'],
      description: 'Fungal pathogens can rapidly collapse succulent stems in cool wet conditions.',
      severity: 'severe',
      treatment: [
        'Cut healthy top growth and propagate if base is infected.',
        'Discard severely rotted sections and old wet soil.',
        'Improve drainage and keep foliage dry.'
      ],
      prevention: [
        'Never leave succulents in standing water.',
        'Provide warm airflow during wet weather.',
        'Use sterile, draining media.'
      ],
      imageSearch: 'fungal stem rot succulent'
    }
  ],
  herb: [
    {
      name: 'Downy Mildew',
      symptoms: ['yellow patches', 'gray underside', 'leaf curl', 'humid weather', 'mildew'],
      description: 'A common herb disease in humid conditions, especially basil and mint.',
      severity: 'moderate',
      treatment: [
        'Remove infected leaves immediately.',
        'Water at soil level and reduce foliage wetness.',
        'Apply organic fungicide if outbreak expands.'
      ],
      prevention: [
        'Space herbs for airflow.',
        'Water in the morning only.',
        'Avoid overcrowded pots.'
      ],
      imageSearch: 'basil downy mildew yellow leaves'
    },
    {
      name: 'Aphid Infestation',
      symptoms: ['tiny green bugs', 'curled leaves', 'sticky residue', 'distorted tips', 'ants'],
      description: 'Aphids feed on young shoots and spread quickly.',
      severity: 'mild',
      treatment: [
        'Blast aphids off with a gentle stream of water.',
        'Spray insecticidal soap on affected growth.',
        'Repeat every 4-5 days until clear.'
      ],
      prevention: [
        'Pinch crowded tips regularly.',
        'Encourage beneficial insects outdoors.',
        'Avoid over-fertilizing soft new growth.'
      ],
      imageSearch: 'aphids on herb leaves'
    },
    {
      name: 'Leaf Spot',
      symptoms: ['brown lesions', 'yellow halo', 'spotted leaves', 'leaf drop', 'necrotic spots'],
      description: 'Fungal or bacterial spots can spread on damp herb foliage.',
      severity: 'moderate',
      treatment: [
        'Remove and discard spotted leaves.',
        'Improve airflow and reduce overhead watering.',
        'Use a mild copper spray where appropriate.'
      ],
      prevention: [
        'Water soil directly.',
        'Keep foliage dry at night.',
        'Sanitize pruners between plants.'
      ],
      imageSearch: 'leaf spot disease herbs'
    },
    {
      name: 'Root Rot in Herbs',
      symptoms: ['wilting', 'yellowing', 'wet soil', 'weak stems', 'rotting roots'],
      description: 'Container herbs are prone to root rot when drainage is poor.',
      severity: 'severe',
      treatment: [
        'Repot into fresh, airy mix and trim damaged roots.',
        'Reduce watering frequency immediately.',
        'Place in bright light to support recovery.'
      ],
      prevention: [
        'Use pots with strong drainage.',
        'Check moisture before watering.',
        'Add perlite to heavy mixes.'
      ],
      imageSearch: 'herb root rot potted plant'
    },
    {
      name: 'Powdery Mildew on Herbs',
      symptoms: ['white powder', 'dusty leaves', 'leaf distortion', 'slow growth', 'fungus'],
      description: 'Powdery mildew often appears on crowded herbs with poor airflow.',
      severity: 'mild',
      treatment: [
        'Trim infected foliage.',
        'Apply neem or baking-soda-based spray weekly.',
        'Move plants to sunnier, breezier location.'
      ],
      prevention: [
        'Give herbs morning sun.',
        'Avoid crowding and stale air.',
        'Prune regularly for openness.'
      ],
      imageSearch: 'powdery mildew on basil leaves'
    }
  ],
  outdoor: [
    {
      name: 'Black Spot',
      symptoms: ['black spots', 'yellow leaves', 'defoliation', 'leaf drop', 'dark lesions'],
      description: 'A fungal disease common in roses and many ornamental shrubs.',
      severity: 'moderate',
      treatment: [
        'Remove infected leaves from plant and soil surface.',
        'Apply fungicide at label intervals during active spread.',
        'Water at base and avoid wet foliage.'
      ],
      prevention: [
        'Prune for airflow.',
        'Avoid overhead irrigation.',
        'Clean fallen leaves promptly.'
      ],
      imageSearch: 'rose black spot fungal disease'
    },
    {
      name: 'Botrytis Blight',
      symptoms: ['gray mold', 'flower blight', 'soft rot', 'brown petals', 'fuzzy growth'],
      description: 'Gray mold attacks flowers and tender shoots in cool humid weather.',
      severity: 'moderate',
      treatment: [
        'Remove infected blooms and tissue right away.',
        'Improve spacing and airflow around plants.',
        'Apply fungicide if humid conditions persist.'
      ],
      prevention: [
        'Deadhead spent flowers quickly.',
        'Water early in the day.',
        'Avoid dense, wet canopies.'
      ],
      imageSearch: 'botrytis gray mold flower'
    },
    {
      name: 'Rust Disease',
      symptoms: ['orange pustules', 'rust spots', 'leaf yellowing', 'powdery spores', 'premature drop'],
      description: 'Rust fungi create orange powdery pustules on leaf undersides.',
      severity: 'moderate',
      treatment: [
        'Remove heavily infected leaves.',
        'Apply sulfur or copper fungicide.',
        'Improve sun exposure and airflow.'
      ],
      prevention: [
        'Avoid wet foliage late in the day.',
        'Keep beds weed-free.',
        'Do seasonal sanitation pruning.'
      ],
      imageSearch: 'plant rust disease orange pustules'
    },
    {
      name: 'Aphids and Soft-bodied Pests',
      symptoms: ['sticky honeydew', 'curled new growth', 'clusters of bugs', 'ant activity', 'distorted buds'],
      description: 'Aphids weaken plants and can spread viral diseases.',
      severity: 'mild',
      treatment: [
        'Rinse pests off with water jet.',
        'Use neem or insecticidal soap spray.',
        'Repeat treatment every few days as needed.'
      ],
      prevention: [
        'Inspect buds and new shoots weekly.',
        'Encourage ladybugs and beneficial insects.',
        'Avoid excessive nitrogen fertilization.'
      ],
      imageSearch: 'aphids on garden flowers'
    },
    {
      name: 'Root and Crown Rot',
      symptoms: ['wilting', 'stem base rot', 'yellowing', 'stunted growth', 'soil stays wet'],
      description: 'Waterlogged soils allow pathogens to rot roots and crown tissue.',
      severity: 'severe',
      treatment: [
        'Improve drainage with raised beds or soil amendment.',
        'Remove severely affected plants to reduce spread.',
        'Water deeply but less frequently.'
      ],
      prevention: [
        'Plant in well-draining soil.',
        'Mulch without touching plant stems.',
        'Avoid constant soil saturation.'
      ],
      imageSearch: 'garden plant crown rot disease'
    }
  ],
  tomato: [
    {
      name: 'Early Blight',
      symptoms: ['target spots', 'lower leaves yellow', 'brown lesions', 'defoliation', 'tomato blight'],
      description: 'A fungal disease that starts on older leaves and moves upward.',
      severity: 'moderate',
      treatment: [
        'Prune affected leaves below first fruit cluster.',
        'Apply copper fungicide on a regular schedule.',
        'Mulch soil to reduce spore splash.'
      ],
      prevention: [
        'Rotate crops yearly.',
        'Water at base only.',
        'Stake plants to improve airflow.'
      ],
      imageSearch: 'tomato early blight target spots'
    },
    {
      name: 'Late Blight',
      symptoms: ['water-soaked lesions', 'rapid collapse', 'dark stems', 'white mold underside', 'fruit rot'],
      description: 'A fast-spreading disease in cool, wet weather.',
      severity: 'severe',
      treatment: [
        'Remove and destroy infected plants immediately.',
        'Avoid composting infected material.',
        'Protect nearby plants with recommended fungicide.'
      ],
      prevention: [
        'Provide wide plant spacing and airflow.',
        'Avoid overhead watering.',
        'Monitor closely during rainy periods.'
      ],
      imageSearch: 'tomato late blight disease'
    },
    {
      name: 'Blossom End Rot',
      symptoms: ['black bottom fruit', 'sunken end', 'calcium issue', 'fruit lesion', 'tomato rot'],
      description: 'A physiological disorder linked to inconsistent watering and calcium uptake.',
      severity: 'moderate',
      treatment: [
        'Maintain steady watering and mulch to stabilize moisture.',
        'Remove severely affected fruit to reduce stress.',
        'Correct soil pH and calcium availability if needed.'
      ],
      prevention: [
        'Keep watering consistent.',
        'Avoid root disturbance.',
        'Do not over-fertilize with high nitrogen.'
      ],
      imageSearch: 'tomato blossom end rot black bottom'
    },
    {
      name: 'Tomato Hornworm Damage',
      symptoms: ['chewed leaves', 'missing foliage', 'large caterpillar', 'frass', 'stripped stems'],
      description: 'Hornworms can defoliate plants rapidly if unnoticed.',
      severity: 'moderate',
      treatment: [
        'Hand-pick caterpillars in early morning or dusk.',
        'Use Bacillus thuringiensis (Bt) where severe.',
        'Check undersides of leaves daily.'
      ],
      prevention: [
        'Inspect plants often in summer.',
        'Encourage beneficial wasps and birds.',
        'Keep the area weed-free.'
      ],
      imageSearch: 'tomato hornworm caterpillar damage'
    },
    {
      name: 'Aphid Infestation on Tomato',
      symptoms: ['sticky leaves', 'curled shoots', 'green bugs', 'yellowing', 'ant activity'],
      description: 'Aphids feed on sap and stress tomato growth.',
      severity: 'mild',
      treatment: [
        'Rinse foliage with water spray.',
        'Apply insecticidal soap to colonies.',
        'Repeat every few days until controlled.'
      ],
      prevention: [
        'Monitor new growth weekly.',
        'Avoid overfeeding nitrogen.',
        'Support natural predators.'
      ],
      imageSearch: 'aphids on tomato leaves'
    }
  ]
};

const cloneDiseases = (list) => list.map((item) => ({
  ...item,
  symptoms: [...item.symptoms],
  treatment: [...item.treatment],
  prevention: [...item.prevention]
}));

const plantEntries = [
  {
    key: 'rose',
    commonNames: ['rose', 'garden rose', 'rose plant', 'rosa'],
    scientificName: 'Rosa spp.',
    family: 'Rosaceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply 2-3 times per week in warm weather, keeping soil evenly moist but never waterlogged. Morning watering is best to reduce fungal risk.',
      sunlight: 'Roses need at least 6 hours of direct sun daily. Morning sun with airflow helps reduce disease pressure.',
      soil: 'Use fertile, loamy, well-draining soil with pH around 6.0-6.5. Add compost each season for consistent blooms.',
      humidity: 'Moderate humidity is ideal; too much humidity with poor airflow encourages black spot and mildew.',
      temperature: 'Best growth is between 16-30 C (60-86 F). Protect from prolonged frost and extreme heat waves.',
      fertilizer: 'Feed every 4-6 weeks during active growth with a balanced rose fertilizer. Pause feeding in peak dormancy.',
      repotting: 'Container roses should be repotted every 2-3 years in spring with fresh mix and root pruning if crowded.',
      pruning: 'Prune in late winter or early spring, removing dead wood and crossing stems. Deadhead regularly for more flowers.'
    },
    difficulty: 'medium',
    toxicity: 'Mildly irritating thorns can injure skin; generally non-toxic petals, but avoid ingestion of treated plants.',
    funFact: 'Rose petals are edible and are used in traditional syrups, teas, and desserts in many cultures.',
    quickTips: ['Deadhead faded blooms weekly.', 'Water soil, not leaves.', 'Mulch around roots to hold moisture.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'monstera',
    commonNames: ['monstera', 'swiss cheese plant', 'split leaf philodendron', 'monstera deliciosa'],
    scientificName: 'Monstera deliciosa',
    family: 'Araceae',
    type: 'indoor',
    care: {
      water: 'Water when the top 3-5 cm of soil feels dry; usually every 7-12 days indoors. Reduce watering in winter.',
      sunlight: 'Give bright indirect light near an east or filtered south window. Direct harsh afternoon sun can scorch leaves.',
      soil: 'Use chunky aroid mix with bark, perlite, and coco/peat for airflow and drainage. Ideal pH is slightly acidic to neutral.',
      humidity: 'Prefers 50-70% humidity; browning edges often mean air is too dry.',
      temperature: 'Keep between 18-30 C (65-86 F) and avoid cold drafts below 13 C (55 F).',
      fertilizer: 'Feed monthly in spring and summer with a diluted balanced fertilizer.',
      repotting: 'Repot every 1-2 years when roots circle the pot. Upsize gradually and keep support pole stable.',
      pruning: 'Trim leggy vines above a node and remove yellow leaves to redirect energy to healthy growth.'
    },
    difficulty: 'easy',
    toxicity: 'Toxic to pets and humans if chewed due to calcium oxalate crystals.',
    funFact: 'The leaf holes (fenestrations) are thought to help tropical winds pass through without tearing leaves.',
    quickTips: ['Rotate pot every 2 weeks.', 'Use a moss pole for larger leaves.', 'Wipe leaves monthly for better photosynthesis.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'pothos',
    commonNames: ['pothos', 'devils ivy', 'devil ivy', 'golden pothos', 'epipremnum'],
    scientificName: 'Epipremnum aureum',
    family: 'Araceae',
    type: 'indoor',
    care: {
      water: 'Water when top soil dries out, typically once per week. It tolerates occasional missed watering better than overwatering.',
      sunlight: 'Thrives in bright indirect light but tolerates lower light conditions. Variegated types need more brightness.',
      soil: 'Use standard well-draining potting mix. Ensure pot has drainage holes to prevent soggy roots.',
      humidity: 'Average home humidity is fine, but growth improves around 45-60%.',
      temperature: 'Best at 18-29 C (65-85 F), away from cold AC drafts.',
      fertilizer: 'Feed every 4-6 weeks in spring/summer with mild liquid fertilizer.',
      repotting: 'Repot every 1-2 years when roots are dense or growth slows noticeably.',
      pruning: 'Prune trailing vines above nodes to encourage bushier growth and easy propagation.'
    },
    difficulty: 'easy',
    toxicity: 'Toxic to cats, dogs, and people if ingested.',
    funFact: 'Pothos can root in plain water for months, making it one of the easiest plants to propagate.',
    quickTips: ['Pinch vines for fullness.', 'Avoid constant wet soil.', 'Give brighter light for stronger variegation.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'snake-plant',
    commonNames: ['snake plant', 'mother in laws tongue', 'sansevieria', 'dracaena trifasciata'],
    scientificName: 'Dracaena trifasciata',
    family: 'Asparagaceae',
    type: 'succulent',
    care: {
      water: 'Water deeply only when soil is completely dry, often every 2-4 weeks. Overwatering is the biggest risk.',
      sunlight: 'Handles low light but does best in bright indirect light.',
      soil: 'Use cactus/succulent mix with strong drainage.',
      humidity: 'Normal to low humidity is fine and preferred over damp stagnant air.',
      temperature: 'Keep between 15-32 C (59-90 F). Avoid freezing exposure.',
      fertilizer: 'Feed lightly every 6-8 weeks in warm months only.',
      repotting: 'Repot every 2-3 years or when roots distort the pot.',
      pruning: 'Remove damaged leaves at soil line and divide clumps when crowded.'
    },
    difficulty: 'easy',
    toxicity: 'Mildly toxic to pets if eaten.',
    funFact: 'Snake plant uses a CAM-like metabolism pattern that helps conserve water in dry environments.',
    quickTips: ['Err on underwatering.', 'Use terra-cotta pots.', 'Keep away from freezing windows.'],
    diseaseSet: 'succulent'
  },
  {
    key: 'peace-lily',
    commonNames: ['peace lily', 'spathiphyllum', 'white sails'],
    scientificName: 'Spathiphyllum wallisii',
    family: 'Araceae',
    type: 'indoor',
    care: {
      water: 'Keep soil lightly moist and water when top layer starts drying. Avoid prolonged dryness and soggy soil.',
      sunlight: 'Prefers medium to bright indirect light; avoid direct midday sun.',
      soil: 'Use rich but airy potting mix with perlite and organic matter.',
      humidity: 'Likes moderate to high humidity; brown tips can signal dry air or salts.',
      temperature: 'Best between 18-29 C (65-85 F). Keep away from cold drafts.',
      fertilizer: 'Feed monthly in growing season at half strength.',
      repotting: 'Repot every 1-2 years when roots are dense or plant droops too quickly after watering.',
      pruning: 'Remove spent blooms and yellow leaves at the base.'
    },
    difficulty: 'easy',
    toxicity: 'Toxic to pets and irritating if chewed.',
    funFact: 'Peace lily flowers are modified leaves called spathes, not true petals.',
    quickTips: ['Use filtered water if tips brown.', 'Keep out of harsh sun.', 'Wipe leaves to prevent dust buildup.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'lavender',
    commonNames: ['lavender', 'english lavender', 'lavandula'],
    scientificName: 'Lavandula angustifolia',
    family: 'Lamiaceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply but infrequently; let soil dry between watering cycles.',
      sunlight: 'Needs full sun, ideally 6-8+ hours daily.',
      soil: 'Use sandy, gritty, alkaline to neutral soil with excellent drainage.',
      humidity: 'Prefers dry air and suffers in persistent humidity.',
      temperature: 'Grows best between 15-32 C (59-90 F). Protect young plants from severe frost.',
      fertilizer: 'Minimal feeding needed; excess fertilizer reduces fragrance.',
      repotting: 'Container lavender can be repotted every 2 years with gritty mix refresh.',
      pruning: 'Prune after flowering to keep compact and woody growth under control.'
    },
    difficulty: 'medium',
    toxicity: 'Generally safe in small amounts, but concentrated oils can irritate pets and people.',
    funFact: 'Lavender essential oil has been used historically for scenting linens and calming routines.',
    quickTips: ['Avoid wet feet.', 'Plant in windy sunny spots.', 'Do light annual shaping.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'aloe-vera',
    commonNames: ['aloe vera', 'aloe', 'medicinal aloe'],
    scientificName: 'Aloe barbadensis miller',
    family: 'Asphodelaceae',
    type: 'succulent',
    care: {
      water: 'Water every 2-3 weeks, only after soil fully dries.',
      sunlight: 'Give bright light; gentle direct morning sun is ideal.',
      soil: 'Use gritty succulent mix with extra perlite for drainage.',
      humidity: 'Low humidity preferred; avoid damp enclosed conditions.',
      temperature: 'Ideal range is 18-30 C (65-86 F). Keep above 10 C (50 F).',
      fertilizer: 'Feed lightly once a month in spring/summer.',
      repotting: 'Repot every 2 years or when offsets crowd the pot.',
      pruning: 'Remove damaged outer leaves and separate healthy pups.'
    },
    difficulty: 'easy',
    toxicity: 'Latex beneath skin may be toxic to pets and can irritate skin in some people.',
    funFact: 'Aloe leaves store water in gel-like tissue that helps it survive long droughts.',
    quickTips: ['Use clay pots.', 'Never let water sit in rosette.', 'Increase light to avoid leggy growth.'],
    diseaseSet: 'succulent'
  },
  {
    key: 'fiddle-leaf-fig',
    commonNames: ['fiddle leaf fig', 'fiddle fig', 'ficus lyrata'],
    scientificName: 'Ficus lyrata',
    family: 'Moraceae',
    type: 'indoor',
    care: {
      water: 'Water when top 4-5 cm of soil is dry; usually weekly to biweekly depending on light.',
      sunlight: 'Needs bright filtered light and stable placement near a large window.',
      soil: 'Use chunky, fast-draining indoor tree mix with bark and perlite.',
      humidity: 'Prefers 40-60% humidity and stable conditions.',
      temperature: 'Best between 18-29 C (65-85 F); dislikes sudden shifts.',
      fertilizer: 'Feed every 4 weeks in spring/summer with balanced fertilizer.',
      repotting: 'Repot every 1-2 years in spring when root-bound.',
      pruning: 'Prune above nodes to shape canopy and encourage branching.'
    },
    difficulty: 'medium',
    toxicity: 'Sap can irritate skin and is toxic if ingested by pets.',
    funFact: 'Fiddle leaf fig leaves can grow very large because they evolved in bright tropical canopies.',
    quickTips: ['Keep in one stable spot.', 'Rotate monthly for even growth.', 'Do not overwater after leaf drop.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'orchid',
    commonNames: ['orchid', 'moth orchid', 'phalaenopsis', 'dendrobium orchid'],
    scientificName: 'Phalaenopsis spp.',
    family: 'Orchidaceae',
    type: 'indoor',
    care: {
      water: 'Water about weekly, allowing bark medium to dry slightly between waterings.',
      sunlight: 'Bright indirect light; avoid harsh direct afternoon sun.',
      soil: 'Use orchid bark mix, not regular soil, for root aeration.',
      humidity: 'Ideal humidity is 50-70% with good airflow.',
      temperature: 'Day 20-30 C (68-86 F), night slightly cooler to support reblooming.',
      fertilizer: 'Use weak orchid fertilizer every 2-4 weeks in active growth.',
      repotting: 'Repot every 1-2 years when bark breaks down or roots outgrow pot.',
      pruning: 'Trim spent spikes above a node for possible rebloom, or at base if brown.'
    },
    difficulty: 'medium',
    toxicity: 'Most common orchids are non-toxic to pets.',
    funFact: 'Orchid seeds are tiny and often need fungal partners in nature to germinate.',
    quickTips: ['Water roots, not crown.', 'Use transparent pots for root check.', 'Provide nighttime temperature drop.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'basil',
    commonNames: ['basil', 'sweet basil', 'ocimum basilicum'],
    scientificName: 'Ocimum basilicum',
    family: 'Lamiaceae',
    type: 'herb',
    care: {
      water: 'Keep soil consistently moist but never soggy; basil dislikes severe drying.',
      sunlight: 'Needs 6-8 hours of sun or strong grow-light conditions.',
      soil: 'Rich, airy, moisture-retentive but draining mix with pH near neutral.',
      humidity: 'Moderate humidity works well with airflow.',
      temperature: 'Best at 20-32 C (68-90 F); very sensitive to cold.',
      fertilizer: 'Feed lightly every 2-3 weeks for continuous leaf production.',
      repotting: 'Repot when roots fill pot and growth slows.',
      pruning: 'Pinch stem tips often to prevent flowering and keep plant bushy.'
    },
    difficulty: 'easy',
    toxicity: 'Non-toxic culinary herb; safe for most homes when grown cleanly.',
    funFact: 'Regular pinching can double basil yield by promoting branching.',
    quickTips: ['Pinch above leaf pairs.', 'Harvest often for better growth.', 'Protect from cold nights.'],
    diseaseSet: 'herb'
  },
  {
    key: 'tomato',
    commonNames: ['tomato', 'tomato plant', 'solanum lycopersicum'],
    scientificName: 'Solanum lycopersicum',
    family: 'Solanaceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply and consistently 1-2 times weekly, more during hot fruiting periods.',
      sunlight: 'Needs full sun, ideally 8+ hours daily.',
      soil: 'Rich, well-draining loam with compost and pH 6.0-6.8.',
      humidity: 'Moderate humidity with airflow helps prevent leaf diseases.',
      temperature: 'Optimal fruiting at 18-30 C (65-86 F). Flowers may drop in extreme heat.',
      fertilizer: 'Use tomato fertilizer with balanced NPK, then slightly higher potassium at fruit set.',
      repotting: 'Container tomatoes may need one up-potting before flowering.',
      pruning: 'Prune lower leaves and suckers (for indeterminate varieties) to improve airflow and fruit quality.'
    },
    difficulty: 'medium',
    toxicity: 'Leaves and stems are not edible; ripe fruit is edible when grown safely.',
    funFact: 'Tomatoes are botanically fruits but commonly used as vegetables in cooking.',
    quickTips: ['Mulch early.', 'Stake before plants get large.', 'Water consistently to avoid fruit disorders.'],
    diseaseSet: 'tomato'
  },
  {
    key: 'fern',
    commonNames: ['fern', 'boston fern', 'maidenhair fern', 'nephrolepis'],
    scientificName: 'Nephrolepis exaltata',
    family: 'Nephrolepidaceae',
    type: 'indoor',
    care: {
      water: 'Keep soil evenly moist and do not allow complete dryness.',
      sunlight: 'Bright indirect light to filtered shade is ideal.',
      soil: 'Use moisture-retentive but airy mix with peat/coco and perlite.',
      humidity: 'Needs high humidity, often 50-70% for lush fronds.',
      temperature: 'Prefers 16-27 C (60-80 F) and steady humidity.',
      fertilizer: 'Feed monthly at half strength in active season.',
      repotting: 'Repot yearly or when roots crowd and fronds thin out.',
      pruning: 'Trim brown fronds at base and remove crispy tips for appearance.'
    },
    difficulty: 'medium',
    toxicity: 'Most common ferns are non-toxic, but specific species vary.',
    funFact: 'Ferns reproduce via spores instead of flowers and seeds.',
    quickTips: ['Never let root ball fully dry.', 'Use pebble tray for humidity.', 'Keep away from heaters.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'cactus',
    commonNames: ['cactus', 'desert cactus', 'cacti'],
    scientificName: 'Cactaceae spp.',
    family: 'Cactaceae',
    type: 'succulent',
    care: {
      water: 'Water thoroughly but infrequently, allowing full dry-down between waterings.',
      sunlight: 'Needs bright light and several hours of direct sun for compact growth.',
      soil: 'Use mineral-rich cactus mix with fast drainage.',
      humidity: 'Prefers low humidity and good airflow.',
      temperature: 'Most species thrive at 18-35 C (65-95 F) with cooler dry rest in winter.',
      fertilizer: 'Feed lightly in spring and early summer only.',
      repotting: 'Repot every 2-3 years with fresh gritty mix.',
      pruning: 'Minimal pruning; remove damaged pads/segments using sterile tools.'
    },
    difficulty: 'easy',
    toxicity: 'Most cacti are non-toxic but spines can cause injury.',
    funFact: 'Cacti have specialized tissues that store large amounts of water for drought survival.',
    quickTips: ['Give strong light.', 'Avoid winter overwatering.', 'Use gloves while handling.'],
    diseaseSet: 'succulent'
  },
  {
    key: 'sunflower',
    commonNames: ['sunflower', 'helianthus', 'common sunflower'],
    scientificName: 'Helianthus annuus',
    family: 'Asteraceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply once or twice weekly, especially during early growth and flowering.',
      sunlight: 'Requires full sun all day for strong stems and large blooms.',
      soil: 'Fertile, well-draining soil with moderate organic matter works best.',
      humidity: 'Tolerates normal outdoor humidity with airflow.',
      temperature: 'Thrives in warm seasons around 18-32 C (65-90 F).',
      fertilizer: 'Use balanced fertilizer at planting and light feeding during growth.',
      repotting: 'Usually direct sown; container plants can be shifted once before flowering.',
      pruning: 'Minimal pruning; remove spent blooms to tidy and encourage side blooms in branching types.'
    },
    difficulty: 'easy',
    toxicity: 'Generally non-toxic to pets and humans.',
    funFact: 'Young sunflower heads track the sun through the day, a behavior called heliotropism.',
    quickTips: ['Stake tall varieties early.', 'Protect young shoots from birds.', 'Water deeply to promote deep roots.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'jade-plant',
    commonNames: ['jade plant', 'money plant jade', 'crassula ovata'],
    scientificName: 'Crassula ovata',
    family: 'Crassulaceae',
    type: 'succulent',
    care: {
      water: 'Water only when mix is dry through most of pot depth. Reduce watering in cool months.',
      sunlight: 'Bright light with a few hours of direct sun encourages sturdy growth.',
      soil: 'Use gritty cactus mix and pot with drainage.',
      humidity: 'Low humidity is preferred.',
      temperature: 'Ideal at 18-27 C (65-80 F), protect from frost.',
      fertilizer: 'Feed lightly every 6-8 weeks in growing season.',
      repotting: 'Repot every 2-3 years or when top-heavy.',
      pruning: 'Prune leggy stems to maintain shape and propagate cuttings easily.'
    },
    difficulty: 'easy',
    toxicity: 'Toxic to pets if ingested.',
    funFact: 'Jade plants can live for decades and often become family heirloom plants.',
    quickTips: ['Let wounds dry before watering after pruning.', 'Use sturdy pot to prevent tipping.', 'Rotate for even branching.'],
    diseaseSet: 'succulent'
  },
  {
    key: 'spider-plant',
    commonNames: ['spider plant', 'chlorophytum', 'airplane plant'],
    scientificName: 'Chlorophytum comosum',
    family: 'Asparagaceae',
    type: 'indoor',
    care: {
      water: 'Water when top 2-3 cm dries; keep moderately moist but never soggy.',
      sunlight: 'Bright indirect light keeps variegation vivid; tolerates medium light.',
      soil: 'Use regular houseplant mix with good drainage.',
      humidity: 'Average humidity works; slightly higher humidity reduces tip browning.',
      temperature: 'Best between 16-29 C (60-85 F).',
      fertilizer: 'Feed every 4-6 weeks in growing season.',
      repotting: 'Repot when roots crowd and pups overflow the pot.',
      pruning: 'Trim brown tips and remove old runners if plant gets crowded.'
    },
    difficulty: 'easy',
    toxicity: 'Generally considered non-toxic to cats and dogs.',
    funFact: 'Spider plants produce baby offshoots that can root quickly in water or soil.',
    quickTips: ['Use filtered water to reduce tip burn.', 'Hang baskets show off runners.', 'Divide root clumps in spring.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'zz-plant',
    commonNames: ['zz plant', 'zanzibar gem', 'zamioculcas'],
    scientificName: 'Zamioculcas zamiifolia',
    family: 'Araceae',
    type: 'indoor',
    care: {
      water: 'Water sparingly when soil is dry at least halfway down the pot.',
      sunlight: 'Low to bright indirect light; avoid intense direct sun.',
      soil: 'Fast-draining houseplant mix with perlite.',
      humidity: 'Adapts well to typical indoor humidity.',
      temperature: 'Ideal at 18-30 C (65-86 F).',
      fertilizer: 'Feed lightly monthly during growing season.',
      repotting: 'Repot every 2-3 years when rhizomes press against pot.',
      pruning: 'Remove yellow stems at base and wipe leaves occasionally.'
    },
    difficulty: 'easy',
    toxicity: 'Toxic if ingested by pets or children.',
    funFact: 'ZZ plants store water in thick rhizomes, making them very drought tolerant indoors.',
    quickTips: ['Do not overwater.', 'Low light is fine but growth slows.', 'Clean glossy leaves for better light capture.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'rubber-plant',
    commonNames: ['rubber plant', 'rubber tree', 'ficus elastica'],
    scientificName: 'Ficus elastica',
    family: 'Moraceae',
    type: 'indoor',
    care: {
      water: 'Water when top layer dries, then drain excess thoroughly.',
      sunlight: 'Bright indirect light encourages larger, rich-colored leaves.',
      soil: 'Use well-draining indoor tree mix with bark/perlite.',
      humidity: 'Moderate humidity preferred though adaptable indoors.',
      temperature: 'Keep between 18-29 C (65-85 F).',
      fertilizer: 'Feed every 4 weeks in spring/summer.',
      repotting: 'Repot every 1-2 years if root bound.',
      pruning: 'Prune above nodes to control height and branch structure.'
    },
    difficulty: 'easy',
    toxicity: 'Sap may irritate skin and is toxic to pets when ingested.',
    funFact: 'Natural latex was historically harvested from some Ficus relatives, inspiring the common name.',
    quickTips: ['Rotate monthly.', 'Avoid sudden cold drafts.', 'Use gloves when pruning sap-heavy stems.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'bird-of-paradise',
    commonNames: ['bird of paradise', 'strelitzia', 'orange bird of paradise'],
    scientificName: 'Strelitzia reginae',
    family: 'Strelitziaceae',
    type: 'both',
    care: {
      water: 'Water when top few centimeters are dry, then water deeply.',
      sunlight: 'Needs very bright light and some direct sun for flowering.',
      soil: 'Rich, well-draining mix with compost and coarse aeration materials.',
      humidity: 'Moderate humidity preferred; dry air may split leaves more often.',
      temperature: 'Best between 18-30 C (65-86 F). Protect from frost.',
      fertilizer: 'Feed every 2-4 weeks during active growth.',
      repotting: 'Repot every 2 years; prefers slight root snugness to bloom.',
      pruning: 'Remove damaged leaves and spent flower stalks at base.'
    },
    difficulty: 'medium',
    toxicity: 'Mildly toxic seeds/fruit; keep away from pets and children.',
    funFact: 'Its flower shape resembles a tropical bird in flight, giving it the iconic name.',
    quickTips: ['Brightest spot equals better blooms.', 'Expect natural leaf splits.', 'Do not overpot too quickly.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'calathea',
    commonNames: ['calathea', 'prayer plant calathea', 'goeppertia'],
    scientificName: 'Goeppertia spp.',
    family: 'Marantaceae',
    type: 'indoor',
    care: {
      water: 'Keep soil evenly moist with soft/filtered water; avoid complete dry-out.',
      sunlight: 'Bright indirect light; direct sunlight can fade or burn patterned leaves.',
      soil: 'Use moisture-retentive mix with peat/coco and perlite for airflow.',
      humidity: 'Needs high humidity, often 60%+ to prevent edge crisping.',
      temperature: 'Best at 18-28 C (65-82 F), away from cold drafts.',
      fertilizer: 'Feed lightly every 4 weeks in growth period.',
      repotting: 'Repot every 1-2 years to refresh compacted mix.',
      pruning: 'Trim yellow or damaged leaves near soil line.'
    },
    difficulty: 'hard',
    toxicity: 'Generally non-toxic to pets.',
    funFact: 'Many calatheas move their leaves from day to night in a rhythmic "prayer" motion.',
    quickTips: ['Use distilled/rain water.', 'Keep humidity high and stable.', 'Avoid sudden temperature changes.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'philodendron',
    commonNames: ['philodendron', 'heartleaf philodendron', 'split philodendron'],
    scientificName: 'Philodendron spp.',
    family: 'Araceae',
    type: 'indoor',
    care: {
      water: 'Water when top soil starts drying; avoid keeping roots constantly wet.',
      sunlight: 'Medium to bright indirect light is ideal.',
      soil: 'Chunky aroid mix with bark/perlite supports healthy roots.',
      humidity: 'Moderate humidity helps larger leaves and fewer brown edges.',
      temperature: 'Keep between 18-30 C (65-86 F).',
      fertilizer: 'Feed monthly in active growth season.',
      repotting: 'Repot every 1-2 years depending on root growth.',
      pruning: 'Prune vines and remove yellow leaves to keep shape tidy.'
    },
    difficulty: 'easy',
    toxicity: 'Toxic to pets and humans when chewed.',
    funFact: 'Philodendrons are climbing aroids that often develop larger mature leaves when given support.',
    quickTips: ['Use a support pole.', 'Increase humidity for larger leaves.', 'Propagate stem cuttings at nodes.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'dracaena',
    commonNames: ['dracaena', 'dragon tree', 'corn plant dracaena'],
    scientificName: 'Dracaena spp.',
    family: 'Asparagaceae',
    type: 'indoor',
    care: {
      water: 'Water when upper soil dries; dracaena dislikes both drought stress and soggy roots.',
      sunlight: 'Bright indirect light preferred; some varieties tolerate medium light.',
      soil: 'Well-draining indoor mix with some perlite.',
      humidity: 'Average humidity works, but dry air can brown tips.',
      temperature: 'Ideal between 18-27 C (65-80 F).',
      fertilizer: 'Feed every 6 weeks in spring/summer.',
      repotting: 'Repot every 2 years or when roots are pot-bound.',
      pruning: 'Cut canes to control height; new shoots emerge below cuts.'
    },
    difficulty: 'easy',
    toxicity: 'Toxic to pets if ingested.',
    funFact: 'Many dracaenas can be rejuvenated by simple cane cutbacks, making them forgiving indoor trees.',
    quickTips: ['Use low-fluoride water if tips brown.', 'Prune canes to reshape.', 'Avoid overwatering in winter.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'anthurium',
    commonNames: ['anthurium', 'flamingo flower', 'laceleaf'],
    scientificName: 'Anthurium andraeanum',
    family: 'Araceae',
    type: 'indoor',
    care: {
      water: 'Water when top layer dries slightly; keep medium lightly moist but airy.',
      sunlight: 'Bright indirect light supports repeated flowering.',
      soil: 'Use airy orchid-aroid style mix with bark and perlite.',
      humidity: 'Prefers 50-70% humidity for healthy glossy leaves.',
      temperature: 'Best in 20-30 C (68-86 F) warm indoor conditions.',
      fertilizer: 'Feed every 4 weeks with bloom-supporting balanced fertilizer.',
      repotting: 'Repot every 1-2 years when roots pack tightly.',
      pruning: 'Remove old blooms and yellow leaves at base.'
    },
    difficulty: 'medium',
    toxicity: 'Toxic if ingested; sap may irritate skin.',
    funFact: 'The colorful "flower" is actually a spathe, while true flowers are tiny and clustered on the spadix.',
    quickTips: ['Keep in warm humid room.', 'Do not compact roots with heavy soil.', 'Trim spent blooms for new growth.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'croton',
    commonNames: ['croton', 'garden croton', 'codiaeum'],
    scientificName: 'Codiaeum variegatum',
    family: 'Euphorbiaceae',
    type: 'both',
    care: {
      water: 'Water when top soil dries slightly; do not let plant dry for long.',
      sunlight: 'Needs bright light to maintain vivid leaf colors.',
      soil: 'Use rich, well-draining mix with organic matter.',
      humidity: 'Prefers moderate-high humidity and stable conditions.',
      temperature: 'Best in 18-30 C (65-86 F). Avoid cold drafts.',
      fertilizer: 'Feed every 3-4 weeks in warm season.',
      repotting: 'Repot every 1-2 years in spring when root-bound.',
      pruning: 'Pinch tips to encourage branching and fuller shape.'
    },
    difficulty: 'medium',
    toxicity: 'Sap can irritate skin; toxic if ingested by pets.',
    funFact: 'Croton leaf color intensity often increases with stronger light exposure.',
    quickTips: ['Keep conditions stable to reduce leaf drop.', 'Give bright light for color.', 'Increase humidity in dry homes.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'bougainvillea',
    commonNames: ['bougainvillea', 'paper flower'],
    scientificName: 'Bougainvillea glabra',
    family: 'Nyctaginaceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply then allow partial dry-down; too much water reduces blooms.',
      sunlight: 'Needs full sun for heavy bract production.',
      soil: 'Well-draining, slightly acidic to neutral soil works best.',
      humidity: 'Tolerates heat and moderate humidity when airflow is good.',
      temperature: 'Thrives in warm climates above 15 C (59 F).',
      fertilizer: 'Use low-nitrogen bloom fertilizer every 3-4 weeks in season.',
      repotting: 'Repot container plants every 2-3 years carefully to avoid root disturbance.',
      pruning: 'Prune after bloom flushes to maintain shape and encourage new flowering wood.'
    },
    difficulty: 'medium',
    toxicity: 'Sap and thorns may irritate skin; keep away from curious pets/children.',
    funFact: 'The bright color is from modified leaves (bracts), not the tiny true flowers.',
    quickTips: ['More sun equals more blooms.', 'Avoid overwatering.', 'Wear gloves while pruning thorny stems.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'hibiscus',
    commonNames: ['hibiscus', 'china rose', 'hibiscus rosa-sinensis'],
    scientificName: 'Hibiscus rosa-sinensis',
    family: 'Malvaceae',
    type: 'both',
    care: {
      water: 'Keep soil evenly moist in growing season; do not let it fully dry during bloom cycles.',
      sunlight: 'Needs bright sun, ideally 5-7 hours daily.',
      soil: 'Use fertile, well-draining soil rich in compost.',
      humidity: 'Moderate humidity with airflow supports flowering and leaf health.',
      temperature: 'Best at 18-32 C (65-90 F); protect from frost.',
      fertilizer: 'Feed every 2-3 weeks with bloom fertilizer in active season.',
      repotting: 'Repot potted hibiscus every 1-2 years.',
      pruning: 'Prune lightly after flowering to shape and stimulate branching.'
    },
    difficulty: 'medium',
    toxicity: 'Most hibiscus species are low-toxicity, but species-specific sensitivity can occur in pets.',
    funFact: 'Hibiscus flowers are used in teas known for their vivid red color and tart flavor.',
    quickTips: ['Keep in bright warm location.', 'Feed during bloom season.', 'Watch for aphids on buds.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'jasmine',
    commonNames: ['jasmine', 'jasmine vine', 'jasminum'],
    scientificName: 'Jasminum officinale',
    family: 'Oleaceae',
    type: 'both',
    care: {
      water: 'Water when top soil begins drying, keeping moisture steady during flowering.',
      sunlight: 'Prefers bright light to full sun depending on cultivar.',
      soil: 'Use well-draining fertile soil with organic matter.',
      humidity: 'Moderate humidity helps buds and fragrance release.',
      temperature: 'Optimal range 16-30 C (60-86 F).',
      fertilizer: 'Feed every 3-4 weeks in active growth.',
      repotting: 'Repot container jasmine every 1-2 years.',
      pruning: 'Prune after flowering to maintain shape and encourage new flowering shoots.'
    },
    difficulty: 'medium',
    toxicity: 'Most true jasmines are low toxicity, but confirm specific species around pets.',
    funFact: 'Jasmine fragrance intensifies in the evening, especially in night-blooming types.',
    quickTips: ['Support climbing varieties.', 'Prune after bloom.', 'Use bright light for best flowering.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'mint',
    commonNames: ['mint', 'spearmint', 'peppermint', 'mentha'],
    scientificName: 'Mentha spp.',
    family: 'Lamiaceae',
    type: 'herb',
    care: {
      water: 'Keep soil consistently moist, especially in containers and warm weather.',
      sunlight: 'Prefers full to partial sun; in very hot areas, afternoon shade helps.',
      soil: 'Rich, moist, well-draining soil is ideal.',
      humidity: 'Moderate humidity is suitable with airflow.',
      temperature: 'Best at 13-27 C (55-80 F), tolerant but less vigorous in extremes.',
      fertilizer: 'Feed lightly every 4-6 weeks to maintain foliage growth.',
      repotting: 'Repot or divide frequently as mint roots spread aggressively.',
      pruning: 'Harvest tips often to prevent legginess and encourage dense growth.'
    },
    difficulty: 'easy',
    toxicity: 'Generally safe culinary herb in moderate use.',
    funFact: 'Mint spreads through runners and can quickly overtake garden beds if uncontained.',
    quickTips: ['Grow in containers to control spread.', 'Harvest frequently.', 'Pinch flowers to keep leaves tender.'],
    diseaseSet: 'herb'
  },
  {
    key: 'tulsi',
    commonNames: ['tulsi', 'holy basil', 'ocimum tenuiflorum', 'sacred basil'],
    scientificName: 'Ocimum tenuiflorum',
    family: 'Lamiaceae',
    type: 'herb',
    care: {
      water: 'Water when top layer dries slightly, keeping root zone evenly moist.',
      sunlight: 'Needs bright sun, around 5-7 hours daily for robust growth.',
      soil: 'Well-draining fertile soil with compost is ideal.',
      humidity: 'Prefers moderate humidity and good airflow.',
      temperature: 'Thrives at 20-35 C (68-95 F), sensitive to cold.',
      fertilizer: 'Feed lightly every 3-4 weeks with organic fertilizer.',
      repotting: 'Repot when roots outgrow container, typically yearly.',
      pruning: 'Pinch tips and flower buds to maintain bushy medicinal leaf growth.'
    },
    difficulty: 'easy',
    toxicity: 'Traditionally used herb; generally low toxicity when grown and consumed appropriately.',
    funFact: 'Tulsi is culturally revered in many households and commonly grown as a sacred medicinal plant.',
    quickTips: ['Give morning sun.', 'Pinch flower stalks early.', 'Protect from cold wind.'],
    diseaseSet: 'herb'
  },
  {
    key: 'neem',
    commonNames: ['neem', 'neem tree', 'azadirachta indica'],
    scientificName: 'Azadirachta indica',
    family: 'Meliaceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply but infrequently once established; young plants need regular moisture.',
      sunlight: 'Requires full sun for healthy canopy growth.',
      soil: 'Adaptable but prefers well-draining sandy-loam soils.',
      humidity: 'Tolerates dry conditions and seasonal humidity with airflow.',
      temperature: 'Best in warm climates, generally 21-40 C (70-104 F).',
      fertilizer: 'Minimal feeding required; compost once or twice yearly is sufficient.',
      repotting: 'Young container plants can be up-potted yearly before ground planting.',
      pruning: 'Prune lightly to shape and remove weak or crossing branches.'
    },
    difficulty: 'easy',
    toxicity: 'Neem oil and seeds should be used cautiously around children/pets; concentrated ingestion can be harmful.',
    funFact: 'Neem-derived compounds are widely used in organic pest management.',
    quickTips: ['Give full sun.', 'Avoid waterlogging young roots.', 'Prune after active flush.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'bamboo',
    commonNames: ['bamboo', 'lucky bamboo', 'dracaena sanderiana', 'bambusoideae'],
    scientificName: 'Bambusoideae spp.',
    family: 'Poaceae',
    type: 'both',
    care: {
      water: 'Keep soil evenly moist for true bamboo; lucky bamboo in water needs regular clean water changes.',
      sunlight: 'Most indoor forms prefer bright indirect light; outdoor bamboos often tolerate more sun.',
      soil: 'Use fertile, moisture-retentive but draining soil.',
      humidity: 'Moderate humidity supports lush foliage indoors.',
      temperature: 'Generally grows best at 18-32 C (65-90 F).',
      fertilizer: 'Feed monthly in growth season with balanced fertilizer.',
      repotting: 'Repot container bamboo when roots circle tightly or growth stalls.',
      pruning: 'Remove weak canes and trim yellowing leaves as needed.'
    },
    difficulty: 'easy',
    toxicity: 'True bamboo is usually non-toxic; lucky bamboo (Dracaena) is toxic to pets.',
    funFact: 'Some bamboo species are among the fastest-growing plants on Earth.',
    quickTips: ['Confirm if it is true bamboo or lucky bamboo.', 'Keep roots moist but oxygenated.', 'Trim old canes to encourage fresh shoots.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'palm',
    commonNames: ['palm', 'areca palm', 'parlor palm', 'kentia palm'],
    scientificName: 'Arecaceae spp.',
    family: 'Arecaceae',
    type: 'both',
    care: {
      water: 'Water when upper soil dries slightly; avoid prolonged soggy roots.',
      sunlight: 'Bright indirect light is ideal indoors; outdoor palms vary by species.',
      soil: 'Use well-draining palm mix rich in organic matter.',
      humidity: 'Moderate to high humidity helps prevent tip browning.',
      temperature: 'Generally prefer 18-30 C (65-86 F) with no frost.',
      fertilizer: 'Use palm fertilizer every 6-8 weeks in growing season.',
      repotting: 'Repot cautiously every 2-3 years; palms dislike frequent root disturbance.',
      pruning: 'Remove only fully brown fronds; avoid over-pruning green leaves.'
    },
    difficulty: 'medium',
    toxicity: 'Many palms are non-toxic, but verify specific species when pets are present.',
    funFact: 'Palms are monocots, so they do not form growth rings like typical woody trees.',
    quickTips: ['Do not cut green fronds.', 'Increase humidity for indoor palms.', 'Use species-appropriate light levels.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'marigold',
    commonNames: ['marigold', 'tagetes', 'african marigold', 'french marigold'],
    scientificName: 'Tagetes spp.',
    family: 'Asteraceae',
    type: 'outdoor',
    care: {
      water: 'Water when top soil dries; avoid consistently soggy conditions.',
      sunlight: 'Needs full sun for compact growth and many flowers.',
      soil: 'Average garden soil with good drainage is sufficient.',
      humidity: 'Handles normal outdoor humidity with airflow.',
      temperature: 'Best at 18-32 C (65-90 F).',
      fertilizer: 'Light feeding monthly is enough; too much nitrogen reduces flowers.',
      repotting: 'Repot nursery starts once into final container or bed.',
      pruning: 'Deadhead frequently to extend bloom season.'
    },
    difficulty: 'easy',
    toxicity: 'Generally low toxicity; sap may irritate sensitive skin.',
    funFact: 'Marigolds are often planted as companion flowers because their scent can deter some pests.',
    quickTips: ['Deadhead weekly.', 'Avoid heavy nitrogen fertilizer.', 'Plant in sunny borders.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'chrysanthemum',
    commonNames: ['chrysanthemum', 'mum', 'garden mum'],
    scientificName: 'Chrysanthemum morifolium',
    family: 'Asteraceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply when top layer dries, especially during bud set.',
      sunlight: 'Full sun to bright light ensures dense blooming.',
      soil: 'Fertile, well-draining soil with compost.',
      humidity: 'Moderate humidity with airflow prevents fungal disease.',
      temperature: 'Performs best in cool-mild seasons around 15-27 C (59-80 F).',
      fertilizer: 'Feed every 2-3 weeks until buds color, then reduce.',
      repotting: 'Repot potted mums yearly with fresh mix.',
      pruning: 'Pinch tips early season for bushier plants and more flowers.'
    },
    difficulty: 'medium',
    toxicity: 'Toxic to cats and dogs if ingested.',
    funFact: 'In some cultures chrysanthemums symbolize longevity and autumn abundance.',
    quickTips: ['Pinch in early growth.', 'Provide strong light.', 'Improve airflow to reduce mildew.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'geranium',
    commonNames: ['geranium', 'pelargonium', 'zonal geranium'],
    scientificName: 'Pelargonium x hortorum',
    family: 'Geraniaceae',
    type: 'both',
    care: {
      water: 'Water when top layer dries, allowing slight dry-down between cycles.',
      sunlight: 'Needs bright sun for flowering, with afternoon shade in extreme heat.',
      soil: 'Use light, well-draining potting soil.',
      humidity: 'Moderate humidity and airflow keep leaves healthy.',
      temperature: 'Ideal range 15-30 C (59-86 F).',
      fertilizer: 'Feed every 2-4 weeks during bloom season.',
      repotting: 'Repot annually if container-grown.',
      pruning: 'Pinch tips and remove spent flower stalks regularly.'
    },
    difficulty: 'easy',
    toxicity: 'Can be mildly toxic to pets and may irritate skin.',
    funFact: 'Many scented geranium varieties release lemon, rose, or mint-like aromas from their leaves.',
    quickTips: ['Avoid wet foliage at night.', 'Deadhead old blooms.', 'Pinch stems for fuller growth.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'hydrangea',
    commonNames: ['hydrangea', 'mophead hydrangea', 'hortensia'],
    scientificName: 'Hydrangea macrophylla',
    family: 'Hydrangeaceae',
    type: 'outdoor',
    care: {
      water: 'Keep evenly moist, especially during hot weather and flowering.',
      sunlight: 'Morning sun and afternoon shade is ideal in warm climates.',
      soil: 'Moist, rich, well-draining soil; pH affects flower color in some cultivars.',
      humidity: 'Moderate humidity works with good airflow.',
      temperature: 'Best between 15-29 C (59-84 F).',
      fertilizer: 'Feed in spring and again mid-season with balanced fertilizer.',
      repotting: 'Container hydrangeas need repotting every 2 years.',
      pruning: 'Pruning depends on cultivar bloom type (old wood vs new wood).'
    },
    difficulty: 'medium',
    toxicity: 'Toxic if ingested in quantity; keep away from pets and children.',
    funFact: 'Hydrangea bloom color can shift from pink to blue depending on soil chemistry and aluminum availability.',
    quickTips: ['Know your cultivar before pruning.', 'Mulch to conserve moisture.', 'Avoid afternoon scorch in hot zones.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'azalea',
    commonNames: ['azalea', 'rhododendron azalea'],
    scientificName: 'Rhododendron spp.',
    family: 'Ericaceae',
    type: 'outdoor',
    care: {
      water: 'Keep root zone consistently moist, never fully dry and never waterlogged.',
      sunlight: 'Prefers filtered sun or partial shade, especially in hot climates.',
      soil: 'Needs acidic, organic, well-draining soil around pH 4.5-6.0.',
      humidity: 'Moderate humidity with airflow is beneficial.',
      temperature: 'Mild conditions 10-27 C (50-80 F) are best for blooms.',
      fertilizer: 'Feed with acid-loving plant fertilizer after flowering.',
      repotting: 'Repot container azaleas every 2-3 years in acidic mix.',
      pruning: 'Prune lightly right after bloom to shape and maintain flowering wood.'
    },
    difficulty: 'hard',
    toxicity: 'Highly toxic if ingested by pets or humans.',
    funFact: 'Some azalea species contain compounds called grayanotoxins that can affect the nervous system when ingested.',
    quickTips: ['Use acidic mulch like pine bark.', 'Avoid lime-rich water/soil.', 'Prune only after flowering.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'lily',
    commonNames: ['lily', 'true lily', 'lilium'],
    scientificName: 'Lilium spp.',
    family: 'Liliaceae',
    type: 'outdoor',
    care: {
      water: 'Water regularly for evenly moist soil during active growth.',
      sunlight: 'Most lilies prefer full sun to partial shade with cool roots.',
      soil: 'Well-draining fertile soil with organic matter and neutral to slightly acidic pH.',
      humidity: 'Moderate humidity and airflow reduce fungal issues.',
      temperature: 'Best in mild-warm seasons, generally 13-27 C (55-80 F).',
      fertilizer: 'Use balanced fertilizer at sprouting and pre-bloom stages.',
      repotting: 'Lift and divide bulbs every 3-4 years if overcrowded.',
      pruning: 'Remove spent flowers but keep foliage until it yellows naturally.'
    },
    difficulty: 'medium',
    toxicity: 'Many lilies are extremely toxic to cats even in tiny amounts.',
    funFact: 'Lily bulbs store nutrients that fuel dramatic seasonal bloom cycles.',
    quickTips: ['Never cut all foliage after bloom.', 'Mulch roots in heat.', 'Keep away from cats.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'iris',
    commonNames: ['iris', 'bearded iris', 'iris flower'],
    scientificName: 'Iris germanica',
    family: 'Iridaceae',
    type: 'outdoor',
    care: {
      water: 'Water regularly while establishing, then moderately once mature.',
      sunlight: 'Needs full sun for best bloom performance.',
      soil: 'Well-draining soil is critical; rhizomes should not stay buried too deeply.',
      humidity: 'Moderate humidity with open airflow is best.',
      temperature: 'Grows well across temperate ranges with seasonal dormancy.',
      fertilizer: 'Feed lightly in early spring and post-bloom.',
      repotting: 'Divide rhizomes every 3-4 years to maintain flowering.',
      pruning: 'Remove spent flower stalks and trim damaged leaves.'
    },
    difficulty: 'medium',
    toxicity: 'Rhizomes can be toxic if ingested and may irritate skin.',
    funFact: 'The word iris comes from the Greek word for rainbow, reflecting the flower’s color diversity.',
    quickTips: ['Keep rhizome tops partly exposed.', 'Divide clumps periodically.', 'Ensure excellent drainage.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'begonia',
    commonNames: ['begonia', 'wax begonia', 'rex begonia'],
    scientificName: 'Begonia spp.',
    family: 'Begoniaceae',
    type: 'both',
    care: {
      water: 'Water when top layer begins to dry; avoid soggy media.',
      sunlight: 'Bright indirect light is ideal for most begonias.',
      soil: 'Use airy, organic, well-draining mix.',
      humidity: 'Moderate-high humidity helps leaf quality.',
      temperature: 'Best around 18-27 C (65-80 F).',
      fertilizer: 'Feed every 3-4 weeks during active growth.',
      repotting: 'Repot yearly or when root-bound.',
      pruning: 'Pinch tips and remove old flowers/leaves to keep plants compact.'
    },
    difficulty: 'medium',
    toxicity: 'Toxic to pets, especially roots/tubers.',
    funFact: 'Begonias are prized not only for flowers but also for dramatic foliage textures and patterns.',
    quickTips: ['Water soil, not fuzzy leaves.', 'Avoid cold wet roots.', 'Pinch tips for bushiness.'],
    diseaseSet: 'indoor'
  },
  {
    key: 'impatiens',
    commonNames: ['impatiens', 'busy lizzie'],
    scientificName: 'Impatiens walleriana',
    family: 'Balsaminaceae',
    type: 'outdoor',
    care: {
      water: 'Keep consistently moist; impatiens wilt quickly when dry.',
      sunlight: 'Prefers partial shade to bright filtered light.',
      soil: 'Rich, well-draining soil with steady moisture retention.',
      humidity: 'Moderate humidity with airflow supports long bloom period.',
      temperature: 'Thrives in 16-30 C (60-86 F).',
      fertilizer: 'Feed every 2-3 weeks in bloom season.',
      repotting: 'Repot nursery plants once into final containers or beds.',
      pruning: 'Pinch leggy stems and remove spent blooms for tidy growth.'
    },
    difficulty: 'easy',
    toxicity: 'Generally low toxicity to pets.',
    funFact: 'The seed pods of some impatiens varieties burst open when touched, which inspired the name.',
    quickTips: ['Do not let dry out fully.', 'Provide afternoon shade.', 'Pinch back leggy growth.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'petunia',
    commonNames: ['petunia', 'garden petunia'],
    scientificName: 'Petunia x atkinsiana',
    family: 'Solanaceae',
    type: 'outdoor',
    care: {
      water: 'Water when upper soil dries slightly, then soak thoroughly.',
      sunlight: 'Needs full sun for best flowering.',
      soil: 'Well-draining fertile soil with moderate organic content.',
      humidity: 'Moderate humidity and airflow prevent fungal stress.',
      temperature: 'Ideal in 16-30 C (60-86 F).',
      fertilizer: 'Feed every 1-2 weeks in containers for continuous blooms.',
      repotting: 'Repot container petunias if roots become crowded mid-season.',
      pruning: 'Trim back leggy stems and deadhead to rejuvenate flowering.'
    },
    difficulty: 'easy',
    toxicity: 'Generally considered non-toxic to pets.',
    funFact: 'Modern petunias are bred for trailing baskets, upright beds, and weather tolerance.',
    quickTips: ['Deadhead regularly.', 'Feed often in pots.', 'Cut back leggy stems mid-season.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'salvia',
    commonNames: ['salvia', 'sage flower', 'ornamental salvia'],
    scientificName: 'Salvia splendens',
    family: 'Lamiaceae',
    type: 'outdoor',
    care: {
      water: 'Water when top layer dries; established plants tolerate some drought.',
      sunlight: 'Needs full sun to light shade depending on climate.',
      soil: 'Well-draining soil with moderate fertility.',
      humidity: 'Moderate humidity with airflow keeps stems strong.',
      temperature: 'Thrives in warm conditions 18-32 C (65-90 F).',
      fertilizer: 'Feed monthly in bloom season.',
      repotting: 'Repot starts once into final location.',
      pruning: 'Deadhead and pinch to extend flowering and maintain compact form.'
    },
    difficulty: 'easy',
    toxicity: 'Most ornamental salvias are low toxicity.',
    funFact: 'Many salvias are magnet plants for pollinators, especially hummingbirds and bees.',
    quickTips: ['Deadhead often.', 'Give strong light.', 'Avoid heavy wet soil.'],
    diseaseSet: 'outdoor'
  },
  {
    key: 'zinnia',
    commonNames: ['zinnia', 'zinnia elegans'],
    scientificName: 'Zinnia elegans',
    family: 'Asteraceae',
    type: 'outdoor',
    care: {
      water: 'Water deeply at base, letting soil surface dry slightly between watering.',
      sunlight: 'Needs full sun for robust stems and abundant blooms.',
      soil: 'Well-draining garden soil with moderate fertility.',
      humidity: 'Moderate humidity is fine if plants are well spaced.',
      temperature: 'Best in warm weather around 18-35 C (65-95 F).',
      fertilizer: 'Feed lightly every 4 weeks for season-long flowers.',
      repotting: 'Usually direct sown or transplanted once only.',
      pruning: 'Deadhead and cut blooms regularly to trigger more flowering.'
    },
    difficulty: 'easy',
    toxicity: 'Generally considered non-toxic.',
    funFact: 'Zinnias are one of the best cut-and-come-again flowers for home gardens.',
    quickTips: ['Space well for airflow.', 'Water at soil level.', 'Harvest blooms often for more flowers.'],
    diseaseSet: 'outdoor'
  }
];

const addAlias = (entry, aliases = []) => ({
  ...entry,
  commonNames: Array.from(new Set([...entry.commonNames, entry.scientificName, ...aliases]))
});

const expandedPlantEntries = [
  addAlias({
    key: 'dracaena-marginata',
    commonNames: ['dragon tree', 'madagascar dragon tree'],
    scientificName: 'Dracaena marginata',
    family: 'Asparagaceae',
    type: 'indoor',
    care: plantEntries.find((p) => p.key === 'dracaena').care,
    difficulty: 'easy',
    toxicity: 'Toxic to pets if ingested.',
    funFact: 'Dragon tree trunks can be braided or multi-stemmed for sculptural indoor form.',
    quickTips: ['Bright indirect light is best.', 'Trim cane tops to branch.', 'Avoid fluoride-heavy water.'],
    diseaseSet: 'indoor'
  }),
  addAlias({
    key: 'palm-areca',
    commonNames: ['areca palm', 'butterfly palm'],
    scientificName: 'Dypsis lutescens',
    family: 'Arecaceae',
    type: 'indoor',
    care: plantEntries.find((p) => p.key === 'palm').care,
    difficulty: 'medium',
    toxicity: 'Commonly considered non-toxic to pets.',
    funFact: 'Areca palm fronds arch gracefully and can improve indoor visual humidity ambiance.',
    quickTips: ['Keep evenly moist, not soggy.', 'Increase humidity in dry months.', 'Trim only dead fronds.'],
    diseaseSet: 'indoor'
  }),
  addAlias({
    key: 'palm-parlor',
    commonNames: ['parlor palm', 'chamaedorea elegans'],
    scientificName: 'Chamaedorea elegans',
    family: 'Arecaceae',
    type: 'indoor',
    care: plantEntries.find((p) => p.key === 'palm').care,
    difficulty: 'easy',
    toxicity: 'Generally non-toxic to pets.',
    funFact: 'Parlor palm has been grown indoors since Victorian times due to low-light tolerance.',
    quickTips: ['Avoid overwatering.', 'Medium light is enough.', 'Do not over-prune fronds.'],
    diseaseSet: 'indoor'
  })
];

const rawDatabase = [...plantEntries, ...expandedPlantEntries];

/** @type {Record<string, any>} */
export const PLANT_DATABASE = rawDatabase.reduce((acc, plant) => {
  acc[plant.key] = {
    ...plant,
    diseases: cloneDiseases(diseaseCatalog[plant.diseaseSet] || diseaseCatalog.indoor)
  };
  return acc;
}, {});

const allPlants = Object.values(PLANT_DATABASE);

const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = (value = '') => normalizeText(value).split(' ').filter(Boolean);

const levenshtein = (a, b) => {
  if (a === b) return 0;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[rows - 1][cols - 1];
};

const similarity = (a, b) => {
  if (!a || !b) return 0;
  const d = levenshtein(a, b);
  return 1 - d / Math.max(a.length, b.length);
};

const detectPlantTypeFromKeywords = (name = '') => {
  const lower = normalizeText(name);
  if (/basil|mint|tulsi|holy basil|herb/.test(lower)) return 'herb';
  if (/aloe|snake|cactus|jade|succulent/.test(lower)) return 'succulent';
  if (/rose|hibiscus|marigold|petunia|zinnia|hydrangea|azalea|lily|iris/.test(lower)) return 'outdoor';
  if (/monstera|pothos|calathea|philodendron|dracaena|anthurium|orchid|fern/.test(lower)) return 'indoor';
  return 'both';
};

const genericCareByType = {
  indoor: {
    water: 'Water when the top 2-4 cm of soil dries. Avoid leaving roots in standing water.',
    sunlight: 'Provide bright indirect light near a window with filtered sun.',
    soil: 'Use a light, well-draining indoor potting mix with drainage holes.',
    humidity: 'Most indoor plants prefer moderate humidity around 40-60%.',
    temperature: 'Keep between 18-29 C (65-85 F) and avoid cold drafts.',
    fertilizer: 'Feed monthly in spring and summer at half strength.',
    repotting: 'Repot every 1-2 years or when roots circle the pot.',
    pruning: 'Trim yellow leaves and leggy growth to keep healthy structure.'
  },
  outdoor: {
    water: 'Water deeply at the base when top soil dries, adjusting for rainfall.',
    sunlight: 'Most flowering outdoor plants need 6+ hours of sun.',
    soil: 'Use fertile, well-draining soil with compost for steady nutrition.',
    humidity: 'Outdoor humidity is usually fine with proper spacing for airflow.',
    temperature: 'Protect from frost and extreme heat stress as needed.',
    fertilizer: 'Feed every 4-6 weeks during active growth.',
    repotting: 'Container plants may need larger pots every season or two.',
    pruning: 'Deadhead and prune damaged growth to encourage fresh blooms.'
  },
  herb: {
    water: 'Keep herbs evenly moist but not soggy, especially in small containers.',
    sunlight: 'Give herbs strong sun, usually 5-8 hours daily.',
    soil: 'Use nutrient-rich but draining mix with compost.',
    humidity: 'Moderate humidity with airflow helps prevent mildew.',
    temperature: 'Most culinary herbs prefer warm, frost-free conditions.',
    fertilizer: 'Feed lightly every 2-4 weeks for leafy growth.',
    repotting: 'Repot and divide regularly as roots expand.',
    pruning: 'Pinch tips often to keep plants compact and productive.'
  },
  succulent: {
    water: 'Water only when soil is fully dry, then soak and drain completely.',
    sunlight: 'Provide bright light and gradual sun acclimation.',
    soil: 'Use gritty cactus mix with excellent drainage.',
    humidity: 'Low humidity and airflow reduce rot risk.',
    temperature: 'Keep warm and avoid frost exposure.',
    fertilizer: 'Feed lightly during active growth only.',
    repotting: 'Repot every 2-3 years in fresh dry mix.',
    pruning: 'Remove damaged sections and let cuts callus before watering.'
  },
  both: {
    water: 'Water based on soil moisture, not a rigid schedule.',
    sunlight: 'Match plant placement to light demand: bright shade to full sun as needed.',
    soil: 'Use well-draining soil with organic matter for balanced moisture.',
    humidity: 'Moderate humidity is suitable for most adaptable plants.',
    temperature: 'Maintain stable temperatures and protect from extremes.',
    fertilizer: 'Use balanced fertilizer during growth season.',
    repotting: 'Repot when root-bound or refresh top soil annually.',
    pruning: 'Prune dead or weak growth to improve airflow and vigor.'
  }
};

const defaultSuggestionsByIntent = {
  greeting: ['How do I care for it?', 'Any diseases?', 'Watering tips'],
  care_general: ['Watering schedule', 'Light needs', 'Fertilizer tips'],
  disease: ['How to prevent?', 'Other diseases?', 'Care tips'],
  default: ['Care tips 🌿', 'Disease help 🔬', 'Fun fact ✨']
};

const intentMatchers = {
  greeting: ['hello', 'hi', 'hey', 'start', 'good morning', 'good evening'],
  care_general: ['care tips', 'how to care', 'maintain', 'look after', 'care guide', 'care routine'],
  watering: ['water', 'watering', 'how often', 'when to water', 'overwatered', 'dry', 'thirsty', 'moist'],
  sunlight: ['sun', 'light', 'shade', 'bright', 'window', 'outdoor', 'direct sun', 'indirect light'],
  soil: ['soil', 'potting mix', 'repot', 'pot', 'drainage', 'root bound'],
  fertilizer: ['feed', 'fertilize', 'fertilizer', 'nutrients', 'compost'],
  disease: ['sick', 'disease', 'spots', 'yellow', 'brown', 'wilting', 'dying', 'drooping', 'rot', 'mold', 'pest', 'bugs', 'insects', 'leaves falling', 'curling'],
  toxicity: ['toxic', 'safe', 'pet', 'cat', 'dog', 'child', 'baby', 'poison'],
  general_info: ['what is', 'tell me about', 'info', 'information', 'details'],
  fun_fact: ['fun fact', 'interesting', 'did you know'],
  quick_tips: ['tips', 'advice', 'suggestions', 'best practices']
};

const offTopicKeywords = ['movie', 'food', 'politics', 'election', 'javascript', 'coding', 'stock', 'crypto', 'football', 'weather'];
const plantTopicKeywords = ['plant', 'leaf', 'watering', 'soil', 'sunlight', 'flower', 'root', 'pest', 'disease', 'fertilizer', 'garden'];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)] || arr[0] || '';

const getLastIntentFromHistory = (conversationHistory = []) => {
  for (let i = conversationHistory.length - 1; i >= 0; i -= 1) {
    if (conversationHistory[i]?.intent) return conversationHistory[i].intent;
  }
  return '';
};

/**
 * Fuzzy-matches a plant name against common names and scientific names.
 *
 * @param {string} plantName
 * @returns {object|null}
 */
export function getPlantData(plantName) {
  if (!plantName || !String(plantName).trim()) return null;

  const query = normalizeText(plantName);
  const queryWords = words(query);
  let best = null;
  let bestScore = 0;

  allPlants.forEach((plant) => {
    const candidates = [...plant.commonNames, plant.scientificName, plant.key].map((c) => normalizeText(c));

    candidates.forEach((candidate) => {
      if (!candidate) return;

      let score = 0;
      if (candidate === query) score = 1;
      else if (candidate.includes(query) || query.includes(candidate)) score = 0.9;
      else {
        const sim = similarity(candidate, query);
        score = sim;
        const candidateWords = words(candidate);
        const overlap = queryWords.filter((w) => candidateWords.includes(w)).length;
        if (overlap > 0) score += overlap * 0.08;
      }

      if (score > bestScore) {
        bestScore = score;
        best = plant;
      }
    });
  });

  return bestScore >= 0.56 ? best : null;
}

/**
 * Generates care tips for a given plant name from the local knowledge base.
 * Falls back to type-based generic guidance when no exact plant match exists.
 *
 * @param {string} plantName
 * @returns {{
 *  found: boolean,
 *  plantName: string,
 *  scientificName: string,
 *  type: string,
 *  difficulty: string,
 *  toxicity: string,
 *  funFact: string,
 *  care: Record<string, string>,
 *  quickTips: string[]
 * }}
 */
export function generateCareTips(plantName) {
  const matched = getPlantData(plantName);

  if (matched) {
    return {
      found: true,
      plantName: matched.commonNames[0],
      scientificName: matched.scientificName,
      type: matched.type,
      difficulty: matched.difficulty,
      toxicity: matched.toxicity,
      funFact: matched.funFact,
      care: matched.care,
      quickTips: matched.quickTips
    };
  }

  const fallbackType = detectPlantTypeFromKeywords(plantName);
  return {
    found: false,
    plantName: plantName || 'plants in general',
    scientificName: 'Unknown',
    type: fallbackType,
    difficulty: 'medium',
    toxicity: 'Species-dependent; verify exact plant before handling around pets/children.',
    funFact: 'Plants often communicate stress early through leaf color and posture changes.',
    care: genericCareByType[fallbackType],
    quickTips: [
      'Check soil moisture before every watering.',
      'Match light levels to the species needs.',
      'Improve airflow to prevent common fungal issues.'
    ]
  };
}

function scoreDisease(symptomsText, disease) {
  const text = String(symptomsText || '').toLowerCase();
  let score = 0;
  disease.symptoms.forEach((keyword) => {
    const lower = keyword.toLowerCase();
    if (text.includes(lower)) score += 1;
    if (text.includes(`${lower} `)) score += 0.5;
  });
  return score / disease.symptoms.length;
}

/**
 * Diagnoses potential diseases using keyword scoring from free-text symptoms.
 *
 * @param {string} plantName
 * @param {string} symptomsText
 * @returns {{
 *  plant: string,
 *  matches: Array<{
 *    name: string,
 *    severity: string,
 *    description: string,
 *    symptoms: string[],
 *    treatment: string[],
 *    prevention: string[],
 *    imageSearch: string,
 *    imageUrl: string,
 *    score: number
 *  }>,
 *  advice: string[]
 * }}
 */
export function diagnoseDisease(plantName, symptomsText) {
  const baseAdvice = [
    'Check roots for rot and smell before changing care drastically.',
    'Isolate affected plants to reduce spread of pests or pathogens.',
    'Adjust watering and airflow first, then reassess in 5-7 days.'
  ];

  if (!symptomsText || !String(symptomsText).trim()) {
    return {
      plant: plantName || 'unknown plant',
      matches: [],
      advice: ['Describe visible symptoms like spots, yellowing, mold, drooping, or pests.']
    };
  }

  const plant = getPlantData(plantName);
  const type = plant?.type || detectPlantTypeFromKeywords(plantName);
  const diseases = plant?.diseases || cloneDiseases(diseaseCatalog[type] || diseaseCatalog.indoor);

  const scored = diseases
    .map((disease) => ({
      ...disease,
      score: scoreDisease(symptomsText, disease),
      imageUrl: imageFromSearch(disease.imageSearch)
    }))
    .filter((d) => d.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return {
    plant: plant?.commonNames?.[0] || plantName || 'unknown plant',
    matches: scored,
    advice: scored.length ? baseAdvice : [
      'No strong disease match yet; monitor for 2-3 days with better light and airflow.',
      'Check watering frequency, because overwatering and underwatering mimic disease symptoms.',
      'If symptoms worsen quickly, prune affected leaves and isolate the plant.'
    ]
  };
}

const detectIntent = (message, conversationHistory = []) => {
  const text = normalizeText(message);
  const lastIntent = getLastIntentFromHistory(conversationHistory);

  if (!text) return 'greeting';

  const offTopic = offTopicKeywords.some((k) => text.includes(k));
  const hasPlantSignal = plantTopicKeywords.some((k) => text.includes(k));
  if (offTopic && !hasPlantSignal) return 'off_topic';

  for (const [intent, keywords] of Object.entries(intentMatchers)) {
    if (keywords.some((keyword) => text.includes(normalizeText(keyword)))) return intent;
  }

  if ((text.includes('how often') || text.includes('when')) && lastIntent === 'watering') return 'watering';
  if ((text.includes('how to prevent') || text.includes('prevent')) && lastIntent === 'disease') return 'disease';

  return hasPlantSignal ? 'care_general' : 'off_topic';
};

const responsePool = {
  greeting: [
    'Hey there! 🌿 I am ready to help you keep your plant happy and thriving. What would you like to know first? 😊',
    'Hi! 👋 Plant Assistant is here. Ask me about watering, sunlight, diseases, or quick care tips 🌱'
  ],
  care_general: [
    'Great question 🌿 Here is a balanced care plan you can follow:',
    'Absolutely! Let us build a solid care routine for your plant 🌱'
  ],
  watering: [
    'Watering is the most important piece 💧 Here is the safest approach:',
    'Let us dial in watering so your plant avoids stress 💧🌿'
  ],
  sunlight: [
    'Light makes a huge difference ☀️ Here is what works best:',
    'Great call asking about sunlight ☀️ Placement can transform growth.'
  ],
  soil: [
    'Soil and drainage are root-health superpowers 🪴 Here is the ideal setup:',
    'Perfect topic 🪴 Healthy roots start with the right mix and pot.'
  ],
  fertilizer: [
    'Feeding can speed growth when done gently 🌱 Here is a simple schedule:',
    'Nice one. Fertilizer works best in small, regular doses 🌿'
  ],
  toxicity: [
    'Safety first 🐾 Here is what you should know:',
    'Important question for pets and kids ❤️ Here is the safety info:'
  ],
  general_info: [
    'Here is a quick profile of your plant 🌿',
    'Happy to share! Here is a simple plant overview 🌱'
  ],
  fun_fact: [
    'Fun fact time ✨',
    'Love this question. Here is something cool 🌿✨'
  ],
  quick_tips: [
    'Here are practical quick wins you can use today ✅',
    'Absolutely. Try these simple tips 🌿'
  ]
};

/**
 * Generates a conversational chatbot response from local plant intelligence only.
 *
 * @param {string} plantName
 * @param {string} userMessage
 * @param {Array<{role?: string, text?: string, intent?: string}>} conversationHistory
 * @returns {{
 *  message: string,
 *  suggestions: string[],
 *  diseaseData: {
 *    name: string,
 *    severity: string,
 *    description: string,
 *    symptoms: string[],
 *    treatment: string[],
 *    prevention: string[],
 *    imageUrl: string
 *  } | null,
 *  intent: string
 * }}
 */
export function generateChatResponse(plantName, userMessage, conversationHistory = []) {
  const safePlantName = (plantName || 'plants in general').trim();
  const trimmedMessage = String(userMessage || '').trim();

  if (!trimmedMessage) {
    return {
      message: `Share a quick question and I will help right away 🌿 Try asking about ${safePlantName} watering, sunlight, or disease signs.`,
      suggestions: defaultSuggestionsByIntent.default,
      diseaseData: null,
      intent: 'greeting'
    };
  }

  const plantData = getPlantData(safePlantName);
  const careBundle = generateCareTips(safePlantName);
  const intent = detectIntent(trimmedMessage, conversationHistory.slice(-3));

  if (intent === 'off_topic') {
    return {
      message: `I am only trained in plant knowledge 🌿 Try asking me about ${safePlantName}'s care, diseases, watering, or sunlight needs!`,
      suggestions: defaultSuggestionsByIntent.default,
      diseaseData: null,
      intent
    };
  }

  if (intent === 'disease') {
    const diagnosis = diagnoseDisease(safePlantName, trimmedMessage);
    const top = diagnosis.matches[0] || null;

    if (!top) {
      return {
        message: `I could not find a strong disease match yet 🔬 but your plant can still recover. Start with airflow, careful watering, and isolating affected leaves 🌿`,
        suggestions: defaultSuggestionsByIntent.disease,
        diseaseData: null,
        intent
      };
    }

    const diseaseData = {
      name: top.name,
      severity: top.severity,
      description: top.description,
      symptoms: top.symptoms,
      treatment: top.treatment,
      prevention: top.prevention,
      imageUrl: top.imageUrl
    };

    const extra = diagnosis.matches[1] ? `
Also keep an eye out for ${diagnosis.matches[1].name}.` : '';

    return {
      message: `I found a likely issue: ${top.name} ${top.severity === 'severe' ? '⚠️' : '🌿'}.
Start treatment today and monitor progress for the next few days.${extra}`,
      suggestions: defaultSuggestionsByIntent.disease,
      diseaseData,
      intent
    };
  }

  const intro = pickRandom(responsePool[intent] || responsePool.care_general);

  const sections = {
    care_general: `${intro}
• Water: ${careBundle.care.water}
• Light: ${careBundle.care.sunlight}
• Soil: ${careBundle.care.soil}
• Quick tip: ${careBundle.quickTips[0]} 🌿`,
    watering: `${intro}
${careBundle.care.water}
Pro tip: Check soil before watering instead of following a rigid calendar 💧`,
    sunlight: `${intro}
${careBundle.care.sunlight}
Rotate the pot every 1-2 weeks so growth stays even ☀️`,
    soil: `${intro}
${careBundle.care.soil}
Repotting note: ${careBundle.care.repotting} 🪴`,
    fertilizer: `${intro}
${careBundle.care.fertilizer}
Avoid overfeeding during low-light or winter periods 🌱`,
    toxicity: `${intro}
${careBundle.toxicity}
If pets chew leaves, keep this plant elevated or in a separate room 🐾`,
    general_info: `${intro}
${careBundle.plantName} (${careBundle.scientificName}) is a ${careBundle.type} plant from the ${plantData?.family || 'unknown'} family.
Difficulty: ${careBundle.difficulty}.`,
    fun_fact: `${intro}
${careBundle.funFact} ✨`,
    quick_tips: `${intro}
${careBundle.quickTips.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
    greeting: pickRandom(responsePool.greeting)
  };

  return {
    message: sections[intent] || sections.care_general,
    suggestions: defaultSuggestionsByIntent[intent] || defaultSuggestionsByIntent.default,
    diseaseData: null,
    intent
  };
}
