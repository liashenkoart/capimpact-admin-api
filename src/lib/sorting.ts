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
