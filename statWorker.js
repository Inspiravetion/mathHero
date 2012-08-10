//MATH HERO STAT WORKER

this.onmessage = statBreakdown;

var unanswered = 0,
plusC          = 0, 
plusI          = 0,
minusC         = 0,
minusI         = 0,
multC          = 0,
multI          = 0,
divC           = 0,
divI           = 0;

function statBreakdown (problems) {
	for (p in problems.data){
		if(problems.data[p].answer){
			var answer = problems.data[p].answer,
			num1       = problems.data[p].arg1,
			num2       = problems.data[p].arg2,
			level      = problems.data[p].level;
			if(answer == ''){
				unanswered++;
			}
			else if(level == 1 && answer == (num1 + num2)){
				plusC++;
			}
			else if(level == 1 && answer != (num1 + num2)){
				plusI++;
			}
			else if(level == 2 && answer == (num1 - num2)){
				minusC++;
			}
			else if(level == 2 && answer != (num1 - num2)){
				minusI++;
			}
			else if(level == 3 && answer == (num1 * num2)){
				multC++;
			}
			else if(level == 3 && answer != (num1 * num2)){
				multI++;
			}
			else if(level == 4 && answer == (num1 % num2)){
				divC++;
			}
			else if(level == 4 && answer != (num1 % num2)){
				divI++;
			}
		}
	}
	reportStats();
}

function reportStats () {
	var statString = 
	'POINTS BREAKDOWN: \n\n' +

	'Unanswered: ' + unanswered + '(-' + unanswered + ')\n\n' +

	'Addition: CORRECT => ' + plusC + '(+' + plusC + ') INCORRECT => ' 
	+ plusI +'(-' + plusI + ')' + 'TOTAL =>' + (plusC - plusI) + '\n\n' +

	'Subtraction: CORRECT => ' + (minusC) + '(+' + (minusC*2) + ') INCORRECT => ' 
	+ minusI +'(-' + minusI + ')' + 'TOTAL =>' + ((minusC*2) - minusI) + '\n\n' +

	'Multiplication: CORRECT => ' + (multC) + '(+' + (multC*3) + ') INCORRECT => ' 
	+ multI +'(-' + multI + ')' + 'TOTAL =>' + ((multC*3) - multI) + '\n\n' +

	'Division: CORRECT => ' + (divC) + '(+' + (divC*4) + ') INCORRECT => ' 
	+ divI +'(-' + divI + ')' + 'TOTAL =>' + ((divC*4) - divI) + '\n\n' +

	'TOTAL: ' + (plusC + (minusC*2) + (multC*3) + (divC*4) - (unanswered + plusI + minusI + multI + divI));
	self.postMessage(statString);
}