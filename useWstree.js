import { ref, unref } from 'vue';

export const useWsTree = () => {
  const treeInstance = ref();
  const register = instance => {
    treeInstance.value = instance;
  };

  const getInstance = () => {
    const instance = unref(treeInstance);
    if (!instance) {
      console.warn('useWstree must be register on WsTree component!');
    }
    return instance;
  };

  const methods = {
    getCheckedKeys() {
      const instance = getInstance();
      return instance.getCheckedKeys();
    },
    getExpandedKeys() {
      const instance = getInstance();
      return instance.getExpandedKeys();
    },
    getIndeterminateKeys() {
      const instance = getInstance();
      return instance.getIndeterminateKeys();
    },
  };

  return [register, methods];
};
