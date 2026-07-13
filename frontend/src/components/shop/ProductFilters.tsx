'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Category } from '@/types';

type PriceRange = 'all' | 'under-5000' | '5000-10000' | '10000-20000' | 'over-20000';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  priceRange: PriceRange;
  onPriceChange: (range: PriceRange) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClear: () => void;
  searchQuery: string;
  /** Whether the mobile sheet is open */
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

const priceRanges: { value: PriceRange; label: string; min?: number; max?: number }[] = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-5000', label: 'Under Rs.5,000', max: 5000 },
  { value: '5000-10000', label: 'Rs.5,000 – Rs.10,000', min: 5000, max: 10000 },
  { value: '10000-20000', label: 'Rs.10,000 – Rs.20,000', min: 10000, max: 20000 },
  { value: 'over-20000', label: 'Over Rs.20,000', min: 20000 },
];

function FilterContent({
  categories,
  selectedCategoryId,
  onCategoryChange,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  onClear,
}: Omit<ProductFiltersProps, 'mobileOpen' | 'onMobileOpenChange' | 'searchQuery'>) {
  const hasFilters = selectedCategoryId !== null || priceRange !== 'all' || sortBy !== 'newest';

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">Categories</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedCategoryId === null
                ? 'bg-amber-50 text-amber-700 font-medium'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategoryId === cat.id
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-stone-200" />

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">Price Range</h3>
        <RadioGroup value={priceRange} onValueChange={(v) => onPriceChange(v as PriceRange)} className="space-y-2">
          {priceRanges.map((range) => (
            <div key={range.value} className="flex items-center space-x-2.5">
              <RadioGroupItem value={range.value} id={`price-${range.value}`} />
              <Label htmlFor={`price-${range.value}`} className="text-sm text-stone-600 cursor-pointer font-normal">
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator className="bg-stone-200" />

      {/* Sort By */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">Sort By</h3>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <>
          <Separator className="bg-stone-200" />
          <Button
            variant="outline"
            className="w-full border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-800"
            onClick={onClear}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );
}

export default function ProductFilters(props: ProductFiltersProps) {
  const {
    mobileOpen,
    onMobileOpenChange,
    ...filterProps
  } = props;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">
          <FilterContent {...filterProps} />
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-stone-800">Filters</SheetTitle>
            <SheetDescription>Refine your product search</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-5rem)] px-4 pb-4 pt-4">
            <FilterContent {...filterProps} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

export type { PriceRange };