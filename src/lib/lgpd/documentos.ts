/**
 * Documentos e consentimentos da LGPD (Lei 13.709/2018).
 *
 * A versão de cada documento é a data da redação em vigor. Quando o texto da
 * política de privacidade ou dos termos mudar, a versão muda junto, e o
 * registro de consentimento (`consent_records`) passa a distinguir quem
 * aceitou cada versão.
 */

export const VERSAO_POLITICA_DE_PRIVACIDADE = '2026-10-12';
export const VERSAO_TERMOS_DE_USO = '2026-10-12';
export const VERSAO_CONSENTIMENTO_DADOS_DE_SAUDE = '2026-10-12';

export const TIPOS_DE_CONSENTIMENTO = [
  'terms_of_use',
  'privacy_policy',
  // Art. 11, I, da LGPD: dado de saúde é dado pessoal sensível e exige
  // consentimento específico e destacado para a finalidade informada.
  'health_data_processing',
] as const;

export type TipoDeConsentimento = (typeof TIPOS_DE_CONSENTIMENTO)[number];

export const VERSAO_POR_TIPO: Record<TipoDeConsentimento, string> = {
  terms_of_use: VERSAO_TERMOS_DE_USO,
  privacy_policy: VERSAO_POLITICA_DE_PRIVACIDADE,
  health_data_processing: VERSAO_CONSENTIMENTO_DADOS_DE_SAUDE,
};

export const ROTULO_DO_CONSENTIMENTO: Record<TipoDeConsentimento, string> = {
  terms_of_use: 'Termos de uso',
  privacy_policy: 'Política de privacidade',
  health_data_processing: 'Tratamento de dados de saúde',
};

export const ROTA_POLITICA_DE_PRIVACIDADE = '/privacidade';
export const ROTA_TERMOS_DE_USO = '/termos';

/** Frase que a pessoa digita para confirmar a exclusão da conta. */
export const FRASE_DE_EXCLUSAO = 'EXCLUIR MINHA CONTA';

/** E-mail do canal de privacidade (encarregado), quando configurado. */
export function emailDoEncarregado(): string | null {
  const valor = process.env.LGPD_CONTATO_EMAIL?.trim();
  return valor && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? valor : null;
}
