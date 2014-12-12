portable-fsm
=============

Simple, node/browser compatible generic FSM system

Examples
--------

```javascript
var
	FSM = require('portable-fsm'),
	fsm = new FSM();

fsm.debug = true;

fsm.addEvent('start', {
	init: 'inProgress'
});
fsm.addEvent('inProgress', {
	abort: 'cancelled',
	complete: 'done'
});

fsm.on('inProgress',
	function() {
		console.log('Progress start');
		if(Math.random() > 0.5) {
			console.log(' -> Aborting...');
			fsm.consume('abort');
		} else {
			console.log(' -> Completing...');
			fsm.consume('complete');
		}
	},
	function() {
		console.log('Progress end');
	}
);
fsm.on('cancelled', function() {
	console.log('Operation cancelled');
});
fsm.on('done', function() {
	console.log('Operation completed');
});
fsm.when('complete', function() { console.log('ALL DONE!');});
fsm.when('abort', function() { console.log('ABORT! ABORT! ABORT!');});

fsm.consume('init');
```