use mysales;

drop procedure if exists test;
delimiter $$
create procedure test($now varchar(255))
begin
	select now(),$now;
end $$
delimiter ;
#'2023-02-02 17:06:11'
call test('');

drop procedure if exists login;
delimiter $$
create procedure login(
	$user varchar(255),
    $password varchar(255)
)
begin
	if(not exists (select 1 from mytrades.users where userid=$user)) then
		select '用户不存在' as msg;
    elseif($password<>(select password from mytrades.users where userid=$user)) then
		select '用户名或密码错误' as msg;
	else
		select *,'1' msg from mytrades.users where userid=$user;
    end if;
end $$
delimiter ;
#call login('wyn','123456')

drop procedure if exists register;
delimiter $$
create procedure register(
	$user varchar(255),
    $username varchar(255),
    $password varchar(255),
    $phone char(16),
    $email char(50)
)
begin
	if exists (select 1 from mytrades.users where userid=$user)then
		select '用户名重复' as msg;
	else
        insert into mytrades.users(userid,username,password,phone,email) values($user,$username,$password,$phone,$email);
		select *,1 as msg from mytrades.users where userid=$user;
	end if;
end $$
delimiter ;
#call register('guanyan','guanyan','123456','110','');

drop procedure if exists getmainindex;
delimiter $$
create procedure getmainindex($_index varchar(10))
begin
	SELECT * FROM mytrades.mainindex where _index=$_index
    order by date;
end $$
delimiter ;
#call getmainindex('sz');

