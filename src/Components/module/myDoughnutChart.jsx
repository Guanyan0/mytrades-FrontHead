import ReactEcharts from 'echarts-for-react';
import React, { Component } from 'react'

export default class MyDoughnutChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
          
        }
    }
    render() {
        var option = {
            title:{
                text:this.props.title
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: '分布',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: this.props.data
                }
            ]
        };
        return (
            <div>
                <ReactEcharts option={option} style={{width:'500px',marginLeft:'15px'}}></ReactEcharts>
            </div>
        )
    }
}
