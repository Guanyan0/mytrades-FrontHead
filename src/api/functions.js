/**
 * 包含应用中使用请求接口的模块
 */
import ajax from './ajax'
import React, { Component } from 'react';
import {useNavigate} from 'react-router-dom';
import { Label, TextBox, DateBox, NumberBox, ComboBox, Messager, Layout, LayoutPanel, DataList, FileButton, LinkButton, ButtonGroup, Tabs, TabPanel, Dialog } from 'rc-easyui';
import { ComboTree, DataGrid, GridColumn } from 'rc-easyui';
import { useEffect,useRef, useImperativeHandle } from 'react';
import axios from "axios";
import ReactDom from 'react-dom'
import { func } from 'prop-types';
import { getByAltText, render } from '@testing-library/react';

//定义全局变量
const sys={};
sys.label={};
sys.label.fontsize=14;
sys.label.fontname='楷体'; 
sys.panelcolor="#E0ECFF";
sys.bordercolor='#95B8E7';  //panel边框线颜色
sys.headercolor='#efefef';  //网格标题和footer的颜色 

export const myDate = (date, format) => {  //转换字符串为日期
  let d=new Date(date);  
  //console.log(d,date)
  return d;
}

export const myDatetoStr = (date, format) => {  //转换日期为字符串
  let y=date.getFullYear();
  let m=(date.getMonth()+101).toString();
  let d=(date.getDate()+100).toString();
  let s=y+'-'+m.slice(-2)+'-'+d.slice(-2);
  return s;
}

export const myIsArray=(o)=>{ //判断某个变量是不是数组类型
	return Object.prototype.toString.call(o)=='[object Array]';
}

export const myStr2Json= (str) =>{ //将一个字符串转成json对象，判断是否合法
	var obj={};
    if (typeof str == 'string' && str!='') {
		if (str.substring(0,1)=='"' || str.substring(0,1)=="'") str=str.substring(1, str.length-1); //去掉双引号
    	str=str.replace(/\n/g, "<br/>");  //不能有换行。这样会正确，否则json换行字符串会出语法错误。不能使用<br>要用<br/>
        try{
            obj=JSON.parse(str);
        }catch(e){
        	obj={};
        }
    }
    return obj;
}

export const myStr2JsonArray=(value)=>{
	if (value==undefined || value=='' || value=='{}' || value=='[{}]') value=[];
	else value=myStr2Json(value);
	if (!myIsArray(value)){  //将值转换为数组形式
		var s=value;
		value=[];
		value.push(s);  //值作为一个元素存放到数组
	}			
	return value;
}

String.prototype.replaceAll = function (s1, s2){
	var s = this;
	if (s==undefined) s='';
  return this.replace(new RegExp(s1,'gm'), s2);
	//var result=s;
	//if (result.indexOf(s1)>=0) result = str.replace(eval("/"+str1+"/gi"), str2);
	//return result;
}

export const mySelectOnFocus=()=>{ //聚焦后选中全文本，有bug
  /*
	$('input').on('focus', function() {
		var $this = $(this)
		.one('mouseup.mouseupSelect', function() {
			$this.select();
			return false;
		})
		.one('mousedown', function() {
			// compensate for untriggered 'mouseup' caused by focus via tab
			$this.off('mouseup.mouseupSelect');
		})
		.select();
	});
  */
}

// 登录
// const Base ='http://localhost:/8080/imlab'
// /imlab/doLogin?dbms=mysql&database=&action=login&paramvalues={"userid":"20000555","password":"123456","autologin":1}
// /imlab/doLogin?dbms=mysql&database=&action=login&paramvalues={"userid":"20000555,"password":"123456","autologin":1}
//登录请求
export const reqLogin = (dbms, database, action, paramvalues) => {
     var url = '/myServer/doLogin?dbms=' + dbms + '&database=' + database + '&action=' + action + '&paramvalues=' + encodeURIComponent(paramvalues)
     //console.log(url)
     return ajax(url, {}, 'POST')
     // return ajax('/imlab/doLogin', {dbms, database, action, paramvalues}, 'POST')
}

export const fetchData = sqlprocedure => $fetchData({sqlprocedure})
export const $fetchData = async (params) => {
   if (params.nodetype === undefined) params.nodetype='datagrid'; 
   return fetch(`http://localhost:8080/myServer/doSQL?paramvalues=${JSON.stringify(encodeURIComponent(params))}`).then(res => res.json())
}

//数据增删改查请求
export const reqdoSQL = (params) => {
  if (params.nodetype === undefined) params.nodetype='datagrid'; 
  const paramvalues = JSON.stringify(params);
  //var url = '/myServer/doSQL?paramvalues='+encodeURIComponent(paramvalues);
  var url = 'http://localhost:8080/myServer/doSQL?paramvalues='+encodeURIComponent(paramvalues);
  return ajax(url, {}, 'POST');
}

