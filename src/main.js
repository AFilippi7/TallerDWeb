// CASINO UCC - Lógica JavaScript estándar (Vanilla JS sin dependencias ni compilador)
const DEFAULT_SALDO = 12450;
const DEFAULT_SALDO_RETIRABLE = 11800;
const DEFAULT_SALDO_DEMO = 5e3;
function leerStorageNumero(clave, valorDefault) {
  try {
    const val = localStorage.getItem(clave);
    if (val !== null) {
      const num = parseFloat(val);
      if (!isNaN(num)) return num;
    }
  } catch (e) {
  }
  return valorDefault;
}
function guardarStorage(clave, valor) {
  try {
    localStorage.setItem(clave, String(valor));
  } catch (e) {
  }
}
let saldoUsuario = leerStorageNumero("casino_ucc_saldo", DEFAULT_SALDO);
let saldoRetirable = leerStorageNumero("casino_ucc_saldo_retirable", DEFAULT_SALDO_RETIRABLE);
let saldoDemo = leerStorageNumero("casino_ucc_saldo_demo", DEFAULT_SALDO_DEMO);
let usuarioActual = (function() {
  try {
    return localStorage.getItem("casino_ucc_usuario") || "alejandro_vip";
  } catch (e) {
    return "alejandro_vip";
  }
})();
let modoDemo = false;
let apuestaActual = 10;
let juegoActualId = "gates-of-olympus";
let pantallaActual = "autenticacion";
const CATALOGO_METADATA = {
  "gates-of-olympus": { titulo: "Gates of Olympus", proveedor: "Pragmatic Play", rtp: "96.50%", tipoMaquina: "slot", min: 10 },
  "ruleta-europea-vip": { titulo: "Ruleta Europea VIP", proveedor: "Evolution Gaming", rtp: "97.30%", tipoMaquina: "ruleta", min: 5 },
  "vip-blackjack-diamond": { titulo: "VIP Blackjack Diamond", proveedor: "Playtech", rtp: "99.28%", tipoMaquina: "blackjack", min: 25 },
  "sweet-bonanza-1000": { titulo: "Sweet Bonanza 1000", proveedor: "Pragmatic Play", rtp: "96.53%", tipoMaquina: "slot", min: 5 },
  "mega-moolah-safari": { titulo: "Mega Moolah Safari", proveedor: "Microgaming", rtp: "94.80%", tipoMaquina: "slot", min: 10 },
  "lightning-roulette-deluxe": { titulo: "Lightning Roulette Deluxe", proveedor: "Evolution Gaming", rtp: "97.10%", tipoMaquina: "ruleta", min: 10 },
  "book-of-dead-secrets": { titulo: "Book of Dead Secrets", proveedor: "Play'n GO", rtp: "96.21%", tipoMaquina: "slot", min: 5 },
  "infinite-blackjack-pro": { titulo: "Infinite Blackjack Pro", proveedor: "Evolution Gaming", rtp: "99.47%", tipoMaquina: "blackjack", min: 20 }
};
let valorFichaRuleta = 5;
let apuestasRuletaActivas = /* @__PURE__ */ new Map();
let ruletaGirando = false;
let ruletaHistorial = [
  { numero: 7, color: "rojo" },
  { numero: 20, color: "negro" },
  { numero: 32, color: "rojo" },
  { numero: 0, color: "verde" }
];
let blackjackEnJuego = false;
let blackjackCartasJugador = [];
let blackjackCartasCrupier = [];
function formatearDinero(monto) {
  return "$" + monto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USD";
}
function obtenerSaldoActual() {
  return modoDemo ? saldoDemo : saldoUsuario;
}
function modificarSaldo(delta) {
  if (modoDemo) {
    saldoDemo = Math.max(0, saldoDemo + delta);
    guardarStorage("casino_ucc_saldo_demo", saldoDemo);
  } else {
    saldoUsuario = Math.max(0, saldoUsuario + delta);
    saldoRetirable = Math.max(0, saldoRetirable + delta);
    guardarStorage("casino_ucc_saldo", saldoUsuario);
    guardarStorage("casino_ucc_saldo_retirable", saldoRetirable);
  }
  actualizarUI();
}
function actualizarUI() {
  const saldoActual = obtenerSaldoActual();
  const elSaldoHeader = document.getElementById("header-saldo");
  const elSaldoJuego = document.getElementById("juego-saldo-display");
  const elSaldoCajeroTotal = document.getElementById("cajero-saldo-total");
  const elSaldoCajeroRetirable = document.getElementById("cajero-saldo-retirable");
  const elSaldoCargarDisplay = document.getElementById("cargar-saldo-display");
  const elDisplayApuesta = document.getElementById("juego-apuesta-display");
  if (elSaldoHeader) elSaldoHeader.textContent = formatearDinero(saldoActual);
  if (elSaldoJuego) elSaldoJuego.textContent = formatearDinero(saldoActual) + (modoDemo ? " (DEMO)" : "");
  if (elSaldoCajeroTotal) elSaldoCajeroTotal.textContent = formatearDinero(saldoUsuario);
  if (elSaldoCajeroRetirable) elSaldoCajeroRetirable.textContent = formatearDinero(saldoRetirable);
  if (elSaldoCargarDisplay) elSaldoCargarDisplay.textContent = formatearDinero(saldoUsuario);
  if (elDisplayApuesta) elDisplayApuesta.textContent = formatearDinero(apuestaActual);
  document.querySelectorAll(".btn-pantalla").forEach((btn) => {
    const destino = btn.dataset.destino;
    if (destino === pantallaActual) {
      btn.classList.add("activa");
    } else {
      btn.classList.remove("activa");
    }
  });
}
function mostrarPantalla(nombre) {
  pantallaActual = nombre;
  const pDestino = document.getElementById(`pantalla-${nombre}`);
  if (pDestino) {
    document.querySelectorAll(".pantalla").forEach((p) => {
      p.classList.remove("visible");
    });
    pDestino.classList.add("visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    const mapaArchivos = {
      "autenticacion": "index.html",
      "catalogo": "catalogo.html",
      "juego": "juego.html",
      "cargar-dinero": "carga.html",
      "cajero": "retiro.html"
    };
    if (mapaArchivos[nombre]) {
      window.location.href = mapaArchivos[nombre];
      return;
    }
  }
  actualizarUI();
}
function abrirJuegoPorId(juegoId) {
  guardarStorage("casino_ucc_juego_id", juegoId);
  const secJuego = document.getElementById("pantalla-juego");
  if (!secJuego) {
    window.location.href = `juego.html?id=${encodeURIComponent(juegoId)}`;
    return;
  }
  const tarjeta = document.querySelector(`.tarjeta-juego[data-id="${juegoId}"]`);
  const meta = CATALOGO_METADATA[juegoId] || {
    titulo: "Gates of Olympus",
    proveedor: "Pragmatic Play",
    rtp: "96.50%",
    tipoMaquina: "slot",
    min: 10
  };
  const titulo = tarjeta?.dataset.titulo || tarjeta?.querySelector(".nombre-juego")?.textContent?.trim() || meta.titulo;
  const proveedor = tarjeta?.dataset.proveedor || meta.proveedor;
  const rtp = tarjeta?.dataset.rtp || meta.rtp;
  const tipoMaquina = tarjeta?.dataset.tipoMaquina || meta.tipoMaquina;
  const minApuesta = Number(tarjeta?.dataset.min) || meta.min;
  juegoActualId = juegoId;
  apuestaActual = Math.max(minApuesta, 10);
  const elTitulo = document.getElementById("juego-titulo");
  const elProveedor = document.getElementById("juego-proveedor");
  const elRtp = document.getElementById("juego-rtp");
  const elMensaje = document.getElementById("mensaje-resultado-juego");
  if (elTitulo) elTitulo.textContent = titulo;
  if (elProveedor) elProveedor.textContent = proveedor;
  if (elRtp) elRtp.textContent = "RTP: " + rtp;
  if (elMensaje) {
    elMensaje.textContent = `Bienvenido a ${titulo}. Ajusta tu apuesta y comienza a jugar.`;
    elMensaje.className = "mensaje-resultado";
  }
  const secSlot = document.getElementById("maquina-slot");
  const secRuleta = document.getElementById("maquina-ruleta");
  const secBlackjack = document.getElementById("maquina-blackjack");
  const btnGirarSlot = document.getElementById("btn-girar-slot");
  const btnGirarRuleta = document.getElementById("btn-girar-ruleta");
  const btnBjRepartir = document.getElementById("btn-bj-repartir");
  const btnBjPedir = document.getElementById("btn-bj-pedir");
  const btnBjPlantarse = document.getElementById("btn-bj-plantarse");
  if (secSlot) secSlot.style.display = tipoMaquina === "slot" ? "block" : "none";
  if (secRuleta) secRuleta.style.display = tipoMaquina === "ruleta" ? "block" : "none";
  if (secBlackjack) secBlackjack.style.display = tipoMaquina === "blackjack" ? "block" : "none";
  if (btnGirarSlot) btnGirarSlot.style.display = tipoMaquina === "slot" ? "inline-block" : "none";
  if (btnGirarRuleta) btnGirarRuleta.style.display = tipoMaquina === "ruleta" ? "inline-block" : "none";
  if (btnBjRepartir) btnBjRepartir.style.display = tipoMaquina === "blackjack" ? "inline-block" : "none";
  if (btnBjPedir) btnBjPedir.style.display = tipoMaquina === "blackjack" ? "inline-block" : "none";
  if (btnBjPlantarse) btnBjPlantarse.style.display = tipoMaquina === "blackjack" ? "inline-block" : "none";
  if (tipoMaquina === "ruleta") {
    inicializarTableroRuleta();
    actualizarVistaApuestasRuleta();
  }
  if (document.getElementById("pantalla-autenticacion")) {
    mostrarPantalla("juego");
  } else {
    actualizarUI();
  }
}
window.abrirJuegoPorId = abrirJuegoPorId;
window.mostrarPantalla = mostrarPantalla;
const SIMBOLOS_SLOT = [
  { emoji: "\u{1F451}", nombre: "Corona Real", multiplicador: 20 },
  { emoji: "\u{1F48E}", nombre: "Diamante Azul", multiplicador: 15 },
  { emoji: "7\uFE0F\u20E3", nombre: "Triple 7", multiplicador: 10 },
  { emoji: "\u2B50", nombre: "Estrella Wild", multiplicador: 8 },
  { emoji: "\u26A1", nombre: "Rayo Zeus", multiplicador: 5 },
  { emoji: "\u{1F514}", nombre: "Campana de Oro", multiplicador: 4 },
  { emoji: "\u{1F352}", nombre: "Cereza", multiplicador: 2 }
];
function girarTragamonedas() {
  const saldoDisponible = obtenerSaldoActual();
  const elMensaje = document.getElementById("mensaje-resultado-juego");
  if (saldoDisponible < apuestaActual) {
    if (elMensaje) {
      elMensaje.textContent = "\xA1Saldo insuficiente! Cambia al Modo Demo o recarga saldo en el Cajero.";
      elMensaje.className = "mensaje-resultado";
    }
    return;
  }
  modificarSaldo(-apuestaActual);
  if (elMensaje) {
    elMensaje.textContent = "Girando rodillos...";
    elMensaje.className = "mensaje-resultado";
  }
  const esGanador = Math.random() < 0.45;
  const simboloPremio = SIMBOLOS_SLOT[Math.floor(Math.random() * SIMBOLOS_SLOT.length)];
  const casillas = document.querySelectorAll(".simbolo-ranura");
  casillas.forEach((casilla, indice) => {
    if (esGanador && (indice === 5 || indice === 6 || indice === 7)) {
      casilla.textContent = simboloPremio.emoji;
    } else {
      const aleatorio = SIMBOLOS_SLOT[Math.floor(Math.random() * SIMBOLOS_SLOT.length)];
      casilla.textContent = aleatorio.emoji;
    }
  });
  if (esGanador) {
    const premio = Math.round(apuestaActual * simboloPremio.multiplicador);
    modificarSaldo(premio);
    if (elMensaje) {
      elMensaje.textContent = `\xA1GANASTE! L\xEDnea de 3x ${simboloPremio.nombre}. Premio acreditado: ${formatearDinero(premio)}`;
      elMensaje.className = "mensaje-resultado ganador";
    }
  } else {
    if (elMensaje) {
      elMensaje.textContent = "\xA1Casi! Sigue probando tu suerte en el siguiente giro.";
      elMensaje.className = "mensaje-resultado";
    }
  }
}
const NUMEROS_ROJOS_RULETA = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
function calcularTotalApuestasRuleta() {
  let total = 0;
  apuestasRuletaActivas.forEach((item) => {
    total += item.monto;
  });
  return total;
}
function colocarApuestaRuleta(tipo, valor, badgeId, etiqueta) {
  if (ruletaGirando) return;
  const totalActual = calcularTotalApuestasRuleta();
  const saldoDisponible = obtenerSaldoActual();
  if (saldoDisponible < totalActual + valorFichaRuleta) {
    const elMensaje = document.getElementById("mensaje-resultado-juego");
    if (elMensaje) {
      elMensaje.textContent = `\xA1Saldo insuficiente para colocar ficha de $${valorFichaRuleta}! Total en mesa: ${formatearDinero(totalActual)} | Saldo: ${formatearDinero(saldoDisponible)}`;
      elMensaje.className = "mensaje-resultado";
    }
    return;
  }
  const clave = `${tipo}-${valor}`;
  if (apuestasRuletaActivas.has(clave)) {
    const item = apuestasRuletaActivas.get(clave);
    item.monto += valorFichaRuleta;
  } else {
    apuestasRuletaActivas.set(clave, {
      id: clave,
      tipo,
      valor,
      monto: valorFichaRuleta,
      etiqueta
    });
  }
  actualizarVistaApuestasRuleta();
}
function eliminarApuestaRuleta(clave) {
  if (ruletaGirando) return;
  apuestasRuletaActivas.delete(clave);
  actualizarVistaApuestasRuleta();
}
function limpiarMesaRuleta() {
  if (ruletaGirando) return;
  apuestasRuletaActivas.clear();
  actualizarVistaApuestasRuleta();
}
function doblarApuestasRuleta() {
  if (ruletaGirando || apuestasRuletaActivas.size === 0) return;
  const totalActual = calcularTotalApuestasRuleta();
  const saldoDisponible = obtenerSaldoActual();
  if (saldoDisponible < totalActual * 2) {
    const elMensaje = document.getElementById("mensaje-resultado-juego");
    if (elMensaje) {
      elMensaje.textContent = `\xA1Saldo insuficiente para doblar las apuestas! Requieres ${formatearDinero(totalActual * 2)}.`;
      elMensaje.className = "mensaje-resultado";
    }
    return;
  }
  apuestasRuletaActivas.forEach((item) => {
    item.monto *= 2;
  });
  actualizarVistaApuestasRuleta();
}
function actualizarVistaApuestasRuleta() {
  document.querySelectorAll(".ficha-badge").forEach((badge) => {
    badge.classList.remove("visible");
    badge.textContent = "";
  });
  apuestasRuletaActivas.forEach((item) => {
    let badgeId = "";
    if (item.tipo === "numero") badgeId = `ficha-num-${item.valor}`;
    else if (item.tipo === "columna") badgeId = `ficha-col-${item.valor}`;
    else if (item.tipo === "docena") badgeId = `ficha-doc-${item.valor}`;
    else if (item.tipo === "mitad") badgeId = `ficha-mitad-${item.valor}`;
    else if (item.tipo === "color" || item.tipo === "paridad") badgeId = `ficha-${item.valor}`;
    if (badgeId) {
      const elBadge = document.getElementById(badgeId);
      if (elBadge) {
        elBadge.textContent = `$${item.monto}`;
        elBadge.classList.add("visible");
      }
    }
  });
  const total = calcularTotalApuestasRuleta();
  const elResumen = document.getElementById("ruleta-total-apostado-texto");
  if (elResumen) {
    const cant = apuestasRuletaActivas.size;
    elResumen.innerHTML = `Total en Mesa: <strong>${formatearDinero(total)}</strong> (${cant} apuesta${cant === 1 ? "" : "s"})`;
  }
  const contChips = document.getElementById("ruleta-chips-activas");
  if (contChips) {
    if (apuestasRuletaActivas.size === 0) {
      contChips.innerHTML = `<span style="color: #6c7d9e; font-size: 12px; font-style: italic;">Ninguna ficha en la mesa. Haz click en cualquier n\xFAmero o casilla para apostar.</span>`;
    } else {
      let html = "";
      apuestasRuletaActivas.forEach((item, clave) => {
        html += `
          <div class="chip-apuesta-tag">
            <span>${item.etiqueta}: <strong>$${item.monto}</strong></span>
            <span class="btn-quitar-apuesta" data-clave="${clave}" title="Quitar apuesta">\u2715</span>
          </div>
        `;
      });
      contChips.innerHTML = html;
      contChips.querySelectorAll(".btn-quitar-apuesta").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const clv = btn.dataset.clave;
          if (clv) eliminarApuestaRuleta(clv);
        });
      });
    }
  }
}
function actualizarHistorialRuletaUI() {
  const elHistorial = document.getElementById("ruleta-historial");
  if (elHistorial) {
    elHistorial.innerHTML = ruletaHistorial.map((item) => `<span class="bola-historial ${item.color}">${item.numero}</span>`).join("");
  }
}
function girarRuleta() {
  if (ruletaGirando) return;
  const totalApuesta = calcularTotalApuestasRuleta();
  const saldoDisponible = obtenerSaldoActual();
  const elMensaje = document.getElementById("mensaje-resultado-juego");
  const elDisplayResultado = document.getElementById("ruleta-numero-resultado");
  const elRuedaIcono = document.getElementById("ruleta-rueda-icono");
  if (apuestasRuletaActivas.size === 0) {
    if (elMensaje) {
      elMensaje.textContent = "\xA1Por favor coloca al menos una apuesta en el pa\xF1o (n\xFAmero espec\xEDfico, color, par/impar, docenas) antes de girar!";
      elMensaje.className = "mensaje-resultado";
    }
    return;
  }
  if (saldoDisponible < totalApuesta) {
    if (elMensaje) {
      elMensaje.textContent = `\xA1Saldo insuficiente! El total de tus apuestas en mesa es ${formatearDinero(totalApuesta)} y tu saldo es ${formatearDinero(saldoDisponible)}.`;
      elMensaje.className = "mensaje-resultado";
    }
    return;
  }
  modificarSaldo(-totalApuesta);
  ruletaGirando = true;
  if (elRuedaIcono) elRuedaIcono.classList.add("girando");
  if (elMensaje) {
    elMensaje.textContent = "\u{1F3A1} \xA1La ruleta est\xE1 girando y la bola rueda por el cilindro!...";
    elMensaje.className = "mensaje-resultado";
  }
  document.querySelectorAll(".ruleta-casilla").forEach((c) => c.classList.remove("ganador-resaltado"));
  setTimeout(() => {
    const numeroGanador = Math.floor(Math.random() * 37);
    let colorGanador = "negro";
    if (numeroGanador === 0) {
      colorGanador = "verde";
    } else if (NUMEROS_ROJOS_RULETA.includes(numeroGanador)) {
      colorGanador = "rojo";
    }
    if (elDisplayResultado) {
      elDisplayResultado.textContent = `${numeroGanador} (${colorGanador.toUpperCase()})`;
      elDisplayResultado.className = `ruleta-resultado ${colorGanador}`;
    }
    if (elRuedaIcono) elRuedaIcono.classList.remove("girando");
    const casillaGanadora = document.getElementById(`casilla-num-${numeroGanador}`);
    if (casillaGanadora) {
      casillaGanadora.classList.add("ganador-resaltado");
    }
    ruletaHistorial.unshift({ numero: numeroGanador, color: colorGanador });
    if (ruletaHistorial.length > 6) ruletaHistorial.pop();
    actualizarHistorialRuletaUI();
    let gananciaTotal = 0;
    const aciertos = [];
    const docenaGanadora = numeroGanador === 0 ? 0 : Math.ceil(numeroGanador / 12);
    const colGanadora = numeroGanador === 0 ? 0 : numeroGanador % 3 === 0 ? 3 : numeroGanador % 3 === 2 ? 2 : 1;
    const mitadGanadora = numeroGanador === 0 ? 0 : numeroGanador <= 18 ? 1 : 2;
    apuestasRuletaActivas.forEach((bet) => {
      let premioBet = 0;
      if (bet.tipo === "numero" && Number(bet.valor) === numeroGanador) {
        premioBet = bet.monto * 36;
        aciertos.push(`Pleno al ${numeroGanador} (+$${premioBet})`);
      }
      if (bet.tipo === "color" && bet.valor === colorGanador) {
        premioBet = bet.monto * 2;
        aciertos.push(`Color ${colorGanador.toUpperCase()} (+$${premioBet})`);
      }
      if (numeroGanador !== 0 && bet.tipo === "paridad") {
        if (bet.valor === "par" && numeroGanador % 2 === 0) {
          premioBet = bet.monto * 2;
          aciertos.push(`PAR (+$${premioBet})`);
        } else if (bet.valor === "impar" && numeroGanador % 2 !== 0) {
          premioBet = bet.monto * 2;
          aciertos.push(`IMPAR (+$${premioBet})`);
        }
      }
      if (bet.tipo === "docena" && Number(bet.valor) === docenaGanadora) {
        premioBet = bet.monto * 3;
        aciertos.push(`${bet.valor}\xAA Docena (+$${premioBet})`);
      }
      if (bet.tipo === "columna" && Number(bet.valor) === colGanadora) {
        premioBet = bet.monto * 3;
        aciertos.push(`Columna ${bet.valor} (+$${premioBet})`);
      }
      if (bet.tipo === "mitad" && Number(bet.valor) === mitadGanadora) {
        premioBet = bet.monto * 2;
        aciertos.push(`${bet.valor === 1 ? "1 a 18" : "19 a 36"} (+$${premioBet})`);
      }
      gananciaTotal += premioBet;
    });
    if (gananciaTotal > 0) {
      modificarSaldo(gananciaTotal);
      if (elMensaje) {
        elMensaje.textContent = `\xA1VICTORIA EN LA RULETA! Sali\xF3 el ${numeroGanador} (${colorGanador.toUpperCase()}). Cobraste ${formatearDinero(gananciaTotal)} en premios. [Aciertos: ${aciertos.join(", ")}]`;
        elMensaje.className = "mensaje-resultado ganador";
      }
    } else {
      if (elMensaje) {
        elMensaje.textContent = `La bola cay\xF3 en ${numeroGanador} (${colorGanador.toUpperCase()}). No hubo aciertos en tus apuestas. Tus fichas siguen en la mesa o puedes cambiarlas.`;
        elMensaje.className = "mensaje-resultado";
      }
    }
    ruletaGirando = false;
  }, 900);
}
function inicializarTableroRuleta() {
  const gridNumeros = document.getElementById("ruleta-grid-numeros");
  if (gridNumeros && gridNumeros.children.length === 0) {
    const filas = [
      [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
      [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
      [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
    ];
    filas.forEach((fila) => {
      fila.forEach((num) => {
        const esRojo = NUMEROS_ROJOS_RULETA.includes(num);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `ruleta-casilla casilla-num ${esRojo ? "rojo" : "negro"}`;
        btn.dataset.tipo = "numero";
        btn.dataset.valor = String(num);
        btn.id = `casilla-num-${num}`;
        btn.innerHTML = `<span class="numero-label">${num}</span><span class="ficha-badge" id="ficha-num-${num}"></span>`;
        btn.addEventListener("click", () => {
          colocarApuestaRuleta("numero", num, `ficha-num-${num}`, `N\xBA ${num} (${esRojo ? "Rojo" : "Negro"})`);
        });
        gridNumeros.appendChild(btn);
      });
    });
  }
  const btnCero = document.getElementById("casilla-num-0");
  if (btnCero && !btnCero.dataset.bound) {
    btnCero.dataset.bound = "true";
    btnCero.addEventListener("click", () => {
      colocarApuestaRuleta("numero", 0, "ficha-num-0", "N\xBA 0 (Verde)");
    });
  }
  [1, 2, 3].forEach((col) => {
    const btnCol = document.getElementById(`casilla-col-${col}`);
    if (btnCol && !btnCol.dataset.bound) {
      btnCol.dataset.bound = "true";
      btnCol.addEventListener("click", () => {
        colocarApuestaRuleta("columna", col, `ficha-col-${col}`, `Columna ${col} (2:1)`);
      });
    }
  });
  [1, 2, 3].forEach((doc) => {
    const btnDoc = document.getElementById(`casilla-doc-${doc}`);
    if (btnDoc && !btnDoc.dataset.bound) {
      btnDoc.dataset.bound = "true";
      const rango = doc === 1 ? "1-12" : doc === 2 ? "13-24" : "25-36";
      btnDoc.addEventListener("click", () => {
        colocarApuestaRuleta("docena", doc, `ficha-doc-${doc}`, `${doc}\xAA Docena ${rango} (3:1)`);
      });
    }
  });
  const btnMitad1 = document.getElementById("casilla-mitad-1");
  if (btnMitad1 && !btnMitad1.dataset.bound) {
    btnMitad1.dataset.bound = "true";
    btnMitad1.addEventListener("click", () => {
      colocarApuestaRuleta("mitad", 1, "ficha-mitad-1", "1 a 18 (2:1)");
    });
  }
  const btnMitad2 = document.getElementById("casilla-mitad-2");
  if (btnMitad2 && !btnMitad2.dataset.bound) {
    btnMitad2.dataset.bound = "true";
    btnMitad2.addEventListener("click", () => {
      colocarApuestaRuleta("mitad", 2, "ficha-mitad-2", "19 a 36 (2:1)");
    });
  }
  const btnPar = document.getElementById("casilla-par");
  if (btnPar && !btnPar.dataset.bound) {
    btnPar.dataset.bound = "true";
    btnPar.addEventListener("click", () => {
      colocarApuestaRuleta("paridad", "par", "ficha-par", "PAR (2:1)");
    });
  }
  const btnImpar = document.getElementById("casilla-impar");
  if (btnImpar && !btnImpar.dataset.bound) {
    btnImpar.dataset.bound = "true";
    btnImpar.addEventListener("click", () => {
      colocarApuestaRuleta("paridad", "impar", "ficha-impar", "IMPAR (2:1)");
    });
  }
  const btnRojo = document.getElementById("casilla-rojo");
  if (btnRojo && !btnRojo.dataset.bound) {
    btnRojo.dataset.bound = "true";
    btnRojo.addEventListener("click", () => {
      colocarApuestaRuleta("color", "rojo", "ficha-rojo", "ROJO (2:1)");
    });
  }
  const btnNegro = document.getElementById("casilla-negro");
  if (btnNegro && !btnNegro.dataset.bound) {
    btnNegro.dataset.bound = "true";
    btnNegro.addEventListener("click", () => {
      colocarApuestaRuleta("color", "negro", "ficha-negro", "NEGRO (2:1)");
    });
  }
  document.querySelectorAll(".btn-ficha").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-ficha").forEach((b) => b.classList.remove("activa"));
      btn.classList.add("activa");
      valorFichaRuleta = parseInt(btn.dataset.valor || "5", 10);
    });
  });
  const btnLimpiar = document.getElementById("btn-ruleta-limpiar");
  if (btnLimpiar && !btnLimpiar.dataset.bound) {
    btnLimpiar.dataset.bound = "true";
    btnLimpiar.addEventListener("click", limpiarMesaRuleta);
  }
  const btnDoblar = document.getElementById("btn-ruleta-doblar");
  if (btnDoblar && !btnDoblar.dataset.bound) {
    btnDoblar.dataset.bound = "true";
    btnDoblar.addEventListener("click", doblarApuestasRuleta);
  }
  actualizarHistorialRuletaUI();
  actualizarVistaApuestasRuleta();
}
function obtenerCartaAleatoria() {
  const palos = ["\u2660", "\u2665", "\u2666", "\u2663"];
  const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const palo = palos[Math.floor(Math.random() * palos.length)];
  const valor = valores[Math.floor(Math.random() * valores.length)];
  let numero = parseInt(valor);
  if (valor === "A") numero = 11;
  else if (["J", "Q", "K"].includes(valor)) numero = 10;
  const esRoja = palo === "\u2665" || palo === "\u2666";
  return { valor, numero, palo, esRoja };
}
function calcularPuntosBlackjack(cartas) {
  let puntos = cartas.reduce((acc, c) => acc + c.numero, 0);
  let ases = cartas.filter((c) => c.valor === "A").length;
  while (puntos > 21 && ases > 0) {
    puntos -= 10;
    ases--;
  }
  return puntos;
}
function renderizarCartasBlackjack(mostrarOculta = false) {
  const contJugador = document.getElementById("blackjack-cartas-jugador");
  const contCrupier = document.getElementById("blackjack-cartas-crupier");
  const pJugador = document.getElementById("blackjack-puntos-jugador");
  const pCrupier = document.getElementById("blackjack-puntos-crupier");
  if (contJugador) {
    contJugador.innerHTML = blackjackCartasJugador.map(
      (c) => `
        <div class="carta-item ${c.esRoja ? "roja" : ""}">
          <span>${c.valor}</span>
          <span style="font-size:24px; align-self:center;">${c.palo}</span>
          <span style="align-self:flex-end;">${c.valor}</span>
        </div>`
    ).join("");
  }
  if (pJugador) {
    pJugador.textContent = `Puntos: ${calcularPuntosBlackjack(blackjackCartasJugador)}`;
  }
  if (contCrupier) {
    contCrupier.innerHTML = blackjackCartasCrupier.map((c, idx) => {
      if (idx === 1 && !mostrarOculta) {
        return `<div class="carta-oculta">\u{1F512}</div>`;
      }
      return `
          <div class="carta-item ${c.esRoja ? "roja" : ""}">
            <span>${c.valor}</span>
            <span style="font-size:24px; align-self:center;">${c.palo}</span>
            <span style="align-self:flex-end;">${c.valor}</span>
          </div>`;
    }).join("");
  }
  if (pCrupier) {
    if (mostrarOculta) {
      pCrupier.textContent = `Puntos: ${calcularPuntosBlackjack(blackjackCartasCrupier)}`;
    } else {
      pCrupier.textContent = `Puntos: ${blackjackCartasCrupier[0] ? blackjackCartasCrupier[0].numero : 0} + ?`;
    }
  }
}
function iniciarBlackjack() {
  const saldoDisponible = obtenerSaldoActual();
  const elMensaje = document.getElementById("mensaje-resultado-juego");
  const btnRepartir = document.getElementById("btn-bj-repartir");
  const btnPedir = document.getElementById("btn-bj-pedir");
  const btnPlantarse = document.getElementById("btn-bj-plantarse");
  if (saldoDisponible < apuestaActual) {
    if (elMensaje) {
      elMensaje.textContent = "\xA1Saldo insuficiente para iniciar mano de Blackjack!";
      elMensaje.className = "mensaje-resultado";
    }
    return;
  }
  modificarSaldo(-apuestaActual);
  blackjackEnJuego = true;
  blackjackCartasJugador = [obtenerCartaAleatoria(), obtenerCartaAleatoria()];
  blackjackCartasCrupier = [obtenerCartaAleatoria(), obtenerCartaAleatoria()];
  renderizarCartasBlackjack(false);
  if (btnRepartir) btnRepartir.disabled = true;
  if (btnPedir) btnPedir.disabled = false;
  if (btnPlantarse) btnPlantarse.disabled = false;
  const puntosJ = calcularPuntosBlackjack(blackjackCartasJugador);
  if (puntosJ === 21) {
    finalizarBlackjack("blackjack");
  } else {
    if (elMensaje) {
      elMensaje.textContent = `Mano repartida. Tienes ${puntosJ} puntos. \xBFDeseas pedir carta o plantarte?`;
      elMensaje.className = "mensaje-resultado";
    }
  }
}
function pedirCartaBlackjack() {
  if (!blackjackEnJuego) return;
  blackjackCartasJugador.push(obtenerCartaAleatoria());
  renderizarCartasBlackjack(false);
  const puntos = calcularPuntosBlackjack(blackjackCartasJugador);
  if (puntos > 21) {
    finalizarBlackjack("pasado");
  }
}
function plantarseBlackjack() {
  if (!blackjackEnJuego) return;
  let puntosC = calcularPuntosBlackjack(blackjackCartasCrupier);
  while (puntosC < 17) {
    blackjackCartasCrupier.push(obtenerCartaAleatoria());
    puntosC = calcularPuntosBlackjack(blackjackCartasCrupier);
  }
  renderizarCartasBlackjack(true);
  const puntosJ = calcularPuntosBlackjack(blackjackCartasJugador);
  if (puntosC > 21) {
    finalizarBlackjack("crupier_pasado");
  } else if (puntosJ > puntosC) {
    finalizarBlackjack("gana_jugador");
  } else if (puntosJ === puntosC) {
    finalizarBlackjack("empate");
  } else {
    finalizarBlackjack("gana_crupier");
  }
}
function finalizarBlackjack(resultado) {
  blackjackEnJuego = false;
  renderizarCartasBlackjack(true);
  const elMensaje = document.getElementById("mensaje-resultado-juego");
  const btnRepartir = document.getElementById("btn-bj-repartir");
  const btnPedir = document.getElementById("btn-bj-pedir");
  const btnPlantarse = document.getElementById("btn-bj-plantarse");
  if (btnRepartir) btnRepartir.disabled = false;
  if (btnPedir) btnPedir.disabled = true;
  if (btnPlantarse) btnPlantarse.disabled = true;
  if (resultado === "blackjack") {
    const premio = Math.round(apuestaActual * 2.5);
    modificarSaldo(premio);
    if (elMensaje) {
      elMensaje.textContent = `\xA1BLACKJACK NATURAL! Pago 3 a 2. Ganaste ${formatearDinero(premio)}.`;
      elMensaje.className = "mensaje-resultado ganador";
    }
  } else if (resultado === "crupier_pasado" || resultado === "gana_jugador") {
    const premio = apuestaActual * 2;
    modificarSaldo(premio);
    if (elMensaje) {
      elMensaje.textContent = `\xA1GANASTE LA MANO! Pago 1 a 1. Acreditado: ${formatearDinero(premio)}.`;
      elMensaje.className = "mensaje-resultado ganador";
    }
  } else if (resultado === "empate") {
    modificarSaldo(apuestaActual);
    if (elMensaje) {
      elMensaje.textContent = `Empate (Push). Se te devuelve tu apuesta de ${formatearDinero(apuestaActual)}.`;
      elMensaje.className = "mensaje-resultado";
    }
  } else {
    if (elMensaje) {
      elMensaje.textContent = resultado === "pasado" ? "Te pasaste de 21 puntos. Gana la casa." : "El crupier gana esta mano.";
      elMensaje.className = "mensaje-resultado";
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("nombre-juego") || target.closest(".nombre-juego")) {
      e.preventDefault();
      const elEnlace = target.classList.contains("nombre-juego") ? target : target.closest(".nombre-juego");
      const id = elEnlace.dataset.id;
      if (id) abrirJuegoPorId(id);
    }
    if (target.classList.contains("btn-jugar-tarjeta")) {
      e.preventDefault();
      const id = target.dataset.id;
      if (id) abrirJuegoPorId(id);
    }
  });
  document.querySelectorAll("[data-destino]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const destino = btn.dataset.destino;
      if (destino) mostrarPantalla(destino);
    });
  });
  const btnJuegoRetirar = document.getElementById("btn-juego-ir-retirar");
  const btnJuegoCargar = document.getElementById("btn-juego-ir-cargar");
  const btnJuegoInfRetirar = document.getElementById("btn-juego-inferior-retirar");
  const btnJuegoInfCargar = document.getElementById("btn-juego-inferior-cargar");
  if (btnJuegoRetirar) {
    btnJuegoRetirar.addEventListener("click", () => mostrarPantalla("cajero"));
  }
  if (btnJuegoCargar) {
    btnJuegoCargar.addEventListener("click", () => mostrarPantalla("cargar-dinero"));
  }
  if (btnJuegoInfRetirar) {
    btnJuegoInfInfRetirarClick();
  }
  if (btnJuegoInfCargar) {
    btnJuegoInfCargar.addEventListener("click", () => mostrarPantalla("cargar-dinero"));
  }
  function btnJuegoInfInfRetirarClick() {
    if (btnJuegoInfRetirar) {
      btnJuegoInfRetirar.addEventListener("click", () => mostrarPantalla("cajero"));
    }
  }
  const btnSwitchRetiros = document.getElementById("btn-switch-a-retiros");
  const btnSwitchCargar = document.getElementById("btn-switch-a-cargar");
  if (btnSwitchRetiros) btnSwitchRetiros.addEventListener("click", () => mostrarPantalla("cajero"));
  if (btnSwitchCargar) btnSwitchCargar.addEventListener("click", () => mostrarPantalla("cargar-dinero"));
  const btnPostJuego = document.getElementById("btn-post-ir-juego");
  const btnPostCatalogo = document.getElementById("btn-post-ir-catalogo");
  const btnPostRetiros = document.getElementById("btn-post-ir-retiros");
  if (btnPostJuego) btnPostJuego.addEventListener("click", () => mostrarPantalla("juego"));
  if (btnPostCatalogo) btnPostCatalogo.addEventListener("click", () => mostrarPantalla("catalogo"));
  if (btnPostRetiros) btnPostRetiros.addEventListener("click", () => mostrarPantalla("cajero"));
  const inputCargarMonto = document.getElementById("cargar-monto");
  document.querySelectorAll(".btn-monto-rapido").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-monto-rapido").forEach((b) => b.classList.remove("activa"));
      btn.classList.add("activa");
      const monto = btn.dataset.monto;
      if (monto && inputCargarMonto) {
        inputCargarMonto.value = monto;
      }
    });
  });
  const formCargarDinero = document.getElementById("form-cargar-dinero");
  const mensajeCargar = document.getElementById("mensaje-cargar-dinero");
  const accionesPostCarga = document.getElementById("acciones-post-carga");
  const tablaHistorialCargas = document.getElementById("cuerpo-historial-cargas");
  if (formCargarDinero) {
    formCargarDinero.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectMetodo = document.getElementById("cargar-metodo");
      const selectBono = document.getElementById("cargar-bono");
      const monto = parseFloat(inputCargarMonto?.value || "0");
      if (isNaN(monto) || monto < 10) {
        if (mensajeCargar) {
          mensajeCargar.style.display = "block";
          mensajeCargar.className = "mensaje-resultado";
          mensajeCargar.textContent = "El monto m\xEDnimo de carga es de $10.00 USD.";
        }
        return;
      }
      let bonoMonto = 0;
      let detalleBono = "";
      if (selectBono.value === "bono-100") {
        bonoMonto = Math.min(monto, 500);
        detalleBono = ` (+${formatearDinero(bonoMonto)} de Bono 100%)`;
      } else if (selectBono.value === "bono-25") {
        bonoMonto = Math.round(monto * 0.25);
        detalleBono = ` (+${formatearDinero(bonoMonto)} de Bono VIP 25%)`;
      }
      const totalAcreditado = monto + bonoMonto;
      saldoUsuario += totalAcreditado;
      saldoRetirable += monto;
      guardarStorage("casino_ucc_saldo", saldoUsuario);
      guardarStorage("casino_ucc_saldo_retirable", saldoRetirable);
      actualizarUI();
      if (mensajeCargar) {
        mensajeCargar.style.display = "block";
        mensajeCargar.className = "mensaje-resultado ganador";
        mensajeCargar.textContent = `\xA1Carga exitosa! Se han acreditado ${formatearDinero(totalAcreditado)}${detalleBono} en tu cuenta mediante ${selectMetodo.value}.`;
      }
      if (accionesPostCarga) {
        accionesPostCarga.style.display = "flex";
      }
      if (tablaHistorialCargas) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>DEP-${Math.floor(1e3 + Math.random() * 9e3)}</td>
          <td>${formatearDinero(totalAcreditado)}</td>
          <td>${selectMetodo.value.split("(")[0].trim()}</td>
          <td><span style="color:#69f0ae; font-weight:700;">Acreditado</span></td>
          <td>Hoy ${(/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        `;
        tablaHistorialCargas.prepend(fila);
      }
    });
  }
  const formAuth = document.getElementById("form-autenticacion");
  if (formAuth) {
    formAuth.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputUser = document.getElementById("auth-usuario");
      if (inputUser && inputUser.value.trim()) {
        usuarioActual = inputUser.value.trim();
      }
      mostrarPantalla("catalogo");
    });
  }
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const btnAuthSubmit = document.getElementById("btn-auth-submit");
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("activa");
      tabRegister.classList.remove("activa");
      if (btnAuthSubmit) btnAuthSubmit.textContent = "Ingresar al Casino";
    });
    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("activa");
      tabLogin.classList.remove("activa");
      if (btnAuthSubmit) btnAuthSubmit.textContent = "Crear Cuenta y Reclamar Bono";
    });
  }
  const btnVolver = document.getElementById("btn-volver-catalogo");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      mostrarPantalla("catalogo");
    });
  }
  const btnModoReal = document.getElementById("btn-modo-real");
  const btnModoDemo = document.getElementById("btn-modo-demo");
  if (btnModoReal && btnModoDemo) {
    btnModoReal.addEventListener("click", () => {
      modoDemo = false;
      btnModoReal.classList.add("activo");
      btnModoDemo.classList.remove("activo");
      actualizarUI();
    });
    btnModoDemo.addEventListener("click", () => {
      modoDemo = true;
      btnModoDemo.classList.add("activo");
      btnModoReal.classList.remove("activo");
      actualizarUI();
    });
  }
  const btnApuestaMenos = document.getElementById("btn-apuesta-menos");
  const btnApuestaMas = document.getElementById("btn-apuesta-mas");
  const btnApuestaMax = document.getElementById("btn-apuesta-max");
  if (btnApuestaMenos) {
    btnApuestaMenos.addEventListener("click", () => {
      apuestaActual = Math.max(5, apuestaActual - 5);
      actualizarUI();
    });
  }
  if (btnApuestaMas) {
    btnApuestaMas.addEventListener("click", () => {
      apuestaActual = Math.min(500, apuestaActual + 5);
      actualizarUI();
    });
  }
  if (btnApuestaMax) {
    btnApuestaMax.addEventListener("click", () => {
      apuestaActual = 500;
      actualizarUI();
    });
  }
  const btnGirarSlot = document.getElementById("btn-girar-slot");
  if (btnGirarSlot) {
    btnGirarSlot.addEventListener("click", girarTragamonedas);
  }
  inicializarTableroRuleta();
  const btnGirarRuleta = document.getElementById("btn-girar-ruleta");
  if (btnGirarRuleta) {
    btnGirarRuleta.addEventListener("click", girarRuleta);
  }
  const btnBjRepartir = document.getElementById("btn-bj-repartir");
  const btnBjPedir = document.getElementById("btn-bj-pedir");
  const btnBjPlantarse = document.getElementById("btn-bj-plantarse");
  if (btnBjRepartir) btnBjRepartir.addEventListener("click", iniciarBlackjack);
  if (btnBjPedir) btnBjPedir.addEventListener("click", pedirCartaBlackjack);
  if (btnBjPlantarse) btnBjPlantarse.addEventListener("click", plantarseBlackjack);
  document.querySelectorAll(".btn-categoria, .btn-filtro").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-categoria, .btn-filtro").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      const cat = btn.dataset.categoria;
      document.querySelectorAll(".tarjeta-juego").forEach((tj) => {
        const catJuego = tj.dataset.categoria;
        if (cat === "todos" || catJuego === cat) {
          tj.style.display = "flex";
        } else {
          tj.style.display = "none";
        }
      });
    });
  });
  const inputBuscador = document.getElementById("buscador-juegos");
  if (inputBuscador) {
    inputBuscador.addEventListener("input", () => {
      const q = inputBuscador.value.toLowerCase();
      document.querySelectorAll(".tarjeta-juego").forEach((tj) => {
        const texto = tj.textContent?.toLowerCase() || "";
        tj.style.display = texto.includes(q) ? "flex" : "none";
      });
    });
  }
  const formRetiro = document.getElementById("form-retiro");
  const mensajeCajero = document.getElementById("mensaje-cajero");
  const tablaHistorial = document.getElementById("cuerpo-historial-retiros");
  if (formRetiro) {
    formRetiro.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputMonto = document.getElementById("retiro-monto");
      const selectCuenta = document.getElementById("retiro-cuenta");
      const monto = parseFloat(inputMonto.value);
      if (isNaN(monto) || monto <= 0) {
        if (mensajeCajero) mensajeCajero.textContent = "Por favor ingresa un monto v\xE1lido.";
        return;
      }
      if (monto > saldoRetirable) {
        if (mensajeCajero) mensajeCajero.textContent = "El monto supera tu saldo retirable disponible.";
        return;
      }
      saldoUsuario -= monto;
      saldoRetirable -= monto;
      guardarStorage("casino_ucc_saldo", saldoUsuario);
      guardarStorage("casino_ucc_saldo_retirable", saldoRetirable);
      actualizarUI();
      if (mensajeCajero) {
        mensajeCajero.textContent = `\xA1Solicitud de retiro por ${formatearDinero(monto)} a ${selectCuenta.value} enviada con \xE9xito!`;
        mensajeCajero.style.color = "#69f0ae";
      }
      if (tablaHistorial) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>REQ-${Math.floor(1e3 + Math.random() * 9e3)}</td>
          <td>${formatearDinero(monto)}</td>
          <td>${selectCuenta.value}</td>
          <td><span style="color:#ffd166; font-weight:700;">Procesando</span></td>
          <td>Hoy ${(/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        `;
        tablaHistorial.prepend(fila);
      }
      inputMonto.value = "100";
    });
  }
  const params = new URLSearchParams(window.location.search);
  const idDesdeUrl = params.get("id") || params.get("juego");
  const bodyJuegoId = document.body.dataset.juegoId;
  const idGuardado = (function() {
    try {
      return localStorage.getItem("casino_ucc_juego_id");
    } catch (e) {
      return null;
    }
  })();
  const targetJuegoId = idDesdeUrl || bodyJuegoId || idGuardado || "gates-of-olympus";
  if (document.getElementById("pantalla-juego")) {
    abrirJuegoPorId(targetJuegoId);
  } else if (document.getElementById("pantalla-autenticacion")) {
    mostrarPantalla("autenticacion");
  } else {
    actualizarUI();
  }
});
