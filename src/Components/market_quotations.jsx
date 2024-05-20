import React, { Component } from 'react'
import { reqdoSQL } from '../api/functions'
import ReactEcharts from 'echarts-for-react';
import { Menu } from 'antd';

export default class Market_quotations extends Component {
  constructor(props){
    super(props);
    this.state={
      option:{}
    }
  }
  async componentDidMount(){
    this.renderoption('sh');
  }
  async renderoption(_index){
    let p={};
    p._index=_index
    p.sqlprocedure='getmainindex'
    let rs=await reqdoSQL(p);
    let indexdata=rs.rows.map((item)=>{
      let arr=[];
      arr.push(item.date)
      arr.push(parseFloat(item.volume))
      arr.push(parseFloat(item.open))
      arr.push(parseFloat(item.close))
      arr.push(parseFloat(item.lowest))
      arr.push(parseFloat(item.highest))
      return arr;
    })
  let option={};
  const upColor = '#ec0000';
  const upBorderColor = '#8A0000';
  const downColor = '#00da3c';
  const downBorderColor = '#008F28';
  // Each item: open，close，lowest，highest
  let data0=splitData(indexdata);
  
  function splitData(rawData) {
    const categoryData = [];
    const values = [];
    const volumes=[]
    for (var i = 0; i < rawData.length; i++) {
      categoryData.push(rawData[i].splice(0, 1)[0]);
      volumes.push(rawData[i].splice(0, 1)[0]);
      values.push(rawData[i]);

    }
    return {
      categoryData: categoryData,
      values: values,
      volumes:volumes
    };
  }
  function calculateMA(dayCount) {
    var result = [];
    for (var i = 0, len = data0.values.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-');
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data0.values[i - j][1];
      }
      result.push(+(sum / dayCount).toFixed(2));
    }
    return result;
  }
  option = {
    title: {
      // text: '上证指数',
      left: 0
    },
    tooltip: {
      trigger: 'axis',
      triggerOn: 'mousemove|click',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['日K', 'MA5', 'MA10', 'MA20', 'MA60']
    },
    grid: {
      left: '5%'
    },
    xAxis: {
      type: 'category',
      data: data0.categoryData,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: '日K',
        type: 'candlestick',
        data: data0.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upBorderColor,
          borderColor0: downBorderColor
        },
        markPoint: {
          label: {
            formatter: function (param) {
              return param != null ? Math.round(param.value) + '' : '';
            }
          },
          data: [
            {
              name: 'Mark',
              value: 2300,
              itemStyle: {
                color: 'rgb(41,60,85)'
              }
            },
            {
              name: 'highest value',
              type: 'max',
              valueDim: 'highest'
            },
            {
              name: 'lowest value',
              type: 'min',
              valueDim: 'lowest'
            },
            {
              name: 'average value on close',
              type: 'average',
              valueDim: 'close'
            }
          ],
          tooltip: {
            formatter: function (param) {
              return param.name + '<br>' + (param.data.coord || '');
            }
          }
        },
        markLine: {
          symbol: ['none', 'none'],
          data: [
            [
              {
                name: 'from lowest to highest',
                type: 'min',
                valueDim: 'lowest',
                symbol: 'circle',
                symbolSize: 10,
                label: {
                  show: false
                },
                emphasis: {
                  label: {
                    show: false
                  }
                }
              },
              {
                type: 'max',
                valueDim: 'highest',
                symbol: 'circle',
                symbolSize: 10,
                label: {
                  show: false
                },
                emphasis: {
                  label: {
                    show: false
                  }
                }
              }
            ],
            {
              name: 'min line on close',
              type: 'min',
              valueDim: 'close'
            },
            {
              name: 'max line on close',
              type: 'max',
              valueDim: 'close'
            }
          ]
        }
      },
      {
        name: 'MA5',
        type: 'line',
        symbol: 'none',
        data: calculateMA(5),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA10',
        type: 'line',
        symbol: 'none',
        data: calculateMA(10),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA20',
        type: 'line',
        symbol: 'none',
        data: calculateMA(20),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA60',
        type: 'line',
        symbol: 'none',
        data: calculateMA(60),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      }
    ]
  };
  this.setState({option});
  }
  handleMenu=(e)=>{
    this.renderoption(e.key)
  }
  render() {
    const items = [
      {
        label: '上证指数',
        key: 'sh',
      },
      {
        label: '深证成指',
        key: 'sz',
      },
      {
        label: '恒生指数',
        key: 'hk',
      },
      {
        label: '纳斯达克指数',
        key: 'nsdq',
      }
    ];
    return (
      <div>
        <Menu defaultSelectedKeys={['sh']}  onSelect={this.handleMenu.bind(this)} mode="horizontal"  items={items}></Menu>
        <ReactEcharts option={this.state.option} style={{width:1250,height:600}}></ReactEcharts>
      </div>
    )
  }
}
