import { sortTreeByField, flattenTree, asyncForEach } from '@lib/sorting';

export const  getDepthOfTree = (array) => {
    return 1 + Math.max(0, ...array.map(({ children = [] }) => getDepthOfTree(children)));
}

export const nodeExcellTo = () => {

}