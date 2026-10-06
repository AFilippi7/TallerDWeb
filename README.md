# Casino UCC

Simulador de casino online desarrollado con **HTML semántico, CSS y JavaScript puro**, sin frameworks ni backend. Incluye autenticación simulada, catálogo de juegos, tres juegos programados (tragamonedas, ruleta y blackjack) y un cajero para cargar y retirar dinero.

> Proyecto académico, sin dinero real. Todo el saldo es ficticio.

## Integrantes

- [Completar nombre y apellido]

**Materia:** [Completar] · **Docente:** [Completar] · **Entrega:** 1

## Funcionalidades

- **Autenticación:** pantalla de inicio de sesión y registro (simulada).
- **Catálogo:** 8 juegos con filtros por categoría y buscador en tiempo real.
- **Juegos:**
  - **Tragamonedas:** 7 símbolos con multiplicadores de ×2 a ×20.
  - **Ruleta europea (0–36):** apuestas a número, color, par/impar, docena, columna y mitad, con historial de resultados.
  - **Blackjack:** cálculo del As como 1 u 11, crupier que pide hasta 17 y pago 3:2 por blackjack natural.
- **Modo demo:** saldo aparte para jugar sin tocar el saldo real.
- **Cajero:** carga de dinero con bonos promocionales y retiro con validación de saldo retirable.
- **Persistencia:** el saldo se mantiene al recargar o cambiar de página mediante `localStorage`.

## Estructura del proyecto

```
├── index.html          Versión de una sola página (las 5 pantallas juntas)
├── catalogo.html       Catálogo de juegos
├── juego.html          Pantalla de juego
├── tragamonedas.html   Tragamonedas
├── ruleta.html         Ruleta
├── blackjack.html      Blackjack
├── carga.html          Cargar dinero
├── retiro.html         Retirar dinero (cajero)
└── src/
    ├── style.css       Estilos compartidos por todas las páginas
    ├── main.js         Lógica compartida (es el script que carga el navegador)
    └── main.ts         Versión fuente en TypeScript
```

Todas las páginas comparten el mismo `style.css` y `main.js`.

## Cómo ejecutarlo

No requiere instalación ni dependencias.

**Opción 1: servidor local (recomendada).** El script se carga como módulo (`type="module"`), y algunos navegadores, como Chrome, lo bloquean al abrir el HTML con doble clic (`file://`).

```bash
# Desde la carpeta del proyecto
python -m http.server 8000
```

Luego abrir `http://localhost:8000` en el navegador. También sirve la extensión **Live Server** de VS Code.

**Opción 2:** abrir `index.html` directamente en el navegador, si este permite cargar módulos desde archivos locales.

## Cómo usarlo

1. En **Autenticación** se puede ingresar con los datos precargados o con cualquier usuario.
2. En el **Catálogo**, elegir un juego haciendo clic en su nombre o en **Jugar Ahora**.
3. En la **pantalla de juego**, ajustar la apuesta y jugar. Se puede alternar entre saldo real y **modo demo**.
4. Desde el header o desde el juego se accede a **Cargar Dinero** y **Retirar**.

**Saldos iniciales:** $12.450 (total), $11.800 (retirable) y $5.000 (demo).

## Reglas de los juegos

| Juego | Pagos |
|---|---|
| Tragamonedas | Probabilidad de ganar del 45 %. Premio = apuesta × multiplicador del símbolo. |
| Ruleta | Número ×36 · Color ×2 · Par/Impar ×2 · Mitad ×2 · Docena ×3 · Columna ×3 |
| Blackjack | Natural ×2,5 (3:2) · Victoria ×2 · Empate devuelve la apuesta |

Los pagos incluyen la apuesta devuelta.

## Decisiones técnicas

- **Estado global + dos funciones centrales:** `modificarSaldo()` es el único punto donde cambia el saldo al jugar, y `actualizarUI()` actualiza todas las pantallas.
- **Navegación con `mostrarPantalla()`:** muestra u oculta secciones, o redirige al archivo HTML correspondiente si la sección no está en la página actual.
- **Delegación de eventos:** un solo listener de `click` atiende todas las tarjetas del catálogo.
- **Atributos `data-*`:** el HTML transmite al JavaScript los datos de cada juego (id, categoría, proveedor, RTP, apuesta mínima).
- **Variables CSS en `:root`:** la paleta de colores y los radios se cambian desde un único lugar.
- **Diseño adaptable:** media query para pantallas de hasta 768 px.

## Limitaciones conocidas

- La autenticación es una **maqueta**: no valida contraseñas ni guarda usuarios.
- El saldo vive en `localStorage`, por lo que **puede modificarse desde el navegador**. Un sistema real requeriría backend.
- Los resultados se generan con `Math.random()`. Las cartas se sacan con reemplazo (sin mazo real) y la tragamonedas define el resultado por probabilidad, no por líneas.
- Los historiales de cargas y retiros se pierden al recargar la página.

## Tecnologías

HTML5 · CSS3 · JavaScript (ES6+) · Google Fonts (Plus Jakarta Sans) · Imágenes de Unsplash
