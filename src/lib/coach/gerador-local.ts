import { getAstrologicalContext } from '@/lib/astrology/engine';
import {
  calcularPanchang,
  type Intervalo,
  type Panchang,
  type PeriodoDoChoghadiya,
} from '@/lib/astrology/panchang';
import {
  diaVedicoDoPerfil,
  mapaDoPerfil,
} from '@/lib/astrology/perfil-astrologico';
import { NAKSHATRAS } from '@/lib/astrology/sideral';
import { horaLocal, localParaUtc, partesLocais } from '@/lib/astrology/tempo';
import { calculateDynamicDosha } from '@/lib/ayurveda/dosha-engine';
import { calculateMenstrualCycle } from '@/lib/cycle/menstrual-engine';
import { evaluateEarlyWarning } from '@/lib/health/early-warning-engine';

import {
  DOSHA_INFO,
  grupoDoTithi,
  NAKSHATRA_INFO,
  NATUREZA,
  respiracaoDoDia,
  VARA_INFO,
} from './conhecimento';
import type { ContextoDoCoach, MetricasDoCoach } from './contexto';
import { calcularPeriodos } from './periodos';
import { calcularProntidao, formatarDuracao } from './prontidao';
import type { BriefingDoDia, Dica, Periodo, Qualidade, Tom } from './tipos';

/**
 * Motor local do coach: monta o "Seu dia" a partir do Panchang do lugar onde
 * a pessoa mora, do mapa natal (Tara Bala, Chandra Bala, dasha), das métricas
 * reais (prontidão, sinais precoces, sono, hidratação), do dosha do dia e do
 * ciclo menstrual quando acompanhado. Determinístico: as mesmas entradas
 * produzem o mesmo briefing, e cada dica traz o "porquê" de onde veio.
 */

const HORA = 3_600_000;

function sobrepoe(a: Intervalo, b: Intervalo) {
  return (
    Math.min(a.fim.getTime(), b.fim.getTime()) >
    Math.max(a.inicio.getTime(), b.inicio.getTime())
  );
}

function primeiraMaiuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function diaAnterior(data: string) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - 1);
  return instante.toISOString().slice(0, 10);
}

function media(valores: Array<number | null>) {
  const validos = valores.filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0
  );
  return validos.length === 0
    ? null
    : validos.reduce((soma, v) => soma + v, 0) / validos.length;
}

/** Valor de hoje ou, sem ele, o mais recente dos dias anteriores. */
function maisRecente(
  hoje: MetricasDoCoach | null,
  historico: MetricasDoCoach[],
  coluna: 'weight_kg'
) {
  const atual = hoje?.[coluna] ?? null;
  if (atual) return atual;
  return historico.find((dia) => dia[coluna])?.[coluna] ?? null;
}

const PESO_DA_QUALIDADE: Record<Qualidade, number> = {
  favoravel: 1,
  neutro: 0,
  desfavoravel: -1,
};

// Ordem tradicional de força para começar algo importante.
const ORDEM_DAS_JANELAS = ['Abhijit Muhurta', 'Amrit', 'Shubh', 'Labh'];

interface Janelas {
  melhor: (Intervalo & { nome: string; sentido: string }) | null;
  movimento: (Intervalo & { nome: string; sentido: string }) | null;
}

