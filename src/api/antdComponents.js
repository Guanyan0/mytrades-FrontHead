/**
 * 包含应用中使用请求接口的模块
 */
import ajax from './ajax'
import React, { Component } from 'react';
import { useEffect,useRef, useImperativeHandle } from 'react';
import axios from "axios";
import { notification, Form, Input, Select, InputNumber, Checkbox, Radio, DatePicker, Image, Button, ConfigProvider, Cascader, TreeSelect, Divider, QRCode, Rate} from 'antd'
import { WindowsOutlined, FormOutlined, PlusCircleOutlined, EditOutlined,DeleteOutlined,SaveOutlined,PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN'
import { createRef } from 'react';
import '../css/style.css';
import { myLocalTime, searchNodeInRows, addTreeChildrenData, reqdoTree, reqdoSQL,myStr2JsonArray, myStr2Json, myDatetoStr } from './functions.js'
import ReactDom from 'react-dom'

//定义全局变量
const sys={};
sys.label={};
sys.label.fontsize=14;
sys.label.fontname='楷体'; 
sys.panelcolor="#E0ECFF";
sys.bordercolor='#95B8E7';  //panel边框线颜色
sys.headercolor='#efefef';  //网格标题和footer的颜色 
sys.dateformat = 'YYYY-MM-DD';
sys.serverpath='myServer/';

function myHeader(title){
  return (<span><WindowsOutlined /><label style={{marginLeft:8}} className='headerStyle'>学生详细信息</label></span>);
}

export function mySetFormValues(this$0, form, row) {
  //将row中对象值赋值到一个表单，仅适用于自定义组件。//不能给row[key]赋值，否则row会发生改变,tree或table的this.state.data也发生改变
  for (var key in row) {
    //console.log(111, key,this$0[key]);
    //图片和jsons数据必须定义ref
    let str = row[key];
    if (this$0[key] && this$0[key].state && this$0[key].state.datatype=='json'){ //处理json数据
      //console.log(111,row[key]);
      //row[key] = myStr2JsonArray(row[key]);  //将数据库中的json字符串转换成js的json
      str = myStr2JsonArray(row[key]);  //将数据库中的json字符串转换成js的json
      //console.log(112,str);
    }       
    if (this$0[key] && this$0[key].state && this$0[key].state?.antclass === 'datebox') {  
      //处理日期特殊格式,例如2010-01-10
      str = dayjs(str, sys.dateformat);
    }else if (this$0[key] && this$0[key].state && this$0[key].state?.antclass === 'cascader') {
      let node=searchNodeInRows(this$0[key].state?.attr.nodes, str);  //从线性表数组中找到这个元素节点
      //console.log(333,key,node);
      if (node!=null && node.ancestor!=''){
         str=(node.ancestor+str).split('#');
      }else{   
        str=[str];  //是数组
      }      
    }
    if (this$0[key] && this$0[key].state?.antclass === 'image') {
      console.log(334,key, str, this$0[key].state?.antclass);
      //处理图片的特殊赋值方式      
      this$0[key].setState({src: str}); //图片用js赋值。
    }
    this$0[form].setFieldValue(key, str); 
  }
}

export function myResetJsonValues(data){
  //处理日期变量
  for (var key in data) {
    if (typeof data[key] === 'object' && typeof data[key].$d === 'object'){ //将日期型数据转成字符串
      data[key] = data[key].format(sys.dateformat);        
    }
  }
  return data;
}

export function myNotice(msg, type, width){
  if (!type || type=='') type='success';
  notification.open({
    key: '_notice1', 
    message: '系统提示!', 
    description: msg,
    duration: 2,
    type: type,
    overlayStyle: { width: width },
    placement: 'bottomRight'
  });  //
}; 

export const myParseAntProps = (props) => {
    //可以有三种方式接受参数
    //调用方式1：<MyTextBox params='stuname,学生姓名,72, 70, 20, 28,240,诸葛孔明, ,' />
    //调用方式2：<MyTextBox id='supplierid' label='供应商' labelwidth='72' top={20+7*rowheight} left='20' width='200' ref={ref => this.supplierid = ref} addonRight={this.addon.bind(this, 'help')} />
    //let params=this.props.params;  
    // attr=this.props.attr;
    //editable控制控件是否只读，value控制控件的值
    //console.log(1,props)
    //console.log(2,props.params)
    let attr={};
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
      if (tmp.length>7) attr.style=tmp[7];
      if (tmp.length>8) attr.items=tmp[8];  //radio/checkbox选项     
      if (tmp.length>9) attr.textfield=tmp[9];  //label的field名称
    }
    attr={...attr, ...props};  //
    if (attr.hidden || (attr.style!==undefined && attr.style==='hidden')){
      attr.top=0; attr.left=0; attr.height=0; attr.width=1; attr.labelwidth=0; attr.label='';
    }
    if (attr.antclass!='label' && attr.antclass!='image'){
      if (attr.height === undefined || parseInt(attr.height) === 0) attr.height=28;
    }    
    if (attr.antclass!='radio' && attr.antclass!='image'){
      if (attr.width === undefined || parseInt(attr.width) === 0) attr.width=200;
    }
    if (attr.panelheight === undefined) attr.panelheight=250;
    if (attr.rows === undefined || isNaN(attr.rows)) attr.rows=4;
    attr.rows=parseInt(attr.rows);
    attr.top=parseInt(attr.top);   //top='10'  10
    attr.left=parseInt(attr.left);
    attr.height=parseInt(attr.height);
    attr.width=parseInt(attr.width);
    attr.labelwidth=parseInt(attr.labelwidth);
    if (attr.panelwidth === undefined) attr.panelwidth=attr.width;
    attr.panelheight=parseInt(attr.panelheight);
    attr.panelwidth=parseInt(attr.panelwidth);
    if (attr.items==undefined) attr.items='';
    if (attr.label === undefined) attr.label='';
    if (attr.style === undefined) attr.style='';
    if (attr.disabled==undefined) attr.disabled=false;
    if (attr.datatype==undefined) attr.datatype='c';  //数据类型，如果是json，那么按数组处理
    
    if (attr.label!=='' && attr.colon) attr.label+=':';
    attr.editable=true;
    attr.multiline=false;
    attr.hidden=false;
    if (attr.textfield==undefined || attr.textfield=='') attr.textfield='label';
    if (attr.valuefield==undefined || attr.valuefield=='') attr.valuefield=attr.id;
    attr.addon='';
    attr.spinners=false;
    attr.required=false;
    attr.buttontype='default';  //用于radio
    attr.cascader=false;
    let style=attr.style.split(';');
    if (style.includes('hidden')) attr.hidden=true;  //框隐藏文本框
    if (style.includes('readonly')) attr.editable=false;  //文本框永远只读
    if (style.includes('disabled') || style.includes('disable')) attr.disabled=true;  //文本框永远只读
    if (style.includes('textarea')) attr.multiline=true;  //多行文本框，类似于textarea
    if (style.includes('required')) attr.required=true;    
    if (attr.hidden) attr.editable=false;
    if (style.includes('spinner') || style.includes('spinners')) attr.spinners=true;
    if (style.includes('button')) attr.buttontype='button';    
    if (style.includes('cascader')) attr.cascader=true;
    if (style.includes('search')) attr.addon='search';
    else if (style.includes('help')) attr.addon='help';    
    if (attr.value===undefined) attr.value='';
    if (attr.message!=undefined && attr.message!='') attr.required=true;
    attr.data=[];
    if (attr.options!=undefined && typeof attr.options==='object') attr.data=attr.options;
    if (attr.items!=''){
      if (typeof attr.items ==='object') //本身是对象
        attr.data=attr.items;
      else if (typeof attr.items ==='string')
        attr.data=attr.items.split(';').map(item => {  //字符串,checkbox只能使用label,value？不能设置fieldNames
          let row={}; row[attr.id]=item; row.label=item; row.value=item;  
          return (row)
      });  
    }
    //if (attr.data.length>0) console.log(991,attr.data);
    return attr;
}

