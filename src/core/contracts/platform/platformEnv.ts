type EnvValue = string | number | undefined | null;

export type PlatformEnv<
  TEnv extends { [key: string]: EnvValue } = { [key: string]: EnvValue },
> = TEnv;
