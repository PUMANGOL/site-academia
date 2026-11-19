-- Perfis do caderno de encargos: aluno, formador e administrador.
-- O campo user.role já existe. Este script apenas restringe os valores.
-- Não é uma migração Drizzle; corre no Postgres se quiseres a restrição.

ALTER TABLE "user" ALTER COLUMN role SET DEFAULT 'student';

ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_role_check;
ALTER TABLE "user" ADD CONSTRAINT user_role_check
  CHECK (role IN ('student', 'instructor', 'admin'));
