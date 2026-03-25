CREATE TABLE IF NOT EXISTS `ui_config` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `landing_data` JSON NOT NULL,
  `login_data` JSON NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36) NULL,
  CONSTRAINT `fk_ui_config_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO `ui_config` (`id`, `landing_data`, `login_data`)
VALUES (
  'default',
  '{
    "hero": {
      "title": "Seu bem-estar ganha uma casa mais linda, harmoniosa e inteligente.",
      "subtitle": "A Lyra MetaCare une astrologia vedica, IA e sinais da sua rotina numa interface clara, doce e premium, feita para parecer um lugar que acolhe em vez de cansar."
    },
    "features": {
      "visible": true,
      "items": [
        {
          "icon": "Brain",
          "title": "IA gentil",
          "description": "Tecnologia com presenca e sem ruir a delicadeza.",
          "tone": "from-primary/16 via-primary/7 to-white"
        },
        {
          "icon": "MoonStar",
          "title": "Leitura simbolica",
          "description": "Astrologia moderna em uma linguagem clara e atual.",
          "tone": "from-cosmic/16 via-cosmic/8 to-white"
        },
        {
          "icon": "HeartPulse",
          "title": "Sinais do corpo",
          "description": "Metricas mais organizadas e agradaveis de acompanhar.",
          "tone": "from-accent/16 via-accent/8 to-white"
        },
        {
          "icon": "Zap",
          "title": "Fluxo bonito",
          "description": "Uma jornada mais doce, limpa e sem bagunca visual.",
          "tone": "from-golden/18 via-golden/8 to-white"
        }
      ]
    },
    "flow": {
      "visible": true,
      "items": [
        {
          "id": "01",
          "title": "Abra sua orbita",
          "description": "Seu cadastro cria um espaco pessoal para sinais, preferencias e contexto simbolico.",
          "icon": "Sparkles"
        },
        {
          "id": "02",
          "title": "Conecte seu contexto",
          "description": "Rotina, sinais e preferencias alimentam uma leitura mais delicada e coerente.",
          "icon": "HeartPulse"
        },
        {
          "id": "03",
          "title": "Receba orientacao com IA",
          "description": "Chat, planos e proximos passos ganham presenca e clareza sem excessos visuais.",
          "icon": "Bot"
        },
        {
          "id": "04",
          "title": "Volte com prazer",
          "description": "A ideia e transformar constancia em algo leve, bonito e convidativo de acompanhar.",
          "icon": "Star"
        }
      ]
    },
    "plans": {
      "visible": true
    },
    "faq": {
      "visible": true,
      "items": [
        {
          "question": "A landing usa dados reais do produto?",
          "answer": "Sim. O catalogo abaixo e carregado a partir de uma rota publica ligada ao MySQL desta instancia."
        },
        {
          "question": "Existe login direto pela landing?",
          "answer": "Sim. O card inicial permite entrada real sem sair da landing, mantendo a tela de login completa para quem preferir uma experiencia dedicada."
        },
        {
          "question": "Por que nao ha depoimentos ficticios aqui?",
          "answer": "Porque esta entrega segue a regra de nao simular prova social. Em vez disso, a pagina mostra evidencias reais do proprio ecossistema."
        },
        {
          "question": "O foco continua sendo tema claro?",
          "answer": "Sim. Toda a composicao foi refinada para ficar clara, doce, premium, serena e respiravel."
        }
      ]
    }
  }',
  '{
    "hero": {
      "title": "Entre ou crie sua conta com calma.",
      "subtitle": "Tudo aqui foi reorganizado para ficar mais fluido, mais fofo e mais convidativo, sem perder o rigor do fluxo real de auth."
    }
  }'
);
