/*jshint esnext: true */
/*jshint loopfunc:true */

var n = 100;
var p = 0.5;
var a1 = 1;
var b1 = 1;
var a2 = 0.5;
var b2 = 0.5;

var m1 = new BetaBinomial(a1, b1, n, p);
var m2 = new BetaBinomial(a2, b2, n, p);

// Functions
function update(slider, value) {
    var models = slider.update.models;
    var param = slider.update.param;
    console.log(param);
    for (i = 0; i < models.length; i++) {
        var model = models[i];
        model[param]= value;
        model.update();
        model.chart.config.data.datasets = model.get_datasets();
    }
    for (i = 0; i < models.length; i++) {
        models[i].chart.update();
    }
}

function get_options(n) {
    options = {
        title: {display: true, text: `${n} Probability Densities`},
        maintainAspectRatio: false,
        legend: { reverse: true },
        elements: { line: { tension: 0 }, point: { radius:0 } },
        scales: {
            xAxes: [{
                scaleLabel: { display: true, labelString: 'θ' },
                gridLines: { display: false },
                ticks: { autoSkip: true, maxTicksLimit: 2 }
            }],
            yAxes: [{
                scaleLabel: { display: true, labelString: 'Density' },
                gridLines: { display: false, drawBorder: true, borderLineColor: 'rgba(0, 0, 0, 1)' }
            }]
        }
    };
    return options;
}

// Initialize charts
var chart1 = new Chart(document.getElementById('chart1'), {
    type: 'line',
    data: {labels: m1.x, datasets: m1.get_datasets()},
    options: get_options('M1')
});
m1.chart = chart1;

var chart2 = new Chart(document.getElementById('chart2'), {
    type: 'line',
    data: {labels: m2.x, datasets: m2.get_datasets()},
    options: get_options('M2')
});
m2.chart = chart2;

var barchart = new Chart(document.getElementById('barchart'), {
    type: 'bar',
    data: {
        labels: ['M1', 'M2'],
        datasets: [{
            data: [m1.marginal, m2.marginal],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)']
        }]
    },
    options: {
        title: {display: true, text: 'Marginal Likelihoods'},
        maintainAspectRatio: false,
        legend: { display: false },
        scales: {
            xAxes: [{ ticks: { min:0, max:1, stepSize:1 }, gridLines: { display:false } }],
            yAxes: [{ ticks: { beginAtZero:true }, gridLines: { display:false } }],
        }
    }
});

// Sliders Options
var sliders = [
    {   id: 'n-slider', start: n,
        range: { 'min': [10, 1], 'max': [1000] },
        update: { models: [m1, m2], charts: [chart1, chart2], param: 'n' }
    },
    {   id: 'p-slider', start: p,
        range: { 'min': [0, 0.01], 'max': [1] },
        update: { models: [m1, m2], charts: [chart1, chart2], param: 'p' }
    },
    {   id: 'a1-slider', start: a1,
        range: { 'min': [0.01, 0.01], '10%': [1, 1], 'max': [100] },
        update: { models: [m1], charts: [chart1], param: 'a' }
    },
    {   id: 'b1-slider', start: b1,
        range: { 'min': [0.01, 0.01], '10%': [1, 1], 'max': [100] },
        update: { models: [m1], charts: [chart1], param: 'b'}
    },
    {   id: 'a2-slider', start: a2,
        range: { 'min': [0.01, 0.01], '10%': [1, 1], 'max': [100] },
        update: { models: [m2], charts: [chart2], param: 'a'}
    },
    {   id: 'b2-slider', start: b2,
        range: {'min': [0.01, 0.01], '10%':  [1, 1], 'max': [100] },
        update: { models: [m2], charts: [chart2], param: 'b'}
    },
];

// Sliders and Inputs
for (var i = 0; i < sliders.length; i++) {
    // Initialize slider and input objects and add some variables to object
    var slider_div_id = sliders[i].id;
    var slider_div = document.getElementById(slider_div_id);
    var input_id = $(slider_div).attr('for');
    var input = document.getElementById(input_id);
    var slider =  noUiSlider.create(slider_div, {
        start: sliders[i].start,
        connect:'lower',
        range:sliders[i].range
    });
    slider.input = input;
    slider.input.slider = slider;
    slider.update = sliders[i].update;

    // Function for slider update
    slider.on('update', function(values, handle){
        var value = Number(values[handle]);
        this.input.value = value;
    });

    // Function for slider change
    slider.on('change', function( values, handle) {
        var value = Number(values[handle]);
        this.input.value = value;
        update(this, value);
        barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal];
        barchart.update();
    });

    // Function for input change
    slider.input.addEventListener('change', function() {
        var value = this.value;
        this.slider.set(value);
        var num_value = Number(value);
        update(this.slider, num_value);
        barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal];
        barchart.update();
    });
}
