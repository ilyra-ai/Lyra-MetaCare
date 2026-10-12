import type { Metadata } from 'next';
import Link from 'next/link';

import {
  DocumentoLegal,
  type SecaoDoDocumento,
} from '@/components/lgpd/DocumentoLegal';
import {
  ROTA_POLITICA_DE_PRIVACIDADE,
  VERSAO_TERMOS_DE_USO,
} from '@/lib/lgpd/documentos';

export const metadata: Metadata = {
  title: 'Termos de uso · Lyra MetaCare',
  description: 'Regras de uso da plataforma Lyra MetaCare.',
};

const secoes: SecaoDoDocumento[] = [
  {
    id: 'servico',
    titulo: 'O que é a Lyra MetaCare',
    conteudo: (
      <p>
        A Lyra MetaCare é uma plataforma de bem-estar, longevidade e
        autoconhecimento que transforma dados de dispositivos, hábitos e
        contexto pessoal em orientações. Ela reúne motores de cálculo próprios,
        inteligência artificial e uma camada integrativa de astrologia moderna e
        tradição védica.
      </p>
    ),
  },
  {
    id: 'nao-e-medico',
    titulo: 'Não substitui avaliação profissional',
    conteudo: (
      <p>
        <strong>
          A Lyra não é um serviço médico, não faz diagnóstico e não prescreve
          tratamento.
        </strong>{' '}
        Indicadores, planos e respostas do assistente são informativos. Em caso
        de sintoma, dúvida sobre a sua saúde ou emergência, procure um
        profissional de saúde ou o serviço de emergência.
      </p>
    ),
  },
  {
    id: 'conta',
    titulo: 'Sua conta',
    conteudo: (
      <ul>
        <li>Você é responsável por manter a sua senha em segredo.</li>
        <li>
          As informações que você registra devem ser verdadeiras; a qualidade
          das orientações depende delas.
        </li>
        <li>
          Você pode corrigir os seus dados, baixar uma cópia deles e excluir a
          conta a qualquer momento, na página do perfil.
        </li>
      </ul>
    ),
  },
  {
    id: 'planos',
    titulo: 'Planos e pagamentos',
    conteudo: (
      <ul>
        <li>
          Os recursos disponíveis dependem do plano. O plano gratuito não exige
          pagamento.
        </li>
        <li>
          Planos pagos são cobrados pela Stripe, no ciclo escolhido (mensal ou
          anual), até que a renovação seja cancelada no portal de cobrança.
        </li>
        <li>
          Para excluir a conta com uma assinatura paga ativa, cancele antes a
          renovação no portal de cobrança. Assim não há nova cobrança depois da
          exclusão.
        </li>
        <li>
          As faturas pagas são guardadas como registro fiscal, como exige a
          legislação.
        </li>
      </ul>
    ),
  },
  {
    id: 'uso',
    titulo: 'Uso aceitável',
    conteudo: (
      <ul>
        <li>Não tente acessar contas ou dados de outras pessoas.</li>
        <li>
          Não use a plataforma para atividades ilegais nem para sobrecarregar ou
          prejudicar o serviço.
        </li>
        <li>
          Só cadastre dados de terceiros (como profissionais de saúde na sua
          agenda) quando tiver autorização para isso.
        </li>
      </ul>
    ),
  },
  {
    id: 'privacidade',
    titulo: 'Privacidade',
    conteudo: (
      <p>
        O tratamento dos seus dados pessoais e de saúde segue a{' '}
        <Link
          href={ROTA_POLITICA_DE_PRIVACIDADE}
          className="font-medium text-primary underline underline-offset-2"
        >
          política de privacidade
        </Link>
        , que faz parte destes termos.
      </p>
    ),
  },
  {
    id: 'alteracoes',
    titulo: 'Alterações',
    conteudo: (
      <p>
        Quando estes termos mudarem, a versão no topo da página muda junto, e o
        registro de consentimento mostra qual versão você aceitou e quando.
      </p>
    ),
  },
];

export default function TermosDeUsoPage() {
  return (
    <DocumentoLegal
      titulo="Termos de uso"
      resumo="As regras para usar a Lyra MetaCare: o que a plataforma faz, o que ela não faz (ela não substitui avaliação profissional de saúde) e como funcionam a sua conta e os planos."
      versao={VERSAO_TERMOS_DE_USO}
      secoes={secoes}
    />
  );
}
