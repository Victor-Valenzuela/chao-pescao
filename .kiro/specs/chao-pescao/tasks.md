# Plan de Implementación: Chao Pescao

## Visión General

Implementación incremental de un juego de fiesta multijugador en tiempo real usando Astro + Svelte + Tailwind CSS v4 en el frontend y Firebase (Firestore + Hosting) en el backend. Cada tarea construye sobre las anteriores, integrando componentes progresivamente hasta tener el flujo completo del juego.

## Tareas

- [x] 1. Configuración del proyecto y estructura base
  - [x] 1.1 Inicializar proyecto Astro con integración Svelte y Tailwind CSS v4
    - Crear proyecto Astro, instalar dependencias: `@astrojs/svelte`, `svelte`, `tailwindcss`, `@tailwindcss/vite`
    - Configurar `astro.config.mjs` con integración Svelte y plugin Tailwind v4 vía Vite
    - Crear archivo CSS global con `@import "tailwindcss"`
    - Verificar que el proyecto compila correctamente
    - _Requisitos: 14.1_

  - [x] 1.2 Configurar Firebase SDK y Vitest
    - Instalar `firebase`, `vitest`, `fast-check`
    - Crear `src/lib/firebase.ts` con inicialización de Firestore (config placeholder)
    - Configurar `vitest.config.ts` con soporte TypeScript
    - _Requisitos: 10.1_

  - [x] 1.3 Definir tipos TypeScript en `src/lib/types.ts`
    - Implementar interfaces: `Room`, `Player`, `RoundState`, `DiscardState`, `Question`, `QuestionDoc`, `LocalPlayerState`
    - Definir tipos de error: `RoomError`, `GameError`
    - Definir tipo `DiscardResult`
    - _Requisitos: 1.1, 2.1, 4.1, 4.2, 6.1, 9.1, 11.1_

- [x] 2. Servicios Firebase — roomService
  - [x] 2.1 Implementar `src/lib/roomService.ts`
    - Implementar `generateRoomCode()`: código de 4 caracteres del conjunto alfanumérico sin I, O, 0, 1
    - Implementar `createRoom(hostName)`: crea documento en Firestore con estado "waiting", asigna hostId, inicializa scores y players
    - Implementar `joinRoom(roomCode, playerName)`: valida existencia de sala y estado "waiting", agrega jugador con transacción
    - Implementar `subscribeToRoom(roomCode, callback)`: listener `onSnapshot` sobre `rooms/{roomCode}`
    - Implementar `leaveRoom(roomCode, playerId)`: elimina jugador de la sala
    - Manejar errores: `ROOM_NOT_FOUND`, `GAME_ALREADY_STARTED`
    - _Requisitos: 1.1, 1.2, 2.1, 2.2, 2.3, 10.1_

  - [x] 2.2 Test de propiedad para invariantes de creación de sala
    - **Propiedad 1: Invariantes de creación de sala**
    - Verificar que el código generado tiene exactamente 4 caracteres del conjunto permitido, estado "waiting", y hostId correcto
    - Generadores: `fc.string({minLength: 1, maxLength: 20})` para nombres
    - **Valida: Requisitos 1.1, 1.2**

  - [x] 2.3 Test de propiedad para unirse a sala
    - **Propiedad 2: Unirse a sala agrega jugador**
    - Verificar que la lista de jugadores crece en 1 al unirse un nuevo jugador
    - Generadores: `fc.array(fc.string())` para jugadores existentes
    - **Valida: Requisito 2.1**

  - [x] 2.4 Test de propiedad para validación de unión a sala
    - **Propiedad 3: Validación de unión a sala**
    - Verificar que se rechaza unirse a sala inexistente o en estado distinto a "waiting"
    - Generadores: `fc.oneof(fc.constant('playing'), fc.constant('finished'))` para estados inválidos
    - **Valida: Requisitos 2.2, 2.3**

