/**
 * Parse recipe text into structured data
 * Supports formats:
 * - "Recipe Name - https://url.com"
 * - "Recipe Name https://url.com"
 * - "Recipe Name" (no URL)
 * - Category headers with ## or **Category**
 */
export function parseRecipes(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  const categories = new Set()
  const recipes = []

  let currentCategory = 'Uncategorized'

  for (const line of lines) {
    // Skip empty lines
    if (!line) continue

    // Check for category headers
    // Markdown style: ## Category or # Category
    if (line.startsWith('#')) {
      const categoryName = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim()
      if (categoryName) {
        currentCategory = categoryName
        categories.add(currentCategory)
      }
      continue
    }

    // Bold style: **Category**
    if (line.startsWith('**') && line.endsWith('**')) {
      const categoryName = line.replace(/\*\*/g, '').trim()
      if (categoryName) {
        currentCategory = categoryName
        categories.add(currentCategory)
      }
      continue
    }

    // All caps line might be a category (like "BREAD", "SALADS")
    if (line === line.toUpperCase() && line.length < 50 && !line.includes('http')) {
      currentCategory = line.charAt(0) + line.slice(1).toLowerCase()
      categories.add(currentCategory)
      continue
    }

    // Parse recipe line
    const recipe = parseRecipeLine(line)
    if (recipe) {
      recipe.category = currentCategory
      categories.add(currentCategory)
      recipes.push(recipe)
    }
  }

  return {
    categories: Array.from(categories),
    recipes
  }
}

/**
 * Parse a single recipe line
 */
function parseRecipeLine(line) {
  // Skip lines that are just URLs
  if (line.match(/^https?:\/\//)) {
    return null
  }

  // Skip navigation/link lines like [Text](#anchor)
  if (line.match(/^\[.*\]\(#.*\)$/)) {
    return null
  }

  let name = ''
  let url = ''

  // Format: [Recipe Name](url)
  const markdownMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (markdownMatch) {
    name = markdownMatch[1].trim()
    url = markdownMatch[2].trim()
  }
  // Format: Recipe Name - https://url or Recipe Name https://url
  else if (line.includes('http')) {
    const urlMatch = line.match(/(https?:\/\/[^\s]+)/)
    if (urlMatch) {
      url = urlMatch[1]
      // Remove URL and common separators from name
      name = line
        .replace(url, '')
        .replace(/\s*[-–—]\s*$/, '')
        .replace(/^\s*[-–—]\s*/, '')
        .trim()
    }
  }
  // Just a name, no URL
  else {
    name = line.trim()
  }

  // Clean up the name
  name = name
    .replace(/^\*+/, '')
    .replace(/\*+$/, '')
    .replace(/^-\s*/, '')
    .trim()

  if (!name || name.length < 2) {
    return null
  }

  return { name, url: url || '', notes: '' }
}

/**
 * Parse the specific format from the user's Google Doc
 * This handles the table format with markdown links
 */
export function parseGoogleDocFormat(text) {
  const categories = new Set()
  const recipes = []

  // Split by major category headers
  const sections = text.split(/(?=\*\*(?:Salads|Soups|Entrées|Sides|Desserts|Bread|Chicken|Steak|Seafood|Sausage|Turkey|Vegetarian|Noodles)[^*]*\*\*)/i)

  let currentCategory = 'Uncategorized'

  for (const section of sections) {
    const lines = section.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Check for bold category header
      const categoryMatch = trimmed.match(/^\*\*([^*]+)\*\*/)
      if (categoryMatch) {
        currentCategory = categoryMatch[1].trim()
        categories.add(currentCategory)
        continue
      }

      // Parse markdown links [Name](url)
      const linkMatches = trimmed.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
      for (const match of linkMatches) {
        const name = match[1].trim()
        const url = match[2].trim()

        // Skip anchor links
        if (url.startsWith('#')) continue

        recipes.push({
          name,
          url,
          category: currentCategory,
          notes: ''
        })
        categories.add(currentCategory)
      }

      // Also check for plain text recipe names (no link)
      // This handles recipes that don't have URLs yet
      const plainText = trimmed
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '') // Remove markdown links
        .replace(/\*\*/g, '') // Remove bold
        .trim()

      if (plainText && !plainText.startsWith('#') && plainText.length > 2) {
        // Check if this looks like a recipe name (not a header or category)
        const words = plainText.split(/\s+/)
        if (words.length >= 2 && words.length <= 10) {
          // Avoid duplicates - check if we already have this recipe
          const exists = recipes.some(r =>
            r.name.toLowerCase() === plainText.toLowerCase()
          )
          if (!exists) {
            recipes.push({
              name: plainText,
              url: '',
              category: currentCategory,
              notes: ''
            })
          }
        }
      }
    }
  }

  return {
    categories: Array.from(categories),
    recipes
  }
}
