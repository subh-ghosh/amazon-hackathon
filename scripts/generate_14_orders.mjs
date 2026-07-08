import fs from "fs";
import { PRODUCTS } from "../frontend/customer/src/data/products.ts";

const orders = [
    {
        order_id: "113-4958271-8473625",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[0], quantity: 1 }],
        total: PRODUCTS[0].price,
        status: "delivered",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 2 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-7823491-3847561",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[1], quantity: 1 }],
        total: PRODUCTS[1].price,
        status: "delivered",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-9912847-1928374",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[4], quantity: 1 }],
        total: PRODUCTS[4].price,
        status: "delivered",
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-5567382-4738291",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[7], quantity: 1 }],
        total: PRODUCTS[7].price,
        status: "delivered",
        created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 3 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-2291038-9182746",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[12], quantity: 1 }],
        total: PRODUCTS[12].price,
        status: "delivered",
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 4 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-4428173-7291038",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[13], quantity: 1 }],
        total: PRODUCTS[13].price,
        status: "delivered",
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 7 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-6618294-3847291",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[2], quantity: 1 }],
        total: PRODUCTS[2].price,
        status: "delivered",
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 5 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-8834729-5829104",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[5], quantity: 1 }],
        total: PRODUCTS[5].price,
        status: "shipped",
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() + 1 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-3347281-9283746",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[3], quantity: 1 }],
        total: PRODUCTS[3].price,
        status: "delivered",
        created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 6 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-7712938-4829103",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[6], quantity: 1 }],
        total: PRODUCTS[6].price,
        status: "delivered",
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 9 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-1192847-5738201",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[8], quantity: 1 }],
        total: PRODUCTS[8].price,
        status: "delivered",
        created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 8 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-9928374-1029384",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[9], quantity: 1 }],
        total: PRODUCTS[9].price,
        status: "delivered",
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 7 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-4482019-8372910",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[10], quantity: 1 }],
        total: PRODUCTS[10].price,
        status: "delivered",
        created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 10 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
    {
        order_id: "113-5519283-7461029",
        customer_id: "CUST-GOOD-001",
        items: [{ product: PRODUCTS[11], quantity: 1 }],
        total: PRODUCTS[11].price,
        status: "delivered",
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        delivery_date: new Date(Date.now() - 12 * 86400000).toISOString(),
        address: { name: "Rahul Sharma", street: "42 MG Road, Indiranagar", city: "Bangalore", state: "KA", zip: "560038" },
    },
];

const ordersString = "        orders: " + JSON.stringify(orders, null, 12).replace(/\n/g, "\n        ") + ",\n";

function injectOrders(filePath) {
    let content = fs.readFileSync(filePath, "utf-8");
    const regex = /[ \t]*orders: \[[\s\S]*?\],(?=\s*customer_id:)/m;
    content = content.replace(regex, ordersString);
    fs.writeFileSync(filePath, content);
    console.log("Injected 14 orders into", filePath);
}

injectOrders("frontend/customer/src/hooks/StoreProvider.tsx");
injectOrders("frontend/customer/src/app/api/store/route.ts");
