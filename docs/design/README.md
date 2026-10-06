# Referências de design

Arquivos estáticos de referência visual, mantidos apenas como documentação. Não fazem parte da aplicação nem são servidos por ela.

- `lyra-ui-preview.html`: protótipo HTML da interface (2026), aberto direto no navegador. Carrega Tailwind e Lucide de CDNs públicas, por isso deixou de ficar em `public/` (tarefa 20): servido na origem da aplicação, executaria scripts de terceiros com acesso às rotas autenticadas.
- `mockup.png`: captura do mockup da interface (636 KB), antes servida em `public/assets/` sem nenhuma referência no código.
