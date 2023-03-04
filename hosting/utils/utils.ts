export const createObjectFromKeysValues = (
    keys: string[],
    values: any[]
  ): { [key: string]: any } => {
    const result: { [key: string]: any } = {};
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = values[i];
    }
    return result;
  };