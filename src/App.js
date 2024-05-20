//0.导入路由组件
import { HashRouter, Route, Routes, Link, Navigate } from 'react-router-dom';
import React from 'react';

import ETFs from './Components/ETFs'
import Market_quotations from './Components/market_quotations';
import Stocks from './Components/stocks'
import Selected from './Components/selected';
import Login from './Components/module/login';
import Portfolio from './Components/portfolio'
import Register from './Components/module/register';
import Transactions from './Components/transactions';
import Test from './Components/test/test';

import { Button, Layout } from 'antd';
import './App.css'
const layoutStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute',
  padding: 0,
  margin: 0,
  overflow: 'hidden'
};

const { Header, Content, Footer, Sider } = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userRowRender: <div></div>,
      user: '',
      username: ''
    }
  }

  async componentDidMount() {

  }
  renderRoutes = async () => {
    // this.stocks?.setState({user:this.Login.state.user});
    setTimeout(() => {
      this.etfs?.loadData();
      this.stocks?.loadData();
      this.selected?.loadData();
      this.transactions?.loadData();
      this.portfolio?.loadData();
    });

  }
  renderUser = async () => {
    this.Login.setState({ msgflag: 0, msg: '' })
    this.renderRoutes()
    this.setState({ user: this.Login.state.user, username: this.Login.state.username })
    this.setState({
      userRowRender:
        <div style={{ float: 'right', fontSize: '20px' }}>
          {this.Login.state.username ? '用户:' + this.Login.state.username : '请登录'}
          <Button type='link' onClick={() => { this.Login.setState({ myWin1: true }) }}>{this.Login.state.user ? '切换账号' : '登录'}</Button>
          <Button type='link' onClick={() => { this.Register.setState({ myWin1: true }) }} style={{ marginLeft: '-20px' }}>注册账号</Button>
        </div>
    })
  }

  render() {
    return (
      <Layout style={layoutStyle} >
        <Header style={{ lineHeight: '56px', borderBottom: '1px solid #95B8E7', background: '#00205b', color: '#fff', fontSize: '30px', height: 60 }}>
          {/* 二级市场场内交易 */}
          二级市场交易系统
          {this.state.userRowRender}
        </Header>
        <Layout>
          <Sider theme='light' width={260} collapsible={false} zeroWidthTriggerStyle collapsedWidth={40} style={{ marginLeft: 0, padding: 0, borderRight: '1px solid #95B8E7' }}>
            <div style={{ borderBottom: '1px solid #95B8E7', textAlign: 'center', height: '40px', backgroundColor: '#00205b', lineHeight: '40px' }}>
              <div className='labelStyle' style={{ float: 'left', fontSize: '20px', color: '#fff', marginLeft: 20 }}>菜单</div>
            </div>
            <Link to="/Market_quotations">大盘行情</Link>
            <Link to="/Stocks">股票列表</Link>
            <Link to="/ETFs" >ETF列表</Link>
            <Link to="/Selected">自选股</Link>
            <Link to="/Transactions">我的交易</Link>
            <Link to="/Portfolio">我的持仓</Link>
            <Link to="/Test">Test</Link>
          </Sider>
          <Content style={{ marginLeft: 3, borderLeft: '1px solid #95B8E7', overflow: 'auto' }}>
            <Routes>
              <Route path='/' element={<Market_quotations />}></Route>
              <Route path='/Market_quotations' element={<Market_quotations />}></Route>
              <Route path='/Stocks' element={<Stocks ref={r => this.stocks = r} user={this.state.user} />}></Route>
              <Route path='/ETFs' element={<ETFs ref={r => this.etfs = r} user={this.state.user} />}></Route>
              <Route path='/Selected' element={<Selected ref={r => this.selected = r} user={this.state.user} />}></Route>
              <Route path='/Transactions' element={<Transactions ref={r => this.transactions = r} user={this.state.user} />}></Route>
              <Route path='/Portfolio' element={<Portfolio ref={r => this.portfolio = r} user={this.state.user} />}></Route>
              <Route path='/Test' element={<Test ref={r => this.portfolio = r} user={this.state.user} />}></Route>
            </Routes>
            <Login ref={r => this.Login = r} afterClose={() => this.renderUser()} />
            <Register ref={r => this.Register = r} ></Register>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
export default App; //2.将组件包装成可编程式跳转的路由组件