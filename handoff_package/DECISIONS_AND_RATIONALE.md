# Decisions and Rationale

- **Why 12 Services?** To strictly mirror Amazon's internal architecture philosophy (Separation of Concerns). It allows the Fraud team to iterate independently from the Logistics team.
- **Why Customer-First UX?** The cheapest return is the one that never happens. Prevention (S1) is the primary story.
- **Why Native Integration?** Middlewares fail. By enforcing `extra="forbid"` and exactly matching output-to-input schemas, the entire pipeline is type-safe and computationally faster.
