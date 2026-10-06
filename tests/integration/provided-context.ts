// Dados entregues pelo setup global aos arquivos de teste de integração
// (vitest `provide`/`inject`).
export interface LyraMysqlTestConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

declare module 'vitest' {
  export interface ProvidedContext {
    lyraMysqlTest: LyraMysqlTestConfig;
  }
}
