FROM node:22-alpine AS calculatrice-base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM calculatrice-base AS calculatrice-deps
COPY package.json package-lock.json ./
RUN npm ci

FROM calculatrice-deps AS calculatrice-dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

FROM calculatrice-deps AS calculatrice-builder
COPY . .
RUN npm run build

FROM calculatrice-base AS calculatrice-runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=calculatrice-builder /app/.next/standalone ./
COPY --from=calculatrice-builder /app/.next/static ./.next/static
COPY --from=calculatrice-builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]