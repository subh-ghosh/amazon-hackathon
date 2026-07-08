"use client";

import { useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from "react";
import { StoreContext, type AppState, type AppStore, type PersonaType } from "./useStore";
import type { Order, Product, Address } from "@/api/types";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getInitialState(): AppState {
    return {
        cart: [],
        orders: [
                  {
                            "order_id": "113-4958271-8473625",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-001",
                                                          "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
                                                          "category": "Electronics",
                                                          "brand": "Sony",
                                                          "price": 348,
                                                          "seller_id": "SELLER-001",
                                                          "warehouse_id": "WH-EAST-01",
                                                          "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop",
                                                          "rating": 4.6,
                                                          "reviews_count": 12847,
                                                          "description": "Industry-leading noise cancellation with Auto NC Optimizer. Crystal-clear hands-free calling with 4 beamforming microphones. Up to 30 hours of battery life.",
                                                          "features": [
                                                                    "Industry-leading noise cancellation",
                                                                    "30-hour battery life",
                                                                    "Multipoint connection",
                                                                    "Speak-to-Chat technology",
                                                                    "Adaptive Sound Control"
                                                          ],
                                                          "delivery_days": 2,
                                                          "weight_kg": 0.25,
                                                          "packaging_weight_kg": 0.4,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 22,
                                                          "width_cm": 18,
                                                          "height_cm": 10
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 348,
                            "status": "delivered",
                            "created_at": "2026-07-02T20:55:56.536Z",
                            "delivery_date": "2026-07-05T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-7823491-3847561",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-002",
                                                          "title": "Nike Air Max 270 Men's Running Shoes - Size 10",
                                                          "category": "Footwear",
                                                          "brand": "Nike",
                                                          "price": 150,
                                                          "seller_id": "SELLER-002",
                                                          "warehouse_id": "WH-WEST-01",
                                                          "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
                                                          "rating": 4.3,
                                                          "reviews_count": 8234,
                                                          "description": "The Nike Air Max 270 delivers visible cushioning under every step. Updated for modern comfort, it nods to the original 1991 Air Max 180 with its exaggerated tongue top and heritage tongue logo.",
                                                          "features": [
                                                                    "Max Air unit for cushioning",
                                                                    "Mesh upper for breathability",
                                                                    "Foam midsole",
                                                                    "Rubber outsole for traction",
                                                                    "Pull tab on heel"
                                                          ],
                                                          "delivery_days": 3,
                                                          "weight_kg": 0.8,
                                                          "packaging_weight_kg": 0.5,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 35,
                                                          "width_cm": 22,
                                                          "height_cm": 14
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 150,
                            "status": "delivered",
                            "created_at": "2026-07-04T20:55:56.536Z",
                            "delivery_date": "2026-07-06T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-9912847-1928374",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-005",
                                                          "title": "Levi's 501 Original Fit Men's Jeans - 32x32",
                                                          "category": "Clothing",
                                                          "brand": "Levi's",
                                                          "price": 69.5,
                                                          "seller_id": "SELLER-005",
                                                          "warehouse_id": "WH-WEST-01",
                                                          "image": "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&h=500&fit=crop",
                                                          "rating": 4.4,
                                                          "reviews_count": 34567,
                                                          "description": "The original jean. The 501 Original Fit is the one that started it all. Since 1873.",
                                                          "features": [
                                                                    "Original fit - straight leg",
                                                                    "Button fly",
                                                                    "100% cotton",
                                                                    "Sits at waist",
                                                                    "Regular through thigh"
                                                          ],
                                                          "delivery_days": 4,
                                                          "weight_kg": 0.9,
                                                          "packaging_weight_kg": 0.2,
                                                          "packaging_material": "plastic",
                                                          "length_cm": 35,
                                                          "width_cm": 28,
                                                          "height_cm": 5
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 69.5,
                            "status": "delivered",
                            "created_at": "2026-07-03T20:55:56.536Z",
                            "delivery_date": "2026-07-06T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-5567382-4738291",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-008",
                                                          "title": "The North Face Thermoball Eco Jacket - Men's Medium",
                                                          "category": "Clothing",
                                                          "brand": "The North Face",
                                                          "price": 230,
                                                          "seller_id": "SELLER-008",
                                                          "warehouse_id": "WH-WEST-01",
                                                          "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
                                                          "rating": 4.5,
                                                          "reviews_count": 3456,
                                                          "description": "Lightweight, packable insulated jacket made with recycled materials.",
                                                          "features": [
                                                                    "ThermoBall Eco insulation",
                                                                    "Made with recycled materials",
                                                                    "Packable design",
                                                                    "Water-repellent finish",
                                                                    "Zippered hand pockets"
                                                          ],
                                                          "delivery_days": 3,
                                                          "weight_kg": 0.6,
                                                          "packaging_weight_kg": 0.3,
                                                          "packaging_material": "plastic",
                                                          "length_cm": 35,
                                                          "width_cm": 28,
                                                          "height_cm": 8
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 230,
                            "status": "delivered",
                            "created_at": "2026-07-01T20:55:56.536Z",
                            "delivery_date": "2026-07-04T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-2291038-9182746",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-013",
                                                          "title": "Amazon Essentials Cotton T-Shirt 3-Pack - Men's Large",
                                                          "category": "Clothing",
                                                          "brand": "Amazon Essentials",
                                                          "price": 24.99,
                                                          "seller_id": "SELLER-013",
                                                          "warehouse_id": "WH-EAST-01",
                                                          "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
                                                          "rating": 4.2,
                                                          "reviews_count": 45678,
                                                          "description": "Everyday cotton crewneck t-shirts. Soft, comfortable, classic fit. Value 3-pack.",
                                                          "features": [
                                                                    "100% cotton",
                                                                    "Classic fit",
                                                                    "Machine washable",
                                                                    "Crewneck design",
                                                                    "Value 3-pack"
                                                          ],
                                                          "delivery_days": 2,
                                                          "weight_kg": 0.4,
                                                          "packaging_weight_kg": 0.15,
                                                          "packaging_material": "plastic",
                                                          "length_cm": 28,
                                                          "width_cm": 22,
                                                          "height_cm": 4
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 24.99,
                            "status": "delivered",
                            "created_at": "2026-06-30T20:55:56.536Z",
                            "delivery_date": "2026-07-03T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-4428173-7291038",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-014",
                                                          "title": "Hanes ComfortSoft Socks 6-Pack - Men's",
                                                          "category": "Clothing",
                                                          "brand": "Hanes",
                                                          "price": 3.99,
                                                          "seller_id": "SELLER-014",
                                                          "warehouse_id": "WH-CENTRAL-01",
                                                          "image": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&h=500&fit=crop",
                                                          "rating": 4.3,
                                                          "reviews_count": 23456,
                                                          "description": "Comfortable everyday socks with cushioned sole. Moisture-wicking fabric.",
                                                          "features": [
                                                                    "Cushioned sole",
                                                                    "Moisture-wicking",
                                                                    "Reinforced heel and toe",
                                                                    "6-pair value pack",
                                                                    "Machine washable"
                                                          ],
                                                          "delivery_days": 2,
                                                          "weight_kg": 0.3,
                                                          "packaging_weight_kg": 0.1,
                                                          "packaging_material": "plastic",
                                                          "length_cm": 20,
                                                          "width_cm": 15,
                                                          "height_cm": 6
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 3.99,
                            "status": "delivered",
                            "created_at": "2026-06-27T20:55:56.536Z",
                            "delivery_date": "2026-06-30T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-6618294-3847291",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-003",
                                                          "title": "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt",
                                                          "category": "Kitchen",
                                                          "brand": "Instant Pot",
                                                          "price": 89.95,
                                                          "seller_id": "SELLER-003",
                                                          "warehouse_id": "WH-CENTRAL-01",
                                                          "image": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop",
                                                          "rating": 4.7,
                                                          "reviews_count": 156789,
                                                          "description": "7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.",
                                                          "features": [
                                                                    "7-in-1 functionality",
                                                                    "13 Smart Programs",
                                                                    "Stainless steel inner pot",
                                                                    "10+ safety mechanisms",
                                                                    "Energy efficient"
                                                          ],
                                                          "delivery_days": 1,
                                                          "weight_kg": 5.5,
                                                          "packaging_weight_kg": 1.8,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 38,
                                                          "width_cm": 35,
                                                          "height_cm": 35
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 89.95,
                            "status": "delivered",
                            "created_at": "2026-06-29T20:55:56.536Z",
                            "delivery_date": "2026-07-02T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-8834729-5829104",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-006",
                                                          "title": "Kindle Paperwhite (16 GB) - 6.8\" Display",
                                                          "category": "Electronics",
                                                          "brand": "Amazon",
                                                          "price": 139.99,
                                                          "seller_id": "SELLER-006",
                                                          "warehouse_id": "WH-EAST-01",
                                                          "image": "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop",
                                                          "rating": 4.7,
                                                          "reviews_count": 89234,
                                                          "description": "The thinnest, lightest Kindle Paperwhite yet with a flush-front design and 300 ppi glare-free display.",
                                                          "features": [
                                                                    "6.8\" glare-free display",
                                                                    "Adjustable warm light",
                                                                    "Up to 10 weeks battery life",
                                                                    "IPX8 waterproof",
                                                                    "16 GB storage"
                                                          ],
                                                          "delivery_days": 1,
                                                          "weight_kg": 0.21,
                                                          "packaging_weight_kg": 0.25,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 20,
                                                          "width_cm": 14,
                                                          "height_cm": 4
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 139.99,
                            "status": "shipped",
                            "created_at": "2026-07-06T20:55:56.536Z",
                            "delivery_date": "2026-07-08T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-3347281-9283746",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-004",
                                                          "title": "Samsung Galaxy S24 Ultra 256GB - Titanium Black",
                                                          "category": "Electronics",
                                                          "brand": "Samsung",
                                                          "price": 1299.99,
                                                          "seller_id": "SELLER-004",
                                                          "warehouse_id": "WH-EAST-01",
                                                          "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop",
                                                          "rating": 4.5,
                                                          "reviews_count": 4521,
                                                          "description": "Galaxy AI is here. Search like never before, 200MP camera, titanium frame, S Pen included.",
                                                          "features": [
                                                                    "Galaxy AI built-in",
                                                                    "200MP camera system",
                                                                    "Titanium frame",
                                                                    "S Pen included",
                                                                    "5000mAh battery"
                                                          ],
                                                          "delivery_days": 2,
                                                          "weight_kg": 0.23,
                                                          "packaging_weight_kg": 0.35,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 18,
                                                          "width_cm": 10,
                                                          "height_cm": 6
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 1299.99,
                            "status": "delivered",
                            "created_at": "2026-06-28T20:55:56.536Z",
                            "delivery_date": "2026-07-01T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-7712938-4829103",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-007",
                                                          "title": "Dyson V15 Detect Absolute Cordless Vacuum",
                                                          "category": "Home",
                                                          "brand": "Dyson",
                                                          "price": 749.99,
                                                          "seller_id": "SELLER-007",
                                                          "warehouse_id": "WH-CENTRAL-01",
                                                          "image": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop",
                                                          "rating": 4.6,
                                                          "reviews_count": 5678,
                                                          "description": "Dyson's most powerful, intelligent cordless vacuum. Reveals hidden dust with a laser.",
                                                          "features": [
                                                                    "Laser Slim Fluffy cleaner head",
                                                                    "Piezo sensor particle counting",
                                                                    "LCD screen",
                                                                    "Up to 60 min run time",
                                                                    "HEPA filtration"
                                                          ],
                                                          "delivery_days": 3,
                                                          "weight_kg": 3.1,
                                                          "packaging_weight_kg": 2,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 70,
                                                          "width_cm": 30,
                                                          "height_cm": 25
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 749.99,
                            "status": "delivered",
                            "created_at": "2026-06-25T20:55:56.536Z",
                            "delivery_date": "2026-06-28T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-1192847-5738201",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-009",
                                                          "title": "Apple AirPods Pro (2nd Generation) with USB-C",
                                                          "category": "Electronics",
                                                          "brand": "Apple",
                                                          "price": 249,
                                                          "seller_id": "SELLER-009",
                                                          "warehouse_id": "WH-EAST-01",
                                                          "image": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=500&fit=crop",
                                                          "rating": 4.7,
                                                          "reviews_count": 67890,
                                                          "description": "Rebuilt from the sound up. Up to 2x more Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio.",
                                                          "features": [
                                                                    "Active Noise Cancellation",
                                                                    "Adaptive Transparency",
                                                                    "Personalized Spatial Audio",
                                                                    "USB-C charging case",
                                                                    "Up to 6 hours listening time"
                                                          ],
                                                          "delivery_days": 1,
                                                          "weight_kg": 0.05,
                                                          "packaging_weight_kg": 0.15,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 10,
                                                          "width_cm": 8,
                                                          "height_cm": 4
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 249,
                            "status": "delivered",
                            "created_at": "2026-06-26T20:55:56.536Z",
                            "delivery_date": "2026-06-29T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-9928374-1029384",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-010",
                                                          "title": "Herman Miller Aeron Chair - Size B, Graphite",
                                                          "category": "Furniture",
                                                          "brand": "Herman Miller",
                                                          "price": 1395,
                                                          "seller_id": "SELLER-010",
                                                          "warehouse_id": "WH-CENTRAL-01",
                                                          "image": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop",
                                                          "rating": 4.8,
                                                          "reviews_count": 2345,
                                                          "description": "The iconic Aeron Chair remastered. 8Z Pellicle suspension, PostureFit SL, adjustable arms.",
                                                          "features": [
                                                                    "8Z Pellicle suspension",
                                                                    "PostureFit SL spinal support",
                                                                    "Adjustable arms and tilt",
                                                                    "12-year warranty",
                                                                    "Size B fits most"
                                                          ],
                                                          "delivery_days": 7,
                                                          "weight_kg": 20,
                                                          "packaging_weight_kg": 8,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 80,
                                                          "width_cm": 70,
                                                          "height_cm": 65
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 1395,
                            "status": "delivered",
                            "created_at": "2026-06-23T20:55:56.536Z",
                            "delivery_date": "2026-06-30T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-4482019-8372910",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-011",
                                                          "title": "Patagonia Better Sweater Quarter-Zip - Women's",
                                                          "category": "Clothing",
                                                          "brand": "Patagonia",
                                                          "price": 139,
                                                          "seller_id": "SELLER-011",
                                                          "warehouse_id": "WH-WEST-01",
                                                          "image": "/images/sweater.png",
                                                          "rating": 4.6,
                                                          "reviews_count": 8901,
                                                          "description": "A casual quarter-zip pullover with sweater-knit face and fleece interior. 100% recycled polyester.",
                                                          "features": [
                                                                    "100% recycled polyester",
                                                                    "Sweater-knit face",
                                                                    "Fleece interior",
                                                                    "Zippered pockets",
                                                                    "Fair Trade Certified sewn"
                                                          ],
                                                          "delivery_days": 4,
                                                          "weight_kg": 0.5,
                                                          "packaging_weight_kg": 0.2,
                                                          "packaging_material": "plastic",
                                                          "length_cm": 32,
                                                          "width_cm": 26,
                                                          "height_cm": 5
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 139,
                            "status": "delivered",
                            "created_at": "2026-06-24T20:55:56.536Z",
                            "delivery_date": "2026-06-27T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  },
                  {
                            "order_id": "113-5519283-7461029",
                            "customer_id": "CUST-GOOD-001",
                            "items": [
                                      {
                                                "product": {
                                                          "product_id": "PROD-012",
                                                          "title": "Bose SoundLink Revolve+ II Portable Bluetooth Speaker",
                                                          "category": "Electronics",
                                                          "brand": "Bose",
                                                          "price": 329,
                                                          "seller_id": "SELLER-012",
                                                          "warehouse_id": "WH-EAST-01",
                                                          "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
                                                          "rating": 4.5,
                                                          "reviews_count": 4567,
                                                          "description": "True 360° sound with deep bass. Durable, water-resistant, 17 hours battery. Built-in handle.",
                                                          "features": [
                                                                    "True 360° sound",
                                                                    "17-hour battery life",
                                                                    "IP55 water-resistant",
                                                                    "Built-in microphone",
                                                                    "Portable handle design"
                                                          ],
                                                          "delivery_days": 2,
                                                          "weight_kg": 0.91,
                                                          "packaging_weight_kg": 0.6,
                                                          "packaging_material": "cardboard",
                                                          "length_cm": 20,
                                                          "width_cm": 15,
                                                          "height_cm": 15
                                                },
                                                "quantity": 1
                                      }
                            ],
                            "total": 329,
                            "status": "delivered",
                            "created_at": "2026-06-22T20:55:56.536Z",
                            "delivery_date": "2026-06-25T20:55:56.536Z",
                            "address": {
                                      "name": "Rahul Sharma",
                                      "street": "42 MG Road, Indiranagar",
                                      "city": "Bangalore",
                                      "state": "KA",
                                      "zip": "560038", "country": "IN"
                            }
                  }
        ],


        customer_id: "CUST-GOOD-001",
        persona: "TRUSTED",
        greenCredits: 150,
        greenHistory: [
            { action: "Welcome bonus", credits: 100, timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
            { action: "Chose sustainable packaging", credits: 10, timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
            { action: "Bought Renewed item", credits: 50, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
            { action: "Redeemed: ₹500 off order", credits: -10, timestamp: new Date(Date.now() - 86400000).toISOString() },
        ],
    };
}

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(getInitialState);
    const [isLoaded, setIsLoaded] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const hasHydrated = useRef(false);

    useEffect(() => {
        fetch("/api/store", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Store bootstrap failed with status ${response.status}`);
                }
                return response.json() as Promise<AppState>;
            })
            .then((remoteState) => {
                setState(remoteState);
                hasHydrated.current = true;
                setIsLoaded(true);
            })
            .catch((error) => {
                setSyncError(error instanceof Error ? error.message : "Failed to load persisted store state.");
            });
    }, []);

    useEffect(() => {
        if (!hasHydrated.current) {
            return;
        }

        fetch("/api/store", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`Store persistence failed with status ${response.status}`);
            }
        }).catch((error) => {
            setSyncError(error instanceof Error ? error.message : "Failed to persist store state.");
        });
    }, [state]);

    const setPersona = useCallback((persona: PersonaType) => {
        setState((prev) => ({
            ...prev,
            persona,
            customer_id: persona === "TRUSTED" ? "CUST-GOOD-001" : "CUST-FRAUD-999"
        }));
    }, []);

    const earnCredits = useCallback((action: string, credits: number) => {
        setState((prev) => ({
            ...prev,
            greenCredits: prev.greenCredits + credits,
            greenHistory: [
                { action, credits, timestamp: new Date().toISOString() },
                ...prev.greenHistory,
            ],
        }));
    }, []);

    const addToCart = useCallback((product: Product, quantity = 1) => {
        setState((prev) => {
            const existing = prev.cart.find((item) => item.product.product_id === product.product_id);
            if (existing) {
                return { ...prev, cart: prev.cart.map((item) => item.product.product_id === product.product_id ? { ...item, quantity: item.quantity + quantity } : item) };
            }
            return { ...prev, cart: [...prev.cart, { product, quantity }] };
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setState((prev) => ({ ...prev, cart: prev.cart.filter((item) => item.product.product_id !== productId) }));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setState((prev) => ({ ...prev, cart: prev.cart.map((item) => item.product.product_id === productId ? { ...item, quantity } : item) }));
    }, []);

    const clearCart = useCallback(() => { setState((prev) => ({ ...prev, cart: [] })); }, []);

    const getCartTotal = useCallback((): number => {
        return state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [state.cart]);

    const getCartCount = useCallback((): number => {
        return state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [state.cart]);

    const placeOrder = useCallback((address: Address): Order => {
        const order: Order = {
            order_id: `ORD-${generateId()}`,
            customer_id: state.customer_id,
            items: [...state.cart],
            total: state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
            status: "confirmed",
            created_at: new Date().toISOString(),
            delivery_date: new Date(Date.now() + 3 * 86400000).toISOString(),
            address,
        };
        setState((prev) => ({ ...prev, orders: [order, ...prev.orders], cart: [] }));
        return order;
    }, [state.cart, state.customer_id]);

    const store: AppStore = useMemo(() => ({
        ...state, addToCart, removeFromCart, updateQuantity, clearCart, placeOrder, getCartTotal, getCartCount, setPersona, earnCredits,
    }), [state, addToCart, removeFromCart, updateQuantity, clearCart, placeOrder, getCartTotal, getCartCount, setPersona, earnCredits]);

    if (syncError) {
        return (
            <div className="min-h-screen bg-[#EAEDED] px-4 py-12">
                <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-900">Persistent Store Unavailable</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        This app is configured to use database-backed customer state only. The persisted session could not be loaded or saved.
                    </p>
                    <p className="mt-3 text-sm text-red-700">{syncError}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#EAEDED] px-4 py-12">
                <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-900">Loading</h1>
                    <p className="mt-2 text-sm text-slate-600">Please wait while we load your session.</p>
                </div>
            </div>
        );
    }

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