function escolherJanelas(
  panchang: Panchang,
  dominante: 'vata' | 'pitta' | 'kapha',
  fuso: string
): Janelas {
  const cautelas = [
    { ...panchang.rahuKalam, nome: 'Rahu Kalam' },
    { ...panchang.yamaganda, nome: 'Yamaganda' },
    { ...panchang.gulikaKalam, nome: 'Gulika Kalam' },
  ];
  const livre = (intervalo: Intervalo) =>
    !cautelas.some((cautela) => sobrepoe(cautela, intervalo));

  const candidatas: Array<Intervalo & { nome: string; sentido: string }> = [];
  if (panchang.abhijitMuhurta.valido && livre(panchang.abhijitMuhurta)) {
    candidatas.push({
      inicio: panchang.abhijitMuhurta.inicio,
      fim: panchang.abhijitMuhurta.fim,
      nome: 'Abhijit Muhurta',
      sentido: 'o muhurta mais forte do dia para começar e decidir',
    });
  }
  for (const c of panchang.choghadiyaDoDia) {
    if (c.qualidade === 'favoravel' && livre(c)) {
      candidatas.push({
        inicio: c.inicio,
        fim: c.fim,
        nome: c.nome,
        sentido: `Choghadiya ${c.nome}: ${c.significado}`,
      });
    }
  }
  candidatas.sort(
    (a, b) =>
      ORDEM_DAS_JANELAS.indexOf(a.nome) - ORDEM_DAS_JANELAS.indexOf(b.nome) ||
      a.inicio.getTime() - b.inicio.getTime()
  );

  // Movimento: Choghadiya favorável ou Char (movimento) fora das janelas de
  // cautela, com a preferência ayurvédica do dosha do dia: Kapha cedo
  // (antes das 10 h), Pitta fora do calor (11 h às 15 h), Vata em qualquer
  // horário regular (de preferência de manhã).
  const horaDe = (instante: Date) => partesLocais(instante, fuso).hora;
  const preferencia = (c: PeriodoDoChoghadiya) => {
    const h = horaDe(c.inicio);
    if (dominante === 'kapha') return h < 10 ? 0 : 1;
    if (dominante === 'pitta') return h >= 11 && h < 15 ? 2 : 0;
    return h < 12 ? 0 : 1;
  };
  // Com alternativas equivalentes, o treino fica fora da melhor janela de
  // foco, para as duas não disputarem o mesmo horário.
  const melhor = candidatas[0] ?? null;
  const ocupaOFoco = (c: PeriodoDoChoghadiya) =>
    melhor !== null && sobrepoe(c, melhor) ? 1 : 0;
  const paraMovimento = panchang.choghadiyaDoDia
    .filter(
      (c) => (c.qualidade === 'favoravel' || c.nome === 'Char') && livre(c)
    )
    .sort(
      (a, b) =>
        preferencia(a) - preferencia(b) ||
        ocupaOFoco(a) - ocupaOFoco(b) ||
        a.inicio.getTime() - b.inicio.getTime()
    );
  const movimento = paraMovimento[0]
    ? {
        inicio: paraMovimento[0].inicio,
        fim: paraMovimento[0].fim,
        nome: paraMovimento[0].nome,
        sentido: `Choghadiya ${paraMovimento[0].nome}: ${paraMovimento[0].significado}`,
      }
    : null;

  return { melhor, movimento };
}

function sugestaoDoPeriodo(
  periodo: Periodo,
  prontidao: number | null,
  hora: (d: Date) => string
): string {
  const brahma = periodo.destaques.find((d) => d.tipo === 'brahma_muhurta');
  const abhijit = periodo.destaques.find((d) => d.tipo === 'abhijit');
  const rahu = periodo.cuidados.find((d) => d.tipo === 'rahu_kalam');
  const favoravel = periodo.destaques.find(
    (d) => d.tipo === 'choghadiya' && d.qualidade === 'favoravel'
  );

  if (periodo.chave === 'madrugada') {
    return brahma
      ? `Se acordar cedo, use o Brahma Muhurta (${brahma.horario}) para respiração e a intenção do dia; antes disso, o sono profundo é a prioridade.`
      : 'O sono profundo é a prioridade: quarto escuro, fresco e sem telas.';
  }

  if (periodo.chave === 'noite') {
    const base =
      'Desacelere depois do pôr do sol: jantar leve e luz baixa ajudam o corpo a preparar o sono.';
    return periodo.qualidade === 'favoravel'
      ? `${base} Noite boa para convivência e práticas contemplativas.`
      : base;
  }

  // Pedaços de Rahu Kalam com menos de 15 minutos no período não viram aviso
  // (o trecho principal aparece no período vizinho).
  const pausa =
    rahu &&
    new Date(rahu.fim).getTime() - new Date(rahu.inicio).getTime() >=
      15 * 60_000
      ? ` Entre ${rahu.horario} (Rahu Kalam), fique na rotina.`
      : '';
  if (periodo.qualidade === 'favoravel') {
    const janela = abhijit ?? favoravel;
    const foco = janela
      ? `Melhor trecho para foco e começos: ${janela.horario}.`
      : 'Bom período para foco e começos.';
    const corpo =
      prontidao !== null && prontidao >= 75
        ? ' Corpo pronto: cabe o treino mais exigente do dia.'
        : '';
    return `${foco}${corpo}${pausa}`;
  }
  if (periodo.qualidade === 'neutro') {
    const janela = abhijit ?? favoravel;
    return `Bom para rotina e tarefas práticas${
      janela ? `; se precisar decidir algo, prefira ${janela.horario}` : ''
    }.${pausa}`;
  }
  const fimDoPior = periodo.cuidados.reduce<Date | null>((ultimo, c) => {
    const fim = new Date(c.fim);
    return !ultimo || fim > ultimo ? fim : ultimo;
  }, null);
  return `Período de cautela: tarefas leves e conhecidas, sem decisões grandes${
    fimDoPior ? ` (até ${hora(fimDoPior)})` : ''
  }.`;
}

