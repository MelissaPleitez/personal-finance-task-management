import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import useCategories from '@/hooks/useCategories'
import api from '@/lib/axios'
import type { Category } from '@/types/category.types'
import { TransactionType } from '@/types/transaction.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// ── curated icon list ──
const COMMON_ICONS = [
  'home', 'car', 'utensils', 'shoppingCart', 'heartPulse',
  'graduationCap', 'briefcase', 'banknote', 'piggyBank',
  'trendingUp', 'creditCard', 'coffee', 'plane', 'gift',
  'music', 'gamepad2', 'smartphone', 'shirt', 'bus',
  'zap', 'droplets', 'tv', 'dumbbell', 'baby'
]

// ── schema ──
const createCategorySchema = z.object({
  name:  z.string().min(1, 'Name is required').max(80),
  icon:  z.string().min(1, 'Please select an icon'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color e.g. #ff0000'),
  type:  z.nativeEnum(TransactionType),
})

type CreateCategoryData = z.infer<typeof createCategorySchema>

// ── dynamic icon renderer ──
const getIcon = (iconName: string, size = 20) => {
  const formatted = iconName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  const Icon = LucideIcons[formatted as keyof typeof LucideIcons] as React.ElementType
  return Icon ? <Icon size={size} /> : <span className="text-base">{iconName}</span>
}

// ── category card ──
const CategoryCard = ({ category, isConfirming, openEdit, handleDelete, setDeletingId, deleteError }: { category: Category; isConfirming: boolean, openEdit: (category: Category) => void, handleDelete: (categoryId: number) => void, setDeletingId: (id: number | null) => void, deleteError: string | null }) => (
  <Card className="p-4 bg-navy-800 border-navy-700 hover:border-violet-500/50 transition-all cursor-pointer">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
        style={{ backgroundColor: `${category.color}30` }}
      >
        {getIcon(category.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{category.name}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          <Badge className="text-xs bg-navy-700 text-slate-400 border-0 px-2 py-0">
            {category.isSystem ? 'System' : 'Custom'}
          </Badge>
          <Badge className={`text-xs border-0 px-2 py-0 ${
            category.type === TransactionType.INCOME
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {category.type}
          </Badge>
          {
          category.isSystem === true ? '': (
          !isConfirming ? (
            
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(category)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-navy-700 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingId(category.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                
                  ) : (
                    /* ── inline delete confirmation ── */
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 rounded text-xs bg-navy-700 text-slate-400 hover:bg-navy-600 transition-all"
                      >
                        No
                      </button>
                    </div>
                  )
                )}
                  {deleteError && (
            <p className="text-red-400 text-xs mt-1">{deleteError}</p>
          )}
        </div>
      </div>
    </div>
  </Card>
)

// ── category grid ──
const CategoryGrid = ({ categories, deletingId, openEdit, handleDelete, setDeletingId, deleteError }: { categories: Category[]; deletingId: number | null, openEdit: (category: Category) => void, handleDelete: (categoryId: number) => void, setDeletingId: (id: number | null) => void, deleteError: string | null }) => {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
        <p className="text-slate-400 text-sm">No categories found</p>
        <p className="text-slate-600 text-xs mt-1">Create a custom category to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat) => {
        const isConfirming = deletingId === cat.id;
        return (
          <CategoryCard key={cat.id} category={cat} isConfirming={isConfirming} openEdit={openEdit} handleDelete={handleDelete} setDeletingId={setDeletingId} deleteError={deleteError} />
        );
      })}
    </div>
  )
}

// ── main page ──
const CategoriesPage = () => {
  const { categories, systemCategories, userCategories, loading, error , refetch } = useCategories()
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const isOpen = selectedCategory !== undefined

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateCategoryData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { color: '#888888' }   // ← default color
  })

  const colorValue = watch('color')
  const iconValue = watch('icon')

  const openCreate = () => {
    reset({ color: '#888888', icon: '', name: '', type: TransactionType.EXPENSE }) // reset form and set default color
    setFormError(null)
    setSelectedCategory(null) 
  }

  const openEdit = (category: Category) => {
      reset({ color: category.color, icon: category.icon, name: category.name, type: category.type }) // reset form with category data
      setFormError(null)
      setSelectedCategory(category) // category = edit mode, modal open
  }

  const closeModal = () => {
    setSelectedCategory(undefined) // undefined = closed
    reset()
  }

  const onSubmit = async (data: CreateCategoryData) => {
    try {
      setFormError(null)
      console.log('id category: ', selectedCategory?.id)
      console.log('data nueva? : ', data)

      console.log('data despues:', TransactionType.EXPENSE)
      
      if(selectedCategory){
        await api.put(`/categories/${selectedCategory.id}`, data)
      } else {
        await api.post('/categories', data)
      }
      closeModal()
      refetch()
    } catch {
      setFormError('Failed to create category. Please try again.')
    }
  }

  const handleDelete = async (categoryId: number) => {
    try {
      setDeleteError(null);
      await api.delete(`/categories/${categoryId}`)
      setDeletingId(null)
      refetch()
    } catch {
      setDeleteError('Failed to delete category. Please try again.')
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Loading categories...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {categories.length} total · {systemCategories.length} system · {userCategories.length} custom
        </p>
        <Button
          onClick={openCreate}
          size="sm"
          className="bg-violet-500 hover:bg-violet-600 text-white"
        >
          <Plus size={16} className="mr-1" />
          New Category
        </Button>
      </div>
      {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{formError}</p>
          </div>
      )}

      {/* ── tabs ── */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-navy-800 border border-navy-700 h-9 p-1">
          <TabsTrigger
            value="all"
            className="text-slate-400 data-[state=active]:bg-violet-500 data-[state=active]:text-white text-xs px-3 h-7"
          >
            All ({categories.length})
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="text-slate-400 data-[state=active]:bg-violet-500 data-[state=active]:text-white text-xs px-3 h-7"
          >
            System ({systemCategories.length})
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="text-slate-400 data-[state=active]:bg-violet-500 data-[state=active]:text-white text-xs px-3 h-7"
          >
            Custom ({userCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CategoryGrid categories={categories} deletingId={deletingId} openEdit={openEdit} handleDelete={handleDelete} setDeletingId={setDeletingId} deleteError={deleteError} />
        </TabsContent>

        <TabsContent value="system">
          <CategoryGrid categories={systemCategories} deletingId={deletingId} openEdit={openEdit} handleDelete={handleDelete} setDeletingId={setDeletingId} deleteError={deleteError}  />
        </TabsContent>

        <TabsContent value="custom">
          {userCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
              <p className="text-slate-400 text-sm">No custom categories yet</p>
              <p className="text-slate-600 text-xs mt-1">Click "New Category" to create one</p>
            </div>
          ) : (
            <CategoryGrid categories={userCategories} deletingId={deletingId} openEdit={openEdit} handleDelete={handleDelete} setDeletingId={setDeletingId} deleteError={deleteError}  />
          )}
        </TabsContent>
      </Tabs>

      {/* ── create category modal ── */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedCategory? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* name */}
            <div className="space-y-2">
              <Label className="text-slate-300">Category Name</Label>
              <Input
                placeholder="e.g. Groceries, Side Hustle"
                className="bg-navy-900 border-navy-700 text-white"
                {...register('name')}
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            {/* type */}
            <div className="space-y-2">
              <Label className="text-slate-300">Category Type</Label>
              <select
                className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm"
                {...register('type')}
              >
                <option value="">Select type...</option>
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
              </select>
              {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
            </div>

            {/* icon picker */}
            <div className="space-y-2">
              <Label className="text-slate-300">
                Category Icon
                {iconValue && (
                  <span className="text-slate-500 text-xs ml-2">
                    — {iconValue} selected
                  </span>
                )}
              </Label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-navy-900 border border-navy-700 rounded-md">
                {COMMON_ICONS.map((iconName) => {
                  const formatted = iconName
                    .split(/[-_]/)
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join('')
                  const Icon = LucideIcons[formatted as keyof typeof LucideIcons] as React.ElementType
                  if (!Icon) return null

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setValue('icon', iconName)}
                      title={iconName}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        iconValue === iconName
                          ? 'bg-violet-500 text-white'
                          : 'bg-navy-800 text-slate-400 hover:bg-navy-700 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  )
                })}
              </div>
              {/* manual input */}
              <div className="flex gap-2 items-center">
                {/* live preview */}
                <div className="w-9 h-9 rounded-lg bg-navy-900 border border-navy-700 flex items-center justify-center text-slate-400 flex-shrink-0">
                  {iconValue ? getIcon(iconValue, 16) : <span className="text-xs">?</span>}
                </div>
                <Input
                  placeholder="or type icon name e.g. shoppingBag"
                  value={iconValue || ''}
                  onChange={(e) => setValue('icon', e.target.value)}
                  className="flex-1 bg-navy-900 border-navy-700 text-white text-sm"
                />
                </div>
               <p className="text-slate-500 text-xs">
                {/* Use Lucide icon names — find them at{' '} */}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-400 hover:underline"
                >
                  Browse all icons at lucide.dev →
                </a>
              </p>
              {errors.icon && <p className="text-red-400 text-xs">{errors.icon.message}</p>}
            </div>

            {/* color */}
            <div className="space-y-2">
              <Label className="text-slate-300">Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={colorValue || '#888888'}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer bg-navy-900 border border-navy-700"
                />
                <Input
                  placeholder="#888888"
                  value={colorValue || ''}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="flex-1 bg-navy-900 border-navy-700 text-white"
                />
              </div>
              {errors.color && <p className="text-red-400 text-xs">{errors.color.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-navy-700 text-slate-300"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
              >
                {isSubmitting ? 'Creating...' : selectedCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default CategoriesPage