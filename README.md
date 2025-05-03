# Rodinné Události - Czech Family Events Application

Tato aplikace slouží k organizaci a plánování rodinných událostí. Umožňuje registraci uživatelů, vytváření událostí, pozvání členů rodiny a potvrzování účasti pomocí jednoduchého systému.

## Funkce

- Registrace a přihlášení uživatelů pomocí e-mailu a hesla
- Profilový systém s možností nastavení přezdívky a profilové fotografie
- Real-time chat pro všechny uživatele
- Správa rodinných událostí s možností pozvat určité osoby
- Jednoduchý systém potvrzování účasti pomocí zelených/červených emotikonů
- E-mailové upozornění pro pozvané účastníky
- Ukládání dat do textových souborů namísto databáze
- Plně lokalizované rozhraní v češtině

## Technologie

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Real-time komunikace: Socket.IO
- Ukládání dat: JSON soubory
- Autentizace: JWT (JSON Web Tokens)

## Jak spustit aplikaci lokálně

1. Nainstalujte všechny závislosti:

```bash
npm install
```

2. Spusťte vývojový server:

```bash
npm run start
```

Tím se spustí jak frontend, tak backend server současně pomocí balíčku `concurrently`.

## Struktura projektu

- `/src` - Frontend aplikace (React)
  - `/components` - Znovupoužitelné komponenty
  - `/contexts` - React kontext pro správu stavu aplikace
  - `/pages` - Jednotlivé stránky aplikace
  - `/types` - TypeScript definice typů
  - `/utils` - Pomocné utility

- `/server` - Backend aplikace (Node.js/Express)
  - `index.js` - Hlavní soubor serveru

- `/public` - Statické soubory
- `/data` - Adresář pro ukládání dat (JSON soubory)

## Nasazení na AWS

Pro nasazení aplikace na AWS lze použít CloudFormation šablonu v adresáři `/aws`:

1. Vytvořte S3 bucket pro frontend
2. Vytvořte EC2 instanci pro backend
3. Nakonfigurujte CloudFront pro distribuci
4. Nahrajte frontend build do S3 bucketu
5. Spusťte backend server na EC2 instanci

Podrobné instrukce jsou v souboru `/aws/cloudformation.yaml`.

## Licence

Tento projekt je licencován pod MIT licencí.