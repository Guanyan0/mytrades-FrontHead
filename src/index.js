import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import 'rc-easyui/dist/themes/default/easyui.css';
//import 'rc-easyui/dist/themes/material-teal/easyui.css';
import 'rc-easyui/dist/themes/icon.css';
import 'rc-easyui/dist/themes/react.css';
import { LocaleProvider } from 'rc-easyui';
import zh_CN from 'rc-easyui/dist/locale/easyui-lang-zh_CN';
import './index.css';
import App from './App';
ReactDom.render(
    <BrowserRouter>
        <LocaleProvider locale={zh_CN}>
            <App />
        </LocaleProvider>
    </BrowserRouter>
, document.getElementById('root'))