export interface EntradaDoGerador {
  contexto: ContextoDoCoach;
  agora: Date;
}

export function gerarBriefingLocal({
  contexto,
  agora,
}: EntradaDoGerador): BriefingDoDia {
  const { data, perfil, pessoa, hoje, historico } = contexto;
  const lugar = perfil.localDoDia;
  const fuso = lugar.fuso;
  const hora = (instante: Date) => horaLocal(instante, fuso);

  const mapa = mapaDoPerfil(perfil, agora);
  const dia = diaVedicoDoPerfil(perfil, mapa, data);
  if (!dia) {
    throw new Error('Perfil sem local do dia: o briefing não se aplica.');
  }
  const panchang = dia.panchang;
  const ontem = calcularPanchang({
    data: diaAnterior(data),
    latitude: lugar.latitude,
    longitude: lugar.longitude,
    fuso,
  });

  // ---------------------------------------------------------------- corpo
  const prontidao = calcularProntidao(hoje, historico);
  const sinais = evaluateEarlyWarning(hoje, historico);

  const snapshot = {
    hrv_ms: hoje?.hrv_ms ?? null,
    resting_heart_rate: hoje?.resting_heart_rate ?? null,
    body_temperature_celsius: hoje?.body_temperature_celsius ?? null,
    sleep_duration_minutes: hoje?.sleep_duration_minutes ?? null,
    deep_sleep_minutes: hoje?.deep_sleep_minutes ?? null,
    active_minutes: hoje?.active_minutes ?? null,
    sedentary_hours: hoje?.sedentary_hours ?? null,
    blood_glucose_mgdl: hoje?.blood_glucose_mgdl ?? null,
    weight_kg: maisRecente(hoje, historico, 'weight_kg'),
    stress_score: hoje?.stress_score ?? null,
    water_liters: hoje?.water_liters ?? null,
    respiratory_rate: hoje?.respiratory_rate ?? null,
    mood_score: hoje?.mood_score ?? null,
  };
  const medidos = Object.entries(snapshot).filter(
    ([chave, valor]) => chave !== 'weight_kg' && valor !== null
  ).length;
  const astro = getAstrologicalContext(panchang.nascerDoSol, {
    birth_date: perfil.nascimento.data,
    birth_time: perfil.nascimento.hora,
    birth_location: perfil.nascimento.local?.rotulo ?? null,
    birth_latitude: perfil.nascimento.local?.latitude ?? null,
    birth_longitude: perfil.nascimento.local?.longitude ?? null,
    birth_timezone: perfil.nascimento.local?.fuso ?? null,
  });
  const resultadoDoDosha = calculateDynamicDosha(snapshot, astro);
  const dominante = resultadoDoDosha.dominant;
  const dosha = DOSHA_INFO[dominante];
  const baseDoDosha: 'metricas' | 'lua' = medidos >= 3 ? 'metricas' : 'lua';
  const porqueDoDosha =
    baseDoDosha === 'metricas'
      ? `${dosha.nome} está mais alto hoje pelos seus sinais do dia e pela Lua em ${panchang.signoDaLua.nome}`
      : `sem sinais suficientes do corpo hoje, o dosha do dia vem da Lua em ${panchang.signoDaLua.nome} (${dosha.nome})`;

  const ciclo = pessoa.ciclo
    ? calculateMenstrualCycle(new Date(`${data}T12:00:00`), pessoa.ciclo)
    : null;
  const cicloAtivo = ciclo && ciclo.lifeStage !== 'sem_ciclo' ? ciclo : null;

  // ----------------------------------------------------------------- céu
  const natureza = NAKSHATRA_INFO[panchang.nakshatra.indice];
  const sentidoDaNatureza = NATUREZA[natureza.natureza];
  const vara = VARA_INFO[panchang.vara.indice];
  const numeroNoPaksha = (panchang.tithi.indice % 15) + 1;
  const grupo = grupoDoTithi(numeroNoPaksha);
  const ekadashi = numeroNoPaksha === 11;
  const pessoal = dia.pessoal;
  const proximoNakshatra = NAKSHATRAS[(panchang.nakshatra.indice + 1) % 27];

  const trocaDeNakshatra =
    panchang.nakshatra.termina < panchang.proximoNascerDoSol
      ? {
          instante: panchang.nakshatra.termina,
          descricao: pessoal?.taraDepois
            ? `A Lua entra em ${proximoNakshatra}: para você, Tara ${pessoal.taraDepois.nome} (${pessoal.taraDepois.sentido}).`
            : `A Lua entra em ${proximoNakshatra}.`,
        }
      : null;

  const periodosBase = calcularPeriodos({
    data,
    fuso,
    hoje: panchang,
    ontem,
    trocaDeNakshatra,
  });
  const periodos = periodosBase.map((periodo) => ({
    ...periodo,
    sugestao: sugestaoDoPeriodo(periodo, prontidao.valor, hora),
  }));

  // "até 16:43" só quando termina hoje; depois da meia-noite local vale o dia.
  const fimDoDiaLocal = new Date(periodos[periodos.length - 1].fim);
  const ate = (instante: Date) =>
    instante >= fimDoDiaLocal ? 'durante todo o dia' : `até ${hora(instante)}`;

  const janelas = escolherJanelas(panchang, dominante, fuso);
  const rahu = panchang.rahuKalam;

  // -------------------------------------------------------------- tom do dia
  let pontos = 0;
  if (pessoal) {
    pontos += PESO_DA_QUALIDADE[pessoal.tara.qualidade];
    pontos += pessoal.chandra.chandrashtama
      ? -2
      : pessoal.chandra.qualidade === 'favoravel'
        ? 0.5
        : 0;
  }
  pontos += panchang.yoga.qualidade === 'desfavoravel' ? -0.5 : 0.25;
  if (panchang.karana.qualidade === 'desfavoravel') pontos -= 0.5;
  if (grupo.nome === 'Rikta') pontos -= 0.5;
  const diurnos = periodos.filter(
    (p) => p.chave === 'manha' || p.chave === 'tarde'
  );
  if (diurnos.length > 0) {
    const mediaDiurna =
      diurnos.reduce((soma, p) => soma + p.nota, 0) / diurnos.length;
    pontos += (mediaDiurna - 50) / 50;
  }

  const chandrashtama = pessoal?.chandra.chandrashtama ?? false;
  const prontidaoBaixa = prontidao.valor !== null && prontidao.valor < 40;
  const corpoEmAlerta = sinais.overall === 'atencao';
  let tom: Tom = 'misto';
  if (chandrashtama || prontidaoBaixa || corpoEmAlerta || pontos <= -1.5) {
    tom = 'atencao';
  } else if (
    pontos >= 1 &&
    (prontidao.valor === null || prontidao.valor >= 60)
  ) {
    tom = 'favoravel';
  }

  let manchete: string;
  if (tom === 'atencao') {
    manchete = prontidaoBaixa
      ? 'Seu corpo pede recuperação hoje'
      : corpoEmAlerta
        ? 'Sinais do seu corpo pedem cuidado hoje'
        : chandrashtama
          ? 'Dia de cautela: a Lua passa pelo seu 8º signo'
          : 'Dia de cautela: avance devagar e escolha bem os horários';
  } else if (tom === 'favoravel') {
    manchete =
      prontidao.valor !== null && prontidao.valor >= 75
        ? 'Corpo pronto e céu a favor: dia de avançar'
        : 'Dia favorável para avançar no que importa';
  } else {
    manchete =
      prontidao.valor !== null && prontidao.valor >= 75
        ? 'Energia alta em um dia de céu misto: use os horários certos'
        : 'Dia de equilíbrio: escolha bem os horários';
  }

  const frases = [
    `A Lua em ${panchang.nakshatra.nome}, de natureza ${sentidoDaNatureza.nome.toLowerCase()}, favorece ${sentidoDaNatureza.favorece}.`,
  ];
  if (pessoal) {
    frases.push(
      `Para você, é um dia ${pessoal.tara.nome} (${pessoal.tara.sentido}).`
    );
  }
  frases.push(
    janelas.melhor
      ? `Melhor janela: ${hora(janelas.melhor.inicio)}–${hora(janelas.melhor.fim)}; cautela das ${hora(rahu.inicio)} às ${hora(rahu.fim)} (Rahu Kalam).`
      : `Cautela das ${hora(rahu.inicio)} às ${hora(rahu.fim)} (Rahu Kalam).`
  );
  if (prontidao.valor !== null) {
    frases.push(
      `Prontidão ${prontidao.valor}: ${prontidao.rotulo.toLowerCase()}.`
    );
  }

  // ------------------------------------------------------- relógio do dia
  const amanhecer = panchang.proximoNascerDoSol;
  // Oito horas antes do próximo nascer do sol, dentro de 21 h e 23 h.
  const dormirIdeal = new Date(amanhecer.getTime() - 8 * HORA);
  const limiteCedo = localParaUtc(data, '21:00', fuso);
  const limiteTarde = localParaUtc(data, '23:00', fuso);
  const dormir =
    dormirIdeal < limiteCedo
      ? limiteCedo
      : dormirIdeal > limiteTarde
        ? limiteTarde
        : dormirIdeal;
  const meioDiaSolar = new Date(
    (panchang.nascerDoSol.getTime() + panchang.porDoSol.getTime()) / 2
  );
  const ultimaCafeina = new Date(dormir.getTime() - 9 * HORA);
  const jantar = new Date(dormir.getTime() - 3 * HORA);

  // ---------------------------------------------------------- recomendações
  const saude: Dica[] = [];
  if (prontidao.valor !== null) {
    saude.push({
      texto: `Prontidão ${prontidao.valor}/100 (${prontidao.rotulo.toLowerCase()}).`,
      porque: `Calculada com os sinais registrados hoje: ${prontidao.base.join(', ')}.`,
    });
  }
  saude.push({
    texto: `Dia de ${vara.regente}: atenção a ${vara.corpo}. ${primeiraMaiuscula(vara.pratica)}.`,
    porque: `${panchang.vara.nome} é regido por ${vara.regente} na tradição védica.`,
  });
  saude.push({
    texto: `Pegue luz natural entre ${hora(panchang.nascerDoSol)} e ${hora(new Date(panchang.nascerDoSol.getTime() + HORA))}, de preferência ao ar livre.`,
    porque:
      'A luz da primeira hora após o nascer do sol ajusta o relógio biológico, melhora o humor do dia e o sono da noite.',
  });
  for (const sinal of sinais.signals.filter((s) => s.severity === 'info')) {
    saude.push({
      texto: `${sinal.title}: ${sinal.actionLabel.toLowerCase()}.`,
      porque: sinal.detail,
    });
  }

  const peso = maisRecente(hoje, historico, 'weight_kg');
  const alimentacao: Dica[] = [
    {
      texto: `${primeiraMaiuscula(dosha.alimentacao)}.`,
      porque: `${primeiraMaiuscula(porqueDoDosha)}. Evite: ${dosha.evite}.`,
    },
    {
      texto: `Faça a refeição principal perto do meio-dia solar (${hora(meioDiaSolar)}) e jante até ${hora(jantar)}.`,
      porque:
        'No Ayurveda, a digestão (Agni) é mais forte no meio do dia; jantar 3 h antes de deitar favorece o sono e a glicemia da noite.',
    },
  ];
  if (peso) {
    const metaDeAgua = Math.round(peso * 0.035 * 10) / 10;
    const bebido = hoje?.water_liters ?? null;
    alimentacao.push({
      texto:
        bebido !== null
          ? `Água: ${bebido.toLocaleString('pt-BR')} L registrados de ~${metaDeAgua.toLocaleString('pt-BR')} L para o seu peso.`
          : `Água: cerca de ${metaDeAgua.toLocaleString('pt-BR')} L ao longo do dia.`,
      porque: `Referência de 35 ml por kg de peso (${peso.toLocaleString('pt-BR')} kg), a ajustar com calor e treino.`,
    });
    const proteinaMinima = Math.round(peso * 1.2);
    const proteinaAlvo = Math.round(peso * 1.6);
    alimentacao.push({
      texto: `Proteína: ${proteinaMinima} a ${proteinaAlvo} g no dia, divididos em 3 ou 4 refeições.`,
      porque:
        'Faixa de 1,2 a 1,6 g/kg usada para preservar massa muscular com o passar dos anos, salvo orientação profissional diferente.',
    });
  }
  alimentacao.push({
    texto: `Última cafeína até ${hora(ultimaCafeina)}.`,
    porque:
      'A cafeína age por 6 a 9 horas; parar cedo protege o sono profundo de hoje à noite.',
  });
  if (ekadashi) {
    alimentacao.push({
      texto:
        'Ekadashi: a tradição sugere refeições mais leves, com menos grãos. É opcional: só se fizer sentido para você e sem contraindicação.',
      porque: `Hoje é o 11º tithi (${panchang.tithi.paksha}), dia tradicional de leveza digestiva.`,
    });
  }
  if (cicloAtivo) {
    alimentacao.push({
      texto: cicloAtivo.recommendation.nutrition,
      porque: `${cicloAtivo.phaseLabel}${cicloAtivo.cycleDay ? ` (dia ${cicloAtivo.cycleDay} do ciclo)` : ''}.`,
    });
  }

  const movimento: Dica[] = [];
  let intensidade: string;
  let porqueDaIntensidade: string;
  if (prontidao.valor === null) {
    intensidade =
      'Intensidade moderada (zona 2 por 30 a 45 min ou força técnica), ajustando pela sensação do corpo';
    porqueDaIntensidade =
      'Sem dados de recuperação suficientes hoje; registre sono, energia e humor para o coach calibrar.';
  } else if (prontidao.valor >= 75 && natureza.natureza === 'mridu') {
    // Corpo pronto em um dia suave: o céu pede leveza, então o treino forte
    // vira técnico, sem chegar à exaustão.
    intensidade =
      'Corpo pronto, dia suave: treino bem feito e técnico, de moderado a forte, sem chegar à exaustão';
    porqueDaIntensidade = `Prontidão ${prontidao.valor} (${prontidao.base.join(', ')}), mas a Lua em ${panchang.nakshatra.nome} é ${sentidoDaNatureza.nome.toLowerCase()} e pede evitar ${sentidoDaNatureza.evite}.`;
  } else if (prontidao.valor >= 75) {
    intensidade = 'Treino intenso cabe hoje: força pesada ou intervalado';
    porqueDaIntensidade = `Prontidão ${prontidao.valor}: ${prontidao.base.join(', ')}.`;
  } else if (prontidao.valor >= 55) {
    intensidade =
      'Treino moderado: zona 2 por 30 a 45 min ou força com carga técnica';
    porqueDaIntensidade = `Prontidão ${prontidao.valor}: recuperação parcial (${prontidao.base.join(', ')}).`;
  } else {
    intensidade =
      'Movimento leve: caminhada, mobilidade ou yoga; deixe o treino forte para outro dia';
    porqueDaIntensidade = `Prontidão ${prontidao.valor}: o corpo ainda está se recuperando (${prontidao.base.join(', ')}).`;
  }
  if (natureza.natureza === 'mridu' && (prontidao.valor ?? 0) < 75) {
    porqueDaIntensidade += ` A Lua em ${panchang.nakshatra.nome} é ${sentidoDaNatureza.nome.toLowerCase()}: ${sentidoDaNatureza.evite} não combinam com o dia.`;
  }
  movimento.push({
    texto: janelas.movimento
      ? `${intensidade}, de preferência entre ${hora(janelas.movimento.inicio)} e ${hora(janelas.movimento.fim)}.`
      : `${intensidade}.`,
    porque: janelas.movimento
      ? `${porqueDaIntensidade} Horário: ${janelas.movimento.sentido}, fora das janelas de cautela e no melhor momento para ${dosha.nome}.`
      : porqueDaIntensidade,
  });
  movimento.push({
    texto: `${primeiraMaiuscula(dosha.movimento)}.`,
    porque: primeiraMaiuscula(porqueDoDosha) + '.',
  });
  const passos = hoje?.steps ?? null;
  const sedentario = hoje?.sedentary_hours ?? null;
  movimento.push({
    texto:
      passos !== null
        ? `${passos.toLocaleString('pt-BR')} passos registrados; quebre o tempo sentado a cada 45 a 60 min com 3 a 5 min de caminhada.`
        : 'Quebre o tempo sentado a cada 45 a 60 min com 3 a 5 min de caminhada.',
    porque:
      sedentario !== null && sedentario >= 8
        ? `Você registrou ${sedentario.toLocaleString('pt-BR')} h sentado: pausas curtas melhoram a glicemia e a circulação.`
        : 'Pausas curtas de movimento melhoram a glicemia e a circulação ao longo do dia.',
  });
  if (cicloAtivo) {
    movimento.push({
      texto: cicloAtivo.recommendation.training,
      porque: `${cicloAtivo.phaseLabel}${cicloAtivo.cycleDay ? ` (dia ${cicloAtivo.cycleDay} do ciclo)` : ''}.`,
    });
  }

  const respiracao = respiracaoDoDia(
    prontidao.valor,
    hoje?.stress_score ?? null
  );
  const mente: Dica[] = [
    {
      texto: `${respiracao.nome}: ${respiracao.como}.`,
      porque: primeiraMaiuscula(respiracao.porque) + '.',
    },
    {
      texto: `${primeiraMaiuscula(dosha.mente)}.`,
      porque: primeiraMaiuscula(porqueDoDosha) + '.',
    },
    {
      texto: `Intenção do dia: ${sentidoDaNatureza.favorece}.`,
      porque: `${panchang.nakshatra.nome} é regido por ${natureza.divindade}; tithi ${panchang.tithi.nome} (${grupo.nome}, ${grupo.sentido}).`,
    },
  ];
  const meditouNaSemana = [hoje, ...historico].some(
    (d) => (d?.meditation_minutes ?? 0) > 0
  );
  if (!meditouNaSemana && historico.length >= 3) {
    mente.push({
      texto:
        'Comece com 5 minutos de meditação hoje, no mesmo horário dos próximos dias.',
      porque:
        'Não há meditação registrada nos últimos 7 dias; a regularidade conta mais que a duração.',
    });
  }
  const humor = hoje?.mood_score ?? null;
  if (humor !== null && humor <= 2) {
    mente.push({
      texto:
        'Humor baixo hoje: 10 minutos ao ar livre e uma conversa com alguém de confiança ajudam.',
      porque: `Você registrou humor ${humor}/5.`,
    });
  }

  const sonoMedio = media(historico.map((d) => d.sleep_duration_minutes));
  const sono: Dica[] = [
    {
      texto: `Deite por volta das ${hora(dormir)} para acordar perto do nascer do sol (${hora(amanhecer)}).`,
      porque:
        'Dormir cedo e acordar com o sol alinha o relógio biológico; no Ayurveda, deitar no período Kapha (antes das 22 h) facilita o sono profundo.',
    },
    {
      texto: 'Telas e luz forte fora da última hora antes de dormir.',
      porque:
        'Luz intensa à noite atrasa a melatonina e encurta o sono profundo.',
    },
  ];
  if (
    sonoMedio !== null &&
    historico.filter((d) => d.sleep_duration_minutes).length >= 3
  ) {
    sono.unshift(
      sonoMedio < 420
        ? {
            texto: `Débito de sono: média de ${formatarDuracao(sonoMedio)} nos últimos dias. Hoje vale dormir mais cedo.`,
            porque:
              'Adultos precisam de 7 a 9 h por noite; a média recente ficou abaixo disso.',
          }
        : {
            texto: `Sono em dia: média de ${formatarDuracao(sonoMedio)} nos últimos dias. Mantenha o horário.`,
            porque:
              'A regularidade do horário é tão importante quanto a duração.',
          }
    );
  }
  if (cicloAtivo) {
    sono.push({
      texto: cicloAtivo.recommendation.sleep,
      porque: `${cicloAtivo.phaseLabel}.`,
    });
  }

  // --------------------------------------------- focos, cuidados e alertas
  const focos: Dica[] = [];
  if (janelas.melhor) {
    focos.push({
      texto: `Faça o mais importante entre ${hora(janelas.melhor.inicio)} e ${hora(janelas.melhor.fim)}.`,
      porque: `${primeiraMaiuscula(janelas.melhor.sentido)}, sem janelas de cautela no intervalo.`,
    });
  }
  focos.push(movimento[0]);
  focos.push({
    texto: `${primeiraMaiuscula(sentidoDaNatureza.favorece)}.`,
    porque: `A Lua em ${panchang.nakshatra.nome}, nakshatra ${sentidoDaNatureza.nome.toLowerCase()} regido por ${natureza.divindade}.`,
  });

  const cuidados: Dica[] = [
    {
      texto: `Evite começos e decisões grandes entre ${hora(rahu.inicio)} e ${hora(rahu.fim)}.`,
      porque:
        'Rahu Kalam: o oitavo do dia regido por Rahu, tradicionalmente evitado para começar algo importante.',
    },
  ];
  if (chandrashtama) {
    cuidados.push({
      texto:
        'Evite confrontos, excessos e riscos desnecessários; o dia pede prudência.',
      porque:
        'Chandrashtama: a Lua do dia está no 8º signo a partir da sua Lua natal, período tradicional de cautela (cerca de 2 dias e meio por mês).',
    });
  } else if (pessoal && pessoal.tara.qualidade === 'desfavoravel') {
    cuidados.push({
      texto: `${primeiraMaiuscula(pessoal.tara.sentido)}.`,
      porque: `Tara ${pessoal.tara.nome}: o nakshatra do dia contado a partir do seu nakshatra natal.`,
    });
  } else {
    cuidados.push({
      texto: `Evite ${sentidoDaNatureza.evite}.`,
      porque: `A Lua em ${panchang.nakshatra.nome} é ${sentidoDaNatureza.nome.toLowerCase()}.`,
    });
  }
  if (prontidao.valor !== null && prontidao.valor < 55) {
    cuidados.push({
      texto: 'Não force o corpo: o treino forte pode esperar.',
      porque: `Prontidão ${prontidao.valor} (${prontidao.base.join(', ')}).`,
    });
  } else if (panchang.karana.qualidade === 'desfavoravel') {
    cuidados.push({
      texto: `Evite começos importantes ${ate(panchang.karana.termina)}.`,
      porque:
        'Karana Vishti (Bhadra): meio tithi tradicionalmente evitado para começos.',
    });
  } else if (panchang.yoga.qualidade === 'desfavoravel') {
    cuidados.push({
      texto: `Prefira rotina a novidades ${ate(panchang.yoga.termina)}.`,
      porque: `Yoga ${panchang.yoga.nome}, tradicionalmente desfavorável para começos.`,
    });
  }

  const alertas: Dica[] = sinais.signals
    .filter((sinal) => sinal.severity !== 'info')
    .map((sinal) => ({
      texto: `${sinal.title}: ${sinal.actionLabel.toLowerCase()}.`,
      porque: `${sinal.detail} Sinais: ${sinal.contributors.join(', ')}.`,
    }));
  if (chandrashtama) {
    alertas.push({
      texto: 'Chandrashtama hoje: dia de prudência.',
      porque: 'A Lua do dia está no 8º signo a partir da sua Lua natal.',
    });
  }

  // ------------------------------------------------------- o que completar
  const completar: string[] = [];
  if (!perfil.nascimento.local || !perfil.nascimento.data) {
    completar.push(
      'Informe a data e a cidade de nascimento no perfil para o coach ler o seu mapa natal (Tara Bala, Chandrashtama e dasha).'
    );
  } else if (!perfil.nascimento.hora) {
    completar.push('Informe a hora de nascimento para Lagna e dasha precisos.');
  }
  if (!perfil.moradia) {
    completar.push(
      'Informe a cidade onde mora: os horários do dia estão usando a cidade de nascimento.'
    );
  }
  if (!hoje || prontidao.valor === null) {
    completar.push(
      'Faça o check-in de hoje (sono, energia, humor e estresse) para o coach calibrar a prontidão e as dicas.'
    );
  }
  if (ciclo?.lifeStage === 'sem_ciclo') {
    completar.push(
      'Informe a data da última menstruação no perfil para o coach considerar a fase do ciclo.'
    );
  }

  return {
    versao: 1,
    data,
    geradoEm: agora.toISOString(),
    origem: 'local',
    local: { rotulo: lugar.rotulo, fuso },
    nome: pessoa.nome,
    tom,
    manchete,
    resumo: frases.join(' '),
    prontidao,
    periodos,
    focos: focos.slice(0, 3),
    cuidados: cuidados.slice(0, 3),
    recomendacoes: { saude, alimentacao, movimento, mente, sono },
    ceu: {
      vara: panchang.vara.nome,
      tithi: panchang.tithi.nome,
      paksha: panchang.tithi.paksha,
      nakshatra: panchang.nakshatra.nome,
      naturezaDoNakshatra: sentidoDaNatureza.nome,
      divindade: natureza.divindade,
      yoga: panchang.yoga.nome,
      karana: panchang.karana.nome,
      signoDaLua: panchang.signoDaLua.nome,
      nascerDoSol: hora(panchang.nascerDoSol),
      porDoSol: hora(panchang.porDoSol),
      tara: pessoal
        ? {
            nome: pessoal.tara.nome,
            qualidade: pessoal.tara.qualidade,
            sentido: pessoal.tara.sentido,
          }
        : null,
      chandrashtama,
      dasha: mapa?.dasha
        ? `Mahadasha de ${mapa.dasha.mahadasha.nome} · Antardasha de ${mapa.dasha.antardasha.nome}`
        : null,
    },
    ciclo: cicloAtivo
      ? { fase: cicloAtivo.phaseLabel, dia: cicloAtivo.cycleDay }
      : null,
    dosha: {
      dominante,
      nome: dosha.nome,
      percentuais: resultadoDoDosha.percentages,
      base: baseDoDosha,
    },
    alertas,
    completar,
  };
}