export const reqdoTree = (params) => {
  params.nodetype='tree'; 
  if (params.style === undefined || params.style!=='expand') params.style="full";  
  if (params.keyvalue === undefined) params.keyvalue='';
  const paramvalues = JSON.stringify(params);
  //var url = '/myServer/doSQL?paramvalues='+encodeURIComponent(paramvalues);
  var url = 'http://localhost:8080/myServer/doSQL?paramvalues='+encodeURIComponent(paramvalues);
  return ajax(url, {}, 'POST');
}

export const MyRedirect = (to) => {
  let navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
}

export const navigateCom = (A) => {  //在props中添加一个navigate属性
  return (props) => {
      let navigate = useNavigate();
      return <A {...props} navigate={navigate} />
  }
}

export const myFileSize = (size) =>{
  let x=0;
  if (size<=1024) x=size;
  else if (size<=1024*1024) x=size/1024.00;
  else if (size<=1024*1024*1024) x=size/1024.00/1024.0;
  else x=size/1024/1024.00/1024.0;
  x=parseFloat(parseInt((x+0.005)*100)/100);
  let str='';
  if (size<=1024) str=parseInt(x)+"B";
  else if (size<=1024*1024) str=x+"KB";
  else if (size<=1024*1024*1024) str=x+"MB";
  else str=x+"GB";
  return str;
}

function anonyCom(A) {
  return (props) => {
    let navigate = useNavigate();
    return <A {...props} navigate={navigate} />
  }
}

export const xmyOnFocusEvent =  async (id) =>{
  //控件onchange事件补充
  console.log(991,id);
  return;

}

export const renderGridTitle = (title) => {
  return (<span className="labelStyle">{title}</span>);
}

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

export const myLoadData =  async (id) =>{
  //console.log(id.props.sqlparams);
   let p={...id.props.sqlparams};
   let rs = await reqdoSQL(p);
   id.setState({data: rs.rows});
}

//tree处理函数
//obj传入多层json格式数据,targetId需要插入数据的id, targetChildren插入的数据
export const searchTreeNode = (data, node) => {
  // console.log(111,data);
  // console.log(112,node);
  //找到这个节点的父节点、上一个节点、下一个节点、当前理解点和在父节点数组中的位置,返回在数组中的下标位置
  let json={};
  json.nextnode=null;
  json.priornode=null;
  json.currentnode=null;  
  json.path='';  
  let parentnode=null;
  let index=-1;
  let rs='';
  if (node.ancestor!=undefined && node.ancestor!=''){
     var tmp=node.ancestor.split('#');
     var xdata=[...data];
     for (var i=0; i<tmp.length-1; i++){
        index=xdata.findIndex(item=>item.id==tmp[i]);
        if (index>=0){
          rs+='['+index+'].children';
          parentnode=xdata[index];
          xdata=xdata[index].children;
        }else{
          break;
        }
    }
  }
  if (parentnode!=null && parentnode.children!=undefined){
    index=xdata.findIndex(item=>item.id==node.id);
    if (index<xdata.length-1) json.nextnode=xdata[index+1];
    if (xdata.length>1 && index>0) json.priornode=xdata[index-1];
    if (index>=0) json.currentnode=xdata[index];
  }else{
    //根节点处理
    index=data.findIndex(item=>item.id==node.id);
    if (index<data.length-1) json.nextnode=data[index+1];
    if (data.length>1 && index>0) json.priornode=data[index-1];
    if (index>=0) json.currentnode=data[index];
  }
  json.parentnode=parentnode;
  json.index=index;
  if (index>=0) rs+='['+index+']';
  json.path=rs;
  return json;
}

export const addTreeChildrenData=(data, pnode, children) => {
  //一个父节点替换其所有子节点
  var s=searchTreeNode(data, pnode).path; //找到当前节点的下标
  //console.log(children);
  // console.log('data'+s+'.children = children');
  if (s!='') eval('data'+s+'.children = children');  //获取数组下标，例如data[0].children[1].children[1].children
  return data;
}

export const updateTreeNodeData=(data, node, row) => {
  //替换一个节点的子节点
  var s=searchTreeNode(data, node).path; //找到当前节点的下标
  if (s!='') eval('data'+s+' = row');  //获取数组下标，例如data[0].children[1].children[1].children
  return data;
}

export const removeTreeNodeData=(data, node) => {
  //替换一个节点的子节点
  var xnode=searchTreeNode(data, node); //找到当前节点的下标
  let s=xnode.path;
  let index=xnode.index;
  if (s!='' && index>=0) console.log('data'+s+'.splice(index,1)');  //获取数组下标，例如data[0].children[1].children[1].children
  return data;
}

/*
export const useDate = () => {
  const locale = 'en';
  const [today, setDate] = React.useState(new Date()); // Save the current date to be able to trigger an update
  React.useEffect(() => {
      const timer = setInterval(() => { // Creates an interval which will update the current data every minute
      setDate(new Date());
    }, 60 * 1000);
    return () => {
      clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }, []);
  const day = today.toLocaleDateString(locale, { weekday: 'long' });
  const date = `${day}, ${today.getDate()} ${today.toLocaleDateString(locale, { month: 'long' })}\n\n`;
  const hour = today.getHours();
  const time = today.toLocaleTimeString(locale, { hour: 'numeric', hour12: true, minute: 'numeric' });
  return (
    <div> {time}  </div>
  )
};
*/

