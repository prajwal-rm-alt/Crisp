import { Product, ProductRecipe } from '../types';

export interface DetailedRecipeGuide {
  dishName: string;
  dishType: string;
  applianceBrand: string;
  applianceName: string;
  modelNumber: string;
  prepTime: string;
  cookingMode: string;
  temperature: string;
  timer: string;
  accessoryUsed: string;
  steps: string[];
  proTip: string;
  youtubeTitle: string;
  youtubeQuery: string;
  youtubeUrl: string;
}

// Preset tailored preparation steps for appliances in the catalog
const TAILORED_RECIPE_KNOWLEDGE: Record<
  string,
  {
    temperature: string;
    timer: string;
    accessory: string;
    steps: string[];
    proTip: string;
  }
> = {
  'Crispy Punjabi Samosas (Guilt-Free)': {
    temperature: '185°C',
    timer: '18 Minutes',
    accessory: 'Air Fryer Crisp Tray / Basket',
    steps: [
      'Step 1 (Prep): Roll and stuff samosas with spiced potato-pea filling. Lightly brush or spray with 1 tsp oil on all sides.',
      'Step 2 (Preheat): Preheat the air fryer at 180°C for 2 minutes to ensure immediate crisping.',
      'Step 3 (Arrange): Place samosas in a single layer in the crisper basket with 1cm gap for 360° air circulation.',
      'Step 4 (Air Fry): Cook at 185°C for 18 minutes. Pull out the basket and gently flip at 10 minutes for an even blistered golden shell.',
    ],
    proTip: 'Lightly brushing with oil gives the authentic golden tandoori crust while cutting oil by 90% compared to deep frying.',
  },
  'Tandoori Paneer Tikka Skewers': {
    temperature: '200°C',
    timer: '12 Minutes',
    accessory: 'Crisper Plate & Skewers',
    steps: [
      'Step 1 (Marination): Marinate paneer cubes, capsicum, and onions in thick hung curd, roasted besan, mustard oil, and chaat masala for 20 mins.',
      'Step 2 (Thread): Thread onto skewers alternating paneer and veggies. Brush lightly with melted butter.',
      'Step 3 (Roast): Place on the crisper plate at 200°C for 10-12 minutes on Roast mode.',
      'Step 4 (Serve): Turn halfway for charred smoky edges. Dust with lemon juice and chaat masala.',
    ],
    proTip: 'Sprinkle kasuri methi in the curd marinade; the high-speed hot air creates restaurant-style charred edges in just 12 minutes.',
  },
  'Crispy Masala French Fries': {
    temperature: '195°C',
    timer: '15 Minutes',
    accessory: 'Air Fryer Mesh Basket',
    steps: [
      'Step 1 (Prep): Cut potatoes into uniform 8mm batons. Soak in ice water for 15 mins to strip excess starch, then pat bone-dry with a kitchen towel.',
      'Step 2 (Coat): Toss with 1 tsp olive oil, salt, garlic powder, and smoked paprika.',
      'Step 3 (Air Fry): Cook at 195°C for 15 minutes in the crisper basket.',
      'Step 4 (Shake): Vigorously shake the basket at the 7-minute mark for uniform 360° crunch.',
    ],
    proTip: 'Dry potatoes thoroughly before tossing in oil. Any surface moisture turns into steam instead of crunch.',
  },
  'Roasted Herb Spiced Chicken Wings': {
    temperature: '195°C',
    timer: '22 Minutes',
    accessory: 'Crisper Plate',
    steps: [
      'Step 1 (Prep): Pat chicken wings dry. Season with crushed black pepper, garlic paste, rosemary, and olive oil.',
      'Step 2 (Arrange): Space evenly on the crisper plate skin-side up without stacking.',
      'Step 3 (Air Fry): Cook at 195°C for 22 minutes on High Convection.',
      'Step 4 (Glaze): Flip at 14 minutes. Glaze with honey BBQ butter during the final 3 minutes for crackling caramelized skin.',
    ],
    proTip: 'High convection renders the subcutaneous fat quickly, making the skin ultra-crisp while locking in all juicy tenderness.',
  },
  'Fudgy Molten Chocolate Brownies': {
    temperature: '160°C',
    timer: '16 Minutes',
    accessory: 'Silicone / Aluminium Brownie Pan (fits 5L basket)',
    steps: [
      'Step 1 (Batter): Whisk melted dark chocolate, butter, eggs/condensed milk, cocoa powder, and flour until glossy.',
      'Step 2 (Pour): Pour into a parchment-lined 6-inch square tin that easily nests into the air fryer basket.',
      'Step 3 (Bake): Bake at 160°C for 16 minutes in Bake mode.',
      'Step 4 (Rest): Allow to cool in basket for 10 minutes before slicing to achieve a gooey fudge center.',
    ],
    proTip: 'Do not overbake! A toothpick inserted in the center should come out with moist crumbs, not dry.',
  },
  'Cheesy Stuffed Herb Garlic Bread': {
    temperature: '200°C',
    timer: '14 Minutes',
    accessory: 'Wire Grill Rack & Baking Tray',
    steps: [
      'Step 1 (Prep): Slit a french baguette diagonally without cutting all the way through.',
      'Step 2 (Stuff): Generously stuff with garlic-herb butter and shredded mozzarella cheese.',
      'Step 3 (Preheat): Preheat OTG to 200°C using Top + Bottom heating rods for 5 minutes.',
      'Step 4 (Bake & Toast): Place on the wire rack and bake at 200°C for 12-14 minutes until cheese is molten and crust is golden.',
    ],
    proTip: 'Use both top and bottom heating elements so the bread base gets crisp while the cheese browns beautifully.',
  },
  'Spongy Bakery Vanilla Sponge Cake': {
    temperature: '170°C',
    timer: '30 Minutes',
    accessory: 'Middle Rack + Round Cake Tin',
    steps: [
      'Step 1 (Preheat): Preheat OTG to 170°C for 10 minutes with Bottom element + Convection fan on.',
      'Step 2 (Batter): Pour aerated vanilla batter into a greased and dusted 7-inch cake pan.',
      'Step 3 (Bake): Slide cake pan onto the middle rack. Bake at 170°C for 28-30 minutes without opening the glass door.',
      'Step 4 (Check): Insert skewer in center; when clean, rest cake in turned-off chamber with door slightly ajar for 5 mins.',
    ],
    proTip: 'Never open the OTG door during the first 20 minutes of baking to prevent cold drafts that deflate cakes.',
  },
  'Charcoal Style Whole Roasted Tandoori Chicken': {
    temperature: '220°C',
    timer: '45 Minutes',
    accessory: 'Motorized Rotisserie Rod & Skewer Clamps',
    steps: [
      'Step 1 (Marinate): Double marinate 1kg whole chicken with ginger-garlic paste, lemon, and Kashmiri red chili yogurt paste.',
      'Step 2 (Skewer): Secure chicken tightly onto the motorized rotisserie rod using thumb screw clamps.',
      'Step 3 (Drip Tray): Place the enameled crumb/baking tray on bottom rack with 100ml water to catch drippings and prevent smoke.',
      'Step 4 (Rotisserie): Select Rotisserie + Convection mode at 220°C for 45 minutes for self-basting roasted skin.',
    ],
    proTip: 'As the motorized rod turns, juices naturally roll back over the bird, keeping the breast meat succulent.',
  },
  'Thin Crust Farmhouse Veggie Pizza': {
    temperature: '230°C',
    timer: '12 Minutes',
    accessory: 'Preheated Enamel Baking Tray on Lower-Middle Rack',
    steps: [
      'Step 1 (Preheat): Preheat OTG with the baking tray inside at 230°C (maximum heat) for 10 minutes.',
      'Step 2 (Assemble): Roll pizza dough, spread marinara, top with diced bell peppers, olives, corn, and fresh mozzarella.',
      'Step 3 (Bake): Carefully transfer assembled pizza onto the sizzling hot preheated tray.',
      'Step 4 (Bake): Bake at 230°C for 10-12 minutes until crust edges blister and cheese forms golden spots.',
    ],
    proTip: 'Placing dough directly onto a preheated hot tray replicates a brick pizza oven stone, preventing a soggy base.',
  },
};

