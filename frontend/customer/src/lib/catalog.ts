"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/api/types";

type CatalogState = {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
};

type ProductState = {
  product: Product | null;
  loading: boolean;
  error: string | null;
};

export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({
    products: [],
    categories: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetch("/api/catalog", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Catalog fetch failed with status ${response.status}`);
        }
        return response.json() as Promise<{ products: Product[]; categories: string[] }>;
      })
      .then((data) => {
        setState({
          products: data.products,
          categories: data.categories,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        setState({
          products: [],
          categories: [],
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load catalog.",
        });
      });
  }, []);

  return state;
}

export function useProduct(productId: string | null): ProductState {
  const [state, setState] = useState<ProductState>({
    product: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!productId) {
      setState({
        product: null,
        loading: false,
        error: "Missing product id.",
      });
      return;
    }

    setState({
      product: null,
      loading: true,
      error: null,
    });

    fetch(`/api/catalog/${encodeURIComponent(productId)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Product fetch failed with status ${response.status}`);
        }
        return response.json() as Promise<Product>;
      })
      .then((product) => {
        setState({
          product,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        setState({
          product: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load product.",
        });
      });
  }, [productId]);

  return state;
}
