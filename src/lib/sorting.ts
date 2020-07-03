export const compareObjectsByStringFields = (a, b, fieldNames) => {
  for(const name of fieldNames) {
    const res = (a[name] || '').localeCompare(b[name] || '', 'en', { numeric: true });
    if (res) {
      return res;
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
