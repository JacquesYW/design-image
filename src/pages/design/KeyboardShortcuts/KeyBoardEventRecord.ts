type VerifyFn = <T extends KeyboardEvent>(e: T) => boolean;
type RunFn = (e?: KeyboardEvent) => void;
class KeyBoardEventRecord {
  private verifys = new Map<string, VerifyFn>();
  private runFns = new Map<string, RunFn>();
  constructor() {}
  register(key: string, verifyFn: VerifyFn, runFn: RunFn) {
    this.verifys.set(key, verifyFn);
    this.runFns.set(key, runFn);
  }
  getVerifys() {
    return [...this.verifys];
  }
  getRunFn(key: string): RunFn {
    if (this.runFns.has(key)) {
      return this.runFns.get(key) as RunFn;
    }
    return () => {};
  }
}
const keyBoardEventRecord = new KeyBoardEventRecord();

export default keyBoardEventRecord;