export class AntTextBox extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    //console.log(9999,props);
    //可以有2种方式接受参数
    //调用方式1：<MyTextBox params='stuname,学生姓名,72, 70, 20, 28,240,诸葛孔明, ,' />
    //调用方式2：<MyTextBox id='supplierid' label='供应商' labelwidth='72' top={20+7*rowheight} left='20' width='200' ref={ref => this.supplierid = ref} addonRight={this.addon.bind(this, 'help')} />
    //let antclass='textbox';  //不同控件参数解析不同
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'textbox';  //不同控件参数解析不同
    //let attr=myParseAntProps(this.props,'');
    let attr=myParseAntProps(p);
    //console.log(9991, attr);
    //console.log(9992, attr.height);
    this.state = {
      attr:attr,
      value:attr.value,
      antclass: attr.antclass,
      editable:attr.editable,
      display:'block'
    }
  }  

  handleChange=(e)=>{
    this.setState({value: e.target.value});
  }

  render() {    
    let { onChange, onSearch, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, disabled, editable, addon, multiline, message } = this.state.attr;
    if (addon=='search'){
        return (
          <Form.Item label={label} labelCol={{style:{ width: labelwidth }}} name={id} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
             <Input.Search style={{width: width, height:height}} id={id} ref={ref => this[id] = ref} 
             readOnly={editable? !this.state.editable : true} disabled={disabled}
             onFocus={()=>{document.getElementById(id).select()}} onChange={this.handleChange.bind(this)}
             { ...this.props } />
          </Form.Item>     
        )
    }else if (multiline){
     // console.log(id,this.state.attr)
      return (
          <Form.Item label={label} labelCol={{style:{ width: labelwidth }}} name={id} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
             <Input.TextArea style={{width: width, height:height}} id={id} ref={ref => this[id] = ref} 
              readOnly={ editable? !this.state.editable : true } disabled={disabled}
              autoSize={{ minRows: this.state.attr.rows, maxRows: this.state.attr.rows }} 
              onChange={this.handleChange.bind(this)}
              { ...this.props } />
          </Form.Item>     
        )
    }else{
        return (
          <Form.Item label={label} labelCol={{style:{ width: labelwidth }}} name={id} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
             <Input style={{width: width, height:height}} id={id} ref={ref => this[id] = ref} 
              readOnly={ editable? !this.state.editable : true } disabled={disabled}
              onFocus={()=>{document.getElementById(id).select()}} onChange={this.handleChange.bind(this)}          
              { ...this.props } />
          </Form.Item>     
        )        
    }    
  }
}



