import ReactEcharts from 'echarts-for-react';
import React, { Component } from 'react'

export default class MyBarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
          
        }
    }
    render() {
        const labelRight = {
            position: 'left'
          };
        var option = {
            title: {
              text: this.props.title
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            grid: {
              top: 80,
              bottom: 30
            },
            xAxis: {
              type: 'value',
              position: 'top',
              splitLine: {
                lineStyle: {
                  type: 'dashed'
                }
              }
            },
            yAxis: {
              type: 'category',
              axisLine: { show: false },
              axisLabel: { show: false },
              axisTick: { show: false },
              splitLine: { show: false },
              data: this.props.ydata
            },
            series: [
              {
                name: 'Cost',
                type: 'bar',
                stack: 'Total',
                label: {
                  show: true,
                  formatter: '{b}'
                },
                data: this.props.data
              }
            ]
          };
        return (
            <div>
                <ReactEcharts option={option} style={{width:'500px'}}></ReactEcharts>
            </div>
        )
    }
}
