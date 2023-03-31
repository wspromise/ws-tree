<!-- 树形层级选择器-->
<!-- 1、支持单选、多选 -->
<template>
  <view class="ws-tree">
    <view>
      <scroll-view :scroll-y="true">
        <block v-for="item in computedRenderTreeData" :key="item.key">
          <view
            class="tree-item"
            :class="{
              'tree-item--show': !item.hidden,
            }"
            :style="{
              paddingLeft:
                item.level * props.indent + (item.isLeaf ? 40 : 0) + 'rpx',
            }"
          >
            <view
              v-show="!item.isLeaf"
              class="tree-item__switch-icon"
              @tap.stop="onUpdateExpandedStatus(item, !item.expand)"
            >
              <!-- 展开/收起图标的插槽 -->

              <slot
                name="render-switcher-icon"
                :data="{ expanded: item.expand }"
              >
                <uni-icons
                  :type="item.expand ? 'bottom' : 'right'"
                  size="15"
                ></uni-icons>
              </slot>
            </view>
            <view
              class="tree-item__checkable"
              :class="[`tree-item__checkable--${props.checkboxPlacement}`]"
            >
              <checkbox
                color="#32c770"
                style="transform: scale(0.8)"
                :value="'' + item.key"
                :class="['odp-checkbox', getNodeClassName(item)]"
                :checked="item.checkedStatus === ENUM_CHECKEDSTATUS.CHECKED"
                @tap.stop="
                  onUpdateCheckStatus(
                    item,
                    item.checkedStatus ===
                      ENUM_CHECKEDSTATUS.INDETERMINATE_CHECKED
                      ? true
                      : !item.checkedStatus
                  )
                "
              />
            </view>
            <view class="tree-item__label--prefix">
              <!-- 前缀插槽 -->
              <slot
                name="render-prefix"
                :data="{
                  option: item.originNode,
                  checked: item.checkedStatus === ENUM_CHECKEDSTATUS.CHECKED,
                }"
              ></slot>
            </view>
            <view class="tree-item__label">
              <slot
                name="render-label"
                :data="{
                  option: item.originNode,
                  checked: item.checkedStatus === ENUM_CHECKEDSTATUS.CHECKED,
                }"
              >
                {{ item.label }}
              </slot>
            </view>
            <view class="tree-item__label--suffix">
              <!-- 后缀插槽 -->
              <slot
                name="render-suffix"
                :data="{
                  option: item.originNode,
                  checked: item.checkedStatus === ENUM_CHECKEDSTATUS.CHECKED,
                }"
              ></slot>
            </view>
          </view>
        </block>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref, unref, watch } from 'vue';
import {
  flatTree,
  traverse,
  isChecked,
  isLeafNode,
  isExpanded,
  isRootNode,
  isIndeterminateChecked,
  ENUM_CHECKEDSTATUS,
  ENUM_EXPANDEDSTATUS,
} from './tree-utils';

