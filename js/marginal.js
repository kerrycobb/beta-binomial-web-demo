var BetaBinomial;

BetaBinomial = (function() {
  function BetaBinomial(a, b, n, p) {
    var i;
    this.a = a;
    this.b = b;
    this.n = n;
    this.p = p;
    this.x = (function() {
      var j, results;
      results = [];
      for (i = j = 0; j <= 500; i = ++j) {
        results.push(i / 500);
      }
      return results;
    })();
    this.update();
  }

  BetaBinomial.prototype.update = function() {
    var i;
    this.k = this.p * this.n;
    this.like_a = this.k + 1;
    this.like_b = this.n - this.k + 1;
    this.post_a = this.a + this.k;
    this.post_b = this.b + this.n - this.k;
    this.like_df = (function() {
      var j, len, ref, results;
      ref = this.x;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        results.push(jStat.beta.pdf(i, this.like_a, this.like_b));
      }
      return results;
    }).call(this);
    this.prior_df = (function() {
      var j, len, ref, results;
      ref = this.x;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        results.push(jStat.beta.pdf(i, this.a, this.b));
      }
      return results;
    }).call(this);
    this.post_df = (function() {
      var j, len, ref, results;
      ref = this.x;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        results.push(jStat.beta.pdf(i, this.post_a, this.post_b));
      }
      return results;
    }).call(this);
    this.like = Math.log(jStat.binomial.pdf(this.k, this.n, this.p));
    this.prior = Math.log(jStat.beta.pdf(this.p, this.a, this.b));
    this.post = Math.log(jStat.beta.pdf(this.p, this.post_a, this.post_b));
    return this.marginal = Math.exp(this.like + this.prior - this.post);
  };

  BetaBinomial.prototype.get_datasets = function() {
      var datasets = [
          {
              data: this.post_df,
              label: 'Posterior p(θ|D)',
              borderColor: '#fdc086',
              fill: false
          },
          {
              data: this.prior_df,
              label: 'Prior p(D|θ)',
              borderColor: '#beaed4',
              fill: false
          },
          {
              data: this.like_df,
              label: 'Likelihood p(θ)',
              borderColor: '#7fc97f',
              fill: false
          }
      ]
      return datasets
  }
  return BetaBinomial;
})();


// ----------------------------------------------------------------------------
// Charts and Sliders
var m1 = new BetaBinomial( .5, .5, 100, 0.5);
var m2 = new BetaBinomial( 1, 1, 100, 0.5);

function get_options(n) {
    options = {
        title: {display: true, text: `${n} Probability Densities`},
        maintainAspectRatio: false,
        legend: {
            reverse: true
        },
        elements: {
                line: {
                    tension: 0
                },
                point: {
                    radius:0
                }
            },
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'θ'
                },
                // display: false,
                gridLines: {
                    display: false
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 2
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Density'
                },
                gridLines: {
                    display: false,
                    drawBorder: true,
                    borderLineColor: 'rgba(0, 0, 0, 1)',
                }
            }]
        }
    }
return options;
}

var chart1 = new Chart(document.getElementById('chart1'), {
    type: 'line',
    data: {labels: m1.x, datasets: m1.get_datasets()},
    options: get_options('M1')
});

var chart2 = new Chart(document.getElementById('chart2'), {
    type: 'line',
    data: {labels: m2.x, datasets: m2.get_datasets()},
    options: get_options('M2')
});

var barchart = new Chart(document.getElementById('barchart'), {
    type: 'bar',
    data: {
        labels: ['M1', 'M2'],
        datasets: [{
            data: [m1.marginal, m2.marginal],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)'
            ]
        }]
    },
    options: {
        title: {display: true, text: 'Marginal Likelihoods'},
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        scales: {
            xAxes: [{
                ticks: {
                    min:0,
                    max:1,
                    stepSize:1
                },
                gridLines: {
                    display:false
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero:true
                },
                gridLines: {
                    display:false
                }
            }],
        }
    }
});

// Sample Size Slider
var n_slider = document.getElementById('n_slider');
var n_input = document.getElementById('n_input');
noUiSlider.create(n_slider, {
    start: m1.n,
    step: 1,
    connect:'lower',
    range: {'min': 10, 'max': 1000 }
});
n_slider.noUiSlider.on('update', function( values, handle ) {
	var value = Number(values[handle]);
  n_input.value = value;
});
n_slider.noUiSlider.on('change', function( values, handle) {
  var value = Number(values[handle]);
  n_input.value = value;
  m1.n = value;
  m2.n = value;
  m1.update();
  m2.update();
  chart1.config.data.datasets = m1.get_datasets();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update({duration: 0});
  chart2.update();
  barchart.update();
});
n_input.addEventListener('change', function() {
  var value = this.value
  n_slider.noUiSlider.set(value);
  num_value = Number(value)
  m1.n = num_value;
  m2.n = num_value;
  m1.update();
  m2.update();
  chart1.config.data.datasets = m1.get_datasets();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update();
  chart2.update();
  barchart.update();
});