/**
 * Returns complete recipe preparation details and YouTube demonstration link
 */
export function getRecipeIntelligence(product: Product, recipe: ProductRecipe): DetailedRecipeGuide {
  const knowledge = TAILORED_RECIPE_KNOWLEDGE[recipe.name];

  const youtubeQuery =
    recipe.youtubeQuery ||
    `${product.brand} ${product.name} ${recipe.name} recipe demonstration`;

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    youtubeQuery
  )}`;

  if (knowledge) {
    return {
      dishName: recipe.name,
      dishType: recipe.dishType,
      applianceBrand: product.brand,
      applianceName: product.name,
      modelNumber: product.modelNumber,
      prepTime: recipe.prepTime,
      cookingMode: recipe.cookingMode,
      temperature: knowledge.temperature,
      timer: knowledge.timer,
      accessoryUsed: knowledge.accessory,
      steps: knowledge.steps,
      proTip: knowledge.proTip,
      youtubeTitle: `${recipe.name} in ${product.brand} ${product.name}`,
      youtubeQuery,
      youtubeUrl,
    };
  }

  // Generative fallback for other recipes
  const isAirFryer = product.category.toLowerCase().includes('air fry');
  const isOTG = product.category.toLowerCase().includes('otg') || product.category.toLowerCase().includes('oven');
  const isMixer = product.category.toLowerCase().includes('mixer') || product.category.toLowerCase().includes('blender');
  const isInduction = product.category.toLowerCase().includes('induction');

  let defaultSteps: string[] = [];
  let defaultAccessory = 'Standard Appliance Cooking Container';
  let defaultTemp = '180°C / Standard Mode';
  let defaultTimer = recipe.prepTime || '15 Minutes';
  let defaultProTip = `Use the recommended genuine ${product.brand} accessories for maximum thermal efficiency.`;

  if (isAirFryer) {
    defaultAccessory = 'Non-Stick Air Fryer Food Basket';
    defaultTemp = '185°C';
    defaultSteps = [
      `Step 1 (Prep): Prepare the ingredients for ${recipe.name}. Lightly brush with 1 teaspoon of oil.`,
      `Step 2 (Arrange): Place evenly in the ${product.brand} air fryer basket without overcrowding.`,
      `Step 3 (Cook): Set appliance to ${recipe.cookingMode || '185°C'} for ${recipe.prepTime}.`,
      `Step 4 (Finish): Shake or flip halfway through the cycle for 360-degree even crisping.`,
    ];
    defaultProTip = 'Do not overcrowd the basket. Hot air circulation is the secret to 90% less oil cooking.';
  } else if (isOTG) {
    defaultAccessory = 'Enamelled Baking Tray / Wire Grill Rack';
    defaultTemp = '190°C';
    defaultSteps = [
      `Step 1 (Preheat): Preheat the ${product.name} at 190°C for 8-10 minutes.`,
      `Step 2 (Tray Setup): Place ${recipe.name} on the greased baking tray or wire rack.`,
      `Step 3 (Bake/Grill): Set cooking mode to ${recipe.cookingMode || 'Bake Mode'} for ${recipe.prepTime}.`,
      `Step 4 (Rest): Turn off elements and let rest inside the oven for 3 minutes before serving.`,
    ];
    defaultProTip = 'Always preheat your OTG before sliding in baked goods or roasted dishes for consistent rising.';
  } else if (isMixer) {
    defaultAccessory = 'Stainless Steel Flow-Breaker Jar';
    defaultTemp = 'Pulse to Speed 2';
    defaultTimer = '2-3 Minutes';
    defaultSteps = [
      `Step 1 (Load): Place ingredients in the jar, ensuring not to exceed the maximum fill line.`,
      `Step 2 (Pulse): Pulse 3 times for 3 seconds each to crush hard pieces.`,
      `Step 3 (Grind): Shift to Speed 1 for 30 seconds, then Speed 2 until silkily pulverized.`,
      `Step 4 (Serve): Unlatch lid and scrape down edges. Wash jar immediately for easy cleaning.`,
    ];
    defaultProTip = 'Use the Pulse mode first to break down tough textures before running continuous motor speeds.';
  } else if (isInduction) {
    defaultAccessory = 'Induction-Compatible Ferromagnetic Pan';
    defaultTemp = '1200W - 1600W';
    defaultSteps = [
      `Step 1 (Setup): Place flat-bottom induction pan on the crystal glass surface center.`,
      `Step 2 (Power): Select ${recipe.cookingMode || 'Curry / Fry'} preset mode.`,
      `Step 3 (Cook): Cook for ${recipe.prepTime}, adjusting power wattage with touch controls.`,
      `Step 4 (Keep Warm): Switch to Keep Warm feature until ready to serve.`,
    ];
    defaultProTip = 'Direct magnetic induction transfers 93% heat directly to the pan with zero wasted ambient warmth.';
  } else {
    defaultSteps = [
      `Step 1: Prepare all fresh ingredients for ${recipe.name}.`,
      `Step 2: Set the ${product.name} to ${recipe.cookingMode || 'Standard Setting'}.`,
      `Step 3: Allow appliance to run for ${recipe.prepTime}.`,
      `Step 4: Plate and serve hot.`,
    ];
  }

  return {
    dishName: recipe.name,
    dishType: recipe.dishType,
    applianceBrand: product.brand,
    applianceName: product.name,
    modelNumber: product.modelNumber,
    prepTime: recipe.prepTime,
    cookingMode: recipe.cookingMode,
    temperature: defaultTemp,
    timer: defaultTimer,
    accessoryUsed: defaultAccessory,
    steps: defaultSteps,
    proTip: defaultProTip,
    youtubeTitle: `${recipe.name} in ${product.brand} ${product.name}`,
    youtubeQuery,
    youtubeUrl,
  };
}
