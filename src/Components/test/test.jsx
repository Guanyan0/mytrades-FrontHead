import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react';
import { reqdoSQL } from '../../api/functions'
import {Layout, Menu,Checkbox, Button} from 'antd';

const { Header, Content, Footer, Sider } = Layout;

export default class Test extends Component {
constructor(props) {
    super(props);
    this.state = {
        option:{},
        opt:1
    }
}
    
async componentDidMount() {
  this.loaddata()
}
loaddata =async()=>{
  let p1={},p2={}
  p1.sqlprocedure='getdata1'
  p2.sqlprocedure='getdata2'
  let rs1 = await reqdoSQL(p1);
  let rs2 = await reqdoSQL(p2);
  let xAxis=[];
  let yAxis1=[];
  let yAxis2=[]
  rs1.rows.forEach((item)=>{
    xAxis.push(item.time);
    yAxis1.push(item.data);
  })
  rs2.rows.forEach((item)=>{
    yAxis2.push(item.data);
  })
  let opt={}
  opt = {
    title: {
      text: 'ESP32'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    xAxis: {
      type: 'category',
      data: xAxis
    },
    yAxis: {
      type: 'value'
    },
    legend: {
      data: ['温度', '湿度']
    },
    series: [
      {
        name:'温度',
        data: yAxis1,
        type: 'line',
        smooth: true
      },
      {
        name:'湿度',
        data: yAxis2,
        type: 'line',
        smooth: true
      }
    ]
  };
  this.setState({option:opt});
}
handleMenu=(e)=>{
  this.setState({opt:e.key})
}

  render() {
    const items = [
      {
        label: '示意图',
        key: '1',
      },
      {
        label: '趋势',
        key: '2',
      }
    ];
    return (
      <div>
        <div style={{position:'relative'}}>
          <Menu defaultSelectedKeys={['1']}  onSelect={this.handleMenu.bind(this)} mode="horizontal"  items={items}></Menu>
          
          {this.state.opt==2?<ReactEcharts option={this.state.option} style={{width:1200,marginTop:'50px'}}></ReactEcharts>:<></>}
          {this.state.opt==1?
          <Layout style={{overflow:'hidden',position:'relative'}}>
            <Sider style={{backgroundColor:'#f5f5f5',borderRight:'1px solid #00205b'}} width={800}>
            <img src={require('./tt.png')}
          style={{width:'600px',marginLeft:'100px',position:'absolute',marginTop:'50px'}}
          ></img>
          </Sider>
          <Content style={{overflow:'hidden', position:'relative',height:'616px',marginLeft:'10px'}}>
            <h1>参数选项</h1>
            <Checkbox.Group id='hobby' ref={ref => this.hobby = ref} 
            options={[{label:'温度',value:'1',checked:true,width:'100px'},{label:'空气湿度',value:'2',checked:true},
            {label:'土壤湿度',value:'3',disabled: true,checked:false},{label:'光照',value:'4',checked:false,disabled: true,},
            {label:'水位',value:'5',disabled: true,checked:false},]} 
            style={{margin:'10px 0px 20px 0px'}}
             />
             <Button type='primary' style={{marginRight:'10px'}}>确定</Button>
             <Button >取消</Button>
          </Content>
          </Layout>:<></>
          
          }
        </div>
      </div>
    )

  }
}
