import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

async function mountApp({ canEdit = true, recipesByCategoryOverride } = {}) {
  vi.resetModules()

  const categories = ref([{ id: '1', name: 'Salads' }])
  const recipes = ref([{ id: '1', name: 'Test Recipe', url: '', ingredients: [] }])

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

  vi.doMock('../lib/firebase', () => ({
    isFirebaseConfigured: true
  }))
  vi.doMock('../composables/useAuth', () => ({
    useAuth: () => ({
      user: ref(canEdit ? { email: 'editor@example.com' } : null),
      isEditor: ref(canEdit),
      loading: ref(false),
      initAuth: vi.fn(() => () => {}),
      signIn: vi.fn(),
      signOut: vi.fn()
    })
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
      recipesByCategory: ref(recipesByCategoryOverride || [
        {
          category: { id: '1', name: 'Salads' },
          recipes: [{ id: '1', name: 'Test Recipe', url: '', ingredients_status: 'failed' }]
        }
      ]),
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
          emits: ['add-recipe', 'import-recipes', 'backfill-ingredients', 'export-backup', 'auth-action'],
          template: `
            <div>
              <button data-test="add" @click="$emit('add-recipe')">add</button>
              <button data-test="export" @click="$emit('export-backup')">export</button>
              <button data-test="backfill" @click="$emit('backfill-ingredients')">backfill</button>
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
      addRecipe,
      updateRecipe,
      deleteRecipe,
      importRecipes,
      extractIngredientsForRecipe,
      backfillIngredients,
      saveIngredientsForRecipe,
      getOrCreateCategory,
      searchQuery
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

  it('saves recipes and can export backup', async () => {
    const { wrapper, mocks } = await mountApp()

    mocks.addRecipe.mockResolvedValue({ id: '10', url: 'https://example.com' })

    wrapper.findComponent({ name: 'RecipeForm' }).vm.$emit('save', {
      name: 'New',
      url: 'https://example.com'
    })
    await flushPromises()

    expect(mocks.addRecipe).toHaveBeenCalled()

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

  it('blocks write actions when user is read-only', async () => {
    const { wrapper, mocks } = await mountApp({ canEdit: false })

    await wrapper.find('[data-test="add"]').trigger('click')
    expect(wrapper.findComponent({ name: 'RecipeForm' }).props('isOpen')).toBe(false)

    wrapper.findComponent({ name: 'RecipeForm' }).vm.$emit('save', {
      name: 'Nope',
      url: 'https://example.com'
    })
    wrapper.findComponent({ name: 'RecipeList' }).vm.$emit('delete', { id: '1', name: 'Test Recipe' })
    wrapper.findComponent({ name: 'RecipeList' }).vm.$emit('save-ingredients', {
      recipe: { id: '1' },
      ingredients: ['Salt']
    })
    await wrapper.find('[data-test="backfill"]').trigger('click')
    await flushPromises()

    expect(mocks.addRecipe).not.toHaveBeenCalled()
    expect(mocks.deleteRecipe).not.toHaveBeenCalled()
    expect(mocks.saveIngredientsForRecipe).not.toHaveBeenCalled()
    expect(mocks.backfillIngredients).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})
