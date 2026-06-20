# Customer Flow

1. **Browse Product** -> Calls `GET S11 /seller/{id}/dashboard` to render seller trust.
2. **View Details** -> Calls `POST S1 /prevention/analyze` to render sizing/compatibility warnings.
3. **Buy Product** -> Simulates order creation.
4. **Return Request** -> User initiates return. Calls `POST S2 /truth/analyze` for root cause, then `POST S3 /fraud/score`.
5. **AI Evaluation** -> Calls `POST S8 /returnless/evaluate` taking inputs from S10 (Packaging) and S11 (Seller).
6. **Resolution** -> User is either granted a Returnless Refund (keep the item) or a Return Label.
7. **Recovery Pipeline (Background)** -> Calls S4 -> S6 -> S7 -> S9 to route the returned item to recycling or refurbishment.
