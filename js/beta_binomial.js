var BetaBinomial;

BetaBinomial = (function() {
    function BetaBinomial(a, b, n, p, params) {
        this.a = a;
        this.b = b;
        this.n = n;
        this.p = p;
        this.params = params;
        this.x = (function() {
            var i, j, results;
            results = [];
            for (i = j = 1; j < params; i = ++j) {
                results.push(i / params);
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
    };

    return BetaBinomial;
})();
