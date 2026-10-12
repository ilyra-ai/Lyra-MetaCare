-- Remove a demonstração herdada do template: a tabela `instruments` (quatro
-- nomes fixos — HRV, Sono, Glicose, Peso — usados só pela página /instruments,
-- que listava o JSON da tabela) e o documento Puck dessa página.
-- Não há dado de usuário: nenhuma tabela referencia `instruments` e a página
-- não aparecia em nenhum menu. Era também a única tabela lida sem sessão pela
-- API de dados; com ela sai essa exceção.
-- Idempotente: reexecutar não falha nem altera nada.

DROP TABLE IF EXISTS instruments;

DELETE FROM puck_documents WHERE document_key = 'instruments';
