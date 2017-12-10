/*jshint esnext: true */
/*jshint loopfunc:true */

var color1 = getComputedStyle(document.body).getPropertyValue('--color1');
var color2 = getComputedStyle(document.body).getPropertyValue('--color2');
var breakpoint = getComputedStyle(document.body).getPropertyValue('--break');
const mq = window.matchMedia( `(min-width: ${breakpoint}px)` );

// Plotting Functions
function update(slider, value) {
    var models = slider.models;
    for (i = 0; i < models.length; i++) {
        var m = models[i];
        m[slider.param]= value;
        m.update();
        m.chart.series[0].setData(m.prior_df, false);
        m.chart.series[1].setData(m.like_df, false);
        m.chart.series[2].setData(m.post_df, false);
    }
    for (i = 0; i < models.length; i++) {
        var mod = models[i];
        mod.chart.redraw();
    }
}

function plot(m, anim){
    var params = m.params;
    var chart = Highcharts.chart(m.id, {
        chart: { type: 'line' },
        title: { text: `${m.name}`},
        credits: { enabled: false },
        yAxis: { title: { text: 'Density' } },
        plotOptions: {
            series: {
                animation: anim
            }
        },
        tooltip: {
            formatter: function() {
                return '<br> θ: <b>' + this.x + '</b><br> Density: <b>' + this.y + '<b><br>';
            }
        },
        series: [
            {
                name: 'Prior p(θ)',
                data: m.prior_df,
                dashStyle: 'solid',
                color: 'black',
                marker: {radius: 0 }
            },
            {
                name: 'Likelihood p(D|θ)',
                data: m.like_df,
                dashStyle: 'shortdash',
                color: 'black',
                marker: { radius: 0 }
            },
            {
                name: 'Posterior p(θ|D)',
                data: m.post_df,
                dashStyle: 'shortdot',
                color: 'black',
                marker: { radius: 0 }
            }
        ],
        xAxis: {
            title: { text: 'θ'},
            categories: m.x,
            tickPositions:
                [0.2*params-1, 0.4*params-1 , 0.6*params-1 , 0.8*params-1]
        },
    });
    m.chart = chart;
}

function inverted(mq){
    if ( mq.matches ) {
        return(false);
    } else {
        return(true);
    }
}

function barchart(id, m1, m2, mq, anim){
    var barchart = new Highcharts.chart(id, {
        chart: { type: 'column', inverted: inverted(mq)},
        title: { text: 'Marginal Likelihoods' },
        legend: { enabled: false },
        credits: { enabled: false },
        plotOptions: {
            series: {
                animation: anim
            }
        },
        xAxis: {
            type: 'category',
            tickLength: 0
        },
        yAxis: {
            title: {
                text: 'P(D)'
            }
        },
        tooltip: {
            pointFormat: '{point.y}'
        },
        series: [{
            data: [
                { name:'Model 1', y: m1.marginal, color: m1.color },
                { name:'Model 2', y: m2.marginal, color: m2.color }
            ]
        }],
    });
    return(barchart);
}

function get_array(params){
    var i, j, results;
    results = [];
    for (i = j = 0; j <= params; i = ++j) {
        results.push(i / (params));
    }
    return(results);
}

var n = 100;
var p = 0.5;
var a1 = 1;
var b1 = 1;
var a2 = 0.5;
var b2 = 0.5;
var param = 300;

var m1 = new BetaBinomial(a1, b1, n, p, param);
var m2 = new BetaBinomial(a2, b2, n, p, param);
m1.id = 'chart1';
m2.id = 'chart2';
m1.name = 'Model 1';
m2.name = 'Model 2';
m1.color = color1;
m2.color = color2;
plot(m1, true);
plot(m2, true);
var barchart = barchart('barchart', m1, m2, mq, true);

var sliders = [
    {
        id:'n-slider' , param:'n', start:n,
        range:{'min':[10, 1], 'max':[1000]},models:[m1, m2]},
    {
        id:'p-slider' , param:'p', start:p,
        range:{'min':[0, 0.01], 'max':[1]}, models:[m1, m2]},
    {
        id:'a1-slider', param:'a', start:a1,
        range:{'min':[0.01, 0.01], '20%':[1, 1], 'max':[100]}, models:[m1]},
    {
        id:'b1-slider', param:'b', start:b1,
        range:{'min':[0.01, 0.01], '20%':[1, 1], 'max':[100]}, models:[m1]},
    {
        id:'a2-slider', param:'a', start:a2,
        range:{'min':[0.01, 0.01], '20%':[1, 1], 'max':[100]}, models:[m2]},
    {
        id:'b2-slider', param:'b', start:b2,
        range:{'min':[0.01, 0.01], '20%':[1, 1], 'max':[100]}, models:[m2]},
];

// Sliders and Inputs
for (var i = 0; i < sliders.length; i++) {
    var slider_div = document.getElementById(sliders[i].id);
    var input_id = $(slider_div).attr('for');
    var input = document.getElementById(input_id);
    var slider =  noUiSlider.create(slider_div, {
        start: sliders[i].start,
        connect: [true, false],
        range:sliders[i].range
    });
    slider.param = sliders[i].param;
    slider.input = input;
    slider.input.slider = slider;
    slider.models = sliders[i].models;

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
        barchart.series[0].setData([m1.marginal, m2.marginal], true);
    });

    // Function for input change
    slider.input.addEventListener('change', function() {
        var value = this.value;
        this.slider.set(value);
        var num_value = Number(value);
        update(this.slider, num_value);
        barchart.series[0].setData([m1.marginal, m2.marginal], true);
    });
}


// Flip barchart on small screen
// media query event handler
if (matchMedia) {
  mq.addListener(WidthChange);
  WidthChange(mq);
}
// media query change
function WidthChange(mq) {
  if (mq.matches) {
    barchart.update({chart: {inverted: false}});
  } else {
    barchart.update({chart: {inverted: true}});
  }
}


// Window Resize
$(window).resize(function() {
    plot(m1, false);
    plot(m2, false);
});
