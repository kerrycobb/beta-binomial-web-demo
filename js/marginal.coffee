{beta, binomial} = require './jstat.js'

class BetaBinomial
    constructor: (@a, @b, @n, @p) ->
        @x = (i /1000 for i in [0..1000])
        @update()

    update:() ->
        @k = @p * @n
        @like_a = @k + 1
        @like_b = @n - @k + 1
        @post_a = @a + @k
        @post_b = @b + @n - @k
        @like_df = (jStat.beta.pdf(i, @like_a, @like_b) for i in @x)
        @prior_df = (jStat.beta.pdf(i, @a, @b) for i in @x)
        @post_df = (jStat.beta.pdf(i, @post_a, @post_b) for i in @x)
        @log_like = Math.log(jStat.binomial.pdf(@k, @n, @p))
        @log_prior = Math.log(jStat.beta.pdf(@p, @a, @b))
        @log_post = Math.log(jStat.beta.pdf(@p, @post_a, @post_b))
        @marginal = Math.exp(@log_like + @log_prior - @log_post)        
