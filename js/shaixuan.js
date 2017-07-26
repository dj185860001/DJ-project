var choose = $('#choose');
var type = $('#type');
var lis = type.children;
//console.log(lis)
fn(0);
fn(1);
fn(2);
fn(3);
function fn(item){
	var btns = lis[item].children;
	for(i = 0; i < btns.length; i++){
		btns[i].index = i;
		btns[i].onclick = function(){
			var newMark = document.createElement('mark');//生成上面的按钮
			newMark.innerHTML = btns[this.index].innerHTML;
			var newA = document.createElement('a');
			newMark.index =item;//上面每个按钮对应每个li，每个按钮的下标对应每个li的下标
			this.parentNode.index = newMark.index;//当前的点击的a的下标对应上面的按钮的下标
			newA.innerHTML = 'X';
			newMark.appendChild(newA);
			choose.appendChild(newMark);
			this.style.color = "#28a5c4";//点击时候给字体加颜色
			newA.onclick = function(){
				this.parentNode.remove();//点击删除自身
			}
			if(!choose.children.length){//如果上面没有mark
				choose.appendChild(newMark);
			}else{
					for(var j=0;j<choose.children.length;j++){
						if(choose.children[j].index == newMark.index){
							choose.replaceChild(newMark,choose.children[j])
						}else{
							if(choose.children[j].index>newMark.index){
								choose.insertBefore(newMark,choose.children[j])
								return
							}
						}
					}
				}

		}
	}

}



