import React, { Component } from 'react'
import { Modal,Button,Input, Form, InputNumber, Switch, Tooltip,Radio } from 'antd'
import { reqdoSQL } from '../../api/functions';

export default class Trading extends Component {
  constructor(props){
    super(props);
    this.state={
      myWin1: false,
      msgflag:0,
      msg:'',
      ifcase:false,
      row:['','',''],
    }
  }
  componentDidMount(){
    
  }
  handleSearch = async ()=>{
    let p={...this.myForm1.getFieldsValue()}
    // console.log(p)
    p.sqlprocedure='gettrading'
    let rs=await reqdoSQL(p);
    // console.log(rs.rows)
    this.setState({row:rs.rows[0]})
    
  }
  handleTrade = async ()=>{
    let data={...this.myForm1.getFieldsValue()},p={}
    console.log(data.tradetype);
    if(data.tradetype=='sell'&&data.quantity>this.state.row.available){
      this.setState({msgflag:2,msg:'卖出超过可用股数'})
    }else if(data.quantity<=0||data.quantity==''){
      this.setState({msgflag:2,msg:'请输入正确的数量'})
    }else if(data.price<=0||data.price==''){
      this.setState({msgflag:2,msg:'请输入正确的价格'})
    }else{
    console.log(this.props);
    p.triggercase=data.ifcased?data.reachprice+'-'+data.supervisetime:'';
    p.userid=this.props.user;
    p.transactionid=data.id;
    p.transprice=data.price;
    p.transqty=data.quantity
    p.transtype=data.tradetype

    p.sqlprocedure='addTransactions'
    let rs=await reqdoSQL(p)
    console.log(rs.rows);
    if(rs.rows[0].msg){
      this.setState({msgflag:1,msg:rs.rows[0].msg})
      setTimeout(() => {
        this.setState({myWin1:false})
        this.props.xonchange();
      }, 500);
      
    }else{
      this.setState({msgflag:2,msg:'交易失败'})
    }
    }
    
  }

  handleFill=(btn,price)=>{
    if(btn=='btn1')this.myForm1.setFieldsValue({price})
    if(btn=='btn2')this.myForm1.setFieldsValue({reachprice:price})
  }
  render() {
    const price=parseFloat(this.state.row.current_price)
    const percent=parseFloat(this.state.row.rfpercent)
    const point=parseInt(this.state.row.point)
    const {name,available}=this.state.row
    return (
      <div>
        <Modal title='交易' open={this.state.myWin1} width={500} centered 
        cancelText='取消' style={{position:'relative'}} closable={false}
        footer={[
        <Button key='btnlogin' type='primary' onClick={()=>this.handleTrade()}>下单</Button>,
        <Button key='btnclose' onClick={()=>this.setState({myWin1:false})}>关闭</Button>,
        ]}
        {...this.props}
        >
        <Form ref={ref => this.myForm1 = ref} labelCol={{span: 4}} onFinish={()=>console.log(111)}>
        <Form.Item name='tradetype' label='类型' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]}>
            <Radio.Group
            options={[{label:'买入', value:'buy'},{label:'卖出', value:'sell'}]}
            optionType="button"
            buttonStyle="solid"
            />
        </Form.Item>
        <Form.Item name='id' label='代码' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]}>
         <Input.Search onSearch={this.handleSearch}></Input.Search>
        </Form.Item>
        {name?
        <Form.Item label='名称' style={{margin:'15px 0px 0px 0px'}}>
            {name}
        </Form.Item>:<></>
        }
        <Form.Item name='price' label='挂单价格' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]}>
            <InputNumber controls={true} step={0.01} ></InputNumber>
        </Form.Item>
        {price?
        <Form.Item label='价格' style={{margin:'15px 0px 0px 0px'}}>
            <Tooltip title={percent>0?'涨'+(percent)+'%':'跌'+(percent)+'%'} placement="left">
            <Button type='text' onClick={()=>this.handleFill('btn1',price.toFixed(point))}>当前:{price?price.toFixed(point):''}</Button>
            </Tooltip>
            <Button type='text' onClick={()=>this.handleFill('btn1',(price/(1+percent/100)*1.1).toFixed(point))} style={{color:'red'}} >涨停:{price?(price/(1+percent/100)*1.1).toFixed(point):''}</Button>
            <Button type='text' onClick={()=>this.handleFill('btn1',(price/(1+percent/100)*0.9).toFixed(point))} style={{color:'green'}}>跌停:{price?(price/(1+percent/100)*0.9).toFixed(point):''}</Button>
        </Form.Item >:<></>
        }
        <Form.Item name='quantity'initialValue={100} label='数量' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]}>
            <InputNumber controls={true} step={100} ></InputNumber>
        </Form.Item>
        {
            available?
            <Form.Item label='可用股数' style={{margin:'15px 0px 0px 0px'}}>
                {available}
            </Form.Item>:<></>
        }
        <Form.Item name='ifcased' label='条件单' style={{margin:'15px 0px 0px 0px'}} 
        valuePropName='checked' //查找文档得知Switch组件是通过checked的属性来显示状态的，所以需要一个额外的属性valuePropName
        >
            <Switch onChange={(checked)=>{this.setState({ifcase:checked})}} ></Switch>
        </Form.Item>
        {this.state.ifcase?<>
        <Form.Item name='reachprice' label='价格到达' style={{margin:'15px 0px 0px 0px'}} >
            <InputNumber controls={true} step={point==3?0.001:0.01} ></InputNumber>
        </Form.Item>
        {price?
        <Form.Item  style={{margin:'15px 0px 0px 15px'}}>
            <Tooltip title={percent>0?'涨'+(percent)+'%':'跌'+(percent)+'%'} placement="left">
            <Button type='text' onClick={()=>this.handleFill('btn2',price.toFixed(point))}>当前:{price?price.toFixed(point):''}</Button>
            </Tooltip>
            <Button type='text' onClick={()=>this.handleFill('btn2',(price/(1+percent/100)*1.1).toFixed(point))}style={{color:'red'}} >涨停:{price?(price/(1+percent/100)*1.1).toFixed(point):''}</Button>
            <Button type='text' onClick={()=>this.handleFill('btn2',(price/(1+percent/100)*0.9).toFixed(point))}style={{color:'green'}}>跌停:{price?(price/(1+percent/100)*0.9).toFixed(point):''}</Button>
        </Form.Item>:<></>
        }
        <Form.Item name='supervisetime' label='监控时长' style={{margin:'15px 0px 0px 0px'}} >
            <InputNumber controls={true} step={10} addonAfter={'天'}></InputNumber>
        </Form.Item></>:<></>
        }
        </Form>
        
        {this.state.msgflag!=0?
            this.state.msgflag==1?<div style={{color:'green'}}>{this.state.msg}</div>:
            <div style={{color:'red'}}>{this.state.msg}</div>
        :<></>}
        </Modal>
       </div>
    )
  }
}