export class Timer extends React.Component{  //实时显示系统时间和日期
  constructor(){
      super()
      this.state={
         time:new Date()
      }
      this.timer=null//定义计时器
    }
    //更新事件
    updateTime(){
        this.setState({
            time:new Date()
        })
    }
    //组件一旦挂载就调用
    componentDidMount(){
        this.timer= setInterval(() => {
            this.updateTime()
        }, 100);
    }
    //组件将要卸载之前清楚定时器
    //为什么异步调用可能会内存泄漏？如果在卸载组件后更新状态，执行状态更新和运行异步操作的 React 组件就会导致内存泄漏问题，比如：用户执行触发事件处理程序以从 API 获取数据的操作。
    //然后，用户点击一个链接，在完成第 1 步之前导航到另一个页面。
    //此时，第1步操作完成并传递从 API 获取到的数据并调用setState。由于组件已卸载，并且函数正在已经卸载的组件中调用，因此会导致内存泄漏问题——并且在控制台中，会出现上述警告。
  componentWillUnmount = () => {
    this.setState = (state, callback)=>{
      clearInterval(Timer); //语句放在setstate中
      return;
    };
  }
  render(){
    return(
      <div>
        {this.state.time.toLocaleDateString()}-{this.state.time.toLocaleTimeString()}
      </div>
    )
  }
}

export class Link extends React.Component {  //创建子类组件2
  render() {
    return (
      <a href={this.props.site}>
        site子组件{this.props.site}
      </a>
    );
  }
}

function parseParams(params){

}

export const MyTextField = (id, label, labelwidth, top, left, height, width, value, style) => { 
    //构造函数，生成文本框textbox
    let p = { id, label, labelwidth, top, left, height, width, value, style };
    //console.log(id,p);
    //p值会自动改变
    if (parseInt(height)===0) height=28;
    if (parseInt(width)===0) width=200;
    if (style===undefined) style='';
    style=';'+style+';';
    let xeditable=true;
    let xmultiline=false;
    if (style.indexOf(';readonly;')>=0) xeditable=false;
    if (style.indexOf(';textarea;')>=0) xmultiline=true;
    if (value===undefined) value='';
    /*
      this.id=id;
      this.parent=parent;
      this.label=label;
      this.labelwidth=labelwidth;
      this.top=top;
      this.left=left;
      this.width=width;
      this.height=height;
      this.value=value;
      this.style=style;
  */
    return (
      <div style={{position:'absolute', top:top, left:left}}>
        <Label htmlFor={id} className="labelStyle" >{label}:</Label>
        <TextBox inputId={id} id={id} value={value} 
         style={{width:width, height:height}} editable={xeditable} multiline={xmultiline} />
      </div>
  )
}

export const MyDefTextBox = (id, label, labelwidth, top, left, height, width, value, style) => { 
  //构造函数，生成文本框textbox
  let p = { id, label, labelwidth, top, left, height, width, value, style };
  /*
  return(
    <div><MyTextBox attr={p}></MyTextBox></div>
  )
  */
 return p;
}