export class AntHiddenField extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    let attr={...this.props};  //this.props不能添加属性e.g.antclass
    attr.antclass = 'textbox';  //不同控件参数解析不同
    //let attr=myParseAntProps(this.props,'');
    this.state = {
      attr:attr,
      value:attr.value,
      antclass: attr.antclass
    }
  }  
  render() {    
    let { onChange } = this.props;
    let id = this.state.attr.id;
    return (
      <Form.Item label='' labelCol={{style:{ width: 0 }}} name={id} style={{position:'absolute', top:0, left:0, display:'none'}}>
         <Input style={{width: 0, height: 1}} id={id} ref={ref => this[id] = ref} disabled { ...this.props } />
      </Form.Item>     
    )        
  }
}

export class AntSearchBox extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'searchbox';  //不同控件参数解析不同
    let attr=myParseAntProps(p);
    this.state = {
      attr:attr,
      value:attr.value,
      antclass: attr.antclass,
      labeltext:'',
      editable:attr.editable,
      display:'block',
      options: attr.label.split(';').map((item,index)=><Select.Option onChange={(value)=>{alert(value);this.setState({labeltext:value})}} key={item} label={index} value={item} />)
    }
  }  

  handleChange=(e)=>{
    this.setState({value: e.target.value});
  }

  render() {
    const selectBefore = (
      <Select defaultValue={this.state.options[0]}>
        {this.state.options}
      </Select>
    );
    let { onChange, onSearch, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, disabled, editable, addon, multiline, message } = this.state.attr;
    return (
      <Form.Item label='' labelCol={0} name={id} colon={false} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
         <Input.Search style={{width: width+labelwidth, height:height}} id={id} ref={ref => this[id] = ref} 
         readOnly={editable? !this.state.editable : true} disabled={disabled} addonBefore={selectBefore}
         onFocus={()=>{document.getElementById(id).select()}} onChange={this.handleChange.bind(this)}
         { ...this.props } />
      </Form.Item>     
    )
  }
}

