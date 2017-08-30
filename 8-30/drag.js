class Drag{
	constructor(){
		this.disX = 0;
		this.disY = 0;
		this.n = 0;

		this.downFn = this.downFn.bind(this);
		this.moveFn = this.moveFn.bind(this);
		this.upFn = this.upFn.bind(this);
	}
	draginit(dragbox){
		this.dragbox = dragbox;
		this.dragbox.onmousedown = this.downFn;
	}

	downFn(ev){
		this.disX = ev.clientX - this.dragbox.offsetLeft;
		this.disY = ev.clientY - this.dragbox.offsetTop;
		document.onmousemove = this.moveFn;
		document.onmouseup = this.upFn;
	}

	moveFn(ev){
		this.dragbox.style.left = ev.clientX - this.disX + 'px';
		this.dragbox.style.top = ev.clientY - this.disY + 'px';
	}

	upFn(){
		document.onmousemove = document.onmouseup = null;
	}

}