# Documento de Requisitos

## Introducción

Chao Pescao es un juego de fiesta multijugador móvil que adapta digitalmente el juego de cartas físico del mismo nombre. Los jugadores se conectan desde sus propios dispositivos móviles estando presencialmente en el mismo lugar. Cada ronda, un jugador asume el rol de "pescador" y debe identificar respuestas falsas a una pregunta que desconoce, mientras los demás jugadores intentan engañarlo o decir la verdad según el pez (rojo o azul) que les fue asignado.

## Glosario

- **Sistema**: La aplicación web móvil Chao Pescao
- **Sala**: Instancia de juego identificada por un código único donde los jugadores se conectan
- **Jugador**: Usuario conectado a una sala desde su dispositivo móvil
- **Anfitrión**: Jugador que crea la sala y puede iniciar la partida
- **Pescador**: Jugador que en su turno lee la pregunta y debe identificar respuestas falsas
- **Pez_Rojo**: Asignación que indica al jugador que debe inventar una respuesta falsa
- **Pez_Azul**: Asignación que indica al jugador que debe decir la respuesta verdadera
- **Ronda**: Ciclo completo de juego con un pescador asignado
- **Descarte**: Acción del pescador de seleccionar a un jugador que cree que miente
- **Banco_de_Preguntas**: Colección de preguntas con sus respuestas correctas almacenadas en Firestore
- **Temporizador**: Cuenta regresiva de 10 segundos tras un descarte antes de la revelación en pantalla

## Requisitos

### Requisito 1: Creación de Sala

**Historia de Usuario:** Como jugador, quiero crear una sala de juego con un código único, para que mis amigos puedan unirse desde sus dispositivos.

#### Criterios de Aceptación

1. WHEN un jugador solicita crear una sala, THE Sistema SHALL generar un código alfanumérico único de 4 caracteres y crear la sala en estado "esperando"
2. WHEN la sala es creada, THE Sistema SHALL asignar al jugador creador como anfitrión de la sala
3. WHEN la sala es creada, THE Sistema SHALL mostrar el código de sala en la pantalla del anfitrión

### Requisito 2: Unirse a una Sala

**Historia de Usuario:** Como jugador, quiero unirme a una sala existente usando un código, para poder participar en la partida con mis amigos.

#### Criterios de Aceptación

1. WHEN un jugador ingresa un código de sala válido, THE Sistema SHALL agregar al jugador a la sala y sincronizar la lista de jugadores en todos los dispositivos conectados
2. IF un jugador ingresa un código de sala inexistente, THEN THE Sistema SHALL mostrar un mensaje de error indicando que la sala no existe
3. IF un jugador intenta unirse a una sala que ya inició la partida, THEN THE Sistema SHALL mostrar un mensaje indicando que la partida ya está en curso
4. WHILE la sala está en estado "esperando", THE Sistema SHALL mostrar la lista actualizada de jugadores conectados en tiempo real en todos los dispositivos

### Requisito 3: Inicio de Partida

**Historia de Usuario:** Como anfitrión, quiero iniciar la partida cuando todos los jugadores estén listos, para comenzar a jugar.

#### Criterios de Aceptación

1. WHILE la sala tiene al menos 3 jugadores conectados, THE Sistema SHALL habilitar el botón de inicio de partida para el anfitrión
2. WHEN el anfitrión presiona iniciar partida, THE Sistema SHALL cambiar el estado de la sala a "en juego" y seleccionar al primer pescador
3. IF la sala tiene menos de 3 jugadores al momento de iniciar, THEN THE Sistema SHALL mostrar un mensaje indicando que se necesitan al menos 3 jugadores

### Requisito 4: Asignación de Roles por Ronda

**Historia de Usuario:** Como jugador, quiero que el sistema asigne automáticamente los roles de pez rojo y pez azul cada ronda, para que el juego sea justo y aleatorio.

#### Criterios de Aceptación

1. WHEN una nueva ronda comienza, THE Sistema SHALL asignar el rol de Pez_Azul a exactamente un jugador no-pescador de forma aleatoria
2. WHEN una nueva ronda comienza, THE Sistema SHALL asignar el rol de Pez_Rojo a todos los demás jugadores no-pescador
3. THE Sistema SHALL mostrar en la pantalla de cada jugador no-pescador únicamente su propia asignación de pez (rojo o azul) junto con la respuesta correcta a la pregunta
4. THE Sistema SHALL ocultar la respuesta correcta de la pantalla del pescador

### Requisito 5: Presentación de Pregunta al Pescador

**Historia de Usuario:** Como pescador, quiero ver la pregunta en mi pantalla sin conocer la respuesta, para poder evaluar las respuestas de los demás jugadores.

#### Criterios de Aceptación

1. WHEN una ronda comienza, THE Sistema SHALL mostrar la pregunta seleccionada del Banco_de_Preguntas en la pantalla del pescador
2. THE Sistema SHALL mostrar en la pantalla del pescador una lista de iconos de pez con el nombre de cada jugador participante en la ronda
3. THE Sistema SHALL seleccionar la pregunta de forma aleatoria sin repetir preguntas ya utilizadas en la misma partida

### Requisito 6: Mecánica de Descarte

**Historia de Usuario:** Como pescador, quiero seleccionar jugadores que creo que mienten para descartarlos y ganar puntos.

#### Criterios de Aceptación

