// 递归整棵树
export const traverse = (data, callback, options = {}) => {
  const { childrenField = 'children', keyField = 'id' } = options;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const children = item[childrenField];
    const hasChildren = children && children.length > 0;
    const isLeaf = !hasChildren;

    callback && callback(item);

    if (hasChildren) {
      item[childrenField] = traverse(children, callback, options);
    }
  }

  return data;
};

// 节点状态枚举
export const ENUM_CHECKEDSTATUS = {
  UN_CHECKED: 0, // 不选中
  INDETERMINATE_CHECKED: 1, // 半选中
  CHECKED: 2, // 选中
};
// 节点的展开状态
export const ENUM_EXPANDEDSTATUS = {
  UN_EXPANDED: false,
  EXPANDED: true,
};

// 是否是叶子节点
export const isLeafNode = node => node.isLeaf;
// 节点是否处于选中状态
export const isChecked = node =>
  node && node.checkedStatus === ENUM_CHECKEDSTATUS.CHECKED;

export const isIndeterminateChecked = node =>
  node && node.checkedStatus === ENUM_CHECKEDSTATUS.INDETERMINATE_CHECKED;

// 节点是否处于展开状态
export const isExpanded = node =>
  node && node.expand === ENUM_EXPANDEDSTATUS.EXPANDED;

export const flatTree = data => {
  const result = [];
  traverse(data, item => result.push(item));
  return result;
};

export const isRootNode = node => node && node.level === 0;
