"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PRODUCTS, searchProducts, getProductsByCategory } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/api/types";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

function sortProducts(products: Product[], sort: SortOption): Product[] {
    switch (sort) {
        case "price-asc": return [...products].sort((a, b) => a.price - b.price);
        case "price-desc": return [...products].sort((a, b) => b.price - a.price);
        case "rating": return [...products].sort((a, b) => b.rating - a.rating);
        default: return products;
    }
}

function ProductListingContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const [sort, setSort] = useState<SortOption>("featured");

    let products = PRODUCTS;
    let title = "All Products";

    if (query) {
        products = searchProducts(query);
        title = `Results for "${query}"`;
    } else if (category) {
        products = getProductsByCategory(category);
        title = category;
    }

    const sorted = sortProducts(products, sort);

    return (
        <div className="max-w-[1500px] mx-auto px-4 py-6">
            <div className="flex items-baseline justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500">{sorted.length} results</p>
                </div>
                <select
                    className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-white"
                    aria-label="Sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Avg. Customer Review</option>
                </select>
            </div>

            {sorted.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sorted.map((product) => (
                        <ProductCard key={product.product_id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 mb-2">No results found</p>
                    <p className="text-sm text-gray-400">Try a different search or browse categories</p>
                </div>
            )}
        </div>
    );
}

export default function ProductListingPage() {
    return (
        <Suspense fallback={<div className="max-w-[1500px] mx-auto px-4 py-6"><div className="skeleton h-8 w-48 mb-4" /><div className="grid grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-72" />)}</div></div>}>
            <ProductListingContent />
        </Suspense>
    );
}
