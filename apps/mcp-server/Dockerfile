FROM node:lts-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV HOST=0.0.0.0
ENV PORT=8001

COPY package*.json ./
COPY tsconfig.json ./

RUN pnpm install --ignore-scripts

COPY . .

RUN pnpm run build

CMD ["node", "./dist/index.js"]