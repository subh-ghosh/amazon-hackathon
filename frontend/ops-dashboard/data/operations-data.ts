import type { OperationsData } from "@/types/operations";

export const operationsData: OperationsData = {
  facility: "BLR Reverse Logistics Center 04",
  lastUpdated: "June 14, 2026 at 09:14 AM",
  returns: {
    totalReceived: 428,
    awaitingInspection: 96,
    awaitingDecision: 54,
    processedToday: 278,
    recoveryValueGenerated: 145000,
  },
  inspections: [
    {
      productId: "P-88421",
      returnId: "RET-9921-A",
      productName: "Echo Show 10",
      category: "Smart Home",
      conditionScore: 92,
      inspectorStatus: "Waiting",
      arrivalTime: "08:15 AM",
      priority: "Urgent",
    },
    {
      productId: "P-88417",
      returnId: "RET-9922-B",
      productName: "Fire TV Stick 4K Max",
      category: "Streaming",
      conditionScore: 74,
      inspectorStatus: "Waiting",
      arrivalTime: "08:42 AM",
      priority: "High",
    },
    {
      productId: "P-88409",
      returnId: "RET-9923-C",
      productName: "Kindle Paperwhite",
      category: "E-readers",
      conditionScore: 88,
      inspectorStatus: "In progress",
      arrivalTime: "09:05 AM",
      priority: "Normal",
    },
    {
      productId: "P-91204",
      returnId: "RET-9924-D",
      productName: "Nike Air Max 270",
      category: "Footwear",
      conditionScore: 45,
      inspectorStatus: "Waiting",
      arrivalTime: "09:22 AM",
      priority: "High",
    },
    {
      productId: "P-73892",
      returnId: "RET-9925-E",
      productName: "Samsung Galaxy S24 Ultra",
      category: "Electronics",
      conditionScore: 30,
      inspectorStatus: "Escalated",
      arrivalTime: "07:50 AM",
      priority: "Urgent",
    },
    {
      productId: "P-55210",
      returnId: "RET-9926-F",
      productName: "Dyson V15 Vacuum",
      category: "Home Appliance",
      conditionScore: 62,
      inspectorStatus: "Waiting",
      arrivalTime: "09:40 AM",
      priority: "Normal",
    },
  ],
  pipeline: [
    { label: "Returned", count: 428, completionRate: 100 },
    { label: "Inspected", count: 332, completionRate: 78 },
    { label: "Decision", count: 278, completionRate: 65 },
    { label: "Recovery", count: 224, completionRate: 52 },
    { label: "Completed", count: 180, completionRate: 42 },
  ],
  triageDetails: {
    "RET-9921-A": {
      returnId: "RET-9921-A",
      productName: "Echo Show 10 (3rd Gen)",
      customerStatedReason: "Item arrived with completely smashed outer packaging. Refused to open.",
      conditionAssessment: "External retail box is destroyed. Internal device seals are intact, display has zero scratches. Powers on perfectly.",
      productImage: "https://m.media-amazon.com/images/I/51EVETDOx+L._AC_SL1000_.jpg",
      riskLevel: "Low",
      twinEvents: [
        { date: "Oct 12, 2024", title: "Manufactured", description: "Foxconn Plant 4", type: "purchase" },
        { date: "May 04, 2026", title: "Purchased", description: "Customer C-82711", type: "purchase" },
        { date: "May 06, 2026", title: "Delivered", description: "Signed at front desk", type: "purchase" },
        { date: "May 06, 2026", title: "Return Initiated", description: "Reason: Damaged box", type: "return" },
        { date: "May 09, 2026", title: "AI Visual Inspection", description: "CV detects 92% health", type: "inspection" },
      ],
      fraudSignals: [
        { name: "Serial Match", status: "Safe", detail: "Hardware serial matches fulfilled order." },
        { name: "Weight Check", status: "Safe", detail: "Package weight matches expected spec." },
        { name: "Account History", status: "Warning", detail: "Customer has 12% return rate." },
      ],
      recoveryOptions: [
        {
          type: "RESTOCK",
          label: "Repackage & Restock",
          expectedValue: 249.99,
          confidence: 45,
          timeRequiredHours: 48,
          isRecommended: false,
          details: {
            processingCost: 12.50,
            facilityName: "Amazon Repackaging Hub (DFW)",
          }
        },
        {
          type: "RESELL",
          label: "Resell (Amazon Renewed)",
          expectedValue: 219.00,
          confidence: 96,
          timeRequiredHours: 2,
          isRecommended: true,
          details: {
            resaleDemand: "High",
            resaleChannel: "Amazon Warehouse Deals",
            facilityName: "BLR Center 04",
            distanceKm: 0,
            processingCost: 2.50,
            etaDays: 1,
            carbonImpact: "-24.5 kg CO₂ (Avoided reverse logistics)",
          }
        },
        {
          type: "DONATE",
          label: "Charity Donation",
          expectedValue: 0,
          confidence: 99,
          timeRequiredHours: 24,
          isRecommended: false,
          details: {
            ngoName: "Tech for Schools India",
            carbonBenefit: "18.2 kg CO₂",
            socialImpact: "Smart classroom enabler",
          }
        },
        {
          type: "RECYCLE",
          label: "E-Waste Recycling",
          expectedValue: 5.00,
          confidence: 99,
          timeRequiredHours: 72,
          isRecommended: false,
          details: {}
        }
      ]
    }
  }
};
