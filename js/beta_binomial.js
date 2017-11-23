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
        this.marginal = Math.exp(this.like + this.prior - this.post);
        return this.maginal;
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
        ];
        return datasets;
    };

    BetaBinomial.prototype.update_param = function() {

    };

    return BetaBinomial;
})();
