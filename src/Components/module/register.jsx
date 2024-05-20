import React, { Component } from 'react'
import { Modal,Button,Input, Form } from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'
import { reqdoSQL } from '../../api/functions';

export default class Register extends Component {
  constructor(props){
    super(props);
    this.state={
      myWin1: false,
      msgflag:0,
      msg:''
    }
  }
  componentDidMount(){
    
  }
  handleRegister= async ()=>{
    let p={...this.myForm1.getFieldsValue()}
    if(p.user&&p.password&&p.checkpassword&&p.phone){
        if(p.password!==p.checkpassword){
            this.setState({msgflag:2,msg:'两次输入密码不同'})
        }else{
        if(!p.username)p.username=''
        if(!p.email)p.email=''
        p.sqlprocedure='register'
        let rs=await reqdoSQL(p)
        let res=rs.rows[0];
        if(res.msg==1){
            this.setState({msgflag:1,msg:'注册成功'});
            setTimeout(() => {
                this.setState({myWin1:false})
            }, 500);
        }else{
            this.setState({msgflag:2,msg:res.msg})
        }
        console.log(res);
        }
    }else{
     this.setState({msgflag:2,msg:'带*为必填项'})
    }
  }
  render() {
    return (
      <div>
        <Modal title='注册' open={this.state.myWin1} width={500} centered 
        cancelText='取消' style={{position:'relative'}} closable={false}
        footer={[
        <Button key='btnlogin' type='primary' onClick={()=>this.handleRegister()}>注册</Button>,
        <Button key='btnclose' onClick={()=>this.setState({myWin1:false})}>关闭</Button>,
        ]}
        {...this.props}
        >
        <Form ref={ref => this.myForm1 = ref} labelCol={{span: 4}} onFinish={()=>console.log(111)}>
        <Form.Item name='user' label='用户名' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]}>
         <Input key='user'></Input>
        </Form.Item>
        <Form.Item name='password' label='密码' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]}>
         <Input.Password ></Input.Password>
        </Form.Item >
        <Form.Item name='checkpassword' label='确认密码' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]}>
         <Input.Password ></Input.Password>
        </Form.Item>
        <Form.Item name='username' label='昵称' style={{margin:'15px 0px 0px 0px'}} >
         <Input></Input>
        </Form.Item>
        <Form.Item name='phone' label='手机号' style={{margin:'15px 0px 0px 0px'}} rules={[{required: true,message: '必填项'}]} >
         <Input></Input>
        </Form.Item>
        <Form.Item name='email' label='邮箱' style={{margin:'15px 0px 0px 0px'}} >
         <Input  ></Input>
        </Form.Item>
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
