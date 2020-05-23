export const sortTreeByField = (fieldName, node) => {
  const { children } = node;
  if (!children) {
    return node;
  } else {
    return {
      ...node,
      children: children
        .sort((a, b) => a[fieldName].localeCompare(b[fieldName], 'en', { numeric: true }))
        .map(child => sortTreeByField(fieldName, child)),
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
