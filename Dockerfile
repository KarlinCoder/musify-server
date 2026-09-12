FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/deemix/package.json packages/deemix/package.json
COPY packages/deezer-sdk/package.json packages/deezer-sdk/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

RUN cp -r apps/server/src/graphql apps/server/dist/graphql

ENV NODE_ENV=production PORT=3000
EXPOSE $PORT

CMD ["pnpm", "--filter", "musify-server", "start"]