FROM oven/bun:latest AS base

FROM base AS builder

WORKDIR /src

COPY package.json bun.lockb tsconfig.json src ./

RUN bun install --no-cache && \
    bun run build

FROM base AS runner
WORKDIR /src

RUN grep -q '^bun:' /etc/group || addgroup --system --gid 1001 bun && \
    grep -q '^bun:' /etc/passwd || adduser --system --uid 1001 bun

COPY --from=builder --chown=bun:bun /src/node_modules /src/node_modules
COPY --from=builder --chown=bun:bun /src/dist /src/dist
COPY --from=builder --chown=bun:bun /src/package.json /src/package.json

USER bun
EXPOSE 3000

CMD ["bun", "dev"]