drop procedure if exists getstocks;
delimiter $$
create procedure getstocks(
	$pageno int,
    $pagesize int,
    $user varchar(255),
    $filter varchar(255)  
)
begin
	set @sql=concat("select rowno, stockid, stockname, current_price, RFpercent,turnover_rate, volume_ratio, PE_ratio,categoryname,
    if(stockid in(select selectedid from mytrades.userselected where userid='",$user,"'),1,0) as _operation from mytrades.stocks a
    join mytrades.categorytree b on a.subcategoryid=b.categoryid
    order by stockid;
    ");
	#select @sql;
    call sys_gridPaging(@sql, $pageno, $pagesize,'stockid','','stockid;stockname;current_price;RFpercent;volume_ratio;PE_ratio;categoryname', $filter);

end $$
delimiter ;
#call getstocks(1,20,'guanyan','中');
/*
select rowno, stockid, stockname, current_price, RFpercent,turnover_rate, volume_ratio, PE_ratio,
if(stockid in(select selectedid from mytrades.userselected where userid='guanyan'),1,0) as _operation from mytrades.stocks
where if(stockid in(select selectedid from mytrades.userselected where userid='wyn'),1,0)=1;
*/


drop procedure if exists gettreedata;
delimiter $$
create procedure gettreedata()
begin
	select *,categoryid as id,concat(categoryid,categoryname) as text from mytrades.categorytree;
end $$
delimiter ;
#'2023-02-02 17:06:11'
call gettreedata();

drop procedure if exists gettreedata2;
delimiter $$
create procedure gettreedata2(
	$parentnodeid char(255)
)
begin
	select *,categoryid as id,concat(categoryid,categoryname) as text from mytrades.categorytree where parentnodeid=$parentnodeid;
end $$
delimiter ;
#'2023-02-02 17:06:11'
call gettreedata2('');

drop procedure if exists gettreeselect;
delimiter $$
create procedure gettreeselect(
	$cid char(10),
	$pageno int,
    $pagesize int,
    $user varchar(255),
    $filter varchar(255)  
)
begin
	set @sql=concat("select rowno, stockid, stockname, current_price, RFpercent,turnover_rate, volume_ratio, PE_ratio,categoryname,
    if(stockid in(select selectedid from mytrades.userselected where userid='",$user,"'),1,0) as _operation from mytrades.stocks a
    join mytrades.categorytree b on a.subcategoryid=b.categoryid
    where subcategoryid in(select categoryid from mytrades.categorytree where concat(categoryid,ancestor) like concat('%','",$cid,"','%'))
    order by stockid;");
    call sys_gridPaging(@sql, $pageno, $pagesize,'stockid','','stockid;stockname;current_price;RFpercent;volume_ratio;PE_ratio;categoryname', $filter);

end $$
delimiter ;
#'2023-02-02 17:06:11'
call gettreeselect('c01',1,20,'guanyan','');

#加入/删除自选股
drop procedure if exists addordeleteselect;
delimiter $$
create procedure addordeleteselect(
	$opt int,
	$user varchar(255),
    $selectedid char(50)
)
begin
	set sql_safe_updates=0;
    if $opt=0 then #0为add,1为delete
		if exists (select 1 from mytrades.stocks where $selectedid=stockid) then
			insert into mytrades.userselected
			select $user,$selectedid,stockname,'stock',current_price,RFpercent,volume_ratio from mytrades.stocks where stockid=$selectedid;
			select '添加成功' as msg1;
		elseif exists (select 1 from mytrades.etfs where $selectedid=etfid) then
			insert into mytrades.userselected
			select $user,$selectedid,etfname,'etf',current_price,RFpercent,volume_ratio from mytrades.etfs where etfid=$selectedid;
			select '添加成功' as msg1;
		end if;
	elseif $opt=1 then
		if exists (select 1 from mytrades.userselected where $selectedid=selectedid) then
			delete from mytrades.userselected where userid=$user and selectedid=$selectedid;
			select '删除成功' as msg1;
		end if;
    end if;
end $$
delimiter ;
#call addordeleteselect(0,'wyn','000002');
#call addordeleteselect(1,'wyn','000002');
#call addordeleteselect(0,'wyn','SH512100');

drop procedure if exists getetfs;
delimiter $$
create procedure getetfs(
	$pageno int,
    $pagesize int,
    $user varchar(255),
    $filter varchar(255)  
)
begin
	set @sql=concat("select rowno, etfid, etfname, current_price, RFpercent,turnover_rate, volume_ratio,
    if(etfid in(select selectedid from mytrades.userselected where userid='",$user,"'),1,0) as _operation from mytrades.etfs
    ");
	#select @sql;
    call sys_gridPaging(@sql, $pageno, $pagesize,'etfid','','etfid;etfname;current_price;RFpercent;volume_ratio', $filter);

end $$
delimiter ;
#call getetfs(1,20,'wyn','');

drop procedure if exists getselected;
delimiter $$
create procedure getselected(
	$pageno int,
    $pagesize int,
    $user varchar(255),
    $filter varchar(255)  
)
begin
	set @sql=concat("select selectedid, selectname, current_price, RFpercent, volume_ratio,
    if(selectedid in(select selectedid from mytrades.userselected where userid='",$user,"'),1,0) as _operation from mytrades.userselected
    where userid='",$user,"'
    ");
	#select @sql;
    call sys_gridPaging(@sql, $pageno, $pagesize,'selectedid','','selectedid;selectname;current_price;RFpercent;volume_ratio', $filter);
end $$
delimiter ;
#call getselected(1,20,'wyn','');

drop procedure if exists gettransactions;
delimiter $$
create procedure gettransactions(
	$pageno int,
    $pagesize int,
    $user varchar(255),
    $filter varchar(255),
    $start char(50),
    $end char(50)
)
begin
	if($start='' or $end='')then
	set @sql=concat("select *,round(transprice*transqty,2) as transamt,concat(userid,'_',transactionid,'_',transtime) as transkey from mytrades.transactions
    where userid='",$user,"'
    order by transtime
    ");
    else
    set @sql=concat("select *,round(transprice*transqty,2) as transamt,concat(userid,'_',transactionid,'_',transtime) as transkey from mytrades.transactions
    where userid='",$user,"' and transtime between '",$start,"' and '",$end,"'
    order by transtime
    ");
    
    end if;
	#select @sql;
    call sys_gridPaging(@sql, $pageno, $pagesize,'selectedid','','transactionid;transname;transtime;transprice;transqty;transtype;porttype', $filter);
end $$
delimiter ;
#call gettransactions(1,20,'wyn','','2022-7-1','2022-7-30');
#call gettransactions(1,20,'wyn','','','');

drop procedure if exists gettrading;
delimiter $$
create procedure gettrading($id varchar(255))
begin
	if exists (select 1 from mytrades.stocks where $id=stockid) then
		select stockname as name,current_price,RFpercent,2 as point,ifnull((select portqty from mytrades.portfolio where portfolioid=$id),0) as available from mytrades.stocks where $id=stockid;
	elseif exists (select 1 from mytrades.etfs where $id=etfid) then
		select etfname as name,current_price,RFpercent,3 as point,ifnull((select portqty from mytrades.portfolio where portfolioid=$id),0) as available from mytrades.etfs where $id=etfid;
	end if;
end $$
delimiter ;
call gettrading('000001');
call gettrading('SH513050');

drop procedure if exists updatePortfolio;
delimiter $$
create procedure updatePortfolio()
begin
	truncate table mytrades.portfolio;
    insert into mytrades.portfolio
	with t as(
		select stockid id,current_price,'stock' as type from mytrades.stocks
        union all
        select etfid,current_price,'etf' from mytrades.etfs
    )
	select userid,transactionid portfolioid,transname portname,sum(transqty)*current_price portvalue,sum(transqty) portqty,round(sum(transprice*transqty)/sum(transqty),if(type='stock',2,3)) port_per_cost,
    round(sum(transqty)*current_price-sum(transprice*transqty),if(type='stock',2,3)) as profit_loss from mytrades.transactions a
    join t on a.transactionid=t.id
    where triggercase=''
    group by userid,transactionid;
end $$
delimiter ;
call updatePortfolio();
select * from mytrades.portfolio;

drop procedure if exists addTransactions;
delimiter $$
create procedure addTransactions(
	$userid varchar(255),
    $transactionid char(20),
    $transprice char(30),
    $transqty int,
    $transtype char(10),
    $triggercase varchar(255)
    #,$porttype char(20)
)
begin
	set @now=now();
	insert into mytrades.transactions(userid,transactionid,transname,transtime,transprice,transqty,transtype,porttype,triggerCase)    
    with t as(
    select stockid id,stockname name,'stock' as type from mytrades.stocks
    union all
    select etfid,etfname,'etf' from mytrades.etfs
    )
    select $userid,$transactionid,(select name from t where id=$transactionid),@now,$transprice,if($transtype='buy',$transqty,-$transqty),
    if($transtype='buy',if($triggerCase<>'','条件单买入','买入'),if($transtype='sell',if($triggerCase<>'','条件单卖出','卖出'),'')),(select type from t where id=$transactionid),if($triggerCase<>'',$triggerCase,'');
	call updatePortfolio();
    select '交易成功' as msg from mytrades.transactions where transtime=@now;
end $$
delimiter ;
#call addTransactions('wyn','SH513050','1.092',200,'buy','233');
#call addTransactions('wyn','SH513050','1.092',200,'sell','233');

drop procedure if exists getstatics;
delimiter $$
create procedure getstatics($userid varchar(255))
begin
	with t as(
    select stockid id,current_price,RFpercent from mytrades.stocks
    union all
    select etfid,current_price,RFpercent from mytrades.etfs
    )
	select (select total_assets from mytrades.users where userid=$userid) as total_assets,sum(portvalue) as total_value,
    round(sum(portqty*(current_price-port_per_cost)),2) as floatingPL,(select total_assets from mytrades.users where userid=$userid)-sum(portvalue) as available,
    round(sum(portqty*current_price/(1+RFpercent*0.01)*RFpercent*0.01),2) as todayPL from mytrades.portfolio a join t on a.portfolioid=t.id;
end $$
delimiter ;
#call getstatics('wyn');

drop procedure if exists getchartdata;
delimiter $$
create procedure getchartdata($userid varchar(255),$opt int)
begin
	if($opt=1)then
		with t as(
		select stockid id,stockname name,'股票' as type from mytrades.stocks
		union all
		select etfid,etfname,'etf基金' from mytrades.etfs
		)
		select type name,sum(portvalue) as value from mytrades.portfolio a
		join t on a.portfolioid=t.id
        where userid=$userid
		group by type;
    elseif($opt=2)then
		select l1name name,sum(portvalue) value from mytrades.portfolio a
        join mytrades.category_stock_data b on a.portfolioid=b.stockid
        where userid=$userid
        group by l1name;
	elseif($opt=3)then
		select l1name name,round(sum(portqty*(current_price-port_per_cost)),2) value from mytrades.portfolio a
        join mytrades.category_stock_data b on a.portfolioid=b.stockid
        join mytrades.stocks c on a.portfolioid=c.stockid
        where userid=$userid
        group by l1name;
    end if;
end $$
delimiter ;
call getchartdata('wyn',3);

drop procedure if exists getportfolio;
delimiter $$
create procedure getportfolio(
	$pageno int,
    $pagesize int,
    $user varchar(255),
    $filter varchar(255)  
)
begin
	set @sql=concat("
    with t as(
    select stockid id,current_price,RFpercent from mytrades.stocks
    union all
    select etfid,current_price,round(RFpercent*100,2) from mytrades.etfs
    )
    select portfolioid, portname, portvalue,
    concat(profit_loss,' (',round(profit_loss/port_per_cost/portqty*100,2),'%)') totalPL ,
    portqty, port_per_cost,current_price,concat(round(portqty*current_price/(1+RFpercent*0.01)*RFpercent*0.01,2),'   (',RFpercent,'%)') as todayPL
     from mytrades.portfolio a
    join t on a.portfolioid=t.id
    where userid='",$user,"'
    order by portvalue desc
    ");
	#select @sql;
    call sys_gridPaging(@sql, $pageno, $pagesize,'selectedid','','portfolioid;portname;portvalue;portqty;port_per_cost;profit_loss', $filter);
end $$
delimiter ;
#call getportfolio(1,20,'wyn','');


