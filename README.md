#

- Next.js
- GraphQL Backend (Next Functions)

Infrastructure - Cross cutting concern
---
Database 
Migrations (Prisma migrate, Flyway)
Auth - 3rd Party 
Caching
Communication Protocal
Healthchecks
SignalR


Folder Structures
---

Option #1

Project
- services
-- frontend
-- gateway
-- microservice2

OR

Option #2

Project
- frontend
- services
-- gateway
-- microservice2

OR 

Option #3

Project
- frontends
-- customer facing
-- dashboard admin
- services
-- microservice1
-- mircoservice2