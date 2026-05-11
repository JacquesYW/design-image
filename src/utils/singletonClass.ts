/* 确保类的单例 */
export const singletonClass = <T extends new (...args: ConstructorParameters<T>) => InstanceType<T>>(className: T) => {
  let instance: InstanceType<T> | null = null;
  const proxy = new Proxy(className, {
    construct: (target, argArray: ConstructorParameters<T>) => {
      if (!instance) {
        instance = new className(...argArray);
      }
      return instance as object;
    },
  });
  /* 防止通过实例的 constructor 去new新的实例 */
  className.prototype.constructor = proxy;
  return proxy;
};