1. WHEN el pescador selecciona un jugador para descartar, THE Sistema SHALL iniciar el Temporizador de 10 segundos visible en la pantalla del pescador
2. WHILE el Temporizador está activo, THE Sistema SHALL mostrar en la pantalla del jugador descartado una indicación para que muestre físicamente su pantalla al grupo
3. WHEN el Temporizador llega a cero, THE Sistema SHALL revelar en la pantalla del pescador si el jugador descartado tenía Pez_Rojo o Pez_Azul
4. WHEN el pescador descarta a un jugador con Pez_Rojo, THE Sistema SHALL sumar 1 punto al pescador y eliminar al jugador descartado de la ronda actual
5. WHEN el pescador descarta a un jugador con Pez_Azul, THE Sistema SHALL restar todos los puntos acumulados del pescador en la partida y finalizar la ronda

### Requisito 7: Finalización Voluntaria del Turno

**Historia de Usuario:** Como pescador, quiero poder detenerme voluntariamente en mi turno para conservar mis puntos acumulados.

#### Criterios de Aceptación

1. WHILE hay jugadores sin descartar en la ronda, THE Sistema SHALL mostrar un botón "Parar" en la pantalla del pescador
2. WHEN el pescador presiona "Parar", THE Sistema SHALL conservar los puntos acumulados del pescador y finalizar la ronda

### Requisito 8: Rotación del Pescador

**Historia de Usuario:** Como jugador, quiero que el rol de pescador rote entre todos los jugadores, para que todos tengan la oportunidad de pescar.

#### Criterios de Aceptación

1. WHEN una ronda finaliza, THE Sistema SHALL asignar el rol de pescador al siguiente jugador en el orden de la lista de jugadores
2. THE Sistema SHALL rotar el rol de pescador de forma cíclica entre todos los jugadores de la sala

### Requisito 9: Sistema de Puntuación

**Historia de Usuario:** Como jugador, quiero ver la puntuación acumulada de todos los jugadores, para saber quién va ganando.

#### Criterios de Aceptación

1. THE Sistema SHALL mantener un registro de puntos acumulados por cada jugador durante toda la partida
2. WHEN una ronda finaliza, THE Sistema SHALL mostrar el marcador actualizado con los puntos de todos los jugadores en todos los dispositivos
3. WHEN el pescador descarta correctamente un Pez_Rojo, THE Sistema SHALL incrementar la puntuación del pescador en 1 punto
4. WHEN el pescador descarta al Pez_Azul, THE Sistema SHALL establecer la puntuación del pescador en 0 puntos

### Requisito 10: Sincronización en Tiempo Real

**Historia de Usuario:** Como jugador, quiero que el estado del juego se sincronice en tiempo real entre todos los dispositivos, para que la experiencia sea fluida.

#### Criterios de Aceptación

1. THE Sistema SHALL sincronizar el estado de la sala entre todos los dispositivos conectados mediante listeners de Firestore en tiempo real
2. WHEN el estado del juego cambia, THE Sistema SHALL reflejar el cambio en todos los dispositivos conectados en menos de 2 segundos
3. IF un jugador pierde la conexión, THEN THE Sistema SHALL mostrar un indicador de desconexión a los demás jugadores de la sala

### Requisito 11: Gestión del Banco de Preguntas

**Historia de Usuario:** Como sistema, quiero gestionar un banco de preguntas con respuestas correctas, para alimentar las rondas del juego.

#### Criterios de Aceptación

1. THE Banco_de_Preguntas SHALL almacenar cada pregunta con su texto y su respuesta correcta asociada
2. THE Sistema SHALL seleccionar preguntas del Banco_de_Preguntas de forma aleatoria sin repetición dentro de una misma partida
3. IF el Banco_de_Preguntas no tiene preguntas disponibles sin usar en la partida actual, THEN THE Sistema SHALL finalizar la partida y mostrar los resultados finales

### Requisito 12: Temporizador de Revelación

**Historia de Usuario:** Como jugador, quiero que haya una cuenta regresiva de 10 segundos antes de la revelación digital, para generar tensión y permitir la revelación física.

#### Criterios de Aceptación

1. WHEN un descarte es realizado, THE Sistema SHALL mostrar una cuenta regresiva de 10 segundos en la pantalla del pescador
2. WHILE el Temporizador está activo, THE Sistema SHALL mostrar en la pantalla del jugador descartado su asignación de pez de forma prominente para facilitar la revelación física
3. WHEN el Temporizador llega a cero, THE Sistema SHALL procesar el resultado del descarte y actualizar el estado de la ronda

### Requisito 13: Finalización de Partida y Resultados

**Historia de Usuario:** Como jugador, quiero ver los resultados finales al terminar la partida, para saber quién ganó.

#### Criterios de Aceptación

1. WHEN todas las rondas programadas se completan, THE Sistema SHALL mostrar la pantalla de resultados finales con el ranking de jugadores ordenado por puntuación
2. WHEN la partida finaliza, THE Sistema SHALL mostrar el jugador con mayor puntuación como ganador
3. WHEN la partida finaliza, THE Sistema SHALL ofrecer la opción de volver al lobby para iniciar una nueva partida

### Requisito 14: Diseño Mobile-First

**Historia de Usuario:** Como jugador, quiero que la interfaz esté optimizada para dispositivos móviles, para una experiencia cómoda en mi teléfono.

#### Criterios de Aceptación

1. THE Sistema SHALL renderizar la interfaz de forma responsiva adaptada a pantallas de dispositivos móviles con ancho mínimo de 320px
2. THE Sistema SHALL utilizar elementos táctiles con un tamaño mínimo de 44x44 píxeles para facilitar la interacción
3. THE Sistema SHALL mostrar las asignaciones de pez (rojo/azul) con colores y tamaños suficientemente grandes para ser visibles cuando el jugador muestra su pantalla al grupo
