# 🐟 Chao Pescao

Juego de fiesta multijugador en tiempo real donde los jugadores deben descubrir quién miente y quién dice la verdad.

## ¿Cómo se juega?

1. Un jugador crea una sala y comparte el código o QR con los demás
2. Se necesitan mínimo 3 jugadores para iniciar
3. Cada ronda, un jugador es el **pescador** y los demás son **peces**
4. Un pez es **azul** (debe decir la verdad) y los demás son **rojos** (deben mentir)
5. El pescador ve una pregunta sin la respuesta y debe identificar quién miente
6. Si descarta un pez rojo → gana +1 punto
7. Si descarta al pez azul → pierde todos sus puntos
8. El pescador puede parar en cualquier momento para conservar sus puntos
9. El primer jugador en llegar a 15 puntos gana la partida

## Stack tecnológico

- **Frontend:** Astro + Svelte 5 + Tailwind CSS v4
- **Backend:** Firebase (Firestore + Hosting)
- **Testing:** Vitest + fast-check (property-based testing)
- **i18n:** Sistema propio con soporte para español, inglés y alemán
- **QR:** qrcode (generación de códigos QR para unirse a salas)
- **Alertas:** SweetAlert2
- **Sonidos:** Web Audio API (sintetizados, sin archivos de audio)

## Estructura del proyecto

```
src/
├── components/        # Componentes Svelte
│   ├── HomeScreen     # Pantalla de inicio
│   ├── LanguageSelector # Selector de idioma
│   ├── CreateRoom     # Formulario crear sala
│   ├── JoinRoom       # Formulario unirse a sala
│   ├── Lobby          # Sala de espera con QR
│   ├── Tutorial       # Tutorial de reglas (2 slides)
│   ├── GameBoard      # Contenedor principal del juego
│   ├── FisherView     # Vista del pescador
│   ├── PlayerView     # Vista del jugador (pez rojo/azul)
│   ├── DiscardTimer   # Animación de pesca y countdown
│   ├── RevealScreen   # Revelación del descarte
│   ├── Scoreboard     # Marcador entre rondas
│   └── Results        # Resultados finales
├── lib/               # Servicios y lógica
│   ├── firebase.ts    # Configuración Firebase (lee de .env)
│   ├── roomService.ts # CRUD de salas
│   ├── gameService.ts # Lógica del juego
│   ├── questionService.ts # Consulta de preguntas (multi-idioma)
│   ├── soundService.ts # Efectos de sonido (Web Audio API)
│   ├── types.ts       # Tipos TypeScript
│   └── i18n/          # Sistema de traducciones
│       ├── index.ts   # Store reactivo y función t()
│       ├── es.json    # UI en español
│       ├── en.json    # UI en inglés
│       └── de.json    # UI en alemán
├── stores/            # Stores Svelte reactivos
│   ├── roomStore.ts   # Estado de la sala en tiempo real
│   └── playerStore.ts # Identidad del jugador local
├── pages/             # Páginas Astro
│   ├── index.astro    # Página principal
│   └── sala.astro     # Página de sala/juego
└── styles/
    └── global.css     # Estilos globales
```

## Configuración

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Registrar app web y copiar la config del SDK
4. Copiar `.env.example` a `.env` y llenar con tus credenciales de Firebase:
   ```
   cp .env.example .env
   ```
5. Actualizar el project ID en `.firebaserc`
6. Instalar dependencias: `npm install`
7. Subir preguntas a Firestore: `npx tsx scripts/seed-production.ts`
8. Subir traducciones: `npx tsx scripts/seed-translations.ts`
9. Deploy: `npm run build && npx firebase deploy`

## Comandos

| Comando                                       | Acción                                              |
| :-------------------------------------------- | :-------------------------------------------------- |
| `npm install`                                 | Instalar dependencias                               |
| `npm run dev`                                 | Servidor local en `localhost:4321`                  |
| `npm run build`                               | Build de producción en `./dist/`                    |
| `npm run test`                                | Ejecutar tests (35 tests, 15 property-based)        |
| `npx tsx scripts/seed-production.ts`          | Subir preguntas con respuestas reales               |
| `npx tsx scripts/seed-hidden-answers.ts`      | Subir preguntas con respuestas ocultas (???)        |
| `npx tsx scripts/seed-translations.ts`        | Subir traducciones (ES/EN/DE) con respuestas reales |
| `npx tsx scripts/seed-translations-hidden.ts` | Subir traducciones con respuestas ocultas           |
| `npx firebase deploy --only hosting`          | Deploy a Firebase Hosting                           |

## Reglas de Firestore

El proyecto necesita las siguientes colecciones con permisos de lectura/escritura:

- `rooms` — salas de juego
- `questions` — preguntas base (español)
- `questions_es` — preguntas en español
- `questions_en` — preguntas en inglés
- `questions_de` — preguntas en alemán

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las credenciales de Firebase:

```env
PUBLIC_FIREBASE_API_KEY=tu-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
PUBLIC_FIREBASE_APP_ID=tu-app-id
```
