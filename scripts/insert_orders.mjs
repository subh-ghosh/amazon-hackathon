import fs from "fs";

const ordersData = `        orders: [
            {
                order_id: "ORD-9988-ABC",
                customer_id: "CUST-GOOD-001",
                items: [
                    {
                        quantity: 1,
                        product: {
                            product_id: "PROD-009",
                            title: "Apple AirPods Pro (2nd Generation) with USB-C",
                            category: "Electronics",
                            brand: "Apple",
                            price: 249.0,
                            seller_id: "SELLER-009",
                            warehouse_id: "WH-EAST-01",
                            image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=500&fit=crop",
                            rating: 4.7,
                            reviews_count: 67890,
                            description: "Rebuilt from the sound up. Up to 2x more Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio.",
                            features: ["Active Noise Cancellation", "Adaptive Transparency", "Personalized Spatial Audio", "USB-C charging case", "Up to 6 hours listening time"],
                            delivery_days: 1,
                            weight_kg: 0.05,
                            packaging_weight_kg: 0.15,
                            packaging_material: "cardboard",
                            length_cm: 10,
                            width_cm: 8,
                            height_cm: 4,
                        }
                    }
                ],
                total: 249.0,
                status: "delivered",
                created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
                delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
                address: { name: "Alex Mercer", street: "123 Innovation Drive", city: "Bangalore", state: "KA", zip: "560001" }
            },
            {
                order_id: "ORD-7766-DEF",
                customer_id: "CUST-GOOD-001",
                items: [
                    {
                        quantity: 1,
                        product: {
                            product_id: "PROD-014",
                            title: "Hanes ComfortSoft Socks 6-Pack - Men's",
                            category: "Clothing",
                            brand: "Hanes",
                            price: 3.99,
                            seller_id: "SELLER-014",
                            warehouse_id: "WH-CENTRAL-01",
                            image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&h=500&fit=crop",
                            rating: 4.3,
                            reviews_count: 23456,
                            description: "Comfortable everyday socks with cushioned sole. Moisture-wicking fabric.",
                            features: ["Cushioned sole", "Moisture-wicking", "Reinforced heel and toe", "6-pair value pack", "Machine washable"],
                            delivery_days: 2,
                            weight_kg: 0.3,
                            packaging_weight_kg: 0.1,
                            packaging_material: "plastic",
                            length_cm: 20,
                            width_cm: 15,
                            height_cm: 6,
                        }
                    }
                ],
                total: 3.99,
                status: "delivered",
                created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
                delivery_date: new Date(Date.now() - 7 * 86400000).toISOString(),
                address: { name: "Alex Mercer", street: "123 Innovation Drive", city: "Bangalore", state: "KA", zip: "560001" }
            },
            {
                order_id: "ORD-5544-GHI",
                customer_id: "CUST-GOOD-001",
                items: [
                    {
                        quantity: 1,
                        product: {
                            product_id: "PROD-016",
                            title: "Amazon Basics Iron Dumbbell Set 10lbs (Heavy)",
                            category: "Home",
                            brand: "Amazon Basics",
                            price: 25.0,
                            seller_id: "SELLER-016",
                            warehouse_id: "WH-EAST-01",
                            image: "/images/dumbbell.png",
                            rating: 4.5,
                            reviews_count: 12000,
                            description: "Heavy iron dumbbell set.",
                            features: ["Iron", "Heavy"],
                            delivery_days: 5,
                            weight_kg: 10.0,
                            packaging_weight_kg: 1.0,
                            packaging_material: "cardboard",
                            length_cm: 20,
                            width_cm: 10,
                            height_cm: 10,
                        }
                    }
                ],
                total: 25.0,
                status: "delivered",
                created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
                delivery_date: new Date(Date.now() - 10 * 86400000).toISOString(),
                address: { name: "Alex Mercer", street: "123 Innovation Drive", city: "Bangalore", state: "KA", zip: "560001" }
            },
            {
                order_id: "ORD-3322-JKL",
                customer_id: "CUST-GOOD-001",
                items: [
                    {
                        quantity: 1,
                        product: {
                            product_id: "PROD-011",
                            title: "Patagonia Better Sweater Quarter-Zip - Women's",
                            category: "Clothing",
                            brand: "Patagonia",
                            price: 139.0,
                            seller_id: "SELLER-011",
                            warehouse_id: "WH-WEST-01",
                            image: "/images/sweater.png",
                            rating: 4.6,
                            reviews_count: 8901,
                            description: "A casual quarter-zip pullover with sweater-knit face and fleece interior. 100% recycled polyester.",
                            features: ["100% recycled polyester", "Sweater-knit face", "Fleece interior", "Zippered pockets", "Fair Trade Certified sewn"],
                            delivery_days: 4,
                            weight_kg: 0.5,
                            packaging_weight_kg: 0.2,
                            packaging_material: "plastic",
                            length_cm: 32,
                            width_cm: 26,
                            height_cm: 5,
                        }
                    }
                ],
                total: 139.0,
                status: "delivered",
                created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
                delivery_date: new Date(Date.now() - 15 * 86400000).toISOString(),
                address: { name: "Alex Mercer", street: "123 Innovation Drive", city: "Bangalore", state: "KA", zip: "560001" }
            }
        ],`;

function replaceOrders(filePath) {
    let content = fs.readFileSync(filePath, "utf-8");
    const startIndex = content.indexOf("    orders: [");
    if (startIndex === -1) {
        const altIndex = content.indexOf("        orders: [");
        if (altIndex === -1) {
            console.error("Could not find orders array in", filePath);
            return;
        }
    }
    
    // Replace everything from "orders: [" to the matching "]," before "customer_id:"
    const regex = /[ \t]*orders: \[[\s\S]*?\],(?=\s*customer_id:)/m;
    content = content.replace(regex, ordersData);
    fs.writeFileSync(filePath, content);
    console.log("Updated", filePath);
}

replaceOrders("frontend/customer/src/hooks/StoreProvider.tsx");
replaceOrders("frontend/customer/src/app/api/store/route.ts");
