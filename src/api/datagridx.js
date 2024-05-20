/**
 * 网格组件
 */
import React, { Component } from 'react';
import {useNavigate} from 'react-router-dom';
import { Label, TextBox, DateBox, NumberBox, ComboBox, Messager, Layout, LayoutPanel, DataList, FileButton, LinkButton, ButtonGroup, Tabs, TabPanel, Dialog } from 'rc-easyui';
import {reqdoSQL, myParseInputBaseProps} from './functions.js'
import { DataGrid, GridColumn, ComboGrid,GridColumnGroup,GridHeaderRow } from 'rc-easyui';
import ajax from './ajax'
import axios from "axios";
import ReactDom from 'react-dom'
import { func } from 'prop-types';
import { getByAltText, render } from '@testing-library/react';

export const myParseGridColumns = (columns,type) => {
  //let cols="[@c#160%d]对应课程/coursename;[%d#130]选课号/classno;[%x@c#150]面向对象/scope;[%d#85]任课教师/teachername;[%d#85]发布教师/assigner;[%d#80]发布日期/assigndate;[%d#80]截止日期/requireddate;[%d#65]习题数量/topicnumber;[%d#110]复制方式/copystyle";
  let fieldset=[];
  let fields=columns.split(';');
  let w=0;
  for (let i=0; i<fields.length; i++){
    fieldset[i]={};   //[@c#160%d]对应课程/coursename
    let tmp=fields[i].split('/');  
    if (tmp.length>1) fieldset[i].field=tmp[1];
    let s=tmp[0].toLocaleLowerCase(); //[@c#160%d]对应课程
    let x1=s.indexOf('[');
    let x2=s.indexOf(']');
    s=s.substring(x1+1,x2-x1);  //@c#160%d
    fieldset[i].title=tmp[0].substring(x2+1); //对应课程
    //处理对齐方式
    let x31=s.indexOf('@c');
    let x32=s.indexOf('@l');
    let x33=s.indexOf('@r');  //#160%d
    fieldset[i].align='';
    if (x31>=0){
      fieldset[i].align='center';
    }else if (x33>=0){
      fieldset[i].align='right';
    }else if (x32>=0){
      fieldset[i].align='left';
    }
    s=s.replaceAll('@c','');
    s=s.replaceAll('@l','');
    s=s.replaceAll('@r','');
    //处理数据类型
    let x41=s.indexOf('%d');  //日期型，数字型，默认居中，times new roman字体
    let x42=s.indexOf('%n');  //数值型，默认右对齐，times new roman字体
    let x43=s.indexOf('%f');  //数值型，默认右对齐，非零显示，times new roman字体  
    let x44=s.indexOf('%x');    
    fieldset[i].datatype='c';
    if (x41>=0){
      if (fieldset[i].align=='') fieldset[i].align='center';
      fieldset[i].datatype='d';
    }else if (x42>=0){
      if (fieldset[i].align=='') fieldset[i].align='right';
      fieldset[i].datatype='n';
    }else if (x43>=0){
      if (fieldset[i].align=='') fieldset[i].align='right';
      fieldset[i].datatype='f';
    }    
    s=s.replaceAll('%d','');
    s=s.replaceAll('%n','');
    s=s.replaceAll('%f','');
    s=s.replaceAll('%x','');  //#160
    fieldset[i].width=100;
    let x51=s.indexOf('#');
    if (x51>=0){
      s=s.substring(x51+1);
      if (!isNaN(s)) fieldset[i].width=parseInt(s);
    }
    w+=fieldset[i].width;  
  }
  let columnset=[];
  for (let i=0; i<fieldset.length; i++){
    let item=fieldset[i];
    if (item.datatype=='d' || item.datatype=='f' || item.datatype=='n'){
        columnset.push(<GridColumn frozen={type=='fixed'? true:false}  key={'_'+item.field} width={item.width} align={item.align} halign='center' field={item.field} title={<span className="labelStyle">{item.title}</span>} totalwidth={w}
        render={({ row }) => (<div style={{ fontFamily:'times new roman' }}>{row[`${item.field}`]}</div>)}></GridColumn>)
    }else{
       columnset.push(<GridColumn frozen={type=='fixed'? true:false} key={'_'+item.field} width={item.width} align={item.align} halign='center' field={item.field} title={<span className="labelStyle">{item.title}</span>} totalwidth={w}>
       </GridColumn>)
    }
  }
  return columnset;
}	

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
    if (attr.toolbar === undefined) attr.toolbar=false;
    
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
    //console.log(1141,this.state.keyvalue, this.state.pageno, this.state.pagesize, this.state.rowindex,this.state.reloadflag);
    //this.loadGridData(this.state.pageno, this.state.pagesize, this.state.rowindex, this.state.keyvalue);
    this.loadGridData(1, this.state.pagesize, 0, this.state.keyvalue);
    this.setState({reloadflag:0})
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
      p.filter = '';
      p.keyvalue = keyvalue;
      p.sqlprocedure = this.state.attr.sqlprocedure;
      console.log(p)
      rs = await reqdoSQL(p);
      console.log(666,rs.rows);
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

  render() {  //datagrid
    const toolbar1 = () => {
      return (
        <div id="toolbar1" style={{ paddingTop: 2, paddingLeft: 4, backgroundColor: '#E0ECFF', height: 33, overflow: 'hidden' }}>
          <LinkButton style={{ width: 68, height: 28 }} iconAlign="left" iconCls="okIcon" onClick={this.handleOkClick.bind(this)} >确定</LinkButton>
          <LinkButton style={{ width: 68, height: 28 }} iconAlign="left" iconCls="closeIcon" onClick={this.handleCloseClick.bind(this)} >关闭</LinkButton>
        </div>
      )
    }

    let { onRowSelect,onRowDblClick }= this.props;
    let { pageno, pagesize, rowindex, fixedcols, cols, frozenwidth } = this.state.attr;
    //console.log(115, pageno, pagesize, rowindex)
    return (
      <div style={{}}>
        <DataGrid ref={ref => this.datagrid = ref} data={this.state.data} style={{ width: '100%', height: '100%', position: 'absolute' }} 
         border={false} selectionMode="single" pagination={pagesize>0? true:false} 
         pageNumber={this.state.pageno} pageSize={this.state.pagesize}
         onPageChange={({ pageNumber, pageSize }) => {this.handlePageChange(pageNumber, pageSize);}}
         frozenWidth={frozenwidth+34} 
         onRowSelect={(row) => {this.handleRowSelect(row)}}
         xonRowDblClick={(row) => {onRowSelect?.(row);}}
         toolbar={() => toolbar1()}
         { ...this.props }> 
          <GridColumn frozen width={34} align="center" field="_rowindex" cellCss="datagrid-td-rownumber" render={({ rowIndex }) => (<span style={{fontFamily:'times new roman'}}>{rowIndex + 1}</span>)}></GridColumn>
          {fixedcols}
          {cols}
        </DataGrid>        
      </div>
    )
  }
}

