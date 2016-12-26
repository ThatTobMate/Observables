function map (transformFn) {
	// this refers to the susbscribe key in the createObservable function, which is currently the argument passed into the arrayObservable function argument.
	const inputObservable = this
	const outputObservable = createObservable((outputObserver) => { // outputObserver here is the object passed into subscribe in the filter function

		inputObservable.subscribe({  // inputObservable.subscribe in this example is the arrayObservable
			next: (x) => { // First loop x will be 10
				const y = transformFn(x) // read as y = function (10) { return 10/10 }
				outputObserver.next(y) // This is passing y to the filters next function.
			},
			error: e => outputObserver.error(e),
			complete: () => outputObserver.complete()
		})
	})
	return outputObservable // returning this so filter can call .subscribe. If we don't return this or .subscribe isn't called, data won't be passed down the chain.
}

function filter (conditionFn) {
	const inputObservable = this // inputObservable here is the returned outputObservable from the map function
	const outputObservable = createObservable((outputObserver) => { //outputObserver here is the observer object we pass into the subscribe call
		inputObservable.subscribe({ // Here we call .subscribe and pass in the filter logic object as an argument. This allows us to call outputObserver.next(y) in the map function.
			next: (x) => {
				if (conditionFn(x)) {
					outputObserver.next(x) // This is passing x to the observer objects next function
				}
			},
			error: e => outputObserver.error(e),
			complete: () => outputObserver.complete()
		})
	})
	return outputObservable
}

function delay (time) {
	const inputObservable = this
	const outputObservable = createObservable((outputObserver) => {
		inputObservable.subscribe({
			next: (x) => {
				setTimeout(() => {
					outputObserver.next(x)
				}, time)
			},
			error: e => outputObserver.error(e),
			complete: () => outputObserver.complete()
		})
	})
	return outputObservable
}

function createObservable (subscribe) {
	return {
		subscribe: subscribe,
		map: map,
		filter: filter,
		delay: delay
	}
}

// createObservable will take in a function as an argument and assign it to the subscribe key. Return is then called
// allowing us to call .subscribe on arrayObservable or clickObservale.
const arrayObservable = createObservable((object) => { //1.
	// Synchronously loop over the array and call the next function in the observer object, once it's finished
	// call the complete function.
	['10', '20', '30'].forEach(object.next)
	// object.complete()
})

const clickObservable = createObservable((object) => {
	document.addEventListener('click', object.next)
})

const observer = {
	next: (data) => {
		console.log(data)
	},
	error: (err) => {
		console.log(err)
	},
	complete: () => {
		console.log('complete')
	}
}

arrayObservable
	.map(x => x/10)
	.filter(x => x !== 2)
	.delay(2000)
	.subscribe(observer)

	// DATA FLOW

	// Start from the end and pass logic up the chain, then results come back down. observer object is "passed into" the filter function, which "passes" a similar object (containing the function passed in as an argument e.g. x => x!==2) into the map function, the map function then "passes" another similar object (containing the function passed in as an argument e.g. x => x/10) into the arrayObservable.
	// Next the loop is called and the first loop 10 is passed into object.next which comes from the map function and contains the map logic. When this is finished the value 1 will be passed into outputObserver.next which comes from the filter function and contains the filter logic. When this is finished the value 1 will be passed (as 1 !== 2) into outputObserver.next which comes from the observer object passed into subscribe. This observer object has a next function which just console logs the data. The output will be 1. 

	// NOTES

	// When I say the observer objects are "passed in" I mean they are being made available to the function as a .subscribe call. We are creating an observable. When we call createObservable we pass in a function to the subscribe key which becomes usable as .subscribe to anything that chains onto the returned observable.