export class AntNumberBox extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'numberbox';  //不同控件参数解析不同
    //let attr=myParseAntProps(this.props,'');
    let attr=myParseAntProps(p);
    this.state = {
      attr:attr,
      value:attr.value,
      antclass: attr.antclass,
      editable:attr.editable,
      display:'block'
    }
  }  

  handleChange=(value)=>{
    //console.log(444,value);
    this.setState({value});
  }

  render() {
    let { onChange, onSearch, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, disabled, editable, addon, multiline, message } = this.state.attr;
    return (
      <Form.Item label={label} labelCol={{style:{ width: labelwidth }}} name={id} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
         <InputNumber style={{width: width, height:height, textAlign:'right', fontFamily:'times new roman'}} id={id} ref={ref => this[id] = ref} 
          readOnly={ editable? !this.state.editable : true } disabled={disabled} 
          onFocus={()=>{document.getElementById(id).select()}} onChange={this.handleChange.bind(this)}          
          { ...this.props } />
      </Form.Item>     
    ) 
  }
}


export class AntRadio extends React.Component {  
  //<AntRadio params='gender,性别,82,0,14,0,10,,男;女' top={16+rowheight*3} />
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'radio';  //不同控件参数解析不同
    let attr=myParseAntProps(p);
    if (attr.buttontype!='button') attr.buttontype='default';
    attr.options=attr.data;    
    for (let i=0; i<attr.data.length; i++){    
      attr.data[i]=<Radio key={attr.id+'_'+i} style={{marginLeft: i>0? attr.width:0}} value={attr.data[i][attr.id]}>{attr.data[i].label}</Radio>
    }
    this.state = {
      attr: attr,
      value: attr.value,
      antclass: attr.antclass,
      editable: attr.editable,
      display: 'block'
    }
  }  
  //radio
  render() {
    let { onChange, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, data, textfield, message, buttontype } = this.state.attr;
    return (
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
        <Radio.Group id={id} ref={ref => this[id] = ref} fieldNames={{value: id, label:textfield}} optionType={buttontype}
         buttonStyle="solid" style={{marginLeft:0}} { ...this.props } >
          {data}
        </Radio.Group>
      </Form.Item>     
     )
   }
}

export class AntCheckBox extends Component {  
  //<AntCheckBox params='hobby,个人兴趣,82,0,14,0,16,,下棋;钓鱼;唱歌;书法;弹琴;编程' top={16+rowheight*7} count={3} />
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'checkbox';  //不同控件参数解析不同
    let attr=myParseAntProps(p);    
    if (attr.maxcheckedcount === undefined || isNaN(attr.maxcheckedcount)) attr.maxcheckedcount=0;
    else attr.maxcheckedcount=parseInt(attr.maxcheckedcount);
    if (attr.maxCheckedCount!==undefined && !isNaN(attr.maxCheckedCount)) attr.maxcheckedcount=parseInt(attr.maxCheckedCount);
    this.state = {
      attr: attr,
      value: [],
      antclass: attr.antclass,
      display: 'block'
    }
  }  
  
  handleChange = (values) => {
    this.setState({value: values});    
  }

  //checkbox.group 之后加上<row><col>可以分行显示选项
  SetCheckbox = () => {
    let { id, width, data, maxcheckedcount } = this.state.attr;
    let htmlstr;
    if (maxcheckedcount==0){  //不限制个数
      htmlstr=<Checkbox.Group id={id} ref={ref => this.checkbox = ref} options={data} { ...this.props } />
    }else{ //多个checkbox，限制个数
      let str=data.map((item, index) => {
        return (<Checkbox id={id+index} key={id+index} disabled={this.state.value.length>=maxcheckedcount && !this.state.value.includes(item.value)}
        ref={ref => this[id+index] = ref} value={item.value} style={{ marginLeft:index>0? width : 0 }}>{item.label}</Checkbox>)
      })
      let label=<label className='labelStyle'>（限{maxcheckedcount}项）</label>
      htmlstr=<Checkbox.Group id={id} ref={ref => this.checkbox = ref} onChange={(values)=>this.handleChange(values)} { ...this.props }>{str}{label}</Checkbox.Group>
    }   
    return htmlstr;
  }

  render() {
    let { onChange, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, data, textfield, message, buttontype } = this.state.attr;
    return (      
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
        {this.SetCheckbox()} 
      </Form.Item>     
     )
   }
}

