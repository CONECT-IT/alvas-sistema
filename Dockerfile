FROM oven/bun:1.3.14-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
RUN bun install --filter ./apps/api

COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/
COPY apps/api/drizzle apps/api/drizzle/

COPY drizzle.config.ts ./

WORKDIR /app/apps/api

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=8787
ENV DB_PATH=/app/data/alvas.db

EXPOSE 8787

CMD ["bun", "run", "src/main.ts"]
