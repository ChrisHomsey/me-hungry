var granimInstance = new Granim({
    element: '#canvas-basic',
    name: 'basic-gradient',
    direction: 'left-right',
    opacity: [1, 1],
    isPausedWhenNotInView: true,
    states : {
        "default-state": {
            gradients: [
                ['#07090A', '#07090A'],
                ['#02AAB0', '#00CDAC'],
                ['#DA22FF', '#9733EE']
            ]
        }
    }
});

var granimInstanceTwo = new Granim({
    element: '#logo-canvas',
    direction: 'left-right',
    opacity: [1, 1],
    states : {
        "default-state": {
            gradients: [
                ['#000', '#35444A'],
                ['#35444A', '#000'],
                ['#000', '#35444A'],
            ],
            transitionSpeed: 2000
        }
    }
});