export const AntCheckBoxx = (props)=> {
   const { parent } = props;
   let p={...props};  //this.props不能添加属性e.g.antclass
   p.antclass = 'checkbox';  //不同控件参数解析不同
   let attr=myParseAntProps(p);
   if (attr.count === undefined) attr.count = 0;
   const state = {
     attr: attr,
     value: attr.value,
     antclass: attr.antclass,
     editable: attr.editable,     
     display: 'block'
   }
   const checkbox1=React.createRef();   

   const handleChange = (values) => {     
    //console.log(668,state.attr.parent);

     return;
   }

   let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, data, textfield, message, buttontype } = state.attr;
   return (
     <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : state.display}} rules={[{required: state.attr.required, message:message }]}>
       <Checkbox.Group id={id} value={state.value}
       options={data} { ...props } onChange={(values)=>handleChange(values)} />
     </Form.Item>     
    )
}

export class AntDateBox extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'datebox';  //不同控件参数解析不同
    let attr=myParseAntProps(p);
    //console.log(99990, attr);
    this.state = {
      attr: attr,
      value: attr.value,
      antclass: attr.antclass,
      editable: attr.editable,
      display: 'block'
    }
  }  

  handleChange = (value)=>{
    //console.log(991,value);
    this.setState({value: value});
    //if (value == null) value = myDatetoStr(new Date());    
    //this.setState({value: value});
  }

  render() {
    let { onChange, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, editable, dateformat, message } = this.state.attr;
    return (
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' mode='date' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
         <DatePicker id={id} ref={ref => this[id] = ref} format={sys.dateformat} onChange={this.handleChange.bind(this)} />
      </Form.Item>      
     )
   }
}

export class AntComboBox extends React.Component {  //
  // <AntComboBox params='deptname,所属院系,82,0,14,0,260,,信息管理与信息系统;大数据管理与应用;工商管理;计算机科学与技术;会计学' top={16+rowheight*5} ref={ref=>this.deptname=ref}/>
  //供应商编码区分大小写
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'combobox';  //不同控件参数解析不同
    let attr=myParseAntProps(p);
    //if (attr.buttontype!='button') attr.buttontype='default';
    this.state = {
      attr: attr,
      value: attr.value,
      row: {},
      antclass: attr.antclass,
      editable: attr.editable,
      display: 'block'
    }
  }  

  async componentDidMount(){
    let { sqlprocedure } = this.state.attr;
    if (sqlprocedure!=undefined && sqlprocedure!=''){
      let p={...this.state.attr}
      let rs=await reqdoSQL(p);
      let attr={...this.state.attr};
      attr.data=rs.rows;
      //console.log(3777,rs.rows);
      this.setState({attr});
    }
  }

  xhandleChange=(e)=>{
    this.setState({value: e.target.value});
  }

  render() {
    let { onChange, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, textfield, editable, data, message, buttontype } = this.state.attr;
    //console.log(1777,id,textfield,data)
    return (
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
         <Select id={id} style={{width:width}} ref={ref => this[id] = ref} fieldNames={{value: id, label:textfield}} options={data} 
          onChange={(value,row) => {console.log(value,row); this.setState({ value: value, row:row }); onChange?.(value, row)}}
          { ...this.props } />
      </Form.Item>     
     )
   }
}

