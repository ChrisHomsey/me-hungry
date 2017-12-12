
var granimInstance = new Granim({
    element: '#canvas-basic',
    name: 'basic-gradient',
    direction: 'diagonal',
    opacity: [1, 1],
    isPausedWhenNotInView: true,
    states : {
        "default-state": {
            gradients: [
                ['#000', '#566E78'],
                ['#566E78', '#000'],
                ['#000', '#566E78']
            ]
            
        }
    }
});

