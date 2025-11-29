ReturnHub Monorepo

Structure
- `frontend/`: React app (Vite)
- `backend/`: Spring Boot app (moved from root)

Frontend
- Dev: `cd frontend && npm run dev`
- Build: `npm run build && npm run preview`

Backend
- Build: `cd backend && ./mvnw.cmd -DskipTests package` (Windows)
- Run: `./mvnw.cmd spring-boot:run`
