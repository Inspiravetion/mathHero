//MATH HERO TIME WORKER
var time = 30;

setInterval(keepTime, 1000);
function keepTime () {
	time--;
	if(time == 10){
		this.postMessage({
			cmd : 'yellow', 
			time: '00:10'
		});
	}
	else if(time == 5){
		this.postMessage({
			cmd : 'red', 
			time: '00:05'
		});	
	}
	else if(time == 0){
		this.postMessage({
			cmd : 'timesup', 
			time: '00:00'
		});	
	}
	else if(time < 10){
		this.postMessage({
			cmd : 'timecheck', 
			time: ('00:0' + time)
		});	
	}
	else{
		this.postMessage({
			cmd : 'timecheck', 
			time: ('00:' + time)
		});	
	}
}