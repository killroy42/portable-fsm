(function(){
'use strict';

var FSM = function(initialState) {
	this.name = 'FSM';
	this.debug = false;
	this.initialState = initialState || FSM.INITIAL_STATE;
	this.onError = null;
	this.reset();
};
FSM.INITIAL_STATE = 'Start';
FSM.ERROR_INVALIDTRANSITION = 'ERROR_INVALIDTRANSITION';

FSM.prototype.reset = function() {
	this.inTransit = false;
	this.eventQueue = [];
	this.transitions = {};
	this.onEnterState = {};
	this.onLeaveState = {};
	this.onTransit = {};
	this.state = this.initialState;
	this.lastTransition = null;
	this.currentTransition = null;
}

FSM.prototype.debugLog = function() {
	if(!this.debug) return;
	arguments[0] = '['+this.name+'] '+arguments[0];
	console.log.apply(console, arguments);
}

FSM.prototype.addState = function(state, transitions) {
	if(typeof state == 'object') {
		var states = Object.keys(state);
		for(var i = 0; i < states.length; i++) {
			this.addState(states[i], state[states[i]]);
		}
	} else if(typeof state == 'string' && typeof transitions == 'object') {
		var keys = Object.keys(transitions);
		if(this.transitions[state] == undefined) this.transitions[state] = {};
		for(var i = 0; i < keys.length; i++) {
			this.transitions[state][keys[i]] = transitions[keys[i]];
		}
	} else throw new Error('Invalid arguments.');
	return this;
};

FSM.prototype.on = function(state, onEnter, onExit) {
	if(typeof onEnter ==='function') this.onEnterState[state] = onEnter;
	if(onEnter === null) delete this.onEnterState[state];
	if(typeof onExit ==='function') this.onLeaveState[state] = onExit;
	if(onExit === null) delete this.onLeaveState[state];
	return this;
};

FSM.prototype.when = function(event, whenDo) {
	if(typeof whenDo ==='function') this.onTransit[event] = whenDo;
}

FSM.prototype.consume = function(e) {
	this.debugLog('Queuing (%s) in [%s]', e, this.state);
	this.eventQueue.push(Array.prototype.slice.call(arguments));
	if(this.inTransit) return this;
	while(this.eventQueue.length > 0) {
		this.handleTransition.apply(this, this.eventQueue.shift()); // Apply arguments
	}
	return this;
};

FSM.prototype.handleTransition = function(e) { // Has arguments
	this.currentTransition = e;
	if(this.transitions[this.state] == undefined || this.transitions[this.state][e] == undefined) {
		if(typeof this.onError == 'function') {
			this.onError(FSM.ERROR_INVALIDTRANSITION);
		} else {
			this.defaultErrorHandler(FSM.ERROR_INVALIDTRANSITION);
		}
		return;
	}
	var
		prevState = this.state,
		nextState = this.transitions[this.state][e],
		args = Array.prototype.slice.call(arguments, 1);
	this.inTransit = true;
	this.debugLog('  Begin transit: [%s] -(%s)-> [%s]', prevState, e, nextState);
	if(this.onLeaveState[prevState]) this.onLeaveState[prevState].apply(this, args);
	this.state = nextState;
	this.lastTransition = this.currentTransition;
	if(this.onTransit[e]) this.onTransit[e].apply(this, args);
	if(this.onEnterState[nextState]) this.onEnterState[nextState].apply(this, args);
	this.debugLog('  Complete transit: [%s] -(%s)-> [%s]', prevState, e, nextState);
	this.currentTransition = null;
	this.inTransit = false;
};

FSM.prototype.consumer = function(e) {
	var
		that = this,
		args = Array.prototype.slice.call(arguments, 0);
	return function() {
		return that.consume.apply(that, args.concat(Array.prototype.slice.call(arguments, 0)));
	}
};

FSM.prototype.defaultErrorHandler = function(err) {
	switch(err) {
		case (FSM.ERROR_INVALIDTRANSITION):
			console.warn('[%s] Invalid transition (%s) from [%s]', this.name, this.currentTransition, this.state);
			break;
		default:
			throw new Error('['+this.name+'] Unknown FSM error: '+err);
	}
}


// export in common js
if( typeof module !== "undefined" && ('exports' in module)) {
	module.exports = FSM;
}

})();