export class AntComboTree extends React.Component {  //
  //<AntComboTree params='subcategoryid,类别编码,82,0,14,0,300,cascader,,categoryname' top={16+rowheight*5} ref={ref=>this.subcategoryid=ref} sqlprocedure='demo505a' treestyle='full' onChange={this.handleCategoryChange.bind(this)} /> 
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'combotree';  //不同控件参数解析不同
    let attr=myParseAntProps(p);
    //if (attr.buttontype!='button') attr.buttontype='default';
    this.state = {
      attr: attr,
      value: attr.value,
      antclass: attr.antclass,
      editable: attr.editable,
      data: [],
      selectedKeys: [],
      display: 'block'
    }
  }  
  
  async componentDidMount(){
    let { sqlprocedure, treestyle, options } = this.state.attr;
    if (options==undefined && sqlprocedure!=undefined && sqlprocedure!=''){
      let p={...this.state.attr}
      p.parentnodeid='';
      p.style=treestyle;
      let rs=await reqdoTree(p);
      //console.log(11111,rs.rows);
      let attr={...this.state.attr};
      attr.data=rs.rows;
      this.setState({attr});
    }
  }

  loadData = async (node) => {
    //节点展开时加载数据时触发
    let data =[...this.state.data];
    if (node && node.children && node.children.length==1 && node.children[0].text.trim()==''){        
      let p = {};
      p.style = "expand";
      p.parentnodeid = node.id;
      p.sqlprocedure = this.state.attr.sqlprocedure;
      let rs = await reqdoTree(p);
      //必须设置叶子节点的isLeaf属性为true
      let rows=rs.rows;
      //console.log(991,rows);
      rows.forEach((item)=>{
        if (item.isparentflag==0) item.isLeaf=true;
      })
      //替换原数组data中的children值
      data = addTreeChildrenData(data, node, rows); //将rs.rows数据添加为node的子节点
      this.setState({data: data}, () => {
         setTimeout(()=>{
           //this.myTree1.setState({selectedKeys: [node.id]});
         })
      });
    }
    return data;      
  }

  handleDoubleClick=(e, node)=>{
    //双节结点时选中这个结点，注意需要使用数组
    if (!node) return;
    this.myTree1.setState({selectedKeys: [node.id]});
  }

  render() {
    let { onChange, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, textfield, editable, data, message, buttontype,panelheight } = this.state.attr;
    //console.log(888,data);
    let htmlstr;
    htmlstr=<TreeSelect id={id} ref={ref => this[id] = ref} treeIcon treeLine style={{ width: width }} 
      dropdownStyle={{maxHeight: panelheight, overflow: 'auto'}} fieldNames={{value: id, label:textfield}} 
      onDoubleClick={this.handleDoubleClick.bind(this)} treeData={data}
      loadData = {this.loadData.bind(this)}  
      onChange={(value, row) => {this.setState({ value, row }); onChange?.(value, row)}}
      { ...this.props } />
    return (
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
        {htmlstr}
      </Form.Item>     
     )
   }
}