export const myParseInputBaseProps = (props) => {
    //可以有三种方式接受参数
    //调用方式1：<MyTextBox params='stuname,学生姓名,72, 70, 20, 28,240,诸葛孔明, ,' />
    //调用方式2：<MyTextBox attr={{id:"unitprice", label: "单价", labelwidth: 72, left: 20, top: 20+5*rowheight, width: 200}} ref={ref => this.unitprice = ref} />
    //调用方式3：<MyTextBox id='supplierid' label='供应商' labelwidth='72' top={20+7*rowheight} left='20' width='200' ref={ref => this.supplierid = ref} addonRight={this.addon.bind(this, 'help')} />
    //let params=this.props.params;  
    // attr=this.props.attr;
    //editable控制控件是否只读，value控制控件的值
    //console.log(1,this.props)
    //console.log(2,this.props.params)
    let attr={};
    if (props.attr!=undefined && typeof props.attr==='object'){
      attr={...attr, ...props.attr};
    }
    if (props.params!=undefined && typeof props.params==='string'){
      //将字符串转换成json对象。参数逗号间隔，例如'filter,快速过滤, 72, 2, 16,0, 300,,'
      let tmp=props.params.split(','); //id, label, labelwidth, top, left, height, width, value, style 
      for (let i=0; i<tmp.length; i++) tmp[i]=tmp[i].trim();
      if (tmp.length>0) attr.id=tmp[0];
      if (tmp.length>1) attr.label=tmp[1];
      if (tmp.length>2) attr.labelwidth=tmp[2];
      if (tmp.length>3) attr.top=tmp[3];
      if (tmp.length>4) attr.left=tmp[4];
      if (tmp.length>5) attr.height=tmp[5];
      if (tmp.length>6) attr.width=tmp[6];
      if (tmp.length>7) attr.value=tmp[7];
      if (tmp.length>8) attr.style=tmp[8];
    }
    attr={...attr, ...props};  //
    if (attr.hidden || (attr.style!==undefined && attr.style==='hidden')){
      attr.top=0; attr.left=0; attr.height=0; attr.width=1; attr.labelwidth=0; attr.label='';
    }
    //let { id, label, labelwidth, top, left, height, width, value, style } = attr;
    if (attr.top!==undefined && isNaN(attr.top)) attr.top=eval(attr.top); 
    if (attr.left!==undefined && isNaN(attr.left)) attr.left=eval(attr.left); 
    if (attr.height!==undefined && isNaN(attr.height)) attr.height=eval(attr.height);
    if (attr.width!==undefined && isNaN(attr.width)) attr.width=eval(attr.width);
    if (attr.height === undefined || parseInt(attr.height) === 0) attr.height=28;
    if (attr.width === undefined || parseInt(attr.width) === 0) attr.width=200;
    if (attr.panelheight === undefined) attr.panelheight=200;
    if (attr.panelwidth === undefined) attr.panelwidth=700;
    attr.top=parseInt(attr.top);
    attr.left=parseInt(attr.left);
    attr.height=parseInt(attr.height);
    attr.width=parseInt(attr.width);
    attr.labelwidth=parseInt(attr.labelwidth);
    attr.panelheight=parseInt(attr.panelheight);
    attr.panelwidth=parseInt(attr.panelwidth);
    if (attr.label === undefined) attr.label='';
    if (attr.style === undefined) attr.style='';
    attr.style=';'+attr.style+';';
    if (attr.label!=='') attr.label+=':';
    if (attr.editable==undefined) attr.editable=true;
    if (attr.multiline==undefined) attr.multiline=false;
    if (attr.hidden==undefined) attr.hidden=false;
    attr.addon='';
    attr.spinners=false;
    let style=attr.style.split(';');
    if (style.includes('hidden')) attr.hidden=true;  //框隐藏文本框
    if (style.includes('readonly')) attr.editable=false;  //文本框永远只读
    if (style.includes('textarea')) attr.multiline=true;  //多行文本框，类似于textarea
    if (attr.hidden) attr.editable=false;
    if (style.includes('spinner') || style.includes('spinners')) attr.spinners=true;
    if (style.includes('search')) attr.addon='search';
    else if (style.includes('help')) attr.addon='help';
    if (attr.value===undefined) attr.value='';
    //console.log(991,attr);
    return attr;
}

export class MyTextBox extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    //可以有三种方式接受参数
    //调用方式1：<MyTextBox params='stuname,学生姓名,72, 70, 20, 28,240,诸葛孔明, ,' />
    //调用方式2：<MyTextBox attr={{id:"unitprice", label: "单价", labelwidth: 72, left: 20, top: 20+5*rowheight, width: 200}} ref={ref => this.unitprice = ref} />
    //调用方式3：<MyTextBox id='supplierid' label='供应商' labelwidth='72' top={20+7*rowheight} left='20' width='200' ref={ref => this.supplierid = ref} addonRight={this.addon.bind(this, 'help')} />
    let attr=myParseInputBaseProps(this.props);
    this.state = {
      attr:attr,
      value:attr.value,
      editable:attr.editable,
      display:'block'
    }
  }
  addon(icon){
    let css='';
    if (icon === 'search') css='textbox-icon icon-search';
    else if (icon === 'help') css='textbox-icon icon-help';
    return (<span className={css} onClick={this.handleAddonButtonClick.bind(this)}></span>);
  }
  
  render() {
    let { onChange }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, addon, multiline } = this.state.attr;
    //if (hidden) console.log(this.state.attr)
    return (
      <div style={{position:'absolute', top:top, left:left, display:hidden? 'none' : this.state.display}}>
        <Label htmlFor={id} className="labelStyle" style={{width:labelwidth}} >{label}</Label>
        <TextBox inputId={id} id={id} ref={ref => this[id] = ref} 
         onFocus={()=>{document.getElementById(id).select()}} { ...this.props }
         xaddonRight={ addon!==''? this.addon.bind(this, addon) : null } 
         value={ this.state.value } onChange={(value) => {onChange?.(value); this.setState({ value: value })}}
         style={{ width:width, height:height }} editable={ editable? this.state.editable : false } multiline={ multiline } />
      </div>
    )
  }
}

export class MyDateBox extends React.Component {  //日期框
  constructor(props) {
    super(props);
    let attr=myParseInputBaseProps(this.props);
    this.state = {
      attr: attr,
      value: attr.value,
      editable: attr.editable,
      display: 'block'
    }
  }
  render() {
    let { onChange }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, addon, multiline } = this.state.attr;
    return (
      <div style={{position:'absolute', top:top, left:left, display:hidden? 'none' : this.state.display}}>
        <Label htmlFor={id} className="labelStyle" style={{width:labelwidth}} >{label}</Label>
        <DateBox inputId={id} id={id} ref={ref => this[id] = ref} { ...this.props } currentText='今天' closeText='关闭' okText='确定' format='yyyy-MM-dd'
        value={ myDate(this.state.value) } onChange={(value) => {onChange?.(value); this.setState({ value: value })}} 
        panelStyle={{ width: 250 }} inputStyle={{fontFamily:'times new Roman'}} style={{ width:width, height:height }} editable={ editable? this.state.editable : false } />
      </div>
    )
  }
}

