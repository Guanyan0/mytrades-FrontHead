import React, { Component } from 'react'
import { Modal,Button,Input} from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'
import { reqdoSQL } from '../../api/functions';

export default class Login extends Component {
  constructor(props){
    super(props);
    this.state={
      myWin1: true,
      user:'',
      username:'',
      password:'',
      user_cur:'',
      password_cur:'',
      msgflag:0,
      msg:''
    }
  }
  componentDidMount(){
      let arr=[1,2,3]
      arr.forEach((element,index)=>{
        element=element*2;
      })
      console.log(arr);
  }
  ifmatch= async ()=>{
    let p={}
    p.user=this.state.user_cur
    p.password=this.state.password_cur
    p.sqlprocedure='login'
    let rs=await reqdoSQL(p)
    let res=rs.rows[0];
    if(res.msg==1){
        this.setState({user:res.userid,username:res.username,password:res.password,msgflag:1,msg:'登录成功'});
        setTimeout(() => {
            this.setState({myWin1:false})
        }, 500);
    }else{
        this.setState({msgflag:2,msg:res.msg});
    }
  }
  handleUserChange=(e)=>{
    this.setState({user_cur:e.target.value})
  }
  handlePasswordChange=(e)=>{
    this.setState({password_cur:e.target.value})
  }
  render() {
    return (
      <div>
        <Modal title='登录' open={this.state.myWin1} width={500} centered 
        cancelText='取消' style={{position:'relative'}} closable={false}
        footer={[
        <Button key='btnlogin' type='primary' onClick={()=>this.ifmatch()}>登录</Button>,
        <Button key='btnclose' onClick={()=>this.setState({myWin1:false})}>关闭</Button>,
        ]}
        {...this.props}
        >
        <Input onChange={this.handleUserChange} addonBefore={<div style={{width:'50px'}}>用户名</div>} style={{marginTop:10}}></Input>
        <Input.Password onChange={this.handlePasswordChange} addonBefore={<div style={{width:'50px'}}>密码</div>} style={{marginTop:10,marginBottom:10}}></Input.Password>
        <Button type='Link' style={{color:'#4096ff'}} icon={<QuestionCircleOutlined />}>忘记密码</Button>
        {this.state.msgflag!=0?
            this.state.msgflag==1?<div style={{color:'green'}}>{this.state.msg}</div>:
            <div style={{color:'red'}}>{this.state.msg}</div>
        :<></>}
        </Modal>
       </div>
    )
  }
}
