FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

RUN cp -r src/graphql dist/graphql

ENV NODE_ENV=production PORT=3000
EXPOSE $PORT

CMD ["pnpm", "start"]