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

fsm.addState({
	Start: {
		init: 'InProgress'
	},
	InProgress: {
		abort: 'Cancelled',
		complete: 'Done'
	}
});

fsm
	.on('InProgress', function() {
		console.log('Progress start');
		if(Math.random() > 0.5) {
			console.log(' -> Aborting...');
			fsm.consume('abort');
		} else {
			console.log(' -> Completing...');
			fsm.consume('complete');
		}
	}, function() {
			console.log('Progress end');
	})
	.on('Cancelled', function() {
		console.log('Operation cancelled');
	})
	.on('Done', function() {
		console.log('Operation completed');
	});

fsm
	.when('complete', function() {
		console.log('ALL DONE!');
	})
	.when('abort', function() {
		console.log('ABORT! ABORT! ABORT!');
	});

fsm.consume('init');
```