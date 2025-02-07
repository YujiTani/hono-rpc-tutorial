FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb tsconfig.json ./
COPY src ./src

RUN ls -la

RUN bun install --no-cache && \
    bun run build

USER bun

EXPOSE 3000

CMD ["bun", "dev"]
