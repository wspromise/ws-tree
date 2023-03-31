
## 树形层级选择器
### 简介
在做uniapp移动端项目的时候，由于没有找到合适的移动端树形组件，所以自己动手封装了一个树组件。
* 每个节点都可以选中或取消选中，父级节点选中，下级的所有节点都要全部选中；
* 当下级节点部分选中时，父级节点处于半选状态；
* 当下级节点不选中时，父级节点处于取消选中行状态；
* 可展开或折叠，父级节点收起时，下级所有节点隐藏；
### 使用方法
在 `script` 中引入组件
``` javascript
    import WsTree, { useWsTree }  from "@/components/ws-tree"
    export default {
        components: {
            WsTree
        },
        setup(){
            const [register, { getCheckedKeys,  getExpandedKeys,  getIndeterminateKeys }] = useWsTree();
            return {
                register
            }
        }
```
在 `template` 中使用组件
``` javascript
   <ws-tree
              :data="data"
              childrenField= 'children'
              labelField='label' 
              keyField='id'
              checkable
              v-model:checked-keys="checkedKeys"
              @register="register"
            ></ws-tree>

```
### 属性
|属性名|类型|默认值|说明|
|:-|:-:|:--:|:-|
|data|Array|[]|treeNodes 数据，key 在整个树范围内唯一|
|keyField|String|key|指定 Object 中 key 的值作为节点数据id|
|labelField|String|label|指定 Object 中 key 的值作为节点显示内容|
|childrenField|String|children|指定 Object 中 key 的值作为节点子集|
|checkable|Boolean|false|是否开启多选|
|defaultExpandAll|Boolean|false|默认是否展开所有树节点|
|indent|Number|40|缩进，单位是rpx，默认40rpx|
|checkboxPlacement|String|left|多选框的位置，可选值是left、right|
|checkedKeys|Array|[]|选中的keys|
|expandedKeys|Array|[]|展开的keys|



###  数据格式
注意：id、name、children可通过keyField、labelField、childrenField来配置，keyField字段在整棵树里是唯一的
``` json
[
    {
        id: 1,
        name: '公司1',
        children: [{
            id: 11,
            name: '研发部',
            children: [{
                id: 111,
                name: '张三',
               
            },{
                id: 112,
                name: '李四',
               
            }]
        },{
            id: 12,
            name: '综合部',
           
        } ]
    },
    {
        id: 2,
        name: '公司2',
        children: [{
            id: 21,
            name: '研发部',
           
        },{
            id: 22,
            name: '综合部',
           
        },{
            id: 23,
            name: '财务部',
           
        }, ]
    },
    {
        id: 3,
        name: '公司3'
    },
    {
        id: 4,
        name: '公司4',
        children: [{
            id: 41,
            name: '研发部',
           
        }]
    }
]
```
### 方法
|方法名|说明|
|:-|-:|
|getCheckedKeys()|获取选中的节点的keys|
|getExpandedKeys()|获取展开的节点的keys|
|getIndeterminateKeys()|获取半选中的节点的keys|


