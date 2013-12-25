var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),
    
    daggy = require('daggy'),
    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),

    Identity = require('fantasy-identities'),
    Either = require('../../fantasy-eithers'),

    constant = combinators.constant,
    identity = combinators.identity,

    inc = function(a) {
        return a + 1;
    },
    equals = function(a) {
        return function(b) {
            return a.fold(
                function(x) {
                    return b.fold(
                        function(y) {
                            return x === y;
                        },
                        constant(false)
                    );
                },
                function(x) {
                    return b.fold(
                        constant(false),
                        function(y) {
                            return x === y;
                        }
                    );
                });
        };
    },
    error = function(a) {
        return function() {
            throw new Error(a);
        };
    },

    isIdentity = helpers.isInstanceOf(Identity),
    isEither = helpers.isInstanceOf(Either),
    isLeft = helpers.isInstanceOf(Either.Left),
    isRight = helpers.isInstanceOf(Either.Right),
    isLeftOf = helpers.isInstanceOf(leftOf),
    isRightOf = helpers.isInstanceOf(rightOf),

    isIdentityOf = helpers.isInstanceOf(identityOf);

Identity.prototype.traverse = function(f, p) {
    return p.of(f(this.x));
};

function identityOf(type) {
    var self = this.getInstance(this, identityOf);
    self.type = type;
    return self;
}

function leftOf(type) {
    var self = this.getInstance(this, leftOf);
    self.type = type;
    return self;
}

function rightOf(type) {
    var self = this.getInstance(this, rightOf);
    self.type = type;
    return self;
}

λ = λ
    .property('applicative', applicative)
    .property('functor', functor)
    .property('monad', monad)
    .property('equals', equals)
    .property('inc', inc)
    .property('isLeft', isLeft)
    .property('isRight', isRight)
    .property('Either', Either)
    .property('Identity', Identity)
    .property('badLeft', error('Got Left side'))
    .property('badRight', error('Got Right side'))
    .property('isIdentity', isIdentity)
    .property('identityOf', identityOf)
    .method('arb', isIdentityOf, function(a, b) {
        return Identity.of(this.arb(a.type, b - 1));
    })
    .property('leftOf', leftOf)
    .method('arb', isLeftOf, function(a, b) {
        return Either.Left(this.arb(a.type, b - 1));
    })
    .property('rightOf', rightOf)
    .method('arb', isRightOf, function(a, b) {
        return Either.Right(this.arb(a.type, b - 1));
    });


// Export
if(typeof module != 'undefined')
    module.exports = λ;