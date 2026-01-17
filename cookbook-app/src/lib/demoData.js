// Demo data for when Supabase is not configured
// This allows testing the app without a database connection

export const demoCategories = [
  { id: 1, name: 'Salads', sort_order: 1 },
  { id: 2, name: 'Soups Stews & Curries', sort_order: 2 },
  { id: 3, name: 'Chicken', sort_order: 3 },
  { id: 4, name: 'Seafood', sort_order: 4 },
  { id: 5, name: 'Vegetarian', sort_order: 5 },
  { id: 6, name: 'Sides', sort_order: 6 },
  { id: 7, name: 'Desserts', sort_order: 7 },
]

export const demoRecipes = [
  // Salads
  { id: 1, name: 'Cashew Crunch Salad with Sesame Dressing', url: 'https://pinchofyum.com/cashew-crunch-salad-with-sesame-dressing', category_id: 1, notes: '', categories: { id: 1, name: 'Salads' } },
  { id: 2, name: 'Curried Quinoa Salad', url: 'https://minimalistbaker.com/curried-quinoa-salad/', category_id: 1, notes: '', categories: { id: 1, name: 'Salads' } },
  { id: 3, name: 'Kale Couscous Salad', url: 'https://www.ambitiouskitchen.com/kale-couscous-salad/', category_id: 1, notes: '', categories: { id: 1, name: 'Salads' } },
  { id: 4, name: 'Sweetgreen Elote Bowl', url: 'https://www.lahbco.com/greens-n-things/elotesweetgreenbowl', category_id: 1, notes: '', categories: { id: 1, name: 'Salads' } },

  // Soups
  { id: 5, name: 'Lemony Lentil Soup', url: 'https://www.gimmesomeoven.com/lemony-lentil-soup/', category_id: 2, notes: '', categories: { id: 2, name: 'Soups Stews & Curries' } },
  { id: 6, name: 'Thai Chicken Soup', url: 'https://minimalistbaker.com/cozy-thai-inspired-chicken-noodle-soup/', category_id: 2, notes: '', categories: { id: 2, name: 'Soups Stews & Curries' } },
  { id: 7, name: 'Green Curry Lentil Soup', url: 'https://www.bonappetit.com/recipe/green-curry-lentil-soup', category_id: 2, notes: '', categories: { id: 2, name: 'Soups Stews & Curries' } },

  // Chicken
  { id: 8, name: 'Cashew Chicken', url: 'https://letsdishrecipes.com/easy-cashew-chicken', category_id: 3, notes: '', categories: { id: 3, name: 'Chicken' } },
  { id: 9, name: 'Chicken Pot Pie', url: 'https://allezlefood.com/2019/02/22/chicken-pot-pie-from-salt-fat-acid-heat/', category_id: 3, notes: '', categories: { id: 3, name: 'Chicken' } },
  { id: 10, name: 'Thai Chicken Thighs Coconut Rice', url: 'https://www.bonappetit.com/recipe/thai-roast-chicken-thighs-with-coconut-rice', category_id: 3, notes: '', categories: { id: 3, name: 'Chicken' } },

  // Seafood
  { id: 11, name: 'Fish Tacos', url: 'https://www.gimmesomeoven.com/fish-tacos/#tasty-recipes-59652', category_id: 4, notes: '', categories: { id: 4, name: 'Seafood' } },
  { id: 12, name: 'Coconut Curry Salmon', url: 'https://pinchofyum.com/coconut-curry-salmon', category_id: 4, notes: '', categories: { id: 4, name: 'Seafood' } },
  { id: 13, name: 'Sushi Bowl', url: 'https://www.budgetbytes.com/sushi-bowls-sriracha-mayo/', category_id: 4, notes: '', categories: { id: 4, name: 'Seafood' } },

  // Vegetarian
  { id: 14, name: 'Veggie Shepherd\'s Pie', url: 'https://pinchofyum.com/vegetarian-shepherds-pie', category_id: 5, notes: '', categories: { id: 5, name: 'Vegetarian' } },
  { id: 15, name: 'Mediterranean Bowl', url: 'https://minimalistbaker.com/the-ultimate-mediterranean-bowl/', category_id: 5, notes: '', categories: { id: 5, name: 'Vegetarian' } },
  { id: 16, name: 'Zucchini Fritters', url: 'https://minimalistbaker.com/easy-zucchini-fritters/', category_id: 5, notes: '', categories: { id: 5, name: 'Vegetarian' } },

  // Sides
  { id: 17, name: 'Turmeric Rice', url: 'https://www.fooddolls.com/coconut-turmeric-rice/', category_id: 6, notes: '', categories: { id: 6, name: 'Sides' } },
  { id: 18, name: 'Hot Honey Brussels Sprouts', url: 'https://www.emilyeatsthings.com/hot-honey-brussels-sprouts/', category_id: 6, notes: '', categories: { id: 6, name: 'Sides' } },

  // Desserts
  { id: 19, name: 'Pumpkin Bread', url: 'https://sallysbakingaddiction.com/pumpkin-chocolate-chip-bread/', category_id: 7, notes: '', categories: { id: 7, name: 'Desserts' } },
  { id: 20, name: 'Blueberry Scones', url: 'https://www.bonappetit.com/recipe/easy-blueberry-cream-scones', category_id: 7, notes: '', categories: { id: 7, name: 'Desserts' } },
]

// Helper to generate next ID
let nextCategoryId = 8
let nextRecipeId = 21

export function getNextCategoryId() {
  return nextCategoryId++
}

export function getNextRecipeId() {
  return nextRecipeId++
}
