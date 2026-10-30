// Drafted descriptions, ingredients and allergens for every menu item. These are written from the
// item names and the Spoonfed descriptions, not from Pearl Island's recipes: confirm each with
// Pearl Island before customers or the assistant rely on them.

export type MenuDetail = { description: string; ingredients: string[]; allergens?: string[] }

export const menuDetails: Record<string, MenuDetail> = {
  'slow-roasted-pork': {
    description: "Pearl Island's award-winning slow roasted pork with oregano, garlic, lemon and culantro marinade",
    ingredients: ['Pork shoulder', 'Oregano', 'Garlic', 'Lemon', 'Culantro', 'Salt', 'Black pepper'],
  },
  'sous-poulet': {
    description: 'Tender chicken stewed low and slow in a savory Caribbean herb and pepper sauce',
    ingredients: ['Chicken', 'Onion', 'Bell pepper', 'Garlic', 'Thyme', 'Lime', 'Scallion'],
  },
  'curry-chicken': {
    description: 'Chicken simmered in a golden Caribbean curry with coconut milk, thyme and scotch bonnet',
    ingredients: ['Chicken', 'Curry powder', 'Coconut milk', 'Onion', 'Garlic', 'Thyme', 'Scotch bonnet pepper'],
  },
  'jerk-chicken': {
    description: 'Chicken marinated in a bold jerk blend of allspice, scotch bonnet and thyme, then roasted',
    ingredients: ['Chicken', 'Scallion', 'Scotch bonnet pepper', 'Allspice', 'Thyme', 'Garlic', 'Ginger', 'Soy sauce'],
    allergens: ['Soy'],
  },
  'curry-tofu': {
    description: 'Plant-based curry of tofu, peppers and onion in a rich coconut curry sauce',
    ingredients: ['Tofu', 'Curry powder', 'Coconut milk', 'Onion', 'Bell pepper', 'Garlic', 'Thyme'],
    allergens: ['Soy'],
  },
  'creole-beans': {
    description: 'Slow-cooked red beans in a savory Creole tomato sauce with peppers, celery and herbs',
    ingredients: ['Red beans', 'Onion', 'Bell pepper', 'Celery', 'Garlic', 'Tomato', 'Thyme', 'Creole seasoning'],
  },
  'jerk-tofu': {
    description: 'Tofu marinated in jerk spices and roasted until the edges caramelize',
    ingredients: ['Tofu', 'Scallion', 'Scotch bonnet pepper', 'Allspice', 'Thyme', 'Garlic', 'Ginger', 'Soy sauce'],
    allergens: ['Soy'],
  },
  'tropical-fried-rice': {
    description: 'Turmeric stewed rice with papaya, pineapple, carrots, peas, onions and peppers',
    ingredients: ['Rice', 'Turmeric', 'Papaya', 'Pineapple', 'Carrots', 'Peas', 'Onions', 'Bell pepper', 'Vegetable oil'],
  },
  'rice-pigeon-peas': {
    description: 'Fluffy rice simmered with pigeon peas, onion, garlic and thyme',
    ingredients: ['Rice', 'Pigeon peas', 'Onion', 'Garlic', 'Thyme', 'Scallion'],
  },
  'brown-rice-quinoa-lima': {
    description: 'Hearty blend of brown rice, red quinoa and lima beans, seasoned with garlic and onion',
    ingredients: ['Brown rice', 'Red quinoa', 'Lima beans', 'Onion', 'Garlic', 'Vegetable broth'],
  },
  'yellow-rice': {
    description: 'Turmeric-scented rice with onion and garlic',
    ingredients: ['Rice', 'Turmeric', 'Onion', 'Garlic', 'Vegetable oil'],
  },
  'white-rice': {
    description: 'Plain steamed white rice',
    ingredients: ['Rice', 'Water', 'Salt'],
  },
  'mac-and-cheese': {
    description: "Pearl Island's baked macaroni in a creamy, sharp cheddar sauce",
    ingredients: ['Elbow macaroni', 'Cheddar cheese', 'Milk', 'Butter', 'Flour', 'Black pepper'],
    allergens: ['Milk', 'Wheat'],
  },
  'roasted-vegetables': {
    description: 'Seasonal vegetables roasted with olive oil, garlic and herbs',
    ingredients: ['Zucchini', 'Yellow squash', 'Carrots', 'Bell pepper', 'Olive oil', 'Garlic', 'Herbs'],
  },
  tostones: {
    description: 'Twice-fried green plantain coins, crisp outside and soft inside',
    ingredients: ['Green plantains', 'Vegetable oil', 'Salt'],
  },
  amarillos: {
    description: 'Sweet ripe plantains fried until caramelized',
    ingredients: ['Ripe plantains', 'Vegetable oil'],
  },
  pikliz: {
    description: 'Spicy Haitian pickled slaw of cabbage, carrots and peppers',
    ingredients: ['Cabbage', 'Carrots', 'Bell pepper', 'Scotch bonnet pepper', 'Shallot', 'Vinegar', 'Lime'],
  },
  aioli: {
    description: 'Creamy garlic aioli, a 16oz bottle for dipping and spreading',
    ingredients: ['Vegetable oil', 'Egg yolk', 'Garlic', 'Lemon juice', 'Salt'],
    allergens: ['Eggs'],
  },
  'vegan-aioli': {
    description: 'Egg-free garlic aioli, a 16oz bottle for dipping and spreading',
    ingredients: ['Vegetable oil', 'Chickpea brine', 'Garlic', 'Lemon juice', 'Mustard', 'Salt'],
  },
  'southern-roasted-vegetables': {
    description: 'Sweet potatoes, carrots and peppers roasted with smoked paprika',
    ingredients: ['Sweet potatoes', 'Carrots', 'Onion', 'Bell pepper', 'Smoked paprika', 'Olive oil'],
  },
  'collard-greens': {
    description: "Pearl Island's slow-simmered collard greens with garlic, onion and a touch of vinegar",
    ingredients: ['Collard greens', 'Onion', 'Garlic', 'Vegetable broth', 'Smoked paprika', 'Apple cider vinegar'],
  },
  'kale-salad': {
    description: "Organic Kale, pan-roasted mushrooms, carrots and watermelon radish served with Pearl Island's Shallot Vinaigrette",
    ingredients: ['Organic kale', 'Mushrooms', 'Carrots', 'Watermelon radish', 'Shallot', 'Olive oil', 'Vinegar', 'Mustard'],
  },
  'medley-salad': {
    description: "Organic Mixed Greens, Kale and Baby Spinach tossed with Rainbow Peppers English Cucumbers and Heirloom Tomatoes, served with Pearl Island's Shallot Vinaigrette",
    ingredients: ['Mixed greens', 'Kale', 'Baby spinach', 'Rainbow peppers', 'English cucumbers', 'Heirloom tomatoes', 'Shallot', 'Olive oil', 'Vinegar', 'Mustard'],
  },
  'supplies-plates-cutlery-cups': { description: 'Disposable plates, cutlery and cups for every guest', ingredients: [] },
  'supplies-plates-cutlery': { description: 'Disposable plates and cutlery for every guest', ingredients: [] },
  'supplies-cups': { description: 'Disposable cups for every guest', ingredients: [] },
  'supplies-cutlery-pack': { description: 'A cutlery pack (fork, knife, napkin) for every guest', ingredients: [] },
  'serving-spoons': { description: 'Disposable serving spoons for the buffet line', ingredients: [] },
  'serving-tongs': { description: 'Disposable serving tongs for the buffet line', ingredients: [] },
  'chafing-set': { description: 'Disposable chafing dish with fuel to keep food hot through service', ingredients: [] },
}