export class MyNumberBox extends React.Component {  //日期框
  constructor(props) {
    super(props);
    let attr=myParseInputBaseProps(this.props);
    this.state = {
      attr: attr,
      value: attr.value,
      editable: attr.editable,
      display: 'block'
    }
  }

  componentDidMount(){
    mySelectOnFocus();
  }
  /*
  handleFocus=()=>{
    //选中即聚焦
    let id=this.numberbox.props.id;
    document.getElementById(id).select();
  }
  */

  render() {
    let { onChange }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, spinners, max, min, precision } = this.state.attr;
    return (
      <div style={{position:'absolute', top:top, left:left, display:hidden? 'none' : this.state.display}}>
        <Label htmlFor={id} className="labelStyle" style={{width:labelwidth}} >{label}</Label>
        <NumberBox inputId={id} id={id} ref={ref => this[id] = ref} spinners={spinners} { ...this.props } 
        value={ this.state.value } onChange={(value) => {onChange?.(value); this.setState({ value: value })}} 
        onFocus={()=>{document.getElementById(id).select();}}
        style={{ width:width, height:height}} inputStyle={{ fontFamily:'times new Roman', textAlign:'right' }} 
        editable={ editable? this.state.editable : false } />
      </div>
    )
  }
}

export const MyDefComboBox = (id, label, labelwidth, top, left, height, width, textfield, items, value, style) => { 
  //构造函数，生成文本框textbox
  let p = { id, label, labelwidth, top, left, height, width, textfield, items, value, style };
  /*
  return(
    <div><MyComboBox attr={p}></MyComboBox></div>
  )
  */
 return p;
}

export const MyDefDBComboBox = (id, label, labelwidth, top, left, height, width, textfield, items, value, style) => { 
  //构造函数，生成文本框textbox
  let p = {id, label, labelwidth, top, left, height, width, textfield, items, value, style};
  /*
  return(
    <div><MyComboBox attr={p}></MyComboBox></div>
  )
  */
 return p;
}

export class MyComboBox extends Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    //可以有三种方式接受参数
    //调用方式1：<MyTextBox params='stuname,学生姓名,72, 70, 20, 28,240,诸葛孔明, ,' />
    //调用方式2：<MyTextBox attr={{id:"unitprice", label: "单价", labelwidth: 72, left: 20, top: 20+5*rowheight, width: 200}} ref={ref => this.unitprice = ref} />
    //调用方式3：<MyTextBox id='supplierid' label='供应商' labelwidth='72' top={20+7*rowheight} left='20' width='200' ref={ref => this.supplierid = ref} addonRight={this.addon.bind(this, 'help')} />
    //let params=this.props.params;  
    // attr=this.props.attr;
    let attr={};
    attr.items='';
    attr.sqlparams={};
    if (this.props.attr!=undefined && typeof this.props.attr==='object'){
       attr={...attr, ...this.props.attr};
    }
    if (this.props.params!=undefined && typeof this.props.params==='string'){
      //将字符串转换成json对象。参数逗号间隔，例如'filter,快速过滤, 72, 2, 16,0, 300,,'
      let tmp=this.props.params.split(','); //id, label, labelwidth, top, left, height, width, value, items, textfield, value style 
      for (let i=0; i<tmp.length; i++) tmp[i]=tmp[i].trim();
      if (tmp.length>0) attr.id=tmp[0];
      if (tmp.length>1) attr.label=tmp[1];
      if (tmp.length>2) attr.labelwidth=tmp[2];
      if (tmp.length>3) attr.top=tmp[3];
      if (tmp.length>4) attr.left=tmp[4];
      if (tmp.length>5) attr.height=tmp[5];
      if (tmp.length>6) attr.width=tmp[6];
      attr.items='';
      if (tmp.length>7){
        if (typeof tmp[7]==='object'){
           attr.sqlparams={...tmp[7]};
        }else{
          attr.items=tmp[7];  
        }
      } 
      if (tmp.length>8) attr.textfield=tmp[8];
      if (tmp.length>9) attr.value=tmp[9];
      if (tmp.length>10) attr.style=tmp[10];
    }
    attr={...attr, ...this.props};  //
    if (attr.top!==undefined && isNaN(attr.top)) attr.top=eval(attr.top); 
    if (attr.left!==undefined && isNaN(attr.left)) attr.left=eval(attr.left); 
    if (attr.height!==undefined && isNaN(attr.height)) attr.height=eval(attr.height);
    if (attr.width!==undefined && isNaN(attr.width)) attr.width=eval(attr.width);
    if (attr.height === undefined || parseInt(attr.height) === 0) attr.height=28;
    if (attr.width === undefined || parseInt(attr.width) === 0) attr.width=200;
    attr.top=parseInt(attr.top);
    attr.left=parseInt(attr.left);
    attr.height=parseInt(attr.height);
    attr.width=parseInt(attr.width);
    attr.labelwidth=parseInt(attr.labelwidth);
    if (attr.label === undefined) attr.label='';
    if (attr.textfield === undefined || attr.textfield === '') attr.textfield=attr.id;    
    if (attr.style === undefined) attr.style='';
    attr.style=';'+attr.style+';';
    if (attr.label!=='') attr.label+=':';
    attr.editable=false;
    if (attr.style.indexOf(';editable;')>=0) attr.editable=true; 
    if (attr.value===undefined) attr.value='';
    if (attr.panelwidth===undefined) attr.panelwidth=attr.width;
    //取值
    //console.log(666,attr.items);
    //console.log(667,attr.sqlparams);
    let data=[];
    if (attr.items!==undefined && attr.items!=''){
      let arr=attr.items.split(',');
      data = arr.map((item, index)=> {
        return ({[attr.id]:item, [attr.textfield]:item, index:index})
      })
    }
    if (attr.value===undefined || attr.value===''){
      if (data.length>0) attr.value=data[0][attr.id];
    }
    //console.log(444, attr);
    this.state = {
       attr: attr,
       value: attr.value,
       data: data
    }
  }

  async componentDidMount(){
    if (this.state.attr.sqlparams.sqlprocedure!==undefined){
      //从数据库中提取数据
      let p={...this.state.attr.sqlparams};
      let rs = await reqdoSQL(p); //1.获取到数据
      this.setState({data: rs.rows});
    }
  }
  //构造自定义对象
  render() {
    let { id, label, labelwidth, top, left, height, width, items, sql, textfield, value, style, editable, panelwidth } = this.state.attr;    
    return (
       <div style={{position:'absolute', top:top, left:left}}>
          <Label htmlFor={id} className="labelStyle" style={{width:labelwidth}}  >{label}</Label>
          <ComboBox inputId={id} id={id} data={this.state.data} value={this.state.value} style={{width:width, height:height}} 
          valueField={id} textField={textfield} editable={editable} panelStyle={{ width: panelwidth }} 
          onChange={(value) => this.setState({value: value })} />
       </div>
    )
  }
}


