export const compareObjectsByStringFields = (a, b, fieldNames) => {
  for(const name of fieldNames) {
    if(isNaN(a[name]) && isNaN(b[name])) {
      const res = (a[name] || '').localeCompare(b[name] || '', 'en', { numeric: true });
      if (res) {
        return res;
      }
    } else {
     return a[name] - b[name];
    }
  
  }
  return 0;
};

export const sortTreeByField = (fieldNames, node) => {
  const { children } = node;
  fieldNames = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
  if (!children) {
    return node;
  } else {
    return {
      ...node,
      children: children
        .sort((a, b) => compareObjectsByStringFields(a, b, fieldNames))
        .map(child => sortTreeByField(fieldNames, child)),
    };
  }
};

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
export const flattenTree = (root, key) => {
  let flatten = [Object.assign({}, root)];
  delete flatten[0][key];
  if (root && root[key] && root[key].length > 0) {
    return flatten.concat(root[key]
      .map((child) => flattenTree(child, key))
      .reduce((a, b) => a.concat(b), [])
    );
  }
  return flatten;
};
