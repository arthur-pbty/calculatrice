# Calculatrice

Calculatrice web (simple + scientifique) construite avec Next.js.

## Liens

- Site: https://calculatrice.arthurp.fr
- Site principal: https://arthurp.fr
- Contact: https://contact.arthurp.fr
- Email: contact@arthurp.fr

## Stack

- Next.js 16
- React 19
- TypeScript

## Developpement local

Prerequis: Node.js 22+

```bash
npm ci
npm run dev
```

Application: http://localhost:3000

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Docker

Mode dev:

```bash
docker compose --profile dev up --build
```

Mode production:

```bash
docker compose --profile prod up --build -d
```

- Dev: http://localhost:3000
- Prod: http://localhost:3014

## Pages legales

- /mentions-legales
- /politique-de-confidentialite
