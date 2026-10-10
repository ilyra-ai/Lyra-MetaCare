# Referências de design

Arquivos estáticos de referência visual, mantidos apenas como documentação. Não fazem parte da aplicação nem são servidos por ela.

> O visual atual do app é o **"Lyra Clean"**, descrito em [`../design-system.md`](../design-system.md). Os arquivos abaixo são do visual anterior e ficam só como histórico.

- `lyra-ui-preview.html`: protótipo HTML da interface anterior (2026), aberto direto no navegador. Carrega Tailwind e Lucide de CDNs públicas, por isso deixou de ficar em `public/` (tarefa 20): servido na origem da aplicação, executaria scripts de terceiros com acesso às rotas autenticadas.
- `mockup.png`: captura do mockup da interface anterior (636 KB), antes servida em `public/assets/` sem nenhuma referência no código.
