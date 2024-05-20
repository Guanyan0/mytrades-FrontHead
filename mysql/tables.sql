#drop database if exists mytrades;
#create database mytrades;

#
/*

导入stocks,etfs,category_stock_data

*/
set sql_safe_updates=0;
use mytrades;
#stock表
#alter table stocks add constraint PK_stocks PRIMARY KEY (stockid ASC);
alter table stocks add column subcategoryid char(20) default ' ';
update stocks a set subcategoryid=(select L3id from category_stock_data b where a.stockid=b.stockid);
update stocks a set subcategoryid='NotFound' where stockid not in(select stockid from category_stock_data);
#desc stocks;

#categorytree
drop table if exists categorytree;
create table categorytree
select distinct l1id as CategoryID,l1name as CategoryName,'' as ParentNodeID,1 as IsParentFlag,1 as Level,' ' as ancestor from mytrades.category_stock_data
union all 
select distinct l2id,l2name,l1id,1,2,concat(l1id,'#') from mytrades.category_stock_data
union all
select distinct l3id,l3name,l2id,0,3,concat(l1id,'#',l2id,'#') from mytrades.category_stock_data
union all
select 'NotFound','暂无','',0,3,'N#'
order by trim(concat(ancestor,categoryid));


#用户表
drop table if exists users;
create table users(
	userid varchar(255) primary key,
    username varchar(255) default '',
    password char(50),
    phone char(16),
    email char(50) default '',
    total_assets decimal(15,2) default 0
);
#insert into mytrades.users values('wyn','毌炎','123456','18368883881','wngyining2012@163.com','20000');

#自选股
drop table if exists userselected;
create table userselected(
	userid varchar(255),
    selectedid char(20),
    selectname varchar(255),
    selectedtype char(20),
    current_price char(20),
    RFpercent decimal(12,2),
    volume_ratio decimal(12,2),
    CONSTRAINT PKuserselected PRIMARY KEY CLUSTERED (userid,selectedid)
);
/*
insert into mytrades.userselected 
with t as(
	select stockid,stockname,'stock',current_price,RFpercent,volume_ratio from mytrades.stocks where stockid=5
)
select 'wyn',t.* from t;
*/

drop table if exists transactions;
create table transactions(
	userid varchar(255),
    transactionid char(20),
    transname varchar(255),
    transtime datetime,
    transprice char(30),
    transqty int,
    transtype char(10),
    porttype char(20),
    triggerCase varchar(255) default '',
    CONSTRAINT PKtransactions PRIMARY KEY CLUSTERED (userid,transactionid,transtime)
);
insert into transactions values('wyn','SH513050','中概互联网ETF','2022-07-22 14:20:00',1.112,800,'买入','etf','');
insert into transactions values('wyn','SH513050','中概互联网ETF','2022-07-25 14:59:00',1.092,100,'买入','etf','');
insert into transactions values('wyn','SH513050','中概互联网ETF','2022-07-29 09:48:00',1.073,100,'买入','etf','');
insert into transactions values('wyn','SH513050','中概互联网ETF','2022-08-02 09:40:00',1.003,100,'买入','etf','');
insert into transactions values('wyn','SH513050','中概互联网ETF','2022-08-02 13:54:00',1.011,-100,'卖出','etf','');
insert into transactions values('wyn','SH513050','中概互联网ETF','2022-08-04 09:30:00',1.037,-100,'卖出','etf','');
insert into transactions values('wyn','002897','意华股份','2022-12-20 14:47:00',50.21,100,'买入','stock','');
insert into transactions values('wyn','002897','意华股份','2022-12-27 14:03:00',53.88,-100,'卖出','stock','');

drop table if exists portfolio;
create table portfolio(
	userid varchar(255),
    portfolioid char(20) primary key,
    portname varchar(255),
    portvalue decimal(12,2),
    portqty int,
    port_per_cost char(30),
    profit_loss decimal(12,2)
);



