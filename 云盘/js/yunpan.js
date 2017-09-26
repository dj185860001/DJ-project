(function(){ 
	//让下面内容部分自适应宽高
	var section = $('#section');
	var head = $('#head');
	function resize(){
		var clientH = document.documentElement.clientHeight;
		section.style.height = clientH - head.offsetHeight+'px';
	}
	window.onresize = resize;
	resize();


	function on(element,evName,fn){
		element.addEventListener(evName,fn);	
	}
	function off(element,evName,fn){
		element.removeEventListener(evName,fn);		
	}



	//--------------操作数据的方法--------------------------
	//根据指定id找到指定id的所有的子级
	function getChildsById(id){
		var arr = [];
		for(var attr in data){//循环数组每一项
			 if( data[attr] != null && data[attr].pid == id ){//先判断对象的每一项是不是不为null、如果data[attr].pid == id，就是说data[attr]是data[b]的子元素
				arr.push(data[attr]);
			}
		}
		return arr;
	}
 
 	// 通过id找数据
	function getDataById(id){
		var item = data[id];
		if(item){
			return item
		}
		return null;
	}

	//找到每个元素的子孙节点的id
	function ChildsById(id){
		var arr = [];
		for(var attr in data){//循环数组每一项
			 if(data[attr].pid == id ){ 
				arr.push(data[attr].id + '');
				arr = arr.concat(ChildsById(data[attr].id))//连接子孙元素的id
			}
		}
		return arr;
	}






	//---------------------先渲染菜单区域--------------------
	// 先渲染第一级 先找数据
	 var leval = -1;
	 var initId = -1;  // 最顶层的父级id
	 // 通过父级id找子级数据 pid
	// 循环数据，那些数据的pid为 指定的id，就是指定id的子数据
	var tree = $('.tree-menu')[0];
	//渲染结构
	function createTreeHtml(id,leval){
		var arr = getChildsById(id);// 找到传过来参数id下所有的子级
		leval++;
		var treeHtml = '';
		if(arr.length){//如果存在子级
			treeHtml += '<ul>';
			arr.forEach(function (item){
				// 如果没有下一级，createTreeHtml返回的结构为空
				var html = createTreeHtml(item.id,leval);
				treeHtml += `<li>
						<div data-id="${item.id}" style="padding-left: ${leval*15}px;" class="tree-title ${html !== '' ? 'tree-ico' : '' } close">
							<span><i></i>${item.title}</span>
						</div>
						`
				// createTreeHtml返回的是下一级的结构
				treeHtml += html
				treeHtml += `</li>`	
			});
			treeHtml += '</ul>';
		}
		return treeHtml;
	}
	//生成左边树形结构
	tree.innerHTML = createTreeHtml(initId,leval);


	// -----------------------定位到指定的元素------------------------------
	function positionElement(positionId){
		var treeDivs = $('div',tree);
		//给指定div添加样式
		for(var i = 0; i < treeDivs.length; i++){
			treeDivs[i].classList.remove('active');//清空其他的背景颜色
			if(treeDivs[i].dataset.id == positionId){//如果是指定的id对应的div给他添加样式
				treeDivs[i].classList.add("active");
			}
		}
	}

	positionElement(0);// 给指定id对应的元素添加class

	//--- ------------------生成右边文件区域-------------------------------
	var folders = $('.folders')[0];
	function createFileHtml(id){
		var childs = getChildsById(id);//找到对应的子级
		if(childs.length){//如果有子菜单，就渲染子菜单文件夹
			var fileHtml = childs.map(function (item){
				return `
					<div class="file-item" data-id="${item.id}">
						<img src="img/folder-b.png" alt="" />
						<span class="folder-name">${item.title}</span>
						<input type="text" class="editor"/>
						<i></i>
					</div>
				`
			}).join('');
		}else{//如果没有子菜单就显示为空
			fileHtml = renderNoFolder();
		}
		folders.dataset.id =  id;
		folders.innerHTML = fileHtml;//生成结构默认最外面一个
	}
	createFileHtml(0);


	//------------------渲染导航区域---------------------------

	// 找到指定id的父级的父级的父级的父级  找到最顶层的微云

	// 找到指定id的祖先数据，一直找到最顶层
	function getParentsById(id){
		var arr = [];
		for(var attr in data){
			if(data[attr] != null && data[attr].id == id){
				arr.push(data[attr]);
				// 传入父级的id，getParentsById返回是这个id的父级数据，
				// 使用concat把指定id的数据和父数据练级起来
				// 返回的是新数组，arr重新赋值这个新数组
				arr = arr.concat(getParentsById(data[attr].pid));
				break;
			}
		}
		return arr;
	}
	//生成导航的结构
	function createNavHtml(id){
		var parents = getParentsById(id).reverse();//取反
		var navHtml = '';
		for( var i = 0; i < parents.length-1; i++ ){
			navHtml += `<a href="javascript:;" data-id="${parents[i].id}">${parents[i].title}</a>`;
		}

		navHtml += `<span  data-id="${parents[i].id}">${parents[parents.length-1].title}</span>`;

		return navHtml;
	}


	var breadNav = $(".bread-nav")[0];

	breadNav.innerHTML = createNavHtml(0);

	//------------------给树形菜单每一个菜单绑定点击------------------------
	//点击每个treeDivs时候，渲染一下各个的结构
	var treeDivs = $('div',tree);
	function clickTreeDivs(){
		for( var i = 0; i < treeDivs.length; i++ ){
			treeDivs[i].onclick  =function (){
				var treeId = this.dataset.id;
				createFileHtml(treeId);//重新渲染右边文件夹
				addEventForFolde();//渲染一遍点击进入文件夹
				breadNav.innerHTML = createNavHtml(treeId);//重新渲染导航
				positionElement(treeId);//渲染定位父级，给他设置颜色
				navEvent();//给导航添加点击事件
				//console.log('123')
				//点击每个树形菜单时候，全选按钮未选中
				checkedAll.className = "";//清除全选样式样式
				checkedAll.isChecked = false;//状态改为假
				num = 0;
			};
		}
	}
	clickTreeDivs();

	// //---------------------------为右边下面文件夹添加点击事件，让他进去下一级---------------------------
	var folders = $('.folders')[0];
	var file_item = $('.file-item',folders);//文件夹
	var iS = $('i',folders)//单选按钮
	var num = 0;
	function addEventForFolde(){
		//如果下面没有子集
		if( !file_item.length ){
			return;
		}

		for(var i = 0; i < file_item.length; i++){//循环右边的文件夹

			//-----------------添加点击单选功能---------------

			file_item[i].index = i;
			iS[i].index = i;
			iS[i].isChecked = false;//未选中状态
			iS[i].onclick = function(ev){

				if(this.isChecked){//如果当前按钮选中了,去除所有的样式
					//console.log(this.isChecked)
					num--;
					this.className = "";
				    this.isChecked = false;
				    file_item[this.index].classList.remove('hov');
				}else{
					//console.log(this.isChecked)
					num++;
					this.className = "checked";
				    this.isChecked = true;
				    file_item[this.index].classList.toggle("hov")//给文件夹添加背景
				}
				if(file_item.length == num){//如果数组长度跟num一样就全选
					checkedAll.className = "checked";
					checkedAll.isChecked = true;
				}else{
					checkedAll.className = "";
					checkedAll.isChecked = false;
				}
				ev.stopPropagation();
			};

			//--------为右边文件夹添加点击事件----------------------------
			file_item[i].onclick = function(ev){
				if(ev.target.nodeName == "INPUT"){
					ev.stopPropagation();
					return;
				}
				//console.log(this.dataset.id)
				//点击进入下一级的时候清空全选
				checkedAll.className = "";//清除全选样式样式
				checkedAll.isChecked = false;//状态改为假
				num = 0;
				createFileHtml(this.dataset.id);//右边文件夹的结构
				positionElement(this.dataset.id)//让左边的菜单颜色变化
				breadNav.innerHTML = createNavHtml(this.dataset.id)//让上面导航也跟着变化
				navEvent();//给导航添加点击事件
				if(file_item.length!=0){//如果点击有文件夹
					 //createFileHtml(this.dataset.id);
					 addEventForFolde();

				}else{//否则等于空白的
					folders.innerHTML = renderNoFolder();
					 checkedAll.checked = false;
               		 checkedAll.className = "";
				}
			}
			file_item[i].onmousedown = function(ev){
				ev.stopPropagation();
				//ev.preventDefault();
			}
		}
	};
	addEventForFolde();

	// //-----------------如果里面没有文件---------------------------

	function renderNoFolder(){
		var noFile = `<div class="f-empty"></div>`;
		return noFile;
	}

	//-----------为导航添加点击事件-------------------------------
	function navEvent(){
		var aS = $('a',breadNav);
		for(var i = 0; i < aS.length; i++){
			aS[i].onclick = function(){
				//点击导航区域时候也清空全选
				checkedAll.className = "";//清除全选样式样式
				checkedAll.isChecked = false;//状态改为假
				num = 0;
				createNavHtml(this.dataset.id);//导航数据重新渲染
				breadNav.innerHTML = createNavHtml(this.dataset.id);
				navEvent();//给导航添加点击事件
				createFileHtml(this.dataset.id);//文件夹重新渲染
				addEventForFolde();//添加点击文件夹事件
				positionElement(this.dataset.id);//定位父级添加样式
			}
		}
	}
	
	// 获取那些选中的input

	function whoSelected(){
		var arr = [];
		for( var i = 0; i < iS.length; i++ ){
			if(iS[i].classList.contains("checked")){
				arr.push(iS[i])
			}
		}

		return arr;
	}



	//-----------点击全选-----------------
	var checkedAll = $('.checkedAll')[0];//全选按钮
	checkedAll.isChecked = false;//全选状态为假,未选中状态
	checkedAll.onclick = function(){
		for(var i = 0; i <file_item.length; i++){
			if(file_item.length !=0){
				if(checkedAll.isChecked){//如果全选选中了
					checkedAll.className = "";//清除全选样式样式
					checkedAll.isChecked = false;//状态改为假
					for(var i = 0;i < file_item.length; i++){
						iS[i].isChecked = false;
						iS[i].className = '';
						file_item[i].classList.remove("hov")
					};
					num = 0;
				}else{
					checkedAll.className = "checked";//给它加上样式
					checkedAll.isChecked = true;//状态改为真
					for(var i = 0;i < file_item.length; i++){
						file_item[i].classList.toggle("hov")
						iS[i].isChecked = true;
						iS[i].className = 'checked';

					};
					num = file_item.length;
				}
			}else{//如果下面没有文件夹，全选就不能选中
				 // checkedAll.isChecked = false;
				 return;
			}
		}
	}

//-----------------框选----------------------------
	on(folders,"mousedown", function (ev){
		//当鼠标按下的时候先清空所有选中的
		checkedAll.className = "";//清除全选样式样式
		checkedAll.isChecked = false;//状态改为假
		num = 0;
		if(!file_item.length){//如果右边下面没东西，就不能框选
			return;
		}
		for(var i = 0;i < file_item.length; i++){
			file_item[i].classList.remove('hov')
			iS[i].isChecked = false;
			iS[i].className = '';
		};
		//--------------框选功能--------------------------------------
		var newDivs = document.createElement("div");
		newDivs.className = "wrap_box";//生成一个div
		newDivs.isAppend = false; // 代表是没有append
		//document.body.appendChild(newDivs);
		var disX = ev.clientX ;
		var disY = ev.clientY ;

		on(document,"mousemove",moveFn);
		on(document,'mouseup', upFn)
		function moveFn(ev){
			// 在点击为中心的，移动了10个像素内，把框不放在body中
			//console.log(ev.clientX , disX , 10);
			// 当x轴或Y周大于10，并且状态是没有append的状态，要把newDiv添加在body。已经添加了不需要再添加。
			// 因为&&的优先要高于||
			if((Math.abs(ev.clientX - disX) > 10 || Math.abs(ev.clientY - disY) > 10) && !newDivs.isAppend ){
				// 已经append，不许多次append
				document.body.appendChild(newDivs);
				newDivs.isAppend = true;
			}


			//div的width = 鼠标移动的clientX - 鼠标摁下去的clientX
			newDivs.style.width = Math.abs(ev.clientX-disX)+'px';
			newDivs.style.height = Math.abs(ev.clientY-disY)+'px';
			//控制left值，鼠标移动过程的clientX 和鼠标摁下的clientX，哪一个小，就选哪一个
			newDivs.style.left = Math.min(ev.clientX,disX)+'px';
			newDivs.style.top = Math.min(ev.clientY,disY)+'px';
			//var fileArr = [];//一个空数组用来装被碰撞的元素
			for(var i = 0;i < file_item.length; i++){
				iS[i].isChecked = false;//设置未选中状态
				file_item[i].index = i;
				if(collision(newDivs,file_item[i])){
					iS[i].isChecked = true;//如果碰撞到了就给单选框添加样式
					iS[i].classList.add('checked');
					file_item[i].classList.add('hov');
				}else{//如果没有碰撞元素
					iS[i].isChecked = false;
					iS[i].classList.remove('checked');
					file_item[i].classList.remove('hov');
				};
			}
			 checkedAll.classList.remove("checked");
			ev.preventDefault();
			ev.stopPropagation();
		}
		function upFn(){
			off(document,"mousemove",moveFn);	
			off(document,"mouseup",upFn);
			if(newDivs.isAppend){
				document.body.removeChild(newDivs);
			}
			// 是否所有的i都有class为checked
			var iS = folders.getElementsByClassName("checked");
			//如果被选中的i的个数跟文件夹个数相等，即为全选
			if(iS.length === file_item.length && iS.length){
				checkedAll.classList.add("checked");
				num = iS.length;//全选
				checkedAll.isChecked = true;//状态改为假
			}else{
				checkedAll.classList.remove("checked");
			}
			//阻止冒泡
			ev.preventDefault();
			ev.stopPropagation();
		}

	})

	//封装的碰撞检测的函数
	function collision(obj1,obj2){
		var obj1Rect = obj1.getBoundingClientRect();	
		var obj2Rect = obj2.getBoundingClientRect();	

		if(obj1Rect.right < obj2Rect.left || obj1Rect.bottom < obj2Rect.top || obj1Rect.left > obj2Rect.right || obj1Rect.top > obj2Rect.bottom){
			return false;
		}else{
			return true;
		}

	};
	
	//封装提示信息的函数
	var time = null;
	var fullTipBox = $('.full-tip-box')[0];//console.log(fullTipBox);
	var tipText = $('.tip-text',fullTipBox)[0];
	  function fullTip(classNames,message){
	  	tipText.innerHTML = message;
	  	fullTipBox.classList.add(classNames)
		mTween(fullTipBox,{top:32},300,"linear",function (){
			time = setTimeout(function(){
			mTween(fullTipBox,{top:-32},300,"linear")
			},100)
		});
	  }
	//--------------新建文件夹------------------------
	var create = $('#create');
	on(create,"click",function (ev){//点击的时候新建文件夹
		create.isCreate = true; // 记录正在新建的状态
		var newFile_item = document.createElement("div");
		newFile_item.className = "file-item";//生成一个div
		//console.log(file_item.length)
		if(file_item.length != 0){//如果新建文件夹时候有其他文件夹
			newFile_item.innerHTML =`
									<img src="img/folder-b.png" alt="" />
									<span class="folder-name"></span>
									<input type="text" class="editor"/>
									<i></i>
							`
			folders.insertBefore(newFile_item,folders.firstElementChild);//往结构前面添加新建文件
		}else{//如果新建文件夹时候没有其他文件夹
			folders.innerHTML = '';
			newFile_item.innerHTML =`
									<img src="img/folder-b.png" alt="" />
									<span class="folder-name"></span>
									<input type="text" class="editor"/>
									<i></i>
							`
			folders.insertBefore(newFile_item,folders.firstElementChild);//往结构前面添加新建文件
		}

		var editor = $('.editor')[0];
		var folder_name = $('span',newFile_item)[0];
		folder_name.style.display = 'none';
		editor.style.display = "block";
		editor.focus();
		//点击document判断是否新建
		function createNewFile(ev){
			//点击input让新建的时候不让进去
			if(ev.target.nodeName == "INPUT"){
					return;
				}
			off(document,"mousedown",createNewFile);
			var	editorValue = editor.value.trim();//editor的值
			var newID = Date.now();//一个新id为时间戳；
			var breadmenu = $('.breadmenu')[0];
			var navSpans = $('span',breadmenu)[0];//获取到导航下面最后一个span的id
			var navSpansId = navSpans.dataset.id;
			if(editorValue === ""){//如果editorValue为空就表示新建不成功
				//console.log(folders.firstElementChild)
				folders.firstElementChild.remove();
				if(file_item.length === 0){
					folders.innerHTML = renderNoFolder();
				}
				return;
			}else{
				//getChildsById(navSpansId)
				var newSpanArr = getChildsById(navSpansId);
				for(var i = 0;i < newSpanArr.length; i++){
					//console.log(file_item.length)
					if(editorValue === newSpanArr[i].title){//如果名字一样的
						newFile_item.remove();
						return;
					}

				}
				editor.style.display = 'none';//隐藏结构里的input
				folder_name.style.display = 'block';//释放隐藏的span
				folder_nameValue = editorValue;//把input里面的值赋给span
				//console.log(navSpansId)
				data[newID]={
				 	"id": newID,
			        "pid": navSpansId,//pid就是导航区最后一个元素的id
			        "title": editorValue,
				};

				//提醒新建成功
				fullTip("ok","新建文件夹成功");
				createNavHtml(navSpansId);//导航数据重新渲染
				breadNav.innerHTML = createNavHtml(navSpansId);
				navEvent();//给导航添加点击事件
				createFileHtml(navSpansId);//文件夹重新渲染
				addEventForFolde();//添加点击文件夹事件
				tree.innerHTML = createTreeHtml(initId,leval);//左边菜单结构
				positionElement(navSpansId);//定位父级添加样式
				clickTreeDivs();//左边树形菜单重新绑定点击事件
			}

		}
		on(document,"mousedown",createNewFile);
		ev.stopPropagation();
	});
	//-----------------conf删除提示框实现拖拽-------------------------------
	function move(classNames){
		var disX = 0, disY = 0;
		classNames.onmousedown = function (ev){
			disX = ev.clientX - classNames.offsetLeft;  //X轴	
			disY = ev.clientY - classNames.offsetTop;  //Y轴	

			var maxX = document.documentElement.clientWidth - classNames.clientWidth;
			var maxY = document.documentElement.clientHeight - classNames.clientHeight;

			// 只有down的时候，这个move才有是事件处理函数
			document.onmousemove = function (ev){
				//classNames.style.margin = 0;
				var l = ev.clientX	- disX;
				var t = ev.clientY	- disY;
				if(l < 0) {
					l = 0;
				}
				if(t < 0){
					t = 0;
				}
				if(l >= maxX){
					l = maxX;
				}
				if(t >= maxY){
					t = maxY;
				}

				classNames.style.left = l + 'px';
				classNames.style.top = t + 'px';
			};

			document.onmouseup = function (){
				document.onmousemove = null;	
			};
			ev.preventDefault();
		};
	}
	//------------------删除文件夹------------------------
	var del = $('#del');
	var tanbox = $('.tanbox')[0];//遮罩层
	on(del,"click",function (ev){
		addEventForFolde();//调用一下单选
		var selectArr = whoSelected();//表示选中了的单选框
		var conf = $('.conf')[0];//删除时候询问是否删除的按钮
		var closeIco = $('.close-ico',conf)[0];//关闭按钮
		var confBtn = $('.conf-btn',conf)[0];
		var aYes = confBtn.firstElementChild;//确定按钮
		var aNo = confBtn.lastElementChild;//取消按钮
		conf.style.left = "40%";//让弹框每次都是从指定位置落下
		if(selectArr.length === 0){//如果没有选中
			fullTip("warn","请选择文件");
		}else{//如果选中了，会出来提示框，询问是否删除
			tanbox.style.display = "block";
			mTween(conf,{top:200},300,"linear")//让弹框动画效果下来
			move(conf);//拖拽弹框
			//点击关闭按钮
			closeIco.onclick = function(ev){
				mTween(conf,{top:-200},300,"linear")
				tanbox.style.display = "none";
				ev.stopPropagation();
			}
			//点击取消按钮
			aNo.onclick = function(ev){
				mTween(conf,{top:-200},300,"linear")
				tanbox.style.display = "none";
				ev.stopPropagation();
			};
			aYes.onclick = function(){
				for(var i = 0; i < selectArr.length; i++){
					tanbox.style.display = "none";
					mTween(conf,{top:-200},100,"linear")
					selectArr[i].parentNode.remove();//删出掉选中的
					var deleteId =selectArr[i].parentNode.dataset.id;//得到每个对应单选框的id
					//console.log(deleteId)
					delete data[deleteId];//删除对应的一项
				}
				//如果全选按钮选中的话就清除全选
				var breadmenu = $('.breadmenu')[0];
				var navSpans = $('span',breadmenu)[0];//获取到导航下面最后一个span的id
				var navSpansId = navSpans.dataset.id;
				checkedAll.className = "";//清除全选样式样式
				checkedAll.isChecked = false;//状态改为假
				tree.innerHTML = createTreeHtml(initId,leval);//重新左边菜单结构
				positionElement(navSpansId);//定位父级添加样式
				createFileHtml(navSpansId);//渲染右边文件夹
				clickTreeDivs();//左边树形菜单重新绑定点击事件
				addEventForFolde();
			}
		}

	});

	//----------------------重命名文件夹--------------------------------------------
	 var rename = $('#rename');
	 on(rename,"click",function (ev){
	 	var selectArr = whoSelected();//表示选中了的单选框
	 	if(selectArr.length === 0){//如果没有选中
			fullTip("warn","请选择文件");
		}else if(selectArr.length >1){//如果重命名的时候勾选了不止一个单选框,提醒一下
			fullTip("warn","不能同时重命名多个文件");
		}else{
			var editor = $('input',selectArr[0].parentNode)[0];//被选中文件夹的input
			var folder_name = $('span',selectArr[0].parentNode)[0];//被选中文件夹的span
			var folder_nameValue = folder_name.innerHTML.trim();//被选中文件夹的span的值
			editor.value = folder_nameValue;//把input里面的值赋给span
			folder_name.style.display = 'none';//隐藏结构里的input
			editor.style.display = 'block';//释放隐藏的span
			editor.select();//光标全选状态
			//点击document判断是否重命名成功
			on(document,"mousedown",renameNewFile);
			function renameNewFile(){
				off(document,"mousedown",renameNewFile);
				//判断此时重命名的文件夹跟其他的文件是否有一样的名字
				var renameFileId = selectArr[0].parentNode.dataset.id;//被选中文件夹的id
				for(var i = 0;i < file_item.length; i++){
					var spanInnerHtml = file_item[i].getElementsByTagName('span')[0].innerHTML;//文件夹里面span的值
					if(renameFileId == file_item[i].dataset.id){//不和自身比较
						continue;
					}
					if(editor.value.trim() == ""){//如果重命名的名字为空,点击document后恢复原状
						fullTip("warn","名字不能为空");
						editor.style.display = 'none';
						folder_name.style.display = 'block';
						return;
					}
					if(editor.value.trim() == spanInnerHtml){//如果选中文件的内容跟其他文件夹的内容一样
						editor.style.display = 'none';
						folder_name.style.display = 'block';
						fullTip("warn","命名冲突，请重新命名");
						return;
					}

				}
				if(folder_nameValue == editor.value){//就是想重命名但是没有命名的时候
					folder_name.style.display = 'block';//隐藏结构里的input
					editor.style.display = 'none';//释放隐藏的span
					return;
				}
				//重命名成功
				folder_name.style.display = 'block';//隐藏结构里的input
				editor.style.display = 'none';//释放隐藏的span
				folder_name.innerHTML = editor.value.trim();//把input的值赋给span
				data[renameFileId].title = editor.value.trim();//把修改的名字放进去
				fullTip("warn","重命名成功");
				tree.innerHTML = createTreeHtml(initId,leval);//重新左边菜单结构
				positionElement(selectArr[0].parentNode.parentNode.dataset.id);//定位父级添加样式
				clickTreeDivs();//左边树形菜单重新绑定点击事件
			}
		}
		ev.stopPropagation();
	 });


	//----------------渲染移动到文件夹的数据结构------------
	var conf_remove = $(".conf_remove")[0];
	var conf_content = $('.conf-content',conf_remove)[0];
	//生成左边树形结构
	conf_content.innerHTML = createTreeHtml(initId,leval);//生成移动到文件里面的内容

	//------------------------------移动到----------------------------------------
	var remove = $('#remove');
	var moveRightId = null;
	on(remove,"click",function (ev){
		var selectArr = whoSelected();//表示选中了的单选框
		if(file_item.length === 0 ||selectArr.length ===0){//如果没有文件夹或者没有选中的
			fullTip("warn","请选择要移动的文件");
			return;
		}else{//如果有文件夹，判断是否选中
			var conf_remove = $('.conf_remove')[0];//删除时候询问是否删除的按钮
			var closeIco = $('.close-ico',conf_remove)[0];//关闭按钮
			var confBtn = $('.conf-btn',conf_remove)[0];
			var aYes = $('a',confBtn)[0];//确定按钮
			var aNo = $('a',confBtn)[1];//取消按钮
			conf_remove.style.left = "40%";//让弹框每次都是从指定位置落下
			conf_content.innerHTML = createTreeHtml(initId,leval);
			if(selectArr.length != 0){//如果有选中的
				tanbox.style.display = "block";//出现弹框
				mTween(conf_remove,{top:150},600,"linear")//让弹框动画效果下来
				move(conf_remove);//拖拽弹框
			}

			//------------点击关闭-------------
			closeIco.onclick = function(ev){
				mTween(conf_remove,{top:-450},400,"linear")
				tanbox.style.display = "none";
				ev.stopPropagation();
			}
			//---------------点击取消按钮--------------
			aNo.onclick = function(ev){
				mTween(conf_remove,{top:-450},400,"linear")
				tanbox.style.display = "none";
				ev.stopPropagation();
			};
			moveTreeFn();//点击弹框每个div的函数
			aYes.onclick = function(ev){//点击确定后，把被点击div的id赋给被选中文件夹的pid
				//moveTreeFn();
				if( moveRightId != null ){//如果是可以移动到的
					var moveChildArr = getChildsById(moveRightId)//想要移动到的文件夹的子级
					var newMoveChildArr = [];
					for( var k = 0; k < moveChildArr.length; k++ ){
						newMoveChildArr.push(moveChildArr[k].title);
					}
					//console.log(newMoveChildArr)//想要移动到的文件夹子级的id

					for(var i = 0; i < selectArr.length; i++){
						//data[selectArr[i].parentNode.dataset.id].pid  = moveRightId;

						//找到想要移动的文件夹的title
						var moveTitle = [];
						//如果想要移动的文件夹名字跟移动到的文件夹名字的子元素的名字一样，就不能移动
						for( var m = 0; m < newMoveChildArr.length; m++ ){
							if(newMoveChildArr[m] != data[selectArr[i].parentNode.dataset.id].title){
								moveTitle.push(1)
							}
							if(moveTitle.length == newMoveChildArr.length){
								data[selectArr[i].parentNode.dataset.id].pid  = moveRightId;
							}else{
								fullTip("warn","部分文件夹名字，无法移动");
							}
						}
						// if( newMoveChildArr.indexOf(moveTitle)  != -1){
						// 	fullTip("warn","文件夹名字一样，无法移动");
						// return;
						// }
					}
					//点击确定让弹框消失
					mTween(conf_remove,{top:-450},200,"linear")
					tanbox.style.display = "none";
					//------------重新渲染结构-----------
					checkedAll.className = "";//清除全选样式样式
					checkedAll.isChecked = false;//状态改为假
					tree.innerHTML = createTreeHtml(initId,leval);//重新左边菜单结构
					positionElement(moveRightId);//定位父级添加样式
			        createFileHtml(moveRightId);//渲染右边文件夹
			        clickTreeDivs();//左边树形菜单重新绑定点击事件
			        addEventForFolde();
			        createNavHtml(moveRightId);//导航数据重新渲染
					breadNav.innerHTML = createNavHtml(moveRightId);

				}else{//如果不能移动，就不让点击
					return;
				}
				ev.stopPropagation();
			}

		}
		ev.stopPropagation();
	});


	//----------------给移动到的属性菜单添加点击处理------------------

	function moveTreeFn(){
		var selectArr = whoSelected();//表示选中了的单选框
		var selfIdArr = [];//存放自身id
		var parentIdArr = [];//存放父级id
		var childrenIdArr = [];
		//var moveAllId = [];
		//循环被选中的文件夹，找到他们的自身的id，父级id，子元素的id
		for(var i = 0; i < selectArr.length; i++){
			var selfId = selectArr[i].parentNode.dataset.id;//每个被选中文件夹的id
			var parentId = selectArr[0].parentNode.parentNode.dataset.id;//每个被选中文件夹的父级id
			selfIdArr.push(selfId)//把所有选中元素的id放到一个数组
			parentIdArr.push(parentId);//把所有选中元素的父元素id放到一个数组
			childrenIdArr = childrenIdArr.concat(ChildsById(selfId))//子孙元素的id

		}
		//点击弹框里每一条div 判断是否可以移动到
		var divTips = $('div',conf_content);//弹框里面每一条div
		// 让弹框中树形菜单的“微云”这个标题有颜色
		var oneDiv = conf_content.querySelector("div[data-id='0']")
		oneDiv.style.background = "red";

		for(var i = 0; i < divTips.length; i++){
			divTips[i].onclick = function(){
				for( var i = 0; i < divTips.length; i++ ){
					divTips[i].style.background = "";
				}
				this.style.background = "red";//点击每个div，让他们背景颜色变色

				var moveId = this.dataset.id;//每个想要移动的id
				var moveTips =$('.move-tips')[0];//出现的提示性文字
				if(parentIdArr.indexOf(moveId) != -1){//如果每个点击的div的id跟选中元素的id一样
					moveTips.innerHTML = "不能移动到父级";
						moveRightId = null;
					return;
				}
				if(selfIdArr.indexOf(moveId) != -1){//如果每个点击的div的id跟选中元素的id一样
					moveTips.innerHTML = "不能移动到自身";
						moveRightId = null;
					return;
				}
				if(childrenIdArr.indexOf(moveId) != -1){//如果每个点击的div的id跟选中元素的id一样
					moveTips.innerHTML = "不能移动到子级";
						moveRightId = null;
					return;
				}
				//其他可移动的时候，清空提示语
				moveTips.innerHTML = "";
				moveRightId = moveId;
			}
		}
	}



})();