// Proportion Slider
var p_slider = document.getElementById('p_slider');
var p_input = document.getElementById('p_input');
noUiSlider.create(p_slider, {
    start: m1.p,
    step: .01,
    connect:'lower',
    range: {'min': 0, 'max': 1 }
});
p_slider.noUiSlider.on('update', function( values, handle ) {
	var value = Number(values[handle]);
  p_input.value = value;
});
p_slider.noUiSlider.on('change', function( values, handle) {
  var value = Number(values[handle]);
  p_input.value = value;
  m1.p = value;
  m2.p = value;
  m1.update();
  m2.update();
  chart1.config.data.datasets = m1.get_datasets();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update();
  chart2.update();
  barchart.update();
});
p_input.addEventListener('change', function() {
  var value = this.value
  p_slider.noUiSlider.set(value);
  var num_value = Number(value);
  m1.p = num_value;
  m2.p = num_value
  m1.update();
  m2.update();
  chart1.config.data.datasets = m1.get_datasets();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update();
  chart2.update();
  barchart.update();
});

// A1 Slider
var a1_slider = document.getElementById('a1_slider');
var a1_input = document.getElementById('a1_input');
noUiSlider.create(a1_slider, {
    start: m1.a,
    connect:'lower',
    range:{'min':[0.01, 0.01 ], '10%':[1, 1], 'max':[100] }
});
a1_slider.noUiSlider.on('update', function( values, handle ) {
	var value = Number(values[handle]);
  a1_input.value = value;
});
a1_slider.noUiSlider.on('change', function( values, handle) {
  var value = Number(values[handle]);
  a1_input.value = value;
  m1.a = value;
  m1.update();
  chart1.config.data.datasets = m1.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update();
  barchart.update();
});
a1_input.addEventListener('change', function() {
  var value = this.value
  a1_slider.noUiSlider.set(value);
  var num_value = Number(value);
  m1.a = num_value;
  m1.update();
  chart1.config.data.datasets = m1.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update();
  barchart.update();
});

// B1 Slider
var b1_slider = document.getElementById('b1_slider');
var b1_input = document.getElementById('b1_input');
noUiSlider.create(b1_slider, {
    start: m1.b,
    connect:'lower',
    range:{'min':[0.01, 0.01 ], '10%':[1, 1], 'max':[100] }
});
b1_slider.noUiSlider.on('update', function( values, handle ) {
	var value = Number(values[handle]);
  b1_input.value = value;
});
b1_slider.noUiSlider.on('change', function( values, handle) {
  var value = Number(values[handle]);
  b1_input.value = value;
  m1.b = value;
  m1.update();
  chart1.config.data.datasets = m1.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update();
  barchart.update();
});
b1_input.addEventListener('change', function() {
  var value = this.value
  b1_slider.noUiSlider.set(value);
  var num_value = Number(value);
  m1.b = num_value;
  m1.update();
  chart1.config.data.datasets = m1.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart1.update();
  barchart.update();
});

// A2 Slider
var a2_slider = document.getElementById('a2_slider');
var a2_input = document.getElementById('a2_input');
noUiSlider.create(a2_slider, {
    start: m2.a,
    connect:'lower',
    range:{'min':[0.01, 0.01 ], '10%':[1, 1], 'max':[100] }
});
a2_slider.noUiSlider.on('update', function( values, handle ) {
	var value = Number(values[handle]);
  a2_input.value = value;
});
a2_slider.noUiSlider.on('change', function( values, handle) {
  var value = Number(values[handle]);
  a2_input.value = value;
  m2.a = value;
  m2.update();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart2.update();
  barchart.update();
});
a2_input.addEventListener('change', function() {
  var value = this.value
  a2_slider.noUiSlider.set(value);
  var num_value = Number(value);
  m2.a = num_value;
  m2.update();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart2.update();
  barchart.update();
});

// B2 Slider
var b2_slider = document.getElementById('b2_slider');
var b2_input = document.getElementById('b2_input');
noUiSlider.create(b2_slider, {
    start: m2.b,
    connect:'lower',
    range:{'min':[0.01, 0.01 ], '10%':[1, 1], 'max':[100] }
});
b2_slider.noUiSlider.on('update', function( values, handle ) {
	var value = Number(values[handle]);
  b2_input.value = value;
});
b2_slider.noUiSlider.on('change', function( values, handle) {
  var value = Number(values[handle]);
  b2_input.value = value;
  m2.b = value;
  m2.update();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart2.update();
  barchart.update();
});
b2_input.addEventListener('change', function() {
  var value = this.value
  b2_slider.noUiSlider.set(value);
  var num_value = Number(value);
  m2.b = num_value;
  m2.update();
  chart2.config.data.datasets = m2.get_datasets();
  barchart.config.data.datasets[0].data = [m1.marginal, m2.marginal]
  chart2.update();
  barchart.update();
});
