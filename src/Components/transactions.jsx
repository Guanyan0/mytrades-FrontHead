import { Table, Button, Input, Layout, Pagination, Tooltip, DatePicker, Menu, Modal } from 'antd';
import React, { Component } from 'react'
import { reqdoSQL } from '../api/functions'
import { TransactionOutlined, PropertySafetyOutlined, FileSearchOutlined, PlusCircleOutlined, MinusCircleOutlined, CloseCircleOutlined, StockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Trading from './module/trading';
const { Header, Content, Footer, Sider } = Layout;
const { RangePicker } = DatePicker;

export default class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total: 0,
      pageno: 1,
      pagesize: 20,
      textfilter: '',
      datefilter: ['', ''],
      textcur: '',
      datecur: '',
      // user:'',

      transction: {},
      keyfield: 'transkey',
      selectedkeys: [],
      FilterModal: false,
      // ...this.props
    }
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => { //加载每页数据
    let { pageno, pagesize, textfilter } = this.state
    let p = {}
    p.sqlprocedure = 'gettransactions'
    p.pageno = pageno;
    p.pagesize = pagesize;
    p.user = this.props.user
    p.filter = textfilter;
    p.start = this.state.datefilter[0];
    p.end = this.state.datefilter[1];
    const rs = await reqdoSQL(p)
    let total = 0;
    if (rs.rows.length > 0) {
      total = rs.rows[0].total ? parseInt(rs.rows[0].total) : rs.rows.length;
      for (let i in rs.rows) rs.rows[i].transqty = rs.rows[i].transqty < 0 ? rs.rows[i].transqty * (-1) : rs.rows[i].transqty
    }
    this.setState({ data: rs.rows, total })
  }

  handleSizeChange = (value, pagesize) => {
    this.setState({ pagesize })
  }

  handlePageChange = async (pageno) => {
    this.setState({ pageno })
    setTimeout(() => {
      this.loadData()
    }, 100);
  }

  selectionChange = (selectedkeys) => {
    this.setState({ selectedkeys });
  }

  handleSelectRow = (row) => {
    this.setState({ disabled: false, transction: row, selectedkeys: [row[this.state.keyfield]] });
  }

  showTotal = (total, range) => {
    let { pageno, pagesize } = this.state;
    let start = (pageno - 1) * pagesize + 1;
    let limit = Math.min(start + pagesize - 1, total);
    let pagecount = parseInt((total - 1) / pagesize) + 1;
    let str = `当前第${start}~${limit}行，共${total}行。`;
    return str;
  }

  handleQucikTrans = () => {
    this.trading.setState({ myWin1: true });
    setTimeout(() => {
      this.trading.myForm1.setFieldsValue({ id: this.state.transction.transactionid, tradetype: '' })
    })
  }
  handleMenu = (item) => {
    let { key } = item;
    if (key == 'addfilter') this.setState({ FilterModal: true })
    else if (key == 'resetfilter') {
      this.setState({ pageno: 1, textfilter: '', datefilter: ['', ''] })
      setTimeout(() => {
        this.loadData()
      }, 100);
    } else if (key == 'buy') {
      this.trading.setState({ myWin1: true });
      // console.log(11,this.trading);
      // console.log(12,this.trading.props);
      /*
      为什么第一次调用 ref 的 From 为空？
      ref 仅在节点被加载时才会被赋值，请参考 React 官方文档：https://reactjs.org/docs/refs-and-the-dom.html#accessing-refs
      因此需要使用settimeout
      */
      setTimeout(() => {
        this.trading.myForm1.setFieldsValue({ id: '', tradetype: 'buy' })
      })
    } else if (key == 'sell') {
      this.trading.setState({ myWin1: true });
      setTimeout(() => {
        this.trading.myForm1.setFieldsValue({ id: '', tradetype: 'sell' })
      })
    }
  }
  handleOK = () => {
    let start = dayjs(this.state.datecur[0]).format('YYYY-MM-DD');
    let end = dayjs(this.state.datecur[1]).format('YYYY-MM-DD');
    if (start !== dayjs().format('YYYY-MM-DD') && end !== dayjs().format('YYYY-MM-DD')) this.setState({ datefilter: [start, end] })
    if (this.state.textcur) this.setState({ textfilter: this.state.textcur })

    this.setState({ pageno: 1, FilterModal: false })
    setTimeout(() => {
      this.loadData()
    }, 100);
  }
  render() {
    const columns = [
      {
        title: '序号', dataIndex: 'id', width: '60px', fixed: 'left', className: 'rownumberStyle',
        render: (text, record, index) => (this.state.pageno - 1) * this.state.pagesize + index + 1
      },
      { dataIndex: 'transactionid', title: '代码', width: '100px', align: 'center', fixed: 'left' },
      { dataIndex: 'transname', title: '名称', width: '150px', fixed: 'center' },
      { dataIndex: 'transtime', title: '时间', width: '180px', sorter: (a, b) => dayjs(a.transtime) - dayjs(b.transtime), },
      { dataIndex: 'transprice', title: '成交价', width: '100px', sorter: (a, b) => a.transprice - b.transprice, },
      { dataIndex: 'transqty', title: '成交量', width: '90px', sorter: (a, b) => a.transqty - b.transqty, },
      { dataIndex: 'transamt', title: '成交额', width: '90px', sorter: (a, b) => a.transamt - b.transamt, },
      { dataIndex: 'transtype', title: '操作', width: '90px' },
      {
        dataIndex: '_operation', title: '交易', fixed: 'right', align: 'center', width: '150px',
        //record对应的是render里的对象 ，dataindex对应的值
        render: () => <>
          <Tooltip title='快捷交易'>
            <Button size='small' type="default" danger
              icon={<PropertySafetyOutlined />} onClick={() => this.handleQucikTrans()}>
              快捷交易</Button>
          </Tooltip>
        </>
      }]
    const items = [
      {
        label: '筛选',
        key: 'filter',
        icon: <FileSearchOutlined style={{ fontSize: 16 }} />,
        style: { width: 180, height: '35px', fontSize: 18, fontWeight: 'bold' },
        children: [
          {
            label: '添加筛选',
            key: 'addfilter',
          },
          {
            label: '重置筛选',
            key: 'resetfilter',
          },
        ],
      },
      {
        label: '添加交易',
        key: 'trade',
        icon: <StockOutlined />,
        style: { width: 200, height: '35px', fontSize: 18, fontWeight: 'bold' },
        children: [

          {
            label: '买入',
            key: 'buy',
            icon: <PlusCircleOutlined />
          },
          {
            label: '卖出',
            key: 'sell',
            icon: <MinusCircleOutlined />
          },
          {
            label: '撤单',
            key: 'cancle',
            icon: <CloseCircleOutlined />
          },
          {
            label: '银证转账',
            key: 'trans',
            icon: <TransactionOutlined />
          }
        ],
      }
    ];
    return (
      <div>
        <Layout style={{ overflow: 'hidden', position: 'relative' }}>
          <Header style={{ padding: 0, paddingLeft: 4, height: 36, lineHeight: '30px', borderBottom: '1px solid #95B8E7', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
            <span style={{ fontSize: '22px', lineHeight: '28px', color: '#00205b', textShadow: '2px 2px 2px #ccc', fontWeight: 'bold' }}>交易记录</span>
            {/* <div style={{display:'inline-block',marginLeft:'20px',marginRight:'20px'}}>
            <Button>买入</Button>
            <Button>卖出</Button>
            <Button>撤单</Button>
            </div>
            
            <Input.Search status="warning" addonBefore={<div style={{width:'100px',fontWeight:'bold'}}>添加文本筛选</div>} style={{width:500,marginTop:'1.5px',float:'right'}} onSearch={(e)=>{this.handleSearchFilter(e)}} ref={r=>this.filtertext=r}></Input.Search>
            <div style={{float:'right',marginRight:'5px',marginTop:'1.5px'}}>
              <b style={{marginRight:'10px'}}>添加日期筛选</b><RangePicker></RangePicker>
            </div> */}
            <Menu style={{ float: 'right', width: '405px', backgroundColor: '#fff', borderLeft: '1px solid black', marginTop: '-0.5px' }}
              mode="horizontal" items={items} theme={'light'} onClick={this.handleMenu}></Menu>

            <Modal open={this.state.FilterModal} title="筛选"
              cancelText='取消' okText='确认' onCancel={() => this.setState({ FilterModal: false })}
              onOk={this.handleOK}
            >

              <div style={{ marginBottom: 30, marginTop: 30 }}>
                <b style={{ marginRight: '10px' }}>添加文本筛选:</b>
                <Input style={{ width: 300 }} onChange={(e) => this.setState({ textcur: e.target.value })}></Input>
              </div>
              <div style={{ marginBottom: 30 }}>
                <b style={{ marginRight: '10px' }}>添加日期筛选:</b>
                <RangePicker style={{ width: 300 }} onChange={(e) => this.setState({ datecur: e })}></RangePicker>
              </div>


            </Modal>

            <Trading ref={r => this.trading = r} afterClose={() => { this.loadData() }} user={this.props.user} />

          </Header>
          <Content style={{ overflow: 'hidden', position: 'relative', height: '615px' }}>

            <Table dataSource={this.state.data} rowKey={this.state.keyfield} ref={r => this.Table1 = r}
              columns={columns} pagination={false} style={{ overflow: 'auto', position: 'absolute', height: 616 }}
              sticky scroll={{ x: '90%' }}
              rowSelection={{
                type: 'radio',
                selectedRowKeys: this.state.selectedkeys,
                onChange: (selectedRowKeys, selectedRows) => { this.selectionChange(selectedRowKeys, selectedRows) }
              }}
              onRow={(record) => {
                return {
                  onClick: () => { this.handleSelectRow(record) }, // 点击行
                  onDoubleClick: () => { this.handleSelectRow(record) },
                  onContextMenu: () => { }
                };
              }}
            ></Table>
          </Content>
          <Footer
            style={{ padding: '5px 16px 0px 16px', lineHeight: '36px', border: '1px solid #95B8E7', borderLeft: '0px', background: '#efefef' }}
          >
            <Pagination total={this.state.total} style={{ textAlign: 'center', fontSize: 'small', marginBottom: '5px', marginTop: '-2px' }}
              showSizeChanger showQuickJumper className='paginationStyle'
              current={this.state.pageno} defaultPageSize={this.state.pagesize}
              pageSize={this.state.pagesize} pageSizeOptions={['10', '20', '50', '100']}
              showTotal={(total, range) => this.showTotal(total, range)}
              onShowSizeChange={this.handleSizeChange.bind(this)}
              onChange={this.handlePageChange.bind(this)}
            />
          </Footer>
        </Layout>
      </div>
    )
  }
}
