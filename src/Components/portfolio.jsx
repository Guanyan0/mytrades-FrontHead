import React, { Component } from 'react'
import { Card, Statistic, Divider, Tabs, Layout, Tooltip, Segmented,Calendar,Table,Button, Input, Pagination } from 'antd';
import { reqdoSQL } from '../api/functions';
import { PieChartOutlined, BarChartOutlined,PropertySafetyOutlined } from '@ant-design/icons';
import Trading from './module/trading';
import MyDoughnutChart from './module/myDoughnutChart';
import MyBarChart from './module/myBarChart';
const { Header, Content, Footer, Sider } = Layout;

export default class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statistics: {},
      chart1:[],
      chart2:[],
      chart3:[],

      
      data: [],
      total: 0,
      pageno: 1,
      pagesize: 20,
      filter:'',
      // user:'',

      portfolio:{},
      keyfield:'portfolioid',
      selectedkeys:[],
    }
  }

  componentDidMount() {
    // this.loadData();
    this.loadData()
  }
  loadData = async () => {
    this.getStatics()
    this.handleChartData('btn1')

    let {pageno, pagesize,filter} = this.state
    let p = {}
    p.sqlprocedure = 'getportfolio'
    p.pageno = pageno;
    p.pagesize = pagesize;
    p.user=this.props.user
    p.filter=filter;
    const rs = await reqdoSQL(p) 
    let total=0;
    if(rs.rows.length>0)total = rs.rows[0].total ? parseInt(rs.rows[0].total) : rs.rows.length;
    this.setState({ data:rs.rows,total})

  }
  getStatics = async () => {
    let p = {}
    p.userid = this.props.user
    p.sqlprocedure = 'getstatics'
    let rs = await reqdoSQL(p)
    this.setState({ statistics: rs.rows[0] })
  }
  handleTabSelect = () => {

  }
  handleChartData=async(opt)=>{
    let p={},rs
    p.userid=this.props.user
    if(opt=='btn1'){
    p.opt=1
    p.sqlprocedure='getchartdata'
    rs=await reqdoSQL(p)
    this.setState({chart1:rs.rows})
    p.opt=2
    p.sqlprocedure='getchartdata'
    rs=await reqdoSQL(p)
    this.setState({chart2:rs.rows,chart3:[]})
    }else if(opt='btn2'){
    p.opt=3
    p.sqlprocedure='getchartdata'
    rs=await reqdoSQL(p)
    this.setState({chart3:rs.rows,chart1:[],chart2:[]})
    }
  }
  handleChartChange=(e)=>{
    this.handleChartData(e)
  }
  handleSizeChange= (value,pagesize)=>{
    this.setState({pagesize}) 
  }

  handlePageChange=async (pageno)=>{
    this.setState({pageno})
    setTimeout(() => {
      this.loadData()
    }, 100);
  }

  selectionChange = (selectedkeys) => {
    this.setState({selectedkeys});    
  } 

  handleSelectRow = (row)=>{
    this.setState({disabled:false,portfolio:row, selectedkeys:[row[this.state.keyfield]]});
  }

  showTotal = (total, range)=>{
    let {pageno, pagesize} = this.state;
    let start=(pageno-1)*pagesize+1;
    let limit=Math.min(start+pagesize-1,total);
    let pagecount = parseInt((total-1)/pagesize)+1;
    let str = `当前第${start}~${limit}行，共${total}行。`;
    return str;
  }

  handleQucikTrans=()=>{
    this.trading.setState({myWin1:true});
    setTimeout(()=>{
      this.trading.myForm1.setFieldsValue({id:this.state.portfolio.portfolioid,tradetype:''})
    })
  }
  handleSearchFilter = async (e) =>{
    this.setState({pageno:1,filter:e}, ()=>{
    this.loadData();
  }) 
  } 
  handleRefresh=()=>{
    this.loadData();
  }
  render() {
    const row = this.state.statistics
    const MyCard = ({ title, value, type, precision, suffix, tooltiptext }) => {
      let color = '#000'
      if (type == 'floating') {
        value = value >= 0 ? '+' + value : value
        color = value >= 0 ? '#cf1322' : '#cf1322'
      }
      value=this.props.user?value:0
      return <div style={{ display: 'inline-block', marginLeft: '10px', marginTop: '10px' }}>
        <Card bordered={false} style={{ width: 200 }} hoverable>
          <Tooltip title={tooltiptext ? tooltiptext : ''}>
            <Statistic title={title} value={value}
              precision={precision ? precision : 2} valueStyle={{ color }} suffix={suffix} />
          </Tooltip>
        </Card>
      </div>
    }
    const tab1 = <>
      <Layout>
        <Sider width={640} style={{ backgroundColor: '#f5f5f5' }}>
          <div>
            <MyCard title='总资产' value={row.total_assets} ></MyCard>
            <MyCard title='浮动盈亏' value={row.floatingpl} type='floating'></MyCard>
            <MyCard title='当日参考盈亏' value={row.todaypl} type='floating' tooltiptext={(row.todaypl / row.total_assets * 100).toFixed(2) + '%'}></MyCard>
          </div>
          <div>
            <MyCard title='总市值' value={row.total_value} ></MyCard>
            <MyCard title='可用' value={row.available} ></MyCard>
            <MyCard title='仓位' value={(row.total_value / row.total_assets * 100).toFixed(1)} precision='1' suffix='%' ></MyCard>
          </div>
          <Divider />
          <div style={{ marginLeft: 20 }}>
            图表选项：<Segmented onChange={this.handleChartChange} size="large" 
            options={[{ label: '持仓分布', value: 'btn1', icon: <PieChartOutlined /> },
               { label: '收益/亏损来源', value: 'btn2', icon: <BarChartOutlined /> }]} 
               />
          </div>
          <Calendar fullscreen={false} style={{width:'90%',marginLeft:'5%',marginTop:'5%'}}></Calendar>
        </Sider>
        <Content width={600}>
          {this.state.chart1[0]?<MyDoughnutChart title='持仓分布' data={this.state.chart1}></MyDoughnutChart>:<></>}
          {this.state.chart2[0]?<MyDoughnutChart title='股票行业分布' data={this.state.chart2}></MyDoughnutChart>:<></>}
          {this.state.chart3[0]?<MyBarChart ydata={this.state.chart3.map((item)=>item.name)} 
          title='盈亏来源' data={this.state.chart3}></MyBarChart>:<></>}
        </Content>
      </Layout>
    </>
    const columns=[
      //portfolioid, portname, portvalue, totalPL, portqty, port_per_cost, current_price, todayPL, RFpercent
      {title:'序号',dataIndex:'id', width:'60px', fixed:'left', className:'rownumberStyle',
      render:(text,record,index)=>(this.state.pageno-1)*this.state.pagesize+index+1},
      {dataIndex:'portfolioid',title:'代码', width:'150px', align:'center', fixed:'left'},
      {dataIndex:'portname',title:'名称', width:'150px',fixed:'center'},
      {dataIndex:'portvalue',title:'市值', width:'120px',
      sorter: (a, b) => parseFloat(a.portvalue) - parseFloat(b.portvalue),},
      {dataIndex:'totalpl',title:'盈亏', width:'120px',
      sorter: (a, b) => parseFloat(a.totalpl) - parseFloat(b.totalpl),
      render:(record)=><>{parseInt(record.substring(0,2))>0?<div style={{color:'red',fontWeight:'bold'}}>{record}</div>:<div style={{color:'green',fontWeight:'bold'}}>{record}</div>}</>
      },
      {dataIndex:'portqty',title:'持仓数', width:'120px',
      sorter: (a, b) => a.portqty - b.portqty,
      },
      {dataIndex:'todaypl',title:'当日盈亏', width:'110px',
      sorter: (a, b) => parseInt(a.todaypl) - parseFloat(b.todaypl),
      render:(record)=><>{parseInt(record.substring(0,2))>0?<div style={{color:'red',fontWeight:'bold'}}>{record}</div>:<div style={{color:'green',fontWeight:'bold'}}>{record}</div>}</>
      },
      {dataIndex:'current_price',title:'现价', width:'120px',
      sorter: (a, b) => parseFloat(a.current_price) - parseFloat(b.current_price),},
      {dataIndex:'port_per_cost',title:'成本', width:'120px',
      sorter: (a, b) => parseFloat(a.port_per_cost) - parseFloat(b.port_per_cost),},
      {dataIndex:'_operation',title: '操作',  key: '_operation', fixed: 'right',align:'center', width:'150px',
        //record对应的是render里的对象 ，dataindex对应的值
        render: () => <>
        <Tooltip title='快捷交易'>
        <Button size='small' type="default" danger
          icon={<PropertySafetyOutlined />} onClick={() => this.handleQucikTrans()}>
          快捷交易</Button>
        </Tooltip>
        </>
      }]
    const tab2=<div>
    <Layout style={{overflow:'hidden',position:'relative'}}>
      <Header style={{ padding:0, paddingLeft:4, height: 35, lineHeight:'30px', borderBottom:'1px solid #95B8E7', overflow:'hidden',backgroundColor:'#f5f5f5'}}>
        <span style={{fontSize:'22px',lineHeight:'28px',color:'#00205b',textShadow: '2px 2px 2px #ccc',fontWeight:'bold'}}>持仓股</span>
        <Input.Search status="warning" addonBefore={<div style={{width:'100px',fontWeight:'bold'}}>添加文本筛选</div>} style={{width:500,marginTop:'1.5px',float:'right'}} onSearch={(e)=>{this.handleSearchFilter(e)}} ref={r=>this.filtertext=r}></Input.Search>
      </Header>
      <Content style={{overflow:'hidden', position:'relative',height:'616px'}}>
        
        <Table dataSource={this.state.data} rowKey={this.state.keyfield} ref={r=>this.Table1=r}
        columns={columns} pagination={false} style={{overflow:'auto', position:'absolute', height:616}}
        sticky scroll={{x:'90%'}}
        rowSelection={{
          type:'radio', 
          selectedRowKeys: this.state.selectedkeys,
          onChange:(selectedRowKeys,selectedRows)=>{this.selectionChange(selectedRowKeys,selectedRows)}
        }}
        onRow={(record) => {
          return {
            onClick: () => {this.handleSelectRow(record)}, // 点击行
            onDoubleClick: () => {this.handleSelectRow(record)},
            onContextMenu: () => {}
          };
        }}
        ></Table>
        <Trading ref={r=>this.trading=r} user={this.props.user} xonchange={this.handleRefresh}/>
      </Content>
      <Footer 
      style={{padding:'5px 16px 0px 16px',lineHeight:'36px', border:'1px solid #95B8E7', borderLeft:'0px', background:'#efefef'}}
      >
         <Pagination  total={this.state.total} style={{textAlign:'center',fontSize:'small',marginBottom:'5px',marginTop:'-2px'}} 
         showSizeChanger showQuickJumper className='paginationStyle'
         current={this.state.pageno} defaultPageSize={this.state.pagesize} 
         pageSize={this.state.pagesize} pageSizeOptions={['10', '20', '50', '100']}
         showTotal={(total, range) => this.showTotal(total,range) }
         onShowSizeChange={this.handleSizeChange.bind(this)}
         onChange={this.handlePageChange.bind(this)}             
         />
      </Footer>
    </Layout>
  </div>
    return (
      <div>
        <Tabs type='card' tabPosition='top' onChange={this.handleTabSelect.bind(this)}
          items={[{ key: 'tab1', label: '我的持仓', children: tab1 },{key: 'tab2', label: '持仓列表', children: tab2 }]}
        ></Tabs>

      </div>
    )
  }
}