- [x] 3. Servicios Firebase — gameService
  - [x] 3.1 Implementar `src/lib/gameService.ts` — inicio de partida y asignación de roles
    - Implementar `startGame(roomCode)`: valida mínimo 3 jugadores, cambia estado a "playing", selecciona primer pescador, inicializa scores en 0
    - Implementar `assignRoles(playerIds, fisherId)`: asigna exactamente 1 Pez_Azul aleatorio y resto Pez_Rojo entre no-pescadores
    - Implementar `startRound(roomCode)`: selecciona pregunta aleatoria no repetida, asigna roles, crea RoundState con status "fishing"
    - Usar transacciones Firestore para todas las escrituras
    - _Requisitos: 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.3_

  - [x] 3.2 Test de propiedad para mínimo de jugadores
    - **Propiedad 4: Inicio de partida requiere mínimo de jugadores**
    - Verificar que inicio tiene éxito solo con >= 3 jugadores
    - Generadores: `fc.integer({min: 0, max: 10})` para cantidad de jugadores
    - **Valida: Requisitos 3.1, 3.3**

  - [x] 3.3 Test de propiedad para asignación de roles
    - **Propiedad 5: Completitud de asignación de roles**
    - Verificar exactamente 1 azul, resto rojo, pescador sin rol
    - Generadores: `fc.uniqueArray(fc.uuid(), {minLength: 3, maxLength: 10})`
    - **Valida: Requisitos 4.1, 4.2**

  - [x] 3.4 Implementar `src/lib/gameService.ts` — mecánica de descarte y puntuación
    - Implementar `discardPlayer(roomCode, targetPlayerId)`: crea DiscardState con timestamp, cambia status a "discarding", valida que jugador no esté ya descartado
    - Implementar lógica de revelación: si Pez_Rojo → +1 punto al pescador, agregar a descartados; si Pez_Azul → score del pescador = 0, ronda termina
    - Implementar `stopFishing(roomCode)`: conserva puntos del pescador, finaliza ronda
    - Implementar `nextRound(roomCode)`: rotación cíclica del pescador (i+1) % N, inicia nueva ronda
    - Usar transacciones Firestore con validaciones de estado y rol
    - _Requisitos: 6.1, 6.3, 6.4, 6.5, 7.1, 7.2, 8.1, 8.2, 9.1, 9.3, 9.4, 12.1, 12.3_

  - [x] 3.5 Test de propiedad para no repetición de preguntas
    - **Propiedad 6: No repetición de preguntas**
    - Verificar que las preguntas seleccionadas son todas distintas
    - Generadores: `fc.array(fc.uuid())` para banco de preguntas
    - **Valida: Requisitos 5.3, 11.2**

  - [x] 3.6 Test de propiedad para estado de descarte
    - **Propiedad 7: Descarte crea estado válido**
    - Verificar que DiscardState tiene targetPlayerId correcto y status cambia a "discarding"
    - Generadores: `fc.uuid()` para targetPlayerId
    - **Valida: Requisitos 6.1, 12.1**

  - [x] 3.7 Test de propiedad para resultado de descarte
    - **Propiedad 8: Resultado de descarte coincide con rol real**
    - Verificar que el resultado revelado coincide con el rol asignado
    - Generadores: `fc.oneof(fc.constant('red'), fc.constant('blue'))` para roles
    - **Valida: Requisitos 6.3, 12.3**

  - [x] 3.8 Test de propiedad para puntuación por descarte de Pez Rojo
    - **Propiedad 9: Puntuación por descarte de Pez Rojo**
    - Verificar que el score del pescador incrementa en exactamente 1
    - Generadores: `fc.integer({min: 0})` para score previo
    - **Valida: Requisitos 6.4, 9.3**

  - [x] 3.9 Test de propiedad para penalización por descarte de Pez Azul
    - **Propiedad 10: Penalización por descarte de Pez Azul**
    - Verificar que score del pescador se establece en 0 y ronda termina
    - Generadores: `fc.integer({min: 0})` para score previo
    - **Valida: Requisitos 6.5, 9.4**

  - [x] 3.10 Test de propiedad para parar conserva puntuación
    - **Propiedad 11: Parar conserva puntuación**
    - Verificar que score del pescador no cambia al parar
    - Generadores: `fc.integer({min: 0})` para score previo
    - **Valida: Requisito 7.2**

  - [x] 3.11 Test de propiedad para rotación cíclica del pescador
    - **Propiedad 12: Rotación cíclica del pescador**
    - Verificar que el siguiente pescador es (i+1) % N
    - Generadores: `fc.uniqueArray(fc.uuid(), {minLength: 3})`, `fc.nat()` para índice
    - **Valida: Requisitos 8.1, 8.2**

- [x] 4. Servicio de preguntas y stores Svelte
  - [x] 4.1 Implementar `src/lib/questionService.ts`
    - Implementar `getRandomQuestion(usedQuestionIds)`: consulta Firestore, filtra preguntas usadas, retorna pregunta aleatoria
    - Manejar caso de no quedan preguntas disponibles (`NO_QUESTIONS_LEFT`)
    - _Requisitos: 5.1, 5.3, 11.1, 11.2, 11.3_

  - [x] 4.2 Test de propiedad para validez estructural de preguntas
    - **Propiedad 14: Validez estructural de preguntas**
    - Verificar que cada pregunta tiene text y answer no vacíos
    - Generadores: `fc.record({text: fc.string(), answer: fc.string()})`
    - **Valida: Requisito 11.1**

  - [x] 4.3 Implementar `src/stores/roomStore.ts`
    - Crear store Svelte reactivo con `writable<Room | null>(null)`
    - Implementar función `subscribeToRoom` que conecta el listener de Firestore al store
    - Exportar store derivado para estado de ronda actual, lista de jugadores, scores
    - _Requisitos: 10.1, 10.2_

  - [x] 4.4 Implementar `src/stores/playerStore.ts`
    - Crear store para identidad del jugador local: `playerId`, `playerName`, `currentRoomCode`
    - Generar `playerId` con `crypto.randomUUID()` y persistir en `localStorage`
    - Implementar funciones para set/get del nombre y sala actual
    - _Requisitos: 1.2, 2.1_

