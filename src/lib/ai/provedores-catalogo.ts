/**
 * Catálogo dos provedores de IA aceitos pela Lyra (tarefa 43). Sem
 * dependências de servidor: usado também pela tela de administração.
 *
 * Quatro famílias de API cobrem os provedores:
 * - `openai_compativel`: a API de chat completions (`/v1/chat/completions` e
 *   `/v1/models`), oferecida pelos servidores locais (Ollama, LM Studio, Jan,
 *   llama.cpp, vLLM, LocalAI, KoboldCpp, GPT4All) e por vários serviços em
 *   nuvem (OpenAI, OpenRouter, Groq, Mistral, DeepSeek, Together, xAI);
 * - `gemini`: API nativa do Google Gemini;
 * - `anthropic`: API Messages da Anthropic;
 * - `lyra_local`: nenhum modelo generativo, só o motor determinístico.
 *
 * As URLs abaixo são os endereços padrão documentados por cada projeto; o
 * administrador pode trocar (ex.: outra porta, outra máquina da rede ou
 * `http://host.docker.internal:11434/v1` quando a Lyra roda em contêiner).
 */

export const TIPOS_DE_PROVEDOR = [
  'lyra_local',
  'openai_compativel',
  'gemini',
  'anthropic',
] as const;

export type TipoDeProvedor = (typeof TIPOS_DE_PROVEDOR)[number];

export interface PresetDeProvedor {
  id: string;
  nome: string;
  tipo: TipoDeProvedor;
  /** Roda na própria máquina ou rede: os dados não saem da infraestrutura. */
  local: boolean;
  urlPadrao: string | null;
  exigeChave: boolean;
  descricao: string;
}

export const PRESETS_DE_PROVEDOR: readonly PresetDeProvedor[] = [
  {
    id: 'lyra',
    nome: 'Só o motor da Lyra',
    tipo: 'lyra_local',
    local: true,
    urlPadrao: null,
    exigeChave: false,
    descricao:
      'Leitura escrita pelo motor védico determinístico, sem modelo generativo.',
  },
  {
    id: 'ollama',
    nome: 'Ollama',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:11434/v1',
    exigeChave: false,
    descricao:
      'Modelos locais com `ollama serve` (Llama, Qwen, Gemma e outros).',
  },
  {
    id: 'lm_studio',
    nome: 'LM Studio',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:1234/v1',
    exigeChave: false,
    descricao: 'Servidor local do LM Studio (aba Developer → Start Server).',
  },
  {
    id: 'jan',
    nome: 'Jan',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:1337/v1',
    exigeChave: false,
    descricao: 'Local API Server do Jan (pode exigir a chave definida no Jan).',
  },
  {
    id: 'llama_cpp',
    nome: 'llama.cpp (llama-server)',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:8080/v1',
    exigeChave: false,
    descricao: 'Servidor HTTP do llama.cpp com qualquer modelo GGUF.',
  },
  {
    id: 'vllm',
    nome: 'vLLM',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:8000/v1',
    exigeChave: false,
    descricao: 'Servidor OpenAI-compatível do vLLM (GPU).',
  },
  {
    id: 'localai',
    nome: 'LocalAI',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:8080/v1',
    exigeChave: false,
    descricao: 'LocalAI, alternativa local compatível com a API da OpenAI.',
  },
  {
    id: 'koboldcpp',
    nome: 'KoboldCpp',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:5001/v1',
    exigeChave: false,
    descricao: 'KoboldCpp (baseado no llama.cpp) com a API compatível.',
  },
  {
    id: 'gpt4all',
    nome: 'GPT4All',
    tipo: 'openai_compativel',
    local: true,
    urlPadrao: 'http://localhost:4891/v1',
    exigeChave: false,
    descricao: 'Servidor de API local do GPT4All.',
  },
  {
    id: 'openai',
    nome: 'OpenAI',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: 'https://api.openai.com/v1',
    exigeChave: true,
    descricao: 'Modelos GPT da OpenAI.',
  },
  {
    id: 'gemini',
    nome: 'Google Gemini',
    tipo: 'gemini',
    local: false,
    urlPadrao: null,
    exigeChave: true,
    descricao: 'Modelos Gemini pela API nativa do Google.',
  },
  {
    id: 'anthropic',
    nome: 'Anthropic Claude',
    tipo: 'anthropic',
    local: false,
    urlPadrao: null,
    exigeChave: true,
    descricao: 'Modelos Claude pela API Messages.',
  },
  {
    id: 'openrouter',
    nome: 'OpenRouter',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: 'https://openrouter.ai/api/v1',
    exigeChave: true,
    descricao: 'Centenas de modelos de vários fornecedores com uma chave.',
  },
  {
    id: 'groq',
    nome: 'Groq',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: 'https://api.groq.com/openai/v1',
    exigeChave: true,
    descricao: 'Modelos abertos com inferência rápida.',
  },
  {
    id: 'mistral',
    nome: 'Mistral',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: 'https://api.mistral.ai/v1',
    exigeChave: true,
    descricao: 'Modelos da Mistral AI.',
  },
  {
    id: 'deepseek',
    nome: 'DeepSeek',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: 'https://api.deepseek.com/v1',
    exigeChave: true,
    descricao: 'Modelos da DeepSeek.',
  },
  {
    id: 'together',
    nome: 'Together AI',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: 'https://api.together.xyz/v1',
    exigeChave: true,
    descricao: 'Modelos abertos hospedados pela Together AI.',
  },
  {
    id: 'xai',
    nome: 'xAI Grok',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: 'https://api.x.ai/v1',
    exigeChave: true,
    descricao: 'Modelos Grok da xAI.',
  },
  {
    id: 'personalizado',
    nome: 'Outro compatível com OpenAI',
    tipo: 'openai_compativel',
    local: false,
    urlPadrao: null,
    exigeChave: false,
    descricao:
      'Qualquer servidor com /v1/chat/completions: informe a URL base e, se houver, a chave.',
  },
];

export function presetPorId(id: string | null | undefined) {
  return PRESETS_DE_PROVEDOR.find((preset) => preset.id === id) ?? null;
}

/** Endereços da própria máquina ou de redes privadas (modelo local). */
export function urlEhLocal(url: string | null | undefined) {
  if (!url) return false;
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^\[|\]$/g, '');
  } catch {
    return false;
  }
  return (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host === 'host.docker.internal' ||
    host === '::1' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^f[cd][0-9a-f]{2}:/i.test(host)
  );
}