export class MyComboGrid extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    if (props.params!=undefined && typeof props.params==='string'){
      //将字符串转换成json对象。参数逗号间隔，例如'filter,快速过滤, 72, 2, 16,0, 300,,'
      let tmp=props.params.split(';'); //id, label, labelwidth, top, left, height, width, value, style 
      for (let i=0; i<tmp.length; i++) tmp[i]=tmp[i].trim();
    }
    //attr={...attr, ...props};  //
    console.log(110,props);
    let attr=myParseInputBaseProps(this.props);
    if (attr.columns === undefined) attr.columns='';
    if (attr.fixedcolumns === undefined) attr.fixedcolumns='';
    if (attr.title === undefined) attr.title='';
    if (attr.valuefield === undefined) attr.valuefield=attr.id;
    if (attr.textfield === undefined) attr.valuefield=attr.valuefield;   
    if (attr.pageno === undefined) attr.pageno=1;
    if (attr.pagesize === undefined) attr.pagesize=10;
    if (attr.rowindex === undefined) attr.rowindex=0;
    attr.pagesize=parseInt(attr.pagesize);
    attr.pageno=parseInt(attr.pageno);
    attr.rowindex=parseInt(attr.rowindex);
    attr.cols=myParseGridColumns(attr.columns,'');
    if (attr.fixedcolumns!=''){
      attr.fixedcols=myParseGridColumns(attr.fixedcolumns,'fixed');  //frozen
      let w=0;
      for (let i=0; i<attr.fixedcols.length; i++){
        //attr.fixedcols[i].props.frozen=true;
        w+=parseInt(attr.fixedcols[i].props.width);
      }
      attr.frozenwidth=w; //attr.fixedcols[0].totalwidth;
      console.log(5555,attr.fixedcols)
    }else{ 
      attr.fixedcols=[];
      attr.frozenwidth=0;
    }
    console.log(112,attr);
    this.state = {
      value:'',        
      attr: attr,
      data: [],  //全部页的数据
      total: 0,
      pageno: attr.pageno,
      pagesize: attr.pagesize,
      rowindex: attr.rowindex,
      row: {},
      rows: []
    }
  }

  async componentDidMount() {    
    this.loadGridData(this.state.pageno, this.state.pagesize, this.state.rowindex); 
  }

  loadGridData =  async (pageno, pagesize, rowindex)=>{
    //console.log(113,pageno, pagesize);
    //打开窗体时，pageNumber自动变成1
    var p = {};
    p.pageno = pageno;
    p.pagesize = pagesize;
    p.filter = '';
    p.sqlprocedure = this.state.attr.sqlprocedure;
    const rs = await reqdoSQL(p); //1.获取到数据
    let total = (rs.rows.length === 0 ? 0 : parseInt(rs.rows[0].total)); //2.获取总行数
    var data = new Array(total).fill({});   //3.建立一个总行数长度的数组,其他行为空值
    if (rowindex<0) rowindex = this.state.rowindex;
    if (rowindex < 0 && total > 0) rowindex = 0;    
    data.splice((pageno - 1) * pagesize, pagesize, ...rs.rows)  //4.替换数组中指定位置的数据
    if (rowindex > rs.rows.length - 1) rowindex = rs.rows.length - 1;  //???
    this.setState({ data: data, total: total, rows: rs.rows, rowindex: rowindex, pageno: pageno, pagesize: pagesize }, () => {
       setTimeout(() => {
         if (rowindex >= 0 && data.length > 0) {
           //this.combogrid.select(data[(pageno - 1) * pagesize + rowindex]);
           //this.combogrid.scrollTo(data[(pageno - 1) * pagesize + rowindex]);
         }
      })
    });
  }

  handleRowSelect = (row) => {
    this.setState({row, row});
  }
  handleOnFocus = () => {
    //this.setState({value:55});
    console.log(this.state.pageno, this.state.pagesize, this.state.rowindex);
    this.loadGridData(this.state.pageno, this.state.pagesize, this.state.rowindex);
  }

  handleOnChange = (value) => {  
    this.setState({ value:value}, () => {
      setTimeout(() => {
        this.loadGridData(6,10,5)
        //
      })
   });
  }


  render() {
    let { onFocus,onRowSelect }= this.props;
    let { id, valuefield,textfield, label, labelwidth, pageno, pagesize, rowindex, fixedcols, cols, frozenwidth, top, left, width, height,panelwidth,panelheight,openPanel } = this.state.attr;
    //console.log(115, pageno, pagesize, rowindex)
    return (
      <div style={{position:'absolute', top:top, left:left}}>
            <Label htmlFor={id} style={{width:labelwidth}} className="labelStyle" >{label}</Label>
            <ComboGrid inputId={id} id={id} value={this.state.value} ref={grid => this.combogrid = grid} columnResizing pagination border={false} panelStyle={{ width:panelwidth, height:panelheight, position:'absolute' }} panelAlign="left"
              style={{width:width}} data={this.state.data} editable={false}
              valueField={valuefield} textField={textfield}
              pageOptions={{ total:this.state.total, layout: ['list', 'sep', 'first', 'prev', 'next', 'last', 'sep', 'refresh', 'sep', 'manual', 'info'], displayMsg: '当前显示 {from}~{to}行， 共{total}行', beforePageText:'第', afterPageText:'页' }}
              onPageChange={({ pageNumber, pageSize }) => this.loadGridData( pageNumber, pageSize,-1 )}
              xonChange={(value) => this.setState({ value: value })}
              onChange={(value)=>this.handleOnChange(value)}
              pageNumber={this.state.pageno} pageSize={this.state.pagesize} 
              frozenWidth={frozenwidth+34} 
              xonRowSelect={(row) => {onRowSelect?.(row); this.handleRowSelect(row)}}
              xonFocus={this.handleOnFocus.bind(this)} 
              onFocus={(row) => {onFocus?.(); this.handleOnFocus()}}
              { ...this.props }>
              <GridColumn frozen width={34} align="center" field="_rowindex" cellCss="datagrid-td-rownumber" render={({ rowIndex }) => (<span style={{fontFamily:'times new roman'}}>{rowIndex + 1}</span>)}></GridColumn>
              {fixedcols}
              {cols}
            </ComboGrid>
      </div>

    )
  }
}
