(function(){
'use strict';

var FSM = function() {
	this.name = 'FSM';
	this.debug = false;
	this.reset();
};

FSM.prototype.reset = function() {
	this.inTransit = false;
	this.eventQueue = [];
	this.transitions = {};
	this.onEnterState = {};
	this.onLeaveState = {};
	this.onTransit = {};
	this.state = 'start';
}

FSM.prototype.debugLog = function() {
	if(!this.debug) return;
	arguments[0] = '['+this.name+'] '+arguments[0];
	console.info.apply(console, arguments);
}

FSM.prototype.addEvent = function(state, e, nextState) {
	if(this.transitions[state] == undefined) this.transitions[state] = {};
	if(typeof e === 'undefined' && typeof nextState === 'undefined') {
		return;
	} else if(typeof e === 'string' && typeof nextState === 'string') {
		this.transitions[state][e] = nextState;
	} else if(typeof e === 'object') {
		var keys = Object.keys(e);
		for(var i = 0; i < keys.length; i++) {
			this.transitions[state][keys[i]] = e[keys[i]];
		}
	} else throw new Error('Invalid arguments.');
};

FSM.prototype.on = function(state, onEnter, onExit) {
	if(typeof onEnter ==='function') this.onEnterState[state] = onEnter;
	if(onEnter === null) delete this.onEnterState[state];
	if(typeof onExit ==='function') this.onLeaveState[state] = onExit;
	if(onExit === null) delete this.onLeaveState[state];
};

FSM.prototype.when = function(event, whenDo) {
	if(typeof whenDo ==='function') this.onTransit[event] = whenDo;
}

FSM.prototype.consume = function(e) {
	this.debugLog('Queuing (%s) in [%s]', e, this.state);
	this.eventQueue.push(Array.prototype.slice.call(arguments));
	while(this.eventQueue.length > 0) {
		this.handleTransition.apply(this, this.eventQueue.pop());
	}
	return this;
};

FSM.prototype.handleTransition = function(e) {
	var
		prevState = this.state,
		nextState = this.transitions[this.state][e],
		args = Array.prototype.slice.call(arguments, 1);
	this.debugLog('  Consume (%s) in [%s]', e, prevState);
	if(this.transitions[prevState] == undefined || this.transitions[prevState][e] == undefined) {
		console.warn('    Invalid transition (%s) from [%s]', e, prevState);
		return this;
	}
	this.inTransit = true;
	this.debugLog('    Begin transit: [%s] -(%s)-> [%s]', prevState, e, nextState);
	if(this.onLeaveState[prevState]) this.onLeaveState[prevState].apply(this, args);
	this.debugLog('    Setting state: [%s] --> [%s]', prevState, nextState);
	this.state = nextState;
	if(this.onTransit[e]) this.onTransit[e].apply(this, args);
	if(this.onEnterState[nextState]) this.onEnterState[nextState].apply(this, args);
	this.debugLog('    Complete transit: [%s] -(%s)-> [%s]', prevState, e, nextState);
	this.inTransit = false;
	return this;
};

FSM.prototype.consumer = function(e) {
	return this.consume.bind(this, e);
};


// export in common js
if( typeof module !== "undefined" && ('exports' in module)) {
	module.exports = FSM;
}

})();