/**
 * Leitura e agregação da pulseira/cinta cardíaca por Bluetooth (perfil GATT
 * Heart Rate, característica 0x2A37), usadas pelo painel e pela central de
 * dispositivos (tarefa 40).
 */

export interface MedicaoDeFrequencia {
  /** Frequência cardíaca em bpm. */
  fc: number;
  /** Intervalos RR em milissegundos (podem vir vários por notificação). */
  rr: number[];
}

/**
 * Interpreta uma notificação Heart Rate Measurement conforme a especificação
 * do Bluetooth SIG: bit 0 = FC em 16 bits; bit 3 = "energia gasta" presente
 * (2 bytes, vem antes dos RR); bit 4 = intervalos RR presentes (1/1024 s).
 * As versões anteriores ignoravam o bit 3 e liam a energia como se fosse RR
 * nos aparelhos que a enviam.
 */
export function lerMedicaoDeFrequencia(valor: DataView): MedicaoDeFrequencia {
  if (valor.byteLength < 2) {
    throw new Error('Medição de frequência cardíaca incompleta.');
  }
  const flags = valor.getUint8(0);
  const fc16Bits = (flags & 0x01) !== 0;
  const temEnergia = (flags & 0x08) !== 0;
  const temRr = (flags & 0x10) !== 0;

  let cursor = 1;
  if (fc16Bits && valor.byteLength < 3) {
    throw new Error('Medição de frequência cardíaca incompleta.');
  }
  const fc = fc16Bits ? valor.getUint16(cursor, true) : valor.getUint8(cursor);
  cursor += fc16Bits ? 2 : 1;
  if (temEnergia) {
    cursor += 2;
  }

  const rr: number[] = [];
  if (temRr) {
    while (cursor + 1 < valor.byteLength) {
      rr.push((valor.getUint16(cursor, true) * 1000) / 1024);
      cursor += 2;
    }
  }
  return { fc, rr };
}

export interface ResumoDaSessao {
  minutos: number;
  amostras: number;
  fcMinima: number;
  fcMaxima: number;
  fcMedia: number;
  /** Menor média móvel de 60 s (null em sessões com menos de 1 minuto). */
  fcRepousoEstimada: number | null;
  /** RMSSD dos intervalos RR válidos (null com menos de 30 diferenças). */
  rmssd: number | null;
}

const JANELA_DE_REPOUSO_MS = 60_000;
const MINIMO_DE_DIFERENCAS_RR = 30;
const FC_MINIMA_VALIDA = 25;
const FC_MAXIMA_VALIDA = 240;

/** Intervalo RR fisiologicamente plausível (30 a 200 bpm). */
function rrValido(rr: number) {
  return rr >= 300 && rr <= 2000;
}

/**
 * Agrega uma sessão: extremos e média da FC, frequência de repouso estimada e
 * VFC (RMSSD). Diferenças entre RR consecutivos acima de 20% são tratadas
 * como artefato (batimento perdido ou extra) e descartadas, como nas
 * recomendações de limpeza de RR para VFC de curta duração.
 */
export class AgregadorDaSessao {
  private amostras: Array<{ instante: number; fc: number }> = [];
  private rrAnterior: number | null = null;
  private somaDosQuadrados = 0;
  private diferencas = 0;

  adicionar(medicao: MedicaoDeFrequencia, instante: number) {
    if (medicao.fc >= FC_MINIMA_VALIDA && medicao.fc <= FC_MAXIMA_VALIDA) {
      this.amostras.push({ instante, fc: medicao.fc });
    }
    for (const rr of medicao.rr) {
      if (!rrValido(rr)) {
        this.rrAnterior = null;
        continue;
      }
      if (this.rrAnterior !== null) {
        const diferenca = rr - this.rrAnterior;
        if (Math.abs(diferenca) <= this.rrAnterior * 0.2) {
          this.somaDosQuadrados += diferenca * diferenca;
          this.diferencas += 1;
        }
      }
      this.rrAnterior = rr;
    }
  }

  get totalDeAmostras() {
    return this.amostras.length;
  }

  resumo(): ResumoDaSessao | null {
    if (this.amostras.length < 5) return null;
    const inicio = this.amostras[0].instante;
    const fim = this.amostras[this.amostras.length - 1].instante;
    const duracao = fim - inicio;
    if (duracao < 15_000) return null;

    let minima = Infinity;
    let maxima = -Infinity;
    let soma = 0;
    for (const { fc } of this.amostras) {
      minima = Math.min(minima, fc);
      maxima = Math.max(maxima, fc);
      soma += fc;
    }

    // Menor média de uma janela deslizante de 60 s (dois ponteiros).
    let repouso: number | null = null;
    if (duracao >= JANELA_DE_REPOUSO_MS) {
      let esquerda = 0;
      let somaDaJanela = 0;
      for (let direita = 0; direita < this.amostras.length; direita++) {
        somaDaJanela += this.amostras[direita].fc;
        // Janela meio-aberta de 60 s: [t - 60 s, t].
        while (
          this.amostras[direita].instante - this.amostras[esquerda].instante >=
          JANELA_DE_REPOUSO_MS
        ) {
          somaDaJanela -= this.amostras[esquerda].fc;
          esquerda += 1;
        }
        const cobertura =
          this.amostras[direita].instante - this.amostras[esquerda].instante;
        if (cobertura >= JANELA_DE_REPOUSO_MS * 0.9) {
          const media = somaDaJanela / (direita - esquerda + 1);
          repouso = repouso === null ? media : Math.min(repouso, media);
        }
      }
    }

    return {
      minutos: Math.round((duracao / 60_000) * 10) / 10,
      amostras: this.amostras.length,
      fcMinima: minima,
      fcMaxima: maxima,
      fcMedia: Math.round((soma / this.amostras.length) * 10) / 10,
      fcRepousoEstimada:
        repouso === null
          ? null
          : Math.min(maxima, Math.max(minima, Math.round(repouso * 10) / 10)),
      rmssd:
        this.diferencas >= MINIMO_DE_DIFERENCAS_RR
          ? Math.round(
              Math.sqrt(this.somaDosQuadrados / this.diferencas) * 10
            ) / 10
          : null,
    };
  }

  /** RMSSD parcial para exibição ao vivo (a partir de 2 diferenças). */
  rmssdAoVivo(): number | null {
    return this.diferencas >= 2
      ? Math.round(Math.sqrt(this.somaDosQuadrados / this.diferencas))
      : null;
  }

  zerar() {
    this.amostras = [];
    this.rrAnterior = null;
    this.somaDosQuadrados = 0;
    this.diferencas = 0;
  }
}