export class AntCascader extends React.Component {  //
  //<AntComboTree params='subcategoryid,类别编码,82,0,14,0,300,cascader,,categoryname' top={16+rowheight*5} ref={ref=>this.subcategoryid=ref} sqlprocedure='demo505a' treestyle='full' onChange={this.handleCategoryChange.bind(this)} /> 
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'cascader';  //不同控件参数解析不同
    let attr=myParseAntProps(p);
    //if (attr.buttontype!='button') attr.buttontype='default';
    this.state = {
      attr: attr,
      value: attr.value,
      antclass: attr.antclass,
      data: [],
      selectedKeys: [],
      display: 'block'
    }
  }  
  
  async componentDidMount(){
    let { sqlprocedure, treestyle, options } = this.state.attr;
    if (options==undefined && sqlprocedure!=undefined && sqlprocedure!=''){
      let p={...this.state.attr}
      p.parentnodeid='';
      p.style=treestyle;
      let rs=await reqdoTree(p);
      //console.log(11111,rs.rows);
      //console.log(11112,rs.nodes);
      let attr={...this.state.attr};
      attr.data=rs.rows;
      attr.nodes=rs.nodes;
      this.setState({attr});
    }
  }

  render() {
    let { onChange, rules }= this.props;
    let { id, label, labelwidth, top, left, height, width, value, style, hidden, textfield, editable, data, message, buttontype,panelheight } = this.state.attr;
    console.log(888,data);
    let htmlstr;
    htmlstr=<Cascader id={id} ref={ref => this[id] = ref} fieldNames={{value: id, label:textfield}} 
    options={data} style={{width:width}}      
    onChange={(value, row) => {this.setState({ value, row }); onChange?.(value, row)}}
    { ...this.props }/>
    return (
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} rules={[{required: this.state.attr.required, message:message }]}>
        {htmlstr}
      </Form.Item>     
     )
   }
}

export class AntLabel extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'label';  //不同控件参数解析不同
    let attr=myParseAntProps(p);
    if (attr.height==0) attr.height=sys.fontSize;
    this.state = {
      attr: attr,
      antclass: attr.antclass,
      display: 'block'
    }
  }
  render() {
    //<Header style={{height:30,lineHeight:'30px', paddingLeft:12, borderBottom:'1px solid #95B8E7', background:'#E0ECFF', fontSize:14}}>    <WindowsOutlined />    <label style={{marginLeft:8}} className='headerStyle'>学生详细信息</label>    </Header>   
    let { id, label, labelwidth, top, left, height, width, style, hidden, icon } = this.state.attr;
    return (
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' colon={false} 
       style={{fontSize:height, position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} />
    )
   }
}



export class AntImage extends React.Component {  //class的名称必须大写字母开头
  constructor(props) {
    super(props);
    let p={...this.props};  //this.props不能添加属性e.g.antclass
    p.antclass = 'image';  //不同控件参数解析不同
    p.datatype='json';  //多个图片时
    let attr=myParseAntProps(p);
    if (attr.height==0) attr.height=sys.fontSize;
    this.state = {
      attr: attr,
      src: attr.src,
      value: attr.src,
      datatype: attr.datatype,
      antclass: attr.antclass,
      display: 'block'
    }
  }
 
  render() {
    let { id, label, labelwidth, top, left, height, width, style, hidden } = this.state.attr;
    let src = this.state.src;  //不是从state.attr中提取
    let value = this.state.value;  //不是从state.attr中提取
    let html=[];
    //console.log(115,typeof src,src);
    if (typeof src === 'object'){
      console.log(116,sys.serverpath,typeof src,src);
      for (let i=0; i<src.length; i++){  //多个图片文件,json格式中使用filename属性指定图片文件
        let url=sys.serverpath+src[i].filename+'?time='+myLocalTime('').timestamp;
        console.log(777,id,url);
        html.push(<Image key={id+'_'+i} style={{marginRight:10}} width={width>0? width:null} height={height>0? height:null} src={url} placeholder={<Image width={width>0? width:null} height={height>0? height:null} preview={false} src={url+"?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"}/>} />)
      }       
    }else{ //一个图片
      let url=sys.serverpath+src+'?time='+myLocalTime('').timestamp;;
      html.push(<Image key={id} width={width>0? width:null} height={height>0? height:null} src={url} placeholder={<Image width={width>0? width:null} height={height>0? height:null} preview={false} src={url+"?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"}/>} />)
    }
    //console.log(1119,src, this.state.attr.src);
    return (
      <Form.Item label={label} name={id} labelCol={{style:{ width: labelwidth }}} className='labelStyle' style={{position:'absolute', top:top, left:left>=0? left:null, right:left<0? -left:null, display:hidden? 'none' : this.state.display}} >
        <>
        {html}
        </>
      </Form.Item>
    )
   }
}