- [x] 5. Checkpoint — Verificar servicios y stores
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 6. Páginas Astro y componentes de entrada
  - [x] 6.1 Crear página `src/pages/index.astro`
    - Layout base con meta viewport para mobile-first
    - Importar y renderizar componentes `CreateRoom.svelte` y `JoinRoom.svelte` con `client:load`
    - Estilizar con Tailwind CSS v4, elementos táctiles mínimo 44x44px
    - _Requisitos: 1.3, 14.1, 14.2_

  - [x] 6.2 Implementar `src/components/CreateRoom.svelte`
    - Formulario con campo de nombre del anfitrión y botón "Crear Sala"
    - Al enviar: llamar `roomService.createRoom(hostName)`, guardar datos en `playerStore`, redirigir a `/sala/{code}`
    - Mostrar estados de carga y error
    - _Requisitos: 1.1, 1.2, 1.3_

  - [x] 6.3 Implementar `src/components/JoinRoom.svelte`
    - Formulario con campos de código de sala (4 caracteres) y nombre del jugador
    - Al enviar: llamar `roomService.joinRoom(roomCode, playerName)`, guardar datos en `playerStore`, redirigir a `/sala/{code}`
    - Mostrar errores: sala no existe, partida ya en curso
    - _Requisitos: 2.1, 2.2, 2.3_

  - [x] 6.4 Crear página `src/pages/sala/[code].astro`
    - Obtener `code` de params de Astro
    - Importar y renderizar `Lobby.svelte` y `GameBoard.svelte` con `client:load`, pasando `roomCode` como prop
    - _Requisitos: 2.4, 10.1_

- [x] 7. Componente Lobby
  - [x] 7.1 Implementar `src/components/Lobby.svelte`
    - Suscribirse a `roomStore` al montar, mostrar código de sala prominente
    - Mostrar lista de jugadores conectados en tiempo real con indicador de conexión
    - Mostrar botón "Iniciar Partida" solo al anfitrión, habilitado solo con >= 3 jugadores
    - Al presionar iniciar: llamar `gameService.startGame(roomCode)`
    - Mostrar mensaje de error si hay menos de 3 jugadores
    - Diseño mobile-first con Tailwind, elementos táctiles >= 44x44px
    - _Requisitos: 2.4, 3.1, 3.2, 3.3, 10.1, 10.3, 14.1, 14.2_

- [x] 8. Componentes del juego — Vista del pescador y jugador
  - [x] 8.1 Implementar `src/components/GameBoard.svelte`
    - Contenedor principal que alterna entre componentes según estado de la sala y ronda
    - Si `room.status === 'waiting'` → mostrar Lobby
    - Si `room.status === 'playing'` → mostrar vista según rol del jugador local (pescador vs jugador)
    - Si `room.status === 'finished'` → mostrar Results
    - Gestionar sub-estados de ronda: fishing, discarding, revealing, ended
    - _Requisitos: 3.2, 10.1, 10.2_

  - [x] 8.2 Implementar `src/components/FisherView.svelte`
    - Mostrar pregunta de la ronda (sin respuesta)
    - Mostrar lista de jugadores con iconos de pez, indicando descartados
    - Al seleccionar jugador: llamar `gameService.discardPlayer(roomCode, targetPlayerId)`
    - Mostrar botón "Parar" para finalizar turno voluntariamente
    - _Requisitos: 4.4, 5.1, 5.2, 6.1, 7.1, 7.2_

  - [x] 8.3 Implementar `src/components/PlayerView.svelte`
    - Mostrar rol asignado (Pez Rojo / Pez Azul) con colores grandes y prominentes
    - Mostrar la respuesta correcta a la pregunta
    - Colores y tamaños suficientemente grandes para mostrar pantalla al grupo
    - _Requisitos: 4.3, 4.4, 14.3_