//filebutton
export class MyFileUpload extends Component {
  constructor(props) {
    super(props);
    let attr={};
    if (this.props.params!=undefined && typeof this.props.params==='string'){
       let tmp=this.props.params.split(','); //id, label, labelwidth, top, left, height, width，type，style 
       for (let i=0; i<tmp.length; i++) tmp[i]=tmp[i].trim();
       if (tmp.length>0) attr.id=tmp[0];
       if (tmp.length>1) attr.label=tmp[1];
       if (tmp.length>2) attr.height=tmp[2];
       if (tmp.length>3) attr.width=tmp[3];
       if (tmp.length>4) attr.type=tmp[4];
       if (tmp.length>5) attr.style=tmp[5];
    }
    attr={...attr, ...this.props};  //
    if (attr.height!==undefined && isNaN(attr.height)) attr.height=eval(attr.height);
    if (attr.width!==undefined && isNaN(attr.width)) attr.width=eval(attr.width);
    if (attr.height === undefined) attr.height=0;
    if (attr.width === undefined) attr.width=0;
    //attr.top=parseInt(attr.top);
    //attr.left=parseInt(attr.left);
    attr.height=parseInt(attr.height);
    attr.width=parseInt(attr.width);
    //attr.labelwidth=parseInt(attr.labelwidth);
    if (attr.height===0) attr.height='100%';
    if (attr.width===0) attr.width='100%';
    if (attr.label === undefined) attr.label='选择文件';
    if (attr.layout === undefined) attr.layout='list';
    if (attr.style === undefined) attr.style='';
    attr.style=';'+attr.style+';';
    attr.multi=true;
    attr.replace=false;
    if (attr.style.indexOf(';single;')>=0) attr.multi=false;  //只可以上传一个文件
    if (attr.style.indexOf(';replace;')>=0) attr.replace=true;  //替换原来的文件
    ///console.log(1111,attr);
    this.state = {
        files:[],
        attr: attr,
        value: attr.value,
        display: 'block'
    }
  }
  
  componentWillUnmount() { //释放内存
      this.state.files.forEach(file => {
          let url = window.URL.createObjectURL(file);
          window.URL.revokeObjectURL(url);
      })
  }

  handleSelect(files) {
      files.forEach(file => {
          file.url = window.URL.createObjectURL(file);
          console.log(file);
      })
      this.setState({
          files: this.state.files.concat(files)  //可多次选择文件，选择之后的文件合在一起 
      })
  }

  handleRemoveFile(file) {
      const files = this.state.files.filter(f => f !== file);
      this.setState({
          files: files
      })
  }

  handleClear() {
      this.setState({ files: [] })
  }

