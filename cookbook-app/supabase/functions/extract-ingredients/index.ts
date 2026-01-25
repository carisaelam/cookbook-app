import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.41/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function extractRecipeIngredients(json: unknown): string[] {
  const candidates: unknown[] = [];

  for (const item of asArray(json)) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;

    const graph = obj['@graph'];
    if (graph) {
      candidates.push(...asArray(graph));
      continue;
    }

    candidates.push(obj);
  }

  const ingredients: string[] = [];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const obj = candidate as Record<string, unknown>;

    const type = obj['@type'];
    const types = asArray(type).map((value) => String(value));
    if (!types.includes('Recipe')) continue;

    const raw = obj['recipeIngredient'] ?? obj['ingredients'];
    for (const item of asArray(raw)) {
      if (typeof item === 'string' && item.trim()) {
        ingredients.push(item.trim());
      }
    }
  }

  return ingredients;
}

function parseJsonLdBlocks(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  if (!doc) return [];

  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  const ingredients: string[] = [];

  for (const script of scripts) {
    const text = script.textContent?.trim();
    if (!text) continue;

    try {
      const parsed = JSON.parse(text);
      ingredients.push(...extractRecipeIngredients(parsed));
    } catch {
      continue;
    }
  }

  return ingredients;
}

function extractIngredientsFromHtml(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  if (!doc) return [];

  const selectors = [
    '[itemprop="recipeIngredient"]',
    '.ingredients-item-name',
    '.ingredients-item',
    '.recipe-ingredients li',
    '.ingredients li',
    '.wprm-recipe-ingredient',
    '.wprm-recipe-ingredient-name',
  ];

  const items: string[] = [];
  for (const selector of selectors) {
    const nodes = doc.querySelectorAll(selector);
    if (!nodes?.length) continue;

    for (const node of nodes) {
      const text = node.textContent?.replace(/\s+/g, ' ').trim();
      if (text) items.push(text);
    }

    if (items.length) break;
  }

  return Array.from(new Set(items));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        status: 'failed',
        error: 'Only POST is supported.',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({
          status: 'failed',
          error: 'Missing or invalid url.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'cookbook-app/ingredient-extractor',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          status: 'failed',
          error: `Failed to fetch URL: ${response.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const html = await response.text();
    let ingredients = parseJsonLdBlocks(html);

    if (!ingredients.length) {
      ingredients = extractIngredientsFromHtml(html);
    }

    if (!ingredients.length) {
      return new Response(
        JSON.stringify({
          status: 'failed',
          error: 'No recipe ingredients found.',
          ingredients: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        error: null,
        ingredients,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unexpected error.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
