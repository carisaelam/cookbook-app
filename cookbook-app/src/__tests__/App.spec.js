import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

async function mountApp({ recipesByCategoryOverride } = {}) {
  vi.resetModules()

  const categories = ref([{ id: 1, name: 'Salads' }])
  const recipes = ref([{ id: 1, name: 'Test Recipe', url: '', ingredients: [] }])

  const fetchCategories = vi.fn()
  const fetchRecipes = vi.fn()
  const addRecipe = vi.fn()
  const updateRecipe = vi.fn()
  const deleteRecipe = vi.fn()
  const importRecipes = vi.fn()
  const extractIngredientsForRecipe = vi.fn()
  const backfillIngredients = vi.fn()
  const saveIngredientsForRecipe = vi.fn()
  const getOrCreateCategory = vi.fn()
  const searchQuery = ref('')
  const selectedCategoryId = ref(null)
  const defaultGroups = [
    {
      category: { id: 1, name: 'Salads' },
      recipes: [
        {
          id: 1,
          name: 'Test Recipe',
          url: '',
          ingredients: [],
          ingredients_status: 'failed'
        },
        {
          id: 2,
          name: 'Another Recipe',
          url: 'https://example.com',
          ingredients: ['Salt'],
          ingredients_status: 'success'
        }
      ]
    }
  ]

  vi.doMock('../lib/supabase', () => ({
    isSupabaseConfigured: false
  }))
  vi.doMock('../composables/useCategories', () => ({
    useCategories: () => ({
      categories,
      loading: ref(false),
      fetchCategories,
      getOrCreateCategory
    })
  }))
  vi.doMock('../composables/useRecipes', () => ({
    useRecipes: () => ({
      recipes,
      loading: ref(false),
      fetchRecipes,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      importRecipes,
      extractIngredientsForRecipe,
      backfillIngredients,
      saveIngredientsForRecipe
    })
  }))
  vi.doMock('../composables/useSearch', () => ({
    useSearch: () => ({
      searchQuery,
      selectedCategoryId,
      recipesByCategory: ref(recipesByCategoryOverride || defaultGroups),
      filteredCount: ref(1),
      totalRecipes: ref(1)
    })
  }))

  const { default: App } = await import('../App.vue')
  const wrapper = mount(App, {
    global: {
      stubs: {
        AppHeader: {
          name: 'AppHeader',
          emits: ['add-recipe', 'import-recipes', 'backfill-ingredients', 'export-backup'],
          template: `
            <div>
              <button data-test="add" @click="$emit('add-recipe')">add</button>
              <button data-test="export" @click="$emit('export-backup')">export</button>
            </div>
          `
        },
        RecipeSearch: true,
        CategoryFilter: true,
        RecipeList: {
          name: 'RecipeList',
          props: ['recipesByCategory'],
          emits: ['edit', 'delete', 'import-ingredients', 'save-ingredients'],
          template: '<div></div>'
        },
        RecipeForm: {
          name: 'RecipeForm',
          props: ['isOpen', 'recipe'],
          emits: ['save'],
          template: '<div class="recipe-form-stub" :data-open="isOpen"></div>'
        },
        ConfirmDialog: {
          name: 'ConfirmDialog',
          props: ['isOpen', 'message'],
          emits: ['confirm'],
          template: '<div class="confirm-stub" :data-open="isOpen" :data-message="message"></div>'
        },
        ImportModal: {
          name: 'ImportModal',
          props: ['isOpen'],
          emits: ['import'],
          template: '<div class="import-stub" :data-open="isOpen"></div>'
        }
      }
    }
  })

  return {
    wrapper,
    mocks: {
      fetchCategories,
      fetchRecipes,
      recipes,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      importRecipes,
      extractIngredientsForRecipe,
      backfillIngredients,
      saveIngredientsForRecipe,
      getOrCreateCategory,
      searchQuery,
      selectedCategoryId
    }
  }
}

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('loads recipes and categories on mount', async () => {
    const { wrapper, mocks } = await mountApp()
    await nextTick()

    expect(mocks.fetchCategories).toHaveBeenCalledTimes(1)
    expect(mocks.fetchRecipes).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('opens the recipe form and delete confirm', async () => {
    const { wrapper, mocks } = await mountApp()

    await wrapper.find('[data-test="add"]').trigger('click')
    expect(wrapper.findComponent({ name: 'RecipeForm' }).props('isOpen')).toBe(true)

    wrapper.findComponent({ name: 'RecipeList' }).vm.$emit('delete', mocks.recipes.value[0])
    await nextTick()

    const confirm = wrapper.findComponent({ name: 'ConfirmDialog' })
    expect(confirm.props('isOpen')).toBe(true)
    expect(confirm.props('message')).toContain('Test Recipe')

    confirm.vm.$emit('confirm')
    await nextTick()
    expect(mocks.deleteRecipe).toHaveBeenCalledWith(mocks.recipes.value[0].id)

    wrapper.findComponent({ name: 'RecipeList' }).vm.$emit('edit', mocks.recipes.value[0])
    await nextTick()
    expect(wrapper.findComponent({ name: 'RecipeForm' }).props('recipe')).toEqual(mocks.recipes.value[0])

    wrapper.unmount()
  })

  it('saves recipes and triggers ingredient extraction when needed', async () => {
    const { wrapper, mocks } = await mountApp()

    mocks.addRecipe.mockResolvedValue({ id: 10, url: 'https://example.com' })
    mocks.updateRecipe.mockResolvedValue({ id: 11, url: 'https://example.com' })

    wrapper.findComponent({ name: 'RecipeForm' }).vm.$emit('save', {
      name: 'New',
      url: 'https://example.com'
    })
    await flushPromises()

    expect(mocks.addRecipe).toHaveBeenCalled()
    expect(mocks.extractIngredientsForRecipe).toHaveBeenCalledWith({ id: 10, url: 'https://example.com' })

    wrapper.findComponent({ name: 'RecipeForm' }).vm.$emit('save', {
      id: 11,
      name: 'Updated',
      url: 'https://example.com'
    })
    await flushPromises()

    expect(mocks.updateRecipe).toHaveBeenCalled()
    expect(mocks.extractIngredientsForRecipe).toHaveBeenCalledWith({ id: 11, url: 'https://example.com' })

    wrapper.unmount()
  })

  it('handles import, ingredient actions, and backfill', async () => {
    const { wrapper, mocks } = await mountApp()

    mocks.getOrCreateCategory.mockResolvedValue({ id: 5 })
    const payload = {
      categories: ['Salads'],
      recipes: [{ name: 'Imported', url: '', notes: '', category: 'Salads' }]
    }
    wrapper.findComponent({ name: 'ImportModal' }).vm.$emit('import', payload)
    await flushPromises()

    expect(mocks.importRecipes).toHaveBeenCalled()
    expect(mocks.getOrCreateCategory).toHaveBeenCalledWith('Salads')

    wrapper.findComponent({ name: 'RecipeList' }).vm.$emit('import-ingredients', {
      id: 99,
      url: 'https://example.com'
    })
    wrapper.findComponent({ name: 'RecipeList' }).vm.$emit('save-ingredients', {
      recipe: { id: 99 },
      ingredients: ['Salt']
    })

    await wrapper.findComponent({ name: 'AppHeader' }).vm.$emit('backfill-ingredients')

    expect(mocks.extractIngredientsForRecipe).toHaveBeenCalled()
    expect(mocks.saveIngredientsForRecipe).toHaveBeenCalled()
    expect(mocks.backfillIngredients).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('filters recipes by status', async () => {
    const recipesByCategoryOverride = [
      {
        category: { id: 1, name: 'Salads' },
        recipes: [
          { id: 1, name: 'Has Status', ingredients_status: 'failed', url: '' },
          { id: 2, name: 'Has Ingredients', ingredients: ['Salt'], url: '' },
          { id: 3, name: 'No URL', ingredients: [], url: '' },
          { id: 4, name: 'Pending', ingredients: [], url: 'https://example.com' }
        ]
      }
    ]
    const { wrapper, mocks } = await mountApp({ recipesByCategoryOverride })

    const select = wrapper.find('select#status-filter')
    await select.setValue('failed')

    const recipeList = wrapper.findComponent({ name: 'RecipeList' })
    const groups = recipeList.props('recipesByCategory')
    expect(groups[0].recipes).toHaveLength(2)
    expect(groups[0].recipes.map(recipe => recipe.id).sort()).toEqual([1, 3])

    mocks.searchQuery.value = 'test'
    await nextTick()
    expect(wrapper.text()).toContain('Showing')

    wrapper.unmount()
  })

  it('exports a backup file', async () => {
    const { wrapper } = await mountApp()

    const createObjectURL = vi.fn(() => 'blob:mock')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const realCreateElement = document.createElement.bind(document)
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = realCreateElement(tag)
      element.click = vi.fn()
      element.remove = vi.fn()
      return element
    })

    await wrapper.find('[data-test="export"]').trigger('click')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledTimes(1)
    expect(createElementSpy).toHaveBeenCalledWith('a')

    wrapper.unmount()
  })
})