  async handleUpload() {
      let files = this.state.files;
      for (let i=0; i<files.length; i++){
          let formData = new FormData();
          formData.append("targetpath", this.state.attr.filepath);  //文件路径
          formData.append("targetfile", this.state.attr.filetag+'_'+(i+1));  //目标文件名，不加文件扩展名
          formData.append("file", files[i]);  //上传第一个文件
          const config = {
              headers: {
                  "Content-Type": "multipart/form-data"
              },
          }
          await axios.post("/myServer/doFileUpload", formData, config).then(res => {
            this.console.log(res)
          })
      }
  }

  renderItem({ row }) {
    if (this.state.attr.layout==='span'){
      return (
        <div style={{border:'1px solid #95B8E7' , fontSize:13, display:'inline-block', padding:'2px 2px 4px 8px', margin:'8px 4px 8px 8px'}}>
          <div style={{float:'left', width:30, display:'inline-block'}}><LinkButton iconCls="icon-clear" plain onClick={() => this.handleRemoveFile(row)}></LinkButton></div>
          <div style={{clear:'both'}}></div>
          <img alt="" src={row.url} style={{width:this.state.attr.width, height:this.state.attr.height}} />
          <div className="textdiv" style={{width:this.state.attr.width}}>{row.name}</div>
        </div>                
      );
    }else{
      return (
        <div style={{width:this.state.attr.width}}>
           <div style={{float:'left', width:30, display:'inline-block'}}><LinkButton iconCls="icon-clear" plain onClick={() => this.handleRemoveFile(row)}></LinkButton></div>
           <div className="textdiv" style={{float:'left', width:500, display:'inline-block', marginTop:4}}>{row.name}</div>
           <div className="textdiv" style={{float:'left', width:100, display:'inline-block', marginTop:4}}>{myFileSize(row.size)}</div>
           <div style={{float:'right', width:32, height:32, display:'inline-block'}}><LinkButton iconCls="readIcon" plain ></LinkButton></div>
           <div style={{clear:'both'}}></div>
        </div>
      );
    }  
  }

  render() {
    let { id, label, labelwidth, top, left, height, width, style, multi, data, layout } = this.state.attr;    
    return (
      <div>
         <div style={{ width:'100%', height:'100%', position:'absolute' }}>
             <Layout style={{ width: '100%', height: '100%', position:'relative' }}>
                <LayoutPanel region="north" border={false} style={{borderBottom:'1px solid #95B8E7'}}>
                   <div style={{paddingTop:3, paddingLeft:8, backgroundColor:'#E0ECFF', height:33, width:'100%', position:'relative', overflow:'hidden'}}>
                     <FileButton inputId={id} id={id} style={{ width: 200 }} text={label} value={this.state.files} accept="/*" multiple={multi} onSelect={this.handleSelect.bind(this)} { ...this.props } />
                     <LinkButton style={{ width:72 }} iconCls="uploadIcon" onClick={this.handleUpload.bind(this)} autoUpload = {false}>上传</LinkButton>
                   </div>
                </LayoutPanel>
                <LayoutPanel region="center" border={false} style={{ height: '100%', position:'relative' }}>
                   <DataList border={false} data={this.state.files} renderItem={this.renderItem.bind(this)} />
                </LayoutPanel>
            </Layout>
         </div>
      </div>
    )
  }
}

export class MyComboTree extends Component {  
  constructor(props) {
    super(props);
    let attr={};
    attr.items='';
    attr.sqlparams={};
    if (this.props.attr!=undefined && typeof this.props.attr==='object'){
       attr={...attr, ...this.props.attr};
    }
    if (this.props.params!=undefined && typeof this.props.params==='string'){
      //将字符串转换成json对象。参数逗号间隔，例如'filter,快速过滤, 72, 2, 16,0, 300,,'
      let tmp=this.props.params.split(','); //id, label, labelwidth, top, left, height, width, value, items, textfield, value style 
      for (let i=0; i<tmp.length; i++) tmp[i]=tmp[i].trim();
      if (tmp.length>0) attr.id=tmp[0];
      if (tmp.length>1) attr.label=tmp[1];
      if (tmp.length>2) attr.labelwidth=tmp[2];
      if (tmp.length>3) attr.top=tmp[3];
      if (tmp.length>4) attr.left=tmp[4];
      if (tmp.length>5) attr.height=tmp[5];
      if (tmp.length>6) attr.width=tmp[6];
      attr.items='';
      if (tmp.length>7){
        if (typeof tmp[7]==='object'){
           attr.sqlparams={...tmp[7]};
        }else{
          attr.items=tmp[7];  
        }
      } 
      if (tmp.length>8) attr.textfield=tmp[8];
      if (tmp.length>9) attr.value=tmp[9];
      if (tmp.length>10) attr.style=tmp[10];
    }
    attr={...attr, ...this.props};  //
    if (attr.top!==undefined && isNaN(attr.top)) attr.top=eval(attr.top); 
    if (attr.left!==undefined && isNaN(attr.left)) attr.left=eval(attr.left); 
    if (attr.height!==undefined && isNaN(attr.height)) attr.height=eval(attr.height);
    if (attr.width!==undefined && isNaN(attr.width)) attr.width=eval(attr.width);
    if (attr.height === undefined || parseInt(attr.height) === 0) attr.height=28;
    if (attr.width === undefined || parseInt(attr.width) === 0) attr.width=200;
    attr.top=parseInt(attr.top);
    attr.left=parseInt(attr.left);
    attr.height=parseInt(attr.height);
    attr.width=parseInt(attr.width);
    attr.labelwidth=parseInt(attr.labelwidth);
    if (attr.label === undefined) attr.label='';
    if (attr.textfield === undefined || attr.textfield === '') attr.textfield=attr.id;    
    if (attr.style === undefined) attr.style='';
    attr.style=';'+attr.style+';';
    if (attr.label!=='') attr.label+=':';
    attr.editable=false;
    if (attr.style.indexOf(';editable;')>=0) attr.editable=true; 
    if (attr.value===undefined) attr.value='';
    if (attr.panelwidth===undefined) attr.panelwidth=attr.width;
    //取值
    //console.log(666,attr.items);
    //console.log(667,attr.sqlparams);
    let data=[];
    if (attr.items!==undefined && attr.items!=''){
      let arr=attr.items.split(',');
      data = arr.map((item, index)=> {
        return ({[attr.id]:item, [attr.textfield]:item, index:index})
      })
    }
    if (attr.value===undefined || attr.value===''){
      if (data.length>0) attr.value=data[0][attr.id];
      else attr.value=null;
    }    
    this.state = {
       attr: attr,
       value: attr.value,
       data: data
    }
  }

