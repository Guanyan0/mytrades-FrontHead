/**
 * 包含应用中使用请求接口的模块
 */
import ajax from './ajax'
import React, { Component } from 'react';
import {useNavigate} from 'react-router-dom';
import { Label, TextBox, ComboBox, Messager, Layout, LayoutPanel, DataList, FileButton, LinkButton, ButtonGroup, Tabs, TabPanel, Dialog } from 'rc-easyui';
import { ComboTree } from 'rc-easyui';
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

export const MyDate = (date, format) => {  //转换日起格式
  let d=new Date(date);  
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

// 登录
// const Base ='http://localhost:/8080/imlab'
// /imlab/doLogin?dbms=mysql&database=&action=login&paramvalues={"userid":"20000555","password":"123456","autologin":1}
// /imlab/doLogin?dbms=mysql&database=&action=login&paramvalues={"userid":"20000555,"password":"123456","autologin":1}
//登录请求
export const reqLogin = (dbms, database, action, paramvalues) => {
     var url = '/myServer/doLogin?dbms=' + dbms + '&database=' + database + '&action=' + action + '&paramvalues=' + paramvalues
     //console.log(url)
     return ajax(url, {}, 'POST')
     // return ajax('/imlab/doLogin', {dbms, database, action, paramvalues}, 'POST')
}

export const fetchData = sqlprocedure => $fetchData({sqlprocedure})
export const $fetchData = async (params) => {
   if (params.nodetype === undefined) params.nodetype='datagrid'; 
   return fetch(`http://localhost:8080/myServer/doSQL?paramvalues=${JSON.stringify(params)}`).then(res => res.json())
}

//数据增删改查请求
export const reqdoSQL = (params) => {
  if (params.nodetype === undefined) params.nodetype='datagrid'; 
  const paramvalues = JSON.stringify(params);
  var url = '/myServer/doSQL?paramvalues='+paramvalues;
  var url = 'http://localhost:8080/myServer/doSQL?paramvalues='+paramvalues;  
  return ajax(url, {}, 'POST');
}

export const reqdoTree = (params) => {
  params.nodetype='tree'; 
  if (params.style === undefined) params.style="full"; 
  const paramvalues = JSON.stringify(params);
  var url = '/myServer/doSQL?paramvalues='+paramvalues;
  var url = 'http://localhost:8080/myServer/doSQL?paramvalues='+paramvalues;  
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


export const myLoadData =  async (id) =>{
  //console.log(id.props.sqlparams);
   let p={...id.props.sqlparams};
   let rs = await reqdoSQL(p);
   id.setState({data: rs.rows});
}

//tree处理函数
//obj传入多层json格式数据,targetId需要插入数据的id, targetChildren插入的数据
export const searchTreeNode = (node, data) => {
  //根据ancester找到每一层的节点，返回这个节点的各层父节点的序号和这个节点的值
  //var jsondata=[{"level":"1","ancestor":"","description":"","isparentflag":"1","parentnodeid":"","englishname":"Beverages","children":[{"englishname":"Non-alcoholic beverages","level":"2","children":[{"englishname":"Coffee, tea, and energy drinks","level":"3","ancestor":"A#A1#","description":"","categoryname":"茶、咖啡与功能饮料","id":"A101","isparentflag":"0","text":"A101 茶、咖啡与功能饮料","_rowindex":"3","categoryid":"A101","parentnodeid":"A1"},{"englishname":"Fruit and vegetable juices","level":"3","ancestor":"A#A1#","description":"","categoryname":"果汁与蔬菜汁","id":"A102","isparentflag":"0","text":"A102 果汁与蔬菜汁","_rowindex":"4","categoryid":"A102","parentnodeid":"A1"},{"englishname":"Carbonated and milk drinks","level":"3","ancestor":"A#A1#","description":"","categoryname":"碳酸类与乳饮料","id":"A103","isparentflag":"0","text":"A103 碳酸类与乳饮料","_rowindex":"5","categoryid":"A103","parentnodeid":"A1"}],"ancestor":"A#","description":"","categoryname":"非酒精饮料","id":"A1","isparentflag":"1","text":"A1 非酒精饮料","_rowindex":"2","categoryid":"A1","parentnodeid":"A"},{"englishname":"Alcoholic beverages","level":"2","children":[{"englishname":"Beer","level":"3","ancestor":"A#A2#","description":"","categoryname":"啤酒","id":"A201","isparentflag":"0","text":"A201 啤酒","_rowindex":"7","categoryid":"A201","parentnodeid":"A2"},{"englishname":"Liquors","level":"3","ancestor":"A#A2#","description":"","categoryname":"白酒","id":"A202","isparentflag":"0","text":"A202 白酒","_rowindex":"8","categoryid":"A202","parentnodeid":"A2"}],"ancestor":"A#","description":"","categoryname":"酒精饮料","id":"A2","isparentflag":"1","text":"A2 酒精饮料","_rowindex":"6","categoryid":"A2","parentnodeid":"A"},{"englishname":"Drinking water","level":"2","ancestor":"A#","description":"","categoryname":"饮用水","id":"A3","isparentflag":"0","text":"A3 饮用水","_rowindex":"9","categoryid":"A3","parentnodeid":"A"}],"_total":"1","categoryname":"饮料","id":"A","text":"A 饮料","_rowindex":"1","categoryid":"A"},{"englishname":"Flavourings","level":"1","children":[{"englishname":"Sauce products","level":"2","ancestor":"B#","description":"","categoryname":"酱品类产品","id":"B1","isparentflag":"0","text":"B1 酱品类产品","_rowindex":"11","categoryid":"B1","parentnodeid":"B"},{"englishname":"Soy sauce products","level":"2","ancestor":"B#","description":"","categoryname":"酱油类产品","id":"B2","isparentflag":"0","text":"B2 酱油类产品","_rowindex":"12","categoryid":"B2","parentnodeid":"B"},{"englishname":"Juice products","level":"2","ancestor":"B#","description":"","categoryname":"汁水类产品","id":"B3","isparentflag":"0","text":"B3 汁水类产品","_rowindex":"13","categoryid":"B3","parentnodeid":"B"},{"englishname":"Flavor powder products","level":"2","ancestor":"B#","description":"","categoryname":"味粉类产品","id":"B4","isparentflag":"0","text":"B4 味粉类产品","_rowindex":"14","categoryid":"B4","parentnodeid":"B"},{"englishname":"Solid products","level":"2","ancestor":"B#","description":"","categoryname":"味精","id":"B5","isparentflag":"0","text":"B5 味精","_rowindex":"15","categoryid":"B5","parentnodeid":"B"}],"ancestor":"","description":"","categoryname":"调味品","id":"B","isparentflag":"1","text":"B 调味品","_rowindex":"10","categoryid":"B","parentnodeid":""},{"englishname":"Confections","level":"1","children":[{"englishname":"Candies","level":"2","ancestor":"C#","description":"","categoryname":"糖果","id":"C1","isparentflag":"0","text":"C1 糖果","_rowindex":"17","categoryid":"C1","parentnodeid":"C"},{"englishname":"Desserts","level":"2","ancestor":"C#","description":"","categoryname":"甜点","id":"C2","isparentflag":"0","text":"C2 甜点","_rowindex":"18","categoryid":"C2","parentnodeid":"C"},{"englishname":"Chocolate","level":"2","ancestor":"C#","description":"","categoryname":"巧克力","id":"C3","isparentflag":"0","text":"C3 巧克力","_rowindex":"19","categoryid":"C3","parentnodeid":"C"},{"englishname":"Preserves","level":"2","ancestor":"C#","description":"","categoryname":"蜜饯","id":"C4","isparentflag":"0","text":"C4 蜜饯","_rowindex":"20","categoryid":"C4","parentnodeid":"C"}],"ancestor":"","description":"","categoryname":"糖果蜜饯","id":"C","isparentflag":"1","text":"C 糖果蜜饯","_rowindex":"16","categoryid":"C","parentnodeid":""},{"englishname":"Dairy Products","level":"1","children":[{"englishname":"Milk and dairy-based drinks","level":"2","children":[{"englishname":"Milk","level":"3","ancestor":"D#D1#","description":"","categoryname":"鲜奶","id":"D101","isparentflag":"0","text":"D101 鲜奶","_rowindex":"23","categoryid":"D101","parentnodeid":"D1"},{"englishname":"Yogurt","level":"3","ancestor":"D#D1#","description":"","categoryname":"酸奶","id":"D102","isparentflag":"0","text":"D102 酸奶","_rowindex":"24","categoryid":"D102","parentnodeid":"D1"}],"ancestor":"D#","description":"","categoryname":"液体乳类","id":"D1","isparentflag":"1","text":"D1 液体乳类","_rowindex":"22","categoryid":"D1","parentnodeid":"D"},{"englishname":"Milk Powder","level":"2","ancestor":"D#","description":"","categoryname":"乳粉类","id":"D2","isparentflag":"0","text":"D2 乳粉类","_rowindex":"25","categoryid":"D2","parentnodeid":"D"},{"englishname":"Condensed milk, cheese and others","level":"2","ancestor":"D#","description":"","categoryname":"炼乳、干酪和其他","id":"D3","isparentflag":"0","text":"D3 炼乳、干酪和其他","_rowindex":"26","categoryid":"D3","parentnodeid":"D"}],"ancestor":"","description":"","categoryname":"乳制品","id":"D","isparentflag":"1","text":"D 乳制品","_rowindex":"21","categoryid":"D","parentnodeid":""},{"englishname":"Grains/Cereals","level":"1","children":[{"englishname":"Breads","level":"2","ancestor":"E#","description":"","categoryname":"面包","id":"E1","isparentflag":"0","text":"E1 面包","_rowindex":"28","categoryid":"E1","parentnodeid":"E"},{"englishname":"Crackers","level":"2","ancestor":"E#","description":"","categoryname":"饼干","id":"E2","isparentflag":"0","text":"E2 饼干","_rowindex":"29","categoryid":"E2","parentnodeid":"E"},{"englishname":"Pasta and noodles","level":"2","ancestor":"E#","description":"","categoryname":"面和面条","id":"E3","isparentflag":"0","text":"E3 面和面条","_rowindex":"30","categoryid":"E3","parentnodeid":"E"},{"englishname":"Oatmeal","level":"2","ancestor":"E#","description":"","categoryname":"麦片","id":"E4","isparentflag":"0","text":"E4 麦片","_rowindex":"31","categoryid":"E4","parentnodeid":"E"}],"ancestor":"","description":"","categoryname":"谷类食品","id":"E","isparentflag":"1","text":"E 谷类食品","_rowindex":"27","categoryid":"E","parentnodeid":""},{"englishname":"Meat","level":"1","children":[{"englishname":"Raw fresh meat","level":"2","ancestor":"F#","description":"","categoryname":"未加工过的鲜肉","id":"F1","isparentflag":"0","text":"F1 未加工过的鲜肉","_rowindex":"33","categoryid":"F1","parentnodeid":"F"},{"englishname":"Processed meat products","level":"2","ancestor":"F#","description":"","categoryname":"加工过的肉制品","id":"F2","isparentflag":"0","text":"F2 加工过的肉制品","_rowindex":"34","categoryid":"F2","parentnodeid":"F"}],"ancestor":"","description":"","categoryname":"肉与肉制品","id":"F","isparentflag":"1","text":"F 肉与肉制品","_rowindex":"32","categoryid":"F","parentnodeid":""},{"englishname":"Produce","level":"1","children":[{"englishname":"Melons, fruits and vegetables","level":"2","ancestor":"G#","description":"","categoryname":"瓜、果、蔬菜","id":"G1","isparentflag":"0","text":"G1 瓜、果、蔬菜","_rowindex":"36","categoryid":"G1","parentnodeid":"G"},{"englishname":"Mushroom","level":"2","ancestor":"G#","description":"","categoryname":"蘑菇","id":"G2","isparentflag":"0","text":"G2 蘑菇","_rowindex":"37","categoryid":"G2","parentnodeid":"G"},{"englishname":"Bean products","level":"2","ancestor":"G#","description":"","categoryname":"豆制品","id":"G3","isparentflag":"0","text":"G3 豆制品","_rowindex":"38","categoryid":"G3","parentnodeid":"G"}],"ancestor":"","description":"","categoryname":"农产品","id":"G","isparentflag":"1","text":"G 农产品","_rowindex":"35","categoryid":"G","parentnodeid":""},{"englishname":"Sea foods","level":"1","children":[{"englishname":"Fresh aquatic products","level":"2","children":[{"englishname":"Seawater products","level":"3","ancestor":"H#H1#","description":"","categoryname":"海水产品","id":"H101","isparentflag":"0","text":"H101 海水产品","_rowindex":"41","categoryid":"H101","parentnodeid":"H1"},{"englishname":"Fresh water products","level":"3","ancestor":"H#H1#","description":"","categoryname":"淡水产品","id":"H102","isparentflag":"0","text":"H102 淡水产品","_rowindex":"42","categoryid":"H102","parentnodeid":"H1"}],"ancestor":"H#","description":"","categoryname":"鲜活水产品","id":"H1","isparentflag":"1","text":"H1 鲜活水产品","_rowindex":"40","categoryid":"H1","parentnodeid":"H"},{"englishname":"Processed aquatic products","level":"2","children":[{"englishname":"Dry products","level":"3","ancestor":"H#H2#","description":"","categoryname":"干制品","id":"H201","isparentflag":"0","text":"H201 干制品","_rowindex":"44","categoryid":"H201","parentnodeid":"H2"},{"englishname":"Pickled products","level":"3","ancestor":"H#H2#","description":"","categoryname":"腌制品","id":"H202","isparentflag":"0","text":"H202 腌制品","_rowindex":"45","categoryid":"H202","parentnodeid":"H2"},{"englishname":"Tank products","level":"3","ancestor":"H#H2#","description":"","categoryname":"罐制品","id":"H203","isparentflag":"0","text":"H203 罐制品","_rowindex":"46","categoryid":"H203","parentnodeid":"H2"}],"ancestor":"H#","description":"","categoryname":"加工过的水产品","id":"H2","isparentflag":"1","text":"H2 加工过的水产品","_rowindex":"43","categoryid":"H2","parentnodeid":"H"},{"englishname":"Seaweed and other aquatic products","level":"2","ancestor":"H#","description":"","categoryname":"海藻及其他水产品","id":"H3","isparentflag":"0","text":"H3 海藻及其他水产品","_rowindex":"47","categoryid":"H3","parentnodeid":"H"}],"ancestor":"","description":"","categoryname":"水产品","id":"H","isparentflag":"1","text":"H 水产品","_rowindex":"39","categoryid":"H","parentnodeid":""}];
  //var ancestor='A#A1#';
  //var id='A102';
  var index=-1;
  var rs='';
  if (node.ancestor==='') index=data.findIndex(item=>item.id === node.id);
  else{
     var tmp=node.ancestor.split('#');
     var xdata=[...data];
     for (var i=0; i<tmp.length; i++){
        var index=xdata.findIndex(item=>item.id==tmp[i]);
        if (index>=0){
           rs+='['+index+'].children';
           xdata=xdata[index].children;
        }else{
          break;
        }
    }
    index = xdata.findIndex(item=>item.id== node.id);
  }
  if (index>=0) rs+='['+index+'].children';
  return rs;    
}

export const addTreeChildrenData=(node, data, children) => {
  //替换一个节点的子节点
  var s=searchTreeNode(node, data); //找到子节点的下标
  if (s!='') eval('data'+s+' = children');  //获取数组下标，例如data[0].children[1].children[1].children
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

function anonyCom(A) {
  return (props) => {
    let navigate = useNavigate();
    return <A {...props} navigate={navigate} />
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

export class MyTextBox extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
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
    if (this.props.attr!=undefined && typeof this.props.attr==='object'){
      attr={...attr, ...this.props.attr};
    }
    if (this.props.params!=undefined && typeof this.props.params==='string'){
      //将字符串转换成json对象。参数逗号间隔，例如'filter,快速过滤, 72, 2, 16,0, 300,,'
      let tmp=this.props.params.split(';'); //id, label, labelwidth, top, left, height, width, value, style 
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
    attr={...attr, ...this.props};  //
    if (attr.style!==undefined && attr.style==='hidden'){
      attr.top=0; attr.left=0; attr.height=0; attr.width=1; attr.labelwidth=0; attr.label='';
    }
    //let { id, label, labelwidth, top, left, height, width, value, style } = attr;
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
    if (attr.style === undefined) attr.style='';
    attr.style=';'+attr.style+';';
    if (attr.label!=='') attr.label+=':';
    attr.editable=true;
    attr.multiline=false;
    attr.addon='';
    attr.hidden=false;
    if (attr.style.indexOf(';hidden;')>=0) attr.hidden=true;  //框隐藏文本框
    if (attr.style.indexOf(';readonly;')>=0) attr.editable=false;  //文本框永远只读
    if (attr.style.indexOf(';textarea;')>=0) attr.multiline=true;  //多行文本框，类似于textarea
    if (attr.hidden) attr.editable=false;
    //if (style.indexOf(';searchbutton;')>=0) xaddon='search';
    //else if (style.indexOf(';helpbutton;')>=0) xaddon='help';
    if (attr.value===undefined) attr.value='';
    //this.setState({editable: attr.editable});   
    //console.log(991,attr);
    this.state = {
      attr: attr,
      value: attr.value,
      editable: attr.editable,
      display: 'block'
    }
  }

  componentDidMount(){ //页面启动时就会执行执行
    //console.log(333,this.props.attr.value);
  }
  /*
  componentWillReceiveProps(nextProps){
    this.setState({
      value: nextProps[]
   })
  */
   addon(icon){
     console.log(icon);
     let css='';     
     if (icon === 'search') css='textbox-icon icon-search';
     else if (icon === 'help') css='textbox-icon icon-help';
     return (
        <span className={css} onClick={this.handleButtonClick.bind(this)}></span>
     )
   }   
  //构造自定义对象
  render() {
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, addon, multiline } = this.state.attr;
    return (
      <div style={{position:'absolute', top:top, left:left, display:hidden? 'none' : this.state.display}}>
        <Label htmlFor={id} className="labelStyle" >{label}</Label>
        <TextBox inputId={id} id={id} { ...this.props } 
        xaddonRight={ addon!==''? this.addon.bind(this, addon) : null } 
        value={ this.state.value } onChange={(value) => this.setState({ value: value })}
        style={{ width:width, height:height }} editable={ editable? this.state.editable : false } multiline={ multiline } />
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
      let tmp=this.props.params.split(';'); //id, label, labelwidth, top, left, height, width, value, items, textfield, value style 
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
      let arr=attr.items.split(';');
      data = arr.map((item, index)=> {
        return ({[attr.id]:item, [attr.textfield]:item, index:index})
      })
    }
    if (attr.value===undefined || attr.value===''){
      if (data.length>0) attr.value=data[0][attr.id];
    }
    console.log(444, attr);
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
          <Label htmlFor={id} className="labelStyle" >{label}</Label>
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
       let tmp=this.props.params.split(';'); //id, label, labelwidth, top, left, height, width，type，style 
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
    console.log(1111,attr);
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
            console.log(res)
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
      let tmp=this.props.params.split(';'); //id, label, labelwidth, top, left, height, width, value, items, textfield, value style 
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
      let arr=attr.items.split(';');
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
      console.log(555,rs.rows)
    }
  }
  //构造自定义对象
  render() {
    let { id, label, labelwidth, top, left, height, width, items, sql, textfield, value, style, editable, panelwidth } = this.state.attr;    
    return (
       <div style={{position:'absolute', top:top, left:left}}>
          <Label htmlFor={id} className="labelStyle" >{label}</Label>
          <ComboTree inputId={id} id={id} data={this.state.data} value={this.state.value} style={{width:width, height:height}} 
          valueField={id} textField={textfield} editable={editable} panelStyle={{ width: panelwidth }} { ...this.props } 
          onChange={(value) => this.setState({value: value })} />
       </div>
    )
  }
}

export const MyWindow = React.forwardRef((props, ref) => {
  let { height, width, title, buttons, style } = props
  let myWin1 = useRef();
  useImperativeHandle(ref, () => ({
      close() {
        myWin1.close()
      }
    }
  ))
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
      <Dialog ref={myWin1} borderType="thick" iconCls="win1Icon" closed={false} draggable title={' ' + title} modal={false} closable style={{ width: width, height: height }} >
        <Layout style={{ width: '100%', height: '100%', position: 'relative' }}>
          <LayoutPanel region="north" border={false} style={{ visibility: topbar? 'visible':'hidden', borderBottom: '1px solid #95B8E7' }}>
          </LayoutPanel>
          <LayoutPanel region="center" border={false} style={{ height: '100%', position: 'relative' }}>
            {props.children}
          </LayoutPanel>
          <LayoutPanel region="south" border={false} style={{ visibility: bottombar? 'visible':'hidden', borderTop: '1px solid #95B8E7' }}>
            <div style={{ paddingTop: 4, paddingLeft: 14, paddingRight: 16, height: 38, backgroundColor: '#E0ECFF', overflow: 'hidden' }}>
              <div style={{ display: closebtn ? 'block' : 'none' }}>
                <LinkButton style={{ width: 68, height: 28, float: 'right' }} iconAlign="left" onClick={() => myWin1.close()} >关闭</LinkButton>
              </div>
              <div style={{ display: cancelbtn ? 'block' : 'none' }}>
                <LinkButton style={{ width: 68, height: 28, float: 'right' }} iconAlign="left">取消</LinkButton>
              </div>
              <div style={{ display: okbtn ? 'block' : 'none' }}>
                <LinkButton style={{ width: 68, height: 28, float: 'right' }} >确定</LinkButton>
              </div>
            </div>
          </LayoutPanel>
        </Layout>
      </Dialog>
    </div >
  )
})
