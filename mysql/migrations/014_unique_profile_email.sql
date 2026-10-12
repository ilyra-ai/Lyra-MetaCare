-- E-mail de login sem duplicidade entre contas (tarefa 36).
--
-- `users.email` já é UNIQUE, mas `profiles.email` é uma cópia sem índice
-- único: um ajuste fora do fluxo oficial podia deixar dois perfis com o
-- mesmo e-mail (ou um perfil divergente da própria conta). A cópia passa a
-- acompanhar a conta e o banco recusa a repetição.

-- 1. Realinha qualquer perfil divergente com o e-mail da própria conta (que
--    é único), o que elimina repetições antes de criar o índice.
UPDATE profiles p
INNER JOIN users u ON u.id = p.id
SET p.email = u.email
WHERE p.email <> u.email;

-- 2. Índice único (também acelera a busca por e-mail no painel de usuários).
ALTER TABLE profiles
  ADD UNIQUE INDEX uq_profiles_email (email);
