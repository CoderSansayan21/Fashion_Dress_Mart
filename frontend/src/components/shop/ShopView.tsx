'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import ProductGrid from './ProductGrid';
import ProductFilters, { type PriceRange } from './ProductFilters';
import { useUIStore } from '@/store/ui-store';
import { fetchProducts, fetchCategories } from '@/lib/api';

const PAGE_SIZE = 12;

function getPaginationRange(current: number, total: number) {
  const pages: (number | 'ellipsis')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);
  }
  return pages;
}

export default function ShopView() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const selectedCategoryId = useUIStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useUIStore((s) => s.setSelectedCategoryId);
  const navigateTo = useUIStore((s) => s.navigateTo);

  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derive page from filter signature — auto-resets to 1 when any filter changes
  const filterSig = `${searchQuery}|${selectedCategoryId}|${priceRange}|${sortBy}`;
  const [pageState, setPageState] = useState({ sig: filterSig, page: 1 });
  const page = pageState.sig === filterSig ? pageState.page : 1;
  const setPage = useCallback((updater: number | ((p: number) => number)) => {
    setPageState((prev) => {
      const newPage = typeof updater === 'function' ? updater(prev.page) : updater;
      return { sig: filterSig, page: newPage };
    });
  }, [filterSig]);

  // Parse price range into min/max
  const { minPrice, maxPrice } = useMemo(() => {
    switch (priceRange) {
      case 'under-5000': return { minPrice: 0, maxPrice: 5000 };
      case '5000-10000': return { minPrice: 5000, maxPrice: 10000 };
      case '10000-20000': return { minPrice: 10000, maxPrice: 20000 };
      case 'over-20000': return { minPrice: 20000, maxPrice: undefined };
      default: return { minPrice: undefined, maxPrice: undefined };
    }
  }, [priceRange]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, searchQuery, selectedCategoryId, minPrice, maxPrice, sortBy }],
    queryFn: () =>
      fetchProducts({
        q: searchQuery || undefined,
        category_id: selectedCategoryId || undefined,
        min_price: minPrice,
        max_price: maxPrice,
        page,
        size: PAGE_SIZE,
      }),
  });

  // Sort on client side if needed (newest is handled server-side via default order)
  const products = useMemo(() => {
    if (!data?.items) return [];
    const sorted = [...data.items];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [data, sortBy]);

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startItem = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId)?.name ?? null;
  }, [categories, selectedCategoryId]);

  const clearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setPriceRange('all');
    setSortBy('newest');
  }, [setSelectedCategoryId]);

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer text-stone-500 hover:text-amber-700"
                onClick={() => navigateTo('home')}
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {selectedCategoryName ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="cursor-pointer text-stone-500 hover:text-amber-700"
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setPage(1);
                    }}
                  >
                    Shop
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-stone-800">{selectedCategoryName}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-stone-800">Shop</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
              {searchQuery ? `Search: "${searchQuery}"` : selectedCategoryName ?? 'All Products'}
            </h1>
            {total > 0 && (
              <p className="text-sm text-stone-500 mt-1">
                Showing {startItem}–{endItem} of {total} products
              </p>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            className="lg:hidden border-stone-300 text-stone-600 hover:bg-stone-100"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Main Layout */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <ProductFilters
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClear={clearFilters}
            searchQuery={searchQuery}
            mobileOpen={mobileFiltersOpen}
            onMobileOpenChange={setMobileFiltersOpen}
          />

          {/* Product Grid + Pagination */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} isLoading={isLoading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {getPaginationRange(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <PaginationItem key={`e${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}