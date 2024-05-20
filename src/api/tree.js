/**
 * 树组件
 */
 import React, { Component } from 'react';
 import {useNavigate} from 'react-router-dom';
 import { Label, TextBox, DateBox, NumberBox, ComboBox,Tree, Messager, Layout, LayoutPanel, DataList, FileButton, LinkButton, ButtonGroup, Tabs, TabPanel, Dialog } from 'rc-easyui';
 import {reqdoSQL, reqdoTree, addTreeChildrenData, MyTextBox  } from './functions.js'
 import { DataGrid, GridColumn} from 'rc-easyui';
 import ajax from './ajax'
 import axios from "axios";
 import ReactDom from 'react-dom'
 //import { func } from 'prop-types';
 //import { getByAltText, render } from '@testing-library/react';
 
 export class MyTree extends React.Component {  //class的名称必须大写字母开头
   constructor(props) {
     super(props);
     let attr={};
     attr.sqlparams={};
     if (props.params!=undefined && typeof props.params==='string'){
       //将字符串转换成json对象。参数逗号间隔，例如'filter,快速过滤, 72, 2, 16,0, 300,,'
       let tmp=props.params.split(';'); //id, label, labelwidth, top, left, height, width, value, style 
       for (let i=0; i<tmp.length; i++) tmp[i]=tmp[i].trim();
     }
     attr={...attr, ...props};  //
     if (attr.keyfield === undefined) attr.keyfield='';
     if (attr.keyvalue === undefined) attr.keyvalue='';
     if (attr.treestyle === undefined) attr.treestyle='expand';
     if (attr.tbar === undefined) attr.tbar='';
     if (attr.bbar === undefined) attr.bbar='';
     if (attr.title === undefined) attr.title='';
     attr.ok=false;
     attr.close=false;
     attr.cancel=false;
     attr.filter=false;
     let tmp=attr.tbar.toLowerCase().split(';');
     if (tmp.includes('filter')) attr.filter=true;
     tmp=attr.bbar.toLowerCase().split(';');
     if (tmp.includes('ok')) attr.ok=true;
     if (tmp.includes('close')) attr.close=true;
     if (tmp.includes('cancel')) attr.cancel=true;
     console.log(666,attr.onlyLeafCheck);
     this.state = {        
        attr: attr,
        display: 'block',
        data: [],  //全部页的数据
        treestyle: attr.treestyle,
        tablename: attr.tablename,
        keyfield: attr.keyfield,
        keyvalue: attr.keyvalue, 
        node: {}
     }
   }
 
   async componentDidMount() {    
     this.loadTreeData(this.state.node);
   }

   findNodeInTree = (data, key, callback) => {
     //根据主键值查找这个节点
     for (let i = 0; i < data.length; i++) {
       if (data[i][this.state.keyfield] == key) {
         return callback(data[i], i, data)
       }
       if (data[i].children) {
         this.findNodeInTree(data[i].children, key, callback)
       }
     }
   }
  
  /*   
  loadTreeData = async (node) => {
    var p = {};
    if (this.state.attr.sqlparams !== undefined) p = { ...this.state.attr.sqlparams };
    p.style = this.state.treestyle;
    p.sqlprocedure = this.state.attr.sqlprocedure;
    if (this.state.treestyle === 'expand') {
      p.keyvalue = '';
      p.parentnodeid = '';
      p.ancester = '';
      p.level = 1;
    }else{
      p.keyvalue = this.state.keyvalue;
    }
    var rs1 = await reqdoTree(p); //调用函数，执行存储过程，返回树节点
    let newnode;
    //定位到keyvalue那个结点
    let keyvaluex=this.state.keyvalue.toLowerCase();  //查找时不区分节点字母大小写
    let ancestor='';
    let index;
    if (this.state.keyvalue!='') {
      if (p.style == 'expand'){ 
        //分层展开节点模式
        p.keyvalue = this.state.keyvalue;
        let rs2 = await reqdoSQL(p);  //提取这个节点及其所有层次父节点，非树形结构，为数组
        let index = rs2.rows.findIndex(item => item.id.toLowerCase() === keyvaluex);  //在数组中找到这个节点
        if (index>=0) ancestor=rs2.rows[index].ancestor;
        if (ancestor!=''){
          //如果存在祖先节点，即非根节点
          let tmp = ancestor.toString().split('#');
          //找到这个节点的祖先节点
          tmp = tmp.filter(item => item != '');  //去掉最后一个空节点                    
          //分层展开节点，使用递归找到每一个父节点
          let Obj = {};
          for (let i in tmp) { 
            this.findNodeInTree(rs1.rows, tmp[i], (item, index, arr) => {
              Obj = item;
            })        
            Obj.children = rs2.rows.filter(item => parseInt(item.level) === parseInt(Obj.level )+1);
            this.tree.expandNode(Obj);  //展开这个父节点
          }
          newnode=rs2.rows[index];
        }
      }else{
        //一次性展开节点模式，递归直接查找节点
        ancestor=rs1.rows[0]._ancestor;
        if (ancestor!=''){
          let tmp = ancestor.split('#'); //找到这个节点的祖先节点
          tmp = tmp.filter(item => item != '');  //去掉最后一个空节点
          //分层展开节点，使用递归找到每一个父节点
          let xdata=[...rs1.rows];
          let Obj = {};
          for (let i in tmp) { 
            //找到和展开所有父节点
            index = xdata.findIndex(item => item.id.toLowerCase() === tmp[i].toLowerCase());//在数组中找到这个父节点
            if (index>=0){
              Obj=xdata[index];
              xdata=Obj.children;
              this.tree.expandNode(Obj);  //展开这个父节点
            }
          }
          index = xdata.findIndex(item => item.id.toLowerCase() === keyvaluex);//在数组中找到这个节点
          if (index>=0) newnode=xdata[index];
        }
      }
      //无论哪种节点展开方式，如果是根节点的话，处理方式相同
      if (ancestor==''){
        index = rs1.rows.findIndex(item => item.id.toLowerCase() === keyvaluex);//在数组中找到这个节点
        if (index>=0) newnode=rs1.rows[index];
      }
    }
    this.setState({ data: rs1.rows }, () => {
      setTimeout(() => {
        if (newnode) this.tree.selectNode(newnode);
        else if (rs1.rows.length>0) this.tree.selectNode(rs1.rows[0]);
      })
    });
  }
  */
  
  loadTreeData = async (node) => {
    var p = {};
    if (this.state.attr.sqlparams !== undefined) p = { ...this.state.attr.sqlparams };
    p.style = this.state.treestyle;  //当keyvalue非空时一般style先用full，再用expnad    
    p.sqlprocedure = this.state.attr.sqlprocedure;
    p.keyvalue = this.state.keyvalue;
    p.parentnodeid='';
    p.ancester = '';
    p.level = 1;
    //p.keyvalue不为空时，使用full
    if (p.style=='expand' && p.keyvalue!='') p.style='full';
    var rs = await reqdoTree(p); //调用函数，执行存储过程，返回树节点
    let newnode;
    //定位到keyvalue那个结点
    let keyvaluex=this.state.keyvalue.toLowerCase();  //查找时不区分节点字母大小写
    let ancestor='';
    let index;
    if (rs.rows.length>0 && this.state.keyvalue!='') {
      //一次性展开节点模式，递归直接查找节点
      ancestor=rs.rows[0]._ancestor;
      if (ancestor!=''){
        let tmp = ancestor.split('#'); //找到这个节点的祖先节点
        tmp = tmp.filter(item => item != '');  //去掉最后一个空节点
        //分层展开节点，使用递归找到每一个父节点
        let xdata=[...rs.rows];
        let Obj = {};
        for (let i in tmp) { 
          //找到和展开所有父节点
          index = xdata.findIndex(item => item.id.toLowerCase() === tmp[i].toLowerCase());//在数组中找到这个父节点
          if (index>=0){
            Obj=xdata[index];
            xdata=Obj.children;
            this.tree.expandNode(Obj);  //展开这个父节点
           }
        }         
        index = xdata.findIndex(item => item.id.toLowerCase() === keyvaluex);//在数组中找到这个节点
        if (index>=0) newnode=xdata[index];
      }else{
        //根节点查找
        index = rs.rows.findIndex(item => item.id.toLowerCase() === keyvaluex);//在数组中找到这个节点
        if (index>=0) newnode=rs.rows[index];
      }
    }  
    this.setState({ data: rs.rows }, () => {
      setTimeout(() => {
        if (newnode) this.tree.selectNode(newnode);
        else if (rs.rows.length>0) this.tree.selectNode(rs.rows[0]);
      })
    });
  }

   getChildNodes = async (pnode) => {
     //从数据库提取一个节点的子节点
     let p = {};
     if (this.state.attr.params!=undefined) p={...this.state.attr.params};
     p.style = 'expand' //this.state.treestyle;
     p.keyvalue = '';
     p.parentnodeid = pnode.id;
     p.level = parseInt(pnode.level) + 1;
     p.ancestor=pnode.ancestor;
     p.sqlprocedure = this.state.attr.sqlprocedure;
     let rs=await reqdoTree(p);
     console.log(772,rs.rows);
     return rs;
   }
 
   async handleNodeExpand(node) {  //新增和展开子节点
    if (node.children && node.children.length === 1 && node.children[0].text.trim() === '') {
      let rs = await this.getChildNodes(node);
      //替换原数组data中的children值
      let data = [...this.state.data];
      data = addTreeChildrenData(data, node, rs.rows); //将rs.rows数据添加为node的子节点
      this.setState({ data: data }, () => {
        setTimeout(() => {
          this.tree.expandNode(node);
          this.tree.selectNode(node);
        })
      });
    }
  }
 
   handleTreeDblClick(node){
     if (node.isparentflag>0){
       if (node.state==='closed') this.tree.expandNode(node);
       else this.tree.collapseNode(node);
     }else if (this.state.attr.onlyLeafCheck){
        this.state.attr.onNodeDblClick?.(node);
     }
   }
 
   handleSelectionChange=(node)=>{
     this.setState({node: node});
   }
 
   handleContextMenu(e){
     e.originalEvent.preventDefault();
     this.tree.selectNode(e.node);
   }  
 
   handleCloseClick=()=>{
     this.state.attr.onClose?.();
   }
 
   handleOkClick=()=>{
     let row=this.state.row;
     this.state.attr.onRowDblClick?.(row);
   }
 
   handleAddonClick = async (flag) => {  //addon小图标点击事件
     this.loadGridData(1, this.state.pagesize, 0, '');
   }
 
   tbar = ()=>{
     return (
     <LayoutPanel region="north" border={false} style={{display:this.state.attr.filter? 'block' : 'none'}}>
         <div style={{display:this.state.attr.filter? 'block' : 'none', paddingTop: 2, paddingLeft: 4, backgroundColor: '#E0ECFF', height: 33, overflow: 'hidden' }}>
           <MyTextBox params='filtertext,快速过滤,70,2,20,0,300' ref={ref => this.filtertext = ref} addonRight={() => <span className='textbox-icon icon-search' onClick={this.handleAddonClick.bind(this, 'filter1')}></span>} />
         </div>
      </LayoutPanel>)
   }
 
   bbar = ()=>{
     return(
       <LayoutPanel region="south" border={false}>
         <div style={{display:this.state.attr.ok || this.state.attr.close || this.state.attr.cancel ? 'block' : 'none', borderTop: '1px solid #95B8E7', paddingTop: 4, paddingLeft: 4,  paddingRight: 24, backgroundColor: '#E0ECFF', height: 36, overflow: 'hidden' }}>
           <LinkButton style={{display:this.state.attr.close ? 'block' : 'none', float:'right', width: 68, height: 28 }} iconAlign="left" iconCls="closeIcon" onClick={this.handleCloseClick.bind(this)} >关闭</LinkButton>
           <LinkButton style={{display:this.state.attr.cancel ? 'block' : 'none', float:'right', width: 68, height: 28 }} iconAlign="left" iconCls="closeIcon" onClick={this.handleCloseClick.bind(this)} >取消</LinkButton>
           <LinkButton style={{display:this.state.attr.ok ? 'block' : 'none', float:'right', width: 68, height: 28 }} iconAlign="left" iconCls="okIcon" onClick={this.handleOkClick.bind(this)} >确定</LinkButton>
         </div>
       </LayoutPanel>)
   }
  
   render() { 
     let { onRowSelect, onNodeDblClick, onOpen }= this.props;
     //console.log(115, pageno, pagesize, rowindex)
     return (
       <div>
         <Layout style={{ width: '100%', height: '100%', position: 'absolute' }}>
           {this.tbar()}         
           {this.bbar()}         
           <LayoutPanel region="center" style={{ height: '100%' }}>
             <Tree data={this.state.data} border={false} ref={node => this.tree = node} 
             style={{ overflow:'auto',width:'100%', height:'100%', position:'absolute' }}
                 { ...this.props }
                 xrender={({ node }) => {    
                   let count = null;
                   if (node.children && node.children.length) {
                     count = <span style={{ color: 'blue' }}> ({node.children.length})</span>
                   }
                   return (
                     <span>
                       {node.text}
                       <button style={{heigh:10,width:20,textAlign:'center'}} onClick={({node}) =>onNodeDblClick?.({node})}>√</button>
                     </span>
                   )
                 }
               } 
                 onSelectionChange={this.handleSelectionChange.bind(this)}
                 onNodeDblClick={(node) => {this.handleTreeDblClick(node)}}
                 onNodeContextMenu={this.handleContextMenu.bind(this)}
                 onNodeExpand={this.handleNodeExpand.bind(this)} >
             </Tree>
           </LayoutPanel>
         </Layout>
       </div>
     )
   }
 }
 