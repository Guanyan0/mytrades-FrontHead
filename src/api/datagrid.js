/**
 * 网格组件
 */
import React, { Component } from 'react';
import {useNavigate} from 'react-router-dom';
import { Label, TextBox, DateBox, NumberBox, ComboBox, Messager, Layout, LayoutPanel, DataList, FileButton, LinkButton, ButtonGroup, Tabs, TabPanel, Dialog } from 'rc-easyui';
import {reqdoSQL, myParseInputBaseProps, MyTextBox, myParseGridColumns } from './functions.js'
import { DataGrid, GridColumn} from 'rc-easyui';
import ajax from './ajax'
import axios from "axios";
import ReactDom from 'react-dom'
import { func } from 'prop-types';
import { getByAltText, render } from '@testing-library/react';

export class MyDataGrid extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    let attr={};
    if (props.params!=undefined && typeof props.params==='string'){
      //将字符串转换成json对象。参数逗号间隔，例如'filter,快速过滤, 72, 2, 16,0, 300,,'
      let tmp=props.params.split(';'); //id, label, labelwidth, top, left, height, width, value, style 
      for (let i=0; i<tmp.length; i++) tmp[i]=tmp[i].trim();
    }
    attr={...attr, ...props};  //
    if (attr.columns === undefined) attr.columns='';
    if (attr.fixedcolumns === undefined) attr.fixedcolumns='';
    if (attr.title === undefined) attr.title='';
    if (attr.pageno === undefined) attr.pageno=1;
    if (attr.pagesize === undefined) attr.pagesize=10;
    if (attr.rowindex === undefined) attr.rowindex=0;
    if (attr.keyfield === undefined) attr.keyfield='';
    if (attr.keyvalue === undefined) attr.keyvalue='';
    if (attr.tbar === undefined) attr.tbar='';
    if (attr.bbar === undefined) attr.bbar='';
    if (attr.title === undefined) attr.title
    ='';
    attr.pagesize=parseInt(attr.pagesize);
    attr.pageno=parseInt(attr.pageno);
    attr.rowindex=parseInt(attr.rowindex);
    attr.cols=myParseGridColumns(attr.columns,'');
    if (attr.fixedcolumns!=''){
       attr.fixedcols=myParseGridColumns(attr.fixedcolumns,'fixed');  //frozen
       let w=0;
       for (let i=0; i<attr.fixedcols.length; i++){
          w+=parseInt(attr.fixedcols[i].props.width);
       }
       attr.frozenwidth=w; 
    }else{ 
       attr.fixedcols=[];
       attr.frozenwidth=0;
    }
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
    this.state = {        
       attr: attr,
       editable: attr.editable,
       display: 'block',
       data: [],  //全部页的数据
       total: 0,
       keyfield:attr.keyfield,
       keyvalue:attr.keyvalue, 
       pageno: attr.pageno,
       pagesize: attr.pagesize,
       rowindex: attr.rowindex,
       reloadflag: attr.reloadflag,
       row: {},
       rows: []
    }
  }

  async componentDidMount() {
    this.loadGridData(1, this.state.pagesize, 0, this.state.keyvalue);
    this.setState({reloadflag:0})
  }

  handleonOpen=()=>{
    //
  }

  loadGridData =  async (pageno, pagesize, rowindex, keyvalue)=>{
    console.log(112, pageno, pagesize, rowindex, this.state.reloadflag,this.state.pageno, this.state.keyvalue,keyvalue);
    //打开窗体时，pageNumber自动变成1,见该数据集清空
    let rs;
    let total;    
    /*
    if (pageno!==this.state.pageno && pageno==1 && rowindex==-1){
      rs={};
      rs.rows=[];
      total=0;
    }else{  
      */
      let p = {};
      p.pageno = pageno;
      p.pagesize = pagesize;
      if (this.state.attr.filter) p.filter = this.filtertext.state.value;
      else p.filter = '';
      p.keyvalue = keyvalue;
      p.sqlprocedure = this.state.attr.sqlprocedure;
      rs = await reqdoSQL(p);
      total = (rs.rows.length === 0 ? 0 : parseInt(rs.rows[0].total)); //2.获取总行数
      if (p.keyvalue!=''){  //根据keyvalue值计算页码与行号
        pageno = (rs.rows.length === 0 ? 0 : parseInt(rs.rows[0]._pageno));
        rowindex = (rs.rows.length === 0 ? 0 : parseInt(rs.rows[0]._rowindex-1));
      }
    //}
    let data = new Array(total).fill({});   //3.建立一个总行数长度的数组,其他行为空值
    if (rowindex<0) rowindex = this.state.rowindex;
    if (rowindex < 0 && total > 0) rowindex = 0;    
    data.splice((pageno - 1) * pagesize, pagesize, ...rs.rows)  //4.替换数组中指定位置的数据
    if (rowindex > rs.rows.length - 1) rowindex = rs.rows.length - 1;  //???
    this.setState({ data: data, total: total, rows: rs.rows, rowindex: rowindex, pageno: pageno, pagesize: pagesize }, () => {
       setTimeout(() => {
         if (rowindex >= 0 && data.length > 0) {
            this.datagrid.selectRow(data[(pageno - 1) * pagesize + rowindex]);
            this.datagrid.scrollTo(data[(pageno - 1) * pagesize + rowindex]);
          }
      })
    });  
  }

  handlePageChange=(pageNumber, pageSize)=>{
    //console.log(115,this.state.reloadflag,this.state.pageno,this.state.rowindex);
    if (this.state.reloadflag==0){
      console.log(117,this.state.pageno);
      //this.loadGridData(1, this.state.pagesize, -1, ''); 
      this.loadGridData(this.state.pageno, this.state.pagesize, this.state.rowindex, '');
      this.setState({reloadflag:1})
    }else{ 
      this.loadGridData(pageNumber, pageSize, -1,'');  //-1表示不指定行号 
    }
  }

  handleRowSelect = (row) => {
    this.setState({row, row});
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

  toolbar1 = () => {
    return (
      <div id="toolbar1" style={{ paddingTop: 2, paddingLeft: 4, backgroundColor: '#E0ECFF', height: 33, overflow: 'hidden' }}>
        <LinkButton style={{ width: 68, height: 28 }} iconAlign="left" iconCls="okIcon" onClick={this.handleOkClick.bind(this)} >确定</LinkButton>
        <LinkButton style={{ width: 68, height: 28 }} iconAlign="left" iconCls="closeIcon" onClick={this.handleCloseClick.bind(this)} >关闭</LinkButton>
      </div>
    )
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

  render() {  //datagrid    
    let { onRowSelect, onRowDblClick, onOpen }= this.props;
    let { pageno, pagesize, rowindex, fixedcols, cols, frozenwidth,title } = this.state.attr;
    //console.log(115, pageno, pagesize, rowindex)
    return (
      <div>
        <Layout style={{ width: '100%', height: '100%', position: 'absolute' }}>
          {this.tbar()}         
          {this.bbar()}         
          <LayoutPanel region="center" style={{ height: '100%' }}>
            <DataGrid ref={ref => this.datagrid = ref} data={this.state.data} style={{ width: '100%', height: '100%', position: 'absolute'}} 
              border={false} selectionMode="single" pagination={pagesize>0? true:false} 
              pageNumber={this.state.pageno} pageSize={this.state.pagesize}
              onPageChange={({ pageNumber, pageSize }) => {this.handlePageChange(pageNumber, pageSize);}}
              frozenWidth={frozenwidth+34} 
              onRowSelect={(row) => {this.handleRowSelect(row)}}
              xonRowDblClick={(row) => {onRowSelect?.(row);}}
              xtoolbar={() => this.toolbar1()}
              { ...this.props }> 
              <GridColumn frozen width={34} align="center" field="_rowindex" cellCss="datagrid-td-rownumber" render={({ rowIndex }) => (<span style={{fontFamily:'times new roman'}}>{rowIndex + 1}</span>)}></GridColumn>
              {fixedcols}
              {cols}
            </DataGrid>   
          </LayoutPanel>
        </Layout>
      </div>
    )
  }
}