const props = defineProps({
  // 选中的keys,必须开启checkable才有效,v-model:checked-keys
  checkedKeys: {
    type: Array,
    default: () => [],
  },
  // 多选框的位置 left|right
  checkboxPlacement: {
    type: String,
    default: 'left',
  },
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  // 展开的keys v-model:expanded-keys
  expandedKeys: {
    type: Array,
  },

  // 缩进
  indent: {
    type: Number,
    default: 40,
  },
  // 树的数据
  data: {
    type: Array,
    default: () => [],
  },

  childrenField: {
    type: String,
    default: 'children',
  },
  labelField: {
    type: String,
    default: 'label',
  },
  keyField: {
    type: String,
    default: 'key',
  },
  // 是否开启多选
  checkable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits([
  'update:checked-keys',
  'update:expanded-keys',
  'register',
]);

const expandedKeys = ref([]);
const checkedKeys = ref([]);

// sync props expandedKeys
watch(
  () => unref(props.expandedKeys),
  keys => keys && (expandedKeys.value = keys),
  { immediate: true }
);

// sync props checkedKeys
watch(
  () => unref(props.checkedKeys),
  keys => keys && (checkedKeys.value = keys),
  { immediate: true }
);

const computedFormatTreeData = computed(() => {
  const { data, childrenField, keyField, labelField, defaultExpandAll } = props;

  const expand = defaultExpandAll
    ? ENUM_EXPANDEDSTATUS.EXPANDED
    : ENUM_EXPANDEDSTATUS.UN_EXPANDED;

  const traverse = (data, parent = null, level = 0) => {
    return data.reduce((p, item) => {
      const key = item[keyField];
      const label = item[labelField];
      const children = item[childrenField];
      const hasChildren = children && children.length > 0;
      const isLeaf = !hasChildren;
      const pid = parent ? parent.key : null;
      const hidden = defaultExpandAll ? false : level !== 0;

      const node = {
        key,
        pid,
        label,
        isLeaf,
        level,
        expand,
        hidden,
        checkedStatus: ENUM_CHECKEDSTATUS.UN_CHECKED,
        parentKeys: [],
        childrenKeys: [],
        children: [],
        originNode: item,
      };

      if (parent) {
        node.parentKeys = [parent.key, ...parent.parentKeys];
      }

      if (hasChildren) {
        const treeNodeChildren = traverse(children, node, level + 1);
        const childrenKeys = treeNodeChildren.reduce((p, node) => {
          const keys = node.childrenKeys;
          p.push(...keys, node.key);
          return p;
        }, []);
        node.children = treeNodeChildren;
        node.childrenKeys = childrenKeys;
      }

      p.push(node);
      return p;
    }, []);
  };

  const result = traverse(data);
  return result;
});

const computedRenderTreeData = computed(() => {
  const rawCheckedKeys = unref(checkedKeys);
  const rawExpandedKeys = unref(expandedKeys);
  const treeMap = unref(computedTreeMap);
  const formatTreeData = unref(computedFormatTreeData);

  // 改变多选框的状态
  if (props.checkable) {
    for (let i = 0; i < rawCheckedKeys.length; i++) {
      const checkedKey = rawCheckedKeys[i];
      const node = treeMap.get(checkedKey);
      node && doUpdateCheckStatus(node, ENUM_CHECKEDSTATUS.CHECKED);
    }
  }

  // 改变节点展开和显示状态
  if (rawExpandedKeys && rawExpandedKeys.length > 0) {
    for (let i = 0; i < rawExpandedKeys.length; i++) {
      const expanedKey = rawExpandedKeys[i];
      const node = treeMap.get(expanedKey);
      if (node) {
        doUpdateExpanedStatus(node, ENUM_EXPANDEDSTATUS.EXPANDED);
      }
    }
  }

  doUpdateHiddenStatus();

  return flatTree(formatTreeData);
});

const computedTreeMap = computed(() => {
  const treeMap = new Map();
  traverse(unref(computedFormatTreeData), item => treeMap.set(item.key, item));
  return treeMap;
});

// 获取节点的类名
const getNodeClassName = node => {
  let nodeCheckedStatus = node.checkedStatus;

  let classObj = {
    indeterminate_checked:
      nodeCheckedStatus === ENUM_CHECKEDSTATUS.INDETERMINATE_CHECKED,
    un_checked: nodeCheckedStatus === ENUM_CHECKEDSTATUS.UN_CHECKED,
    checked: nodeCheckedStatus === ENUM_CHECKEDSTATUS.CHECKED,
  };

  return classObj;
};

// 获取所有选中的key值
const getCheckedKeys = () => {
  const treeMap = unref(computedTreeMap);
  const treeMapKeys = [...treeMap.keys()];
  return treeMapKeys.reduce((p, id) => {
    const node = treeMap.get(id);
    isChecked(node) && p.push(id);
    return p;
  }, []);
};

// 获取所有半选的key值
const getIndeterminateKeys = () => {
  const treeMap = unref(computedTreeMap);
  const treeMapKeys = [...treeMap.keys()];
  return treeMapKeys.reduce((p, id) => {
    const node = treeMap.get(id);
    isIndeterminateChecked(node) && p.push(id);
    return p;
  }, []);
};

// 获取所有展开的key值
const getExpandedKeys = () => {
  const treeMap = unref(computedTreeMap);
  const treeMapKeys = [...treeMap.keys()];

  return treeMapKeys.reduce((p, id) => {
    const node = treeMap.get(id);
    isExpanded(node) && p.push(id);
    return p;
  }, []);
};

// 获取父节点的选中状态
const getParentNodeCheckedStatus = (node, checked) => {
  const children = node.children;

  const allCheckedByChildren = children.every(
    item => item.checkedStatus === ENUM_CHECKEDSTATUS.CHECKED
  );

  const allUnCheckedByChildren = children.every(
    item => item.checkedStatus === ENUM_CHECKEDSTATUS.UN_CHECKED
  );

  return checked
    ? allCheckedByChildren
      ? ENUM_CHECKEDSTATUS.CHECKED
      : ENUM_CHECKEDSTATUS.INDETERMINATE_CHECKED
    : allUnCheckedByChildren
    ? ENUM_CHECKEDSTATUS.UN_CHECKED
    : ENUM_CHECKEDSTATUS.INDETERMINATE_CHECKED;
};

// 更新节点选中状态
const doUpdateCheckStatus = (node, checked) => {
  const { childrenKeys, parentKeys } = node;

  // 自己改变状态
  node.checkedStatus = checked
    ? ENUM_CHECKEDSTATUS.CHECKED
    : ENUM_CHECKEDSTATUS.UN_CHECKED;

  // 改变孩子状态
  childrenKeys.forEach(childrenKey => {
    const childrenNode = unref(computedTreeMap).get(childrenKey);
    childrenNode.checkedStatus = node.checkedStatus;
  });

  // 改变父亲状态
  parentKeys.forEach(parentKey => {
    const parentNode = unref(computedTreeMap).get(parentKey);
    const checkedStatus = getParentNodeCheckedStatus(parentNode, checked);
    parentNode.checkedStatus = checkedStatus;
  });
};

// 更新节点展开状态
const doUpdateExpanedStatus = (node, expand) => {
  node.expand = expand;
};

// 更新节点显示状态
const doUpdateHiddenStatus = () => {
  const rawExpandedKeys = unref(expandedKeys);
  const treeMap = unref(computedTreeMap);
  const treeMapKeys = [...treeMap.keys()];

  for (let i = 0; i < treeMapKeys.length; i++) {
    const key = treeMapKeys[i];
    const node = treeMap.get(key);

    if (node && rawExpandedKeys && !isRootNode(node)) {
      const parentNode = treeMap.get(node.pid);
      const show = parentNode.expand && !parentNode.hidden;
      node.hidden = !show;
    }
  }
};

// 当多选框选中状态发生变化，触发的事件
const onUpdateCheckStatus = (node, checked) => {
  doUpdateCheckStatus(node, checked);
  const keys = getCheckedKeys();
  checkedKeys.value = keys;
  emits('update:checked-keys', keys, node.originNode);
};

// 当点击展开收起时触发的事件
const onUpdateExpandedStatus = (node, expand) => {
  doUpdateExpanedStatus(node, expand);
  const keys = getExpandedKeys();
  expandedKeys.value = keys;
  emits('update:expanded-keys', keys, node.originNode);
};

const exposeMethods = {
  getCheckedKeys, // 获取选中的数据
  getExpandedKeys, // 获取展开的数据
  getIndeterminateKeys, // 获取半选的数据
};

defineExpose(exposeMethods);

onMounted(() => {
  emits('register', exposeMethods);
});
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
