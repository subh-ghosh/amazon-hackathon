import fs from "fs";

function revertOrders(filePath) {
    let content = fs.readFileSync(filePath, "utf-8");
    const regex = /[ \t]*orders: \[[\s\S]*?\],(?=\s*customer_id:)/m;
    content = content.replace(regex, "        orders: [],\n");
    fs.writeFileSync(filePath, content);
    console.log("Reverted", filePath);
}

revertOrders("frontend/customer/src/hooks/StoreProvider.tsx");
revertOrders("frontend/customer/src/app/api/store/route.ts");
