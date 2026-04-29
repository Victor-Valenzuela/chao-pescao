# 🐟 Chao Pescao

Juego de fiesta multijugador en tiempo real donde los jugadores deben descubrir quién miente y quién dice la verdad.

� **Jugar:** [chao-pescao-game.web.app](https://chao-pescao-game.web.app)

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
- **QR:** qrcode (generación de códigos QR para unirse a salas)
- **Alertas:** SweetAlert2

## Estructura del proyecto

```
src/
├── components/        # Componentes Svelte
│   ├── HomeScreen     # Pantalla de inicio
│   ├── CreateRoom     # Formulario crear sala
│   ├── JoinRoom       # Formulario unirse a sala
│   ├── Lobby          # Sala de espera con QR
│   ├── GameBoard      # Contenedor principal del juego
│   ├── FisherView     # Vista del pescador
│   ├── PlayerView     # Vista del jugador (pez rojo/azul)
│   ├── DiscardTimer   # Animación de pesca y countdown
│   ├── RevealScreen   # Revelación del descarte
│   ├── Scoreboard     # Marcador entre rondas
│   └── Results        # Resultados finales
├── lib/               # Servicios y lógica
│   ├── firebase.ts    # Configuración Firebase
│   ├── roomService.ts # CRUD de salas
│   ├── gameService.ts # Lógica del juego
│   ├── questionService.ts # Consulta de preguntas
│   └── types.ts       # Tipos TypeScript
├── stores/            # Stores Svelte reactivos
│   ├── roomStore.ts   # Estado de la sala en tiempo real
│   └── playerStore.ts # Identidad del jugador local
├── pages/             # Páginas Astro
│   ├── index.astro    # Página principal
│   └── sala.astro     # Página de sala/juego
└── styles/
    └── global.css     # Estilos globales
```

## Comandos

| Comando                              | Acción                                       |
| :----------------------------------- | :------------------------------------------- |
| `npm install`                        | Instalar dependencias                        |
| `npm run dev`                        | Servidor local en `localhost:4321`           |
| `npm run build`                      | Build de producción en `./dist/`             |
| `npm run test`                       | Ejecutar tests (35 tests, 15 property-based) |
| `npx tsx scripts/seed-questions.ts`  | Subir preguntas a Firestore                  |
| `npx firebase deploy --only hosting` | Deploy a Firebase Hosting                    |

## Configuración

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Registrar app web y copiar la config del SDK
4. Actualizar credenciales en `src/lib/firebase.ts`
5. Actualizar proyecto en `.firebaserc`
6. Subir preguntas: `npx tsx scripts/seed-questions.ts`
7. Deploy: `npm run build && npx firebase deploy`

## Pendientes

- [ ] **Regla de puntuación:** Al descartar al pez azul, el pescador debe perder solo los puntos ganados en esa ronda, no todos los acumulados durante el juego

## Pendientes

- [ ] Regla de puntuación: al descartar al pez azul, el pescador pierde solo los puntos ganados en esa ronda, no todos los acumulados
- [ ] Arreglar posición del botón "Terminar turno" en la vista del pescador
- [ ] Buscar y subir preguntas nuevas más difíciles/interesantes con sus respuestas
- [ ] Configurar PWA (Progressive Web App) para que aparezca la opción de instalar en celulares y computadores
- [ ] Tutorial inicial con las reglas del juego y sistema de puntuación, con opción "No volver a mostrar"