- [x] 9. Componentes del juego — Temporizador, revelación y marcador
  - [x] 9.1 Implementar `src/components/DiscardTimer.svelte`
    - Cuenta regresiva de 10 segundos sincronizada con `currentDiscard.startedAt` de Firestore
    - Calcular tiempo restante localmente basado en timestamp del servidor
    - Mostrar en pantalla del pescador el countdown
    - Mostrar en pantalla del jugador descartado indicación para mostrar pantalla al grupo
    - Al llegar a 0: disparar evento de revelación
    - _Requisitos: 6.1, 6.2, 12.1, 12.2, 12.3_

  - [x] 9.2 Implementar `src/components/RevealScreen.svelte`
    - Mostrar resultado del descarte: Pez Rojo o Pez Azul con animación/color prominente
    - Si Pez Rojo: mostrar "+1 punto" y permitir continuar pescando
    - Si Pez Azul: mostrar "Perdiste todos tus puntos" y finalizar ronda
    - Botón para continuar a siguiente acción
    - _Requisitos: 6.3, 6.4, 6.5_

  - [x] 9.3 Implementar `src/components/Scoreboard.svelte`
    - Mostrar marcador con puntos de todos los jugadores ordenados
    - Actualizar en tiempo real desde `roomStore`
    - Mostrar al finalizar cada ronda
    - _Requisitos: 9.1, 9.2_

  - [x] 9.4 Test de propiedad para completitud del registro de puntuación
    - **Propiedad 13: Completitud del registro de puntuación**
    - Verificar que el mapa de scores contiene entrada para cada jugador
    - Generadores: `fc.uniqueArray(fc.uuid(), {minLength: 3})`
    - **Valida: Requisito 9.1**

- [x] 10. Checkpoint — Verificar flujo de juego completo
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 11. Pantalla de resultados y finalización de partida
  - [x] 11.1 Implementar `src/components/Results.svelte`
    - Mostrar ranking de jugadores ordenado de mayor a menor puntuación
    - Destacar al ganador (jugador con mayor puntuación)
    - Botón "Volver al Lobby" para iniciar nueva partida (resetea sala a estado "waiting")
    - Diseño mobile-first con Tailwind
    - _Requisitos: 13.1, 13.2, 13.3, 14.1_

  - [x] 11.2 Test de propiedad para ranking de resultados ordenado
    - **Propiedad 15: Ranking de resultados ordenado**
    - Verificar que el ranking está ordenado de mayor a menor y el primero es el ganador
    - Generadores: `fc.dictionary(fc.uuid(), fc.integer())` para mapa de puntuaciones
    - **Valida: Requisitos 13.1, 13.2**

- [x] 12. Seed del banco de preguntas y configuración de despliegue
  - [x] 12.1 Crear script de seed para banco de preguntas
    - Crear `scripts/seed-questions.ts` con al menos 30 preguntas de cultura general con texto y respuesta
    - Script que sube las preguntas a la colección `questions` de Firestore
    - Cada pregunta con campos: `id`, `text`, `answer`, `category` (opcional)
    - _Requisitos: 11.1, 11.2_

  - [x] 12.2 Configurar Firebase Hosting
    - Crear `firebase.json` con configuración de hosting apuntando al directorio de build de Astro (`dist/`)
    - Crear `.firebaserc` con proyecto placeholder
    - Configurar reglas de Firestore en `firestore.rules` para permitir lectura/escritura en `rooms` y lectura en `questions`
    - _Requisitos: 10.1_

- [x] 13. Integración final y cableado de componentes
  - [x] 13.1 Conectar todos los componentes en flujo completo
    - Verificar que `GameBoard.svelte` alterna correctamente entre todos los sub-componentes según estado
    - Verificar transiciones: Lobby → GameBoard → FisherView/PlayerView → DiscardTimer → RevealScreen → Scoreboard → Results
    - Verificar que `roomStore` y `playerStore` se actualizan correctamente en cada transición
    - Verificar sincronización en tiempo real entre múltiples clientes
    - _Requisitos: 10.1, 10.2, 3.2, 8.1, 8.2_

  - [x] 13.2 Tests unitarios de integración del flujo de juego
    - Test de flujo completo de una ronda: asignar roles → descartar → revelar → puntuar
    - Test de caso borde: pescador descarta al pez azul en primer intento
    - Test de caso borde: pescador para sin descartar a nadie
    - Test de caso borde: agotar todas las preguntas del banco
    - _Requisitos: 4.1, 6.4, 6.5, 7.2, 11.3_

- [x] 14. Checkpoint final — Verificar aplicación completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan propiedades universales de correctitud
- Los tests unitarios validan ejemplos específicos y casos borde
- El stack tecnológico es: Astro + Svelte + Tailwind CSS v4 + Firebase (Firestore + Hosting) + Vitest + fast-check