  async componentDidMount(){
    if (this.state.attr.sqlparams.sqlprocedure!==undefined){
      //从数据库中提取数据
      let p={...this.state.attr.sqlparams};
      let rs = await reqdoTree(p); //1.获取到数据
      this.setState({data: rs.rows});
    }
  }
  //构造自定义对象
  render() {
    let { id, label, labelwidth, top, left, height, width, items, sql, textfield, value, style, editable, panelwidth } = this.state.attr;    
    return (
       <div style={{position:'absolute', top:top, left:left}}>
          <Label htmlFor={id} className="labelStyle" style={{width:labelwidth}} >{label}</Label>
          <ComboTree inputId={id} id={id} data={this.state.data} value={this.state.value} style={{width:width, height:height}} 
          valueField={id} textField={textfield} editable={editable} panelStyle={{ width: panelwidth }} { ...this.props } 
          onChange={(value) => this.setState({value: value })} />
       </div>
    )
  }
}

export const MyWindow = React.forwardRef((props, ref) => {
  let { height, width, title, buttons, style } = props
  let myWin = useRef();
  useImperativeHandle(ref, () => ({
    close() {
      myWin.current.close()
    },
    open() {
      myWin.current.open()
    }  
  }))
  if (height === undefined || parseInt(height) === 0) height=300;
  if (width === undefined || parseInt(width) === 0) width=500;
  height=parseInt(height);
  width=parseInt(width);
  if (title === undefined) title='系统提示';
  if (buttons === undefined) buttons='';
  if (style === undefined) style='';
  let tmp1=buttons.split(';');
  let tmp2=style.split(';');
  let okbtn,cancelbtn,closebtn,topbar,bottombar=false;
  if (tmp1.includes('ok')) okbtn=true;
  if (tmp1.includes('cancel')) cancelbtn=true;
  if (tmp1.includes('close')) closebtn=true;    
  if (tmp2.includes('topbar')) topbar=true;    
  if (tmp2.includes('bottombar')) bottombar=true;    
  return (
    <div>
      <Dialog ref={myWin} borderType="thick" iconCls="win1Icon" closed={true} draggable title={' ' + title} modal={false} closable style={{ width: width, height: height }} >
        <Layout style={{ width: '100%', height: '100%', position: 'relative' }}>
          <LayoutPanel region="north" border={false} style={{ visibility: topbar? 'visible':'hidden', borderBottom: '1px solid #95B8E7' }}>
          </LayoutPanel>
          <LayoutPanel region="center" border={false} style={{ height: '100%', position: 'relative' }}>
            {props.children}
          </LayoutPanel>
          <LayoutPanel region="south" border={false} style={{ visibility: bottombar? 'visible':'hidden', borderTop: '1px solid #95B8E7' }}>
            <div style={{ paddingTop: 4, paddingLeft: 14, paddingRight: 16, height: 38, backgroundColor: '#E0ECFF', overflow: 'hidden' }}>
              <div style={{ display: closebtn ? 'block' : 'none' }}>
                <LinkButton style={{ width: 68, height: 28, float: 'right' }} iconAlign="left" onClick={() => myWin.current.close()} >关闭</LinkButton>
              </div>
              <div style={{ display: cancelbtn ? 'block' : 'none' }}>
                <LinkButton style={{ width: 68, height: 28, float: 'right' }} iconAlign="left">取消</LinkButton>
              </div>
              <div style={{ display: okbtn ? 'block' : 'none' }}>
                <LinkButton style={{ width: 68, height: 28, float: 'right' }}>确定</LinkButton>
              </div>
            </div>
          </LayoutPanel>
        </Layout>
      </Dialog>
    </div >
  )
})
