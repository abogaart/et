interface JestEnv {
  jestExcept: any;
}
const g = global as any;
export const { jestExpect } = g;
