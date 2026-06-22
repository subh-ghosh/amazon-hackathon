export default function LandingPage() {
    return (
        <main className="overflow-hidden">
            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-[#131921] via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF9900]/5 rounded-full blur-[120px]" />

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm text-gray-300">HackOn with Amazon 2026</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                        <span className="text-white">Amazon</span>{" "}
                        <span className="gradient-text">Second Life</span>{" "}
                        <span className="text-white">Commerce</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        An intelligent ecosystem where every returned product automatically finds its next best owner — through resale, refurbishment, donation, or recycling.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="https://slc-customer.netlify.app" target="_blank" className="px-8 py-4 bg-[#FF9900] text-[#131921] font-bold rounded-full hover:bg-[#FFB84D] transition-all animate-pulse-glow min-h-[44px] flex items-center">
                            Try Live Demo →
                        </a>
                        <a href="https://github.com/subh-ghosh/amazon-hackathon" target="_blank" className="px-8 py-4 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all min-h-[44px] flex items-center">
                            View on GitHub
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
                        {[
                            { value: "12", label: "Microservices" },
                            { value: "4", label: "Live Apps" },
                            { value: "₹0", label: "Idle Cost" },
                            { value: "100%", label: "Serverless" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Problem */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm font-medium text-[#FF9900] uppercase tracking-wider mb-4">The Problem</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Returns are destroying value</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { num: "₹68,000 Cr", desc: "Lost annually in return logistics, inspection, and restocking across Indian e-commerce" },
                            { num: "30%", desc: "Of all online purchases are returned — vs 8% in physical stores" },
                            { num: "2.6B kg", desc: "Of returned products end up in landfills every year despite being perfectly usable" },
                        ].map((item) => (
                            <div key={item.num} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-2xl font-bold text-red-400 mb-2">{item.num}</p>
                                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution */}
            <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm font-medium text-[#FF9900] uppercase tracking-wider mb-4">Our Solution</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Three phases. One connected system.</h2>
                    <p className="text-gray-400 mb-12 max-w-2xl">No existing solution connects prevention, intelligent resolution, and circular recovery into a single seamless platform.</p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { phase: "01", title: "Prevent", desc: "AI-powered purchase guidance warns customers before bad buys. Reduces returns at the source.", color: "from-emerald-500/20 to-transparent" },
                            { phase: "02", title: "Resolve", desc: "Intelligent resolution center offers instant refunds, replacements, or keep-item options based on real-time economics.", color: "from-blue-500/20 to-transparent" },
                            { phase: "03", title: "Recover", desc: "Returned items are matched to nearby buyers and routed directly — skipping warehouse, saving ₹1,800+ per item.", color: "from-amber-500/20 to-transparent" },
                        ].map((item) => (
                            <div key={item.phase} className={`relative bg-gradient-to-b ${item.color} border border-white/10 rounded-2xl p-8`}>
                                <span className="text-6xl font-black text-white/5 absolute top-4 right-6">{item.phase}</span>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architecture */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm font-medium text-[#FF9900] uppercase tracking-wider mb-4">Architecture</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">12 microservices. Fully serverless.</h2>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-8 font-mono text-xs sm:text-sm">
                        <pre className="text-gray-300 overflow-x-auto whitespace-pre">{`
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 14 + Netlify)                  │
│   Customer  ·  Seller Central  ·  Operations  ·  Executive  │
└────────────────────────────┬────────────────────────────────┘
                             │ Server-side proxy
┌────────────────────────────▼────────────────────────────────┐
│          12 MICROSERVICES (AWS Lambda + API Gateway)          │
├──────────────────┬──────────────────┬───────────────────────┤
│ INTELLIGENCE     │ RECOVERY         │ PLATFORM              │
│ S1  Prevention   │ S5  Simulator    │ S4  Digital Twin      │
│ S2  Root Cause   │ S6  Optimizer    │ S11 Seller Intel      │
│ S3  Fraud/Trust  │ S7  Logistics    │ S12 Knowledge Graph   │
│ S10 Packaging    │ S8  Returnless   │                       │
│                  │ S9  Circular     │                       │
└──────────────────┴──────────────────┴───────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│    AWS: Lambda · API Gateway · DynamoDB · CDK · EventBridge  │
└─────────────────────────────────────────────────────────────┘`}</pre>
                    </div>

                    {/* Tech Stack */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {[
                            { tech: "Next.js 14", role: "Frontend" },
                            { tech: "Python / FastAPI", role: "Backend" },
                            { tech: "AWS Lambda", role: "Compute" },
                            { tech: "DynamoDB", role: "Data" },
                            { tech: "AWS CDK", role: "IaC" },
                            { tech: "Pydantic v2", role: "Validation" },
                            { tech: "Tailwind CSS", role: "Styling" },
                            { tech: "TypeScript", role: "Type Safety" },
                        ].map((item) => (
                            <div key={item.tech} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                                <p className="text-sm font-medium text-white">{item.tech}</p>
                                <p className="text-xs text-gray-500">{item.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Demos */}
            <section className="py-24 px-6 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm font-medium text-[#FF9900] uppercase tracking-wider mb-4">Live & Deployed</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Four applications. All live.</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { name: "Customer Experience", url: "https://slc-customer.netlify.app", desc: "Shop with AI purchase guidance, intelligent returns, certified renewed marketplace", audience: "Shoppers" },
                            { name: "Operations Dashboard", url: "https://slc-ops.netlify.app", desc: "Real-time triage, recovery scenarios, demand-aware buyer matching", audience: "Warehouse Ops" },
                            { name: "Executive Dashboard", url: "https://slc-executive.netlify.app", desc: "Revenue recovery, sustainability KPIs, circular economy metrics", audience: "Leadership" },
                            { name: "Seller Dashboard", url: "https://slc-seller.netlify.app", desc: "Return cause analytics, packaging intelligence, actionable insights", audience: "Sellers" },
                        ].map((app) => (
                            <a key={app.name} href={app.url} target="_blank" className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#FF9900]/50 hover:bg-white/[0.03] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#FF9900] transition-colors">{app.name}</h3>
                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{app.audience}</span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{app.desc}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-[#FF9900] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Live on Netlify Edge
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Innovation */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm font-medium text-[#FF9900] uppercase tracking-wider mb-4">Key Innovation</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">What makes this different</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { title: "Native Payload Compatibility", desc: "Output of Service A passes directly as input to Service B without transformation. True pipeline: S5→S6→S7→S9." },
                            { title: "Demand-Aware Direct Fulfillment", desc: "Returned items skip warehouse entirely — matched to nearby buyers in real-time, saving ₹1,800+ per item." },
                            { title: "Indian Cost Matrix", desc: "Decision engine calibrated for Indian logistics economics. Returnless refund for items under ₹1,500 where return cost exceeds recovery value." },
                            { title: "Zero-Cost Serverless", desc: "All 12 services run on AWS Lambda. Pay only per request. ₹0/month when no users." },
                        ].map((item) => (
                            <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#131921]">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-sm font-medium text-[#FF9900] uppercase tracking-wider mb-4">Team KKR</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Kolkata Kode Riders</h2>
                    <p className="text-gray-400 mb-12">Vellore Institute of Technology, Vellore</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                        {[
                            { name: "Subarta Ghosh", role: "Cloud & Backend" },
                            { name: "Arhit Basu", role: "Backend" },
                            { name: "Tiyas Das", role: "Frontend" },
                        ].map((member) => (
                            <div key={member.name}>
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9900] to-[#FFD814] mx-auto mb-3 flex items-center justify-center text-[#131921] font-bold text-lg">
                                    {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <p className="text-sm font-medium text-white">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 px-6 border-t border-white/10">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-sm text-gray-400">Amazon Second Life Commerce</p>
                        <p className="text-xs text-gray-600">HackOn with Amazon 2026 · Theme: AI-Powered Returns & Sustainable Resale</p>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://slc-customer.netlify.app" target="_blank" className="px-6 py-3 bg-[#FF9900] text-[#131921] font-bold text-sm rounded-full hover:bg-[#FFB84D] transition-all">
                            Live Demo
                        </a>
                        <a href="https://github.com/subh-ghosh/amazon-hackathon" target="_blank" className="px-6 py-3 bg-white/5 border border-white/20 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all">
                            GitHub
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
