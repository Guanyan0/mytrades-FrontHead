import { Table,Button, Input, Layout, Pagination, Tooltip } from 'antd';
import React, { Component } from 'react'
import { reqdoSQL } from '../api/functions'
import { PlusOutlined,MinusOutlined,PropertySafetyOutlined } from '@ant-design/icons';
import Trading from './module/trading';
const { Header, Content, Footer, Sider } = Layout;

export default class Selected extends Component {
  constructor(props){
    super(props);
    this.state={
      data: [],
      total: 0,
      pageno: 1,
      pagesize: 20,
      filter:'',
      // user:'',

      selected:{},
      keyfield:'selectedid',
      selectedkeys:[],
      myWin1: false,
      // ...this.props
    }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData = async () => { //加载每页数据
    let {pageno, pagesize,filter} = this.state
    let p = {}
    p.sqlprocedure = 'getselected'
    p.pageno = pageno;
    p.pagesize = pagesize;
    p.user=this.props.user
    p.filter=filter;
    const rs = await reqdoSQL(p) 
    let total=0;
    if(rs.rows.length>0)total = rs.rows[0].total ? parseInt(rs.rows[0].total) : rs.rows.length;
    this.setState({ data:rs.rows,total})
  }  

  handleSearchFilter = async (e) =>{
    this.setState({pageno:1,filter:e}, ()=>{
    this.loadData();
  }) 
  } 
  addSelect=async()=>{ //封装 否则不能在timeout里用await
    let p={}
      p.opt=0;
      p.user=this.props.user
      p.selectedid=this.state.selected.selectedid
      p.sqlprocedure='addordeleteselect'
      let rs= await reqdoSQL(p);
      this.loadData()
  }
  handleAddSelect=async ()=>{
    setTimeout(() => {
      this.addSelect()
    });
  }
  deleteSelect=async()=>{
    let p={}
      p.opt=1;
      p.user=this.props.user
      p.selectedid=this.state.selected.selectedid
      p.sqlprocedure='addordeleteselect'
      let rs= await reqdoSQL(p);
      this.loadData()
  }
  handleReduceSelect= ()=>{
    setTimeout(() => {
      this.deleteSelect()
    });
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
    this.setState({disabled:false,selected:row, selectedkeys:[row[this.state.keyfield]]});
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
      this.trading.myForm1.setFieldsValue({id:this.state.selected.selectedid,tradetype:''})
    })
  }
  render() {
    const columns=[
      {title:'序号',dataIndex:'id', width:'60px', fixed:'left', className:'rownumberStyle',
      render:(text,record,index)=>(this.state.pageno-1)*this.state.pagesize+index+1},
      {dataIndex:'selectedid',title:'代码', width:'150px', align:'center', fixed:'left'},
      {dataIndex:'selectname',title:'名称', width:'150px',fixed:'center'},
      {dataIndex:'current_price',title:'最新价格', width:'120px'},
      {dataIndex:'rfpercent',title:'最新涨跌幅%', width:'120px',
      sorter: (a, b) => a.rfpercent - b.rfpercent,
      render:(record)=><>{record>0?<div style={{color:'red',fontWeight:'bold'}}>{record}</div>:<div style={{color:'green',fontWeight:'bold'}}>{record}</div>}</>
      },
      {dataIndex:'volume_ratio',title:'量比', width:'90px'},
      {dataIndex:'_operation',title: '操作',  key: '_operation', fixed: 'right',align:'center', width:'150px',
        //record对应的是render里的对象 ，dataindex对应的值
        render: (record) => <>
        {record==0?<Tooltip title='添加到自选股'>
          <Button size='small' type="default" danger
          icon={<PlusOutlined />} onClick={() => this.handleAddSelect(record)}>
          添加</Button>
        </Tooltip>:
        <Tooltip title='从自选股中删除'>
          <Button size='small' type="default" danger
          icon={<MinusOutlined />} onClick={() => this.handleReduceSelect(record)}>
          删除</Button>
        </Tooltip>}
        &nbsp;&nbsp;
        <Tooltip title='快捷交易'>
        <Button size='small' type="default" danger
          icon={<PropertySafetyOutlined />} onClick={() => this.handleQucikTrans(record)}>
          快捷交易</Button>
        </Tooltip>
        </>
      }]
    return (
      <div>
        <Layout style={{overflow:'hidden',position:'relative'}}>
          <Header style={{ padding:0, paddingLeft:4, height: 35, lineHeight:'30px', borderBottom:'1px solid #95B8E7', overflow:'hidden',backgroundColor:'#f5f5f5'}}>
            <span style={{fontSize:'22px',lineHeight:'28px',color:'#00205b',textShadow: '2px 2px 2px #ccc',fontWeight:'bold'}}>自选股</span>
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
            <Trading ref={r=>this.trading=r} user={this.props.user}/>
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
    )
  }
}
