var λ = require('fantasy-check/src/adapters/nodeunit'),
    daggy = require('daggy'),
    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),

    Either = require('../fantasy-eithers'),

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

    /* Id is here *only* for testing purposes */
    Id = daggy.tagged('value'),

    isId = helpers.isInstanceOf(Id),
    isEither = helpers.isInstanceOf(Either),
    isLeft = helpers.isInstanceOf(Either.Left),
    isRight = helpers.isInstanceOf(Either.Right),
    isIdOf = helpers.isInstanceOf(idOf),
    isLeftOf = helpers.isInstanceOf(leftOf),
    isRightOf = helpers.isInstanceOf(rightOf);

Id.of = Id;
Id.prototype.concat = function(b) {
    return this.value + b.value;
};
Id.prototype.map = function(f) {
    return Id.of(f(this.value));
};
Id.prototype.traverse = function(f, p) {
    return p.of(f(this.value));
};

function idOf(type) {
    var self = this.getInstance(this, idOf);
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
    .property('badLeft', error('Got Left side'))
    .property('badRight', error('Got Right side'))
    .property('idOf', idOf)
    .method('arb', isIdOf, function(a, b) {
        return Id.of(this.arb(a.type, b - 1));
    })
    .property('leftOf', leftOf)
    .method('arb', isLeftOf, function(a, b) {
        return Either.Left(this.arb(a.type, b - 1));
    })
    .property('rightOf', rightOf)
    .method('arb', isRightOf, function(a, b) {
        return Either.Right(this.arb(a.type, b - 1));
    });

exports.either = {
    'when testing Left with cata should call Left function': λ.check(
        function(a) {
            return Either.Left(a).cata({
                Left: function(b) {
                    return a === b;
                },
                Right: λ.badRight
            });
        },
        [λ.AnyVal]
    ),
    'when testing Right with cata should call Right function': λ.check(
        function(a) {
            return Either.Right(a).cata({
                Left: λ.badLeft,
                Right: function(b) {
                    return a === b;
                }
            });
        },
        [λ.AnyVal]
    ),
    'when creating Left should and getting l should return correct value': λ.check(
        function(a) {
            return Either.Left(a).l === a;
        },
        [λ.AnyVal]
    ),
    'when creating Right should and getting r should return correct value': λ.check(
        function(a) {
            return Either.Right(a).r === a;
        },
        [λ.AnyVal]
    ),
    'when creating Left and calling swap should be Right': λ.check(
        function(a) {
            return equals(Either.Left(a).swap())(Either.Right(a));
        },
        [λ.AnyVal]
    ),
    'when creating Right and calling swap should be Left': λ.check(
        function(a) {
            return equals(Either.Right(a).swap())(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Left and calling map with inc should be correct value': λ.check(
        function(a) {
            return equals(Either.Left(a).map(inc))(Either.Left(a));
        },
        [Number]
    ),
    'when creating Right and calling map with fold should be correct value': λ.check(
        function(a) {
            return equals(Either.Right(a).map(inc))(Either.Right(inc(a)));
        },
        [Number]
    ),
    'when creating Left and calling chain with Right should return Left value': λ.check(
        function(a) {
            return equals(
                Either.Left(a).chain(
                    function(x) {
                        return Either.Right(inc(x));
                    }
                ).chain(
                    function(x) {
                        return Either.Right(inc(x));
                    }
                )
            )(Either.Left(a));
        },
        [Number]
    ),
    'when creating Right and calling chain with Right should return Right with correct value': λ.check(
        function(a) {
            return equals(
                Either.Right(a).chain(
                    function(x) {
                        return Either.Right(inc(x));
                    }
                ).chain(
                    function(x) {
                        return Either.Right(inc(x));
                    }
                )
            )(Either.Right(inc(inc(a))));
        },
        [Number]
    ),
    'when creating Right and calling chain with Left should Right with correct value': λ.check(
        function(a) {
            return equals(
                Either.Right(a).chain(
                    function(x) {
                        return Either.Left(inc(x));
                    }
                ).chain(
                    function(x) {
                        return Either.Right(inc(x));
                    }
                )
            )(Either.Left(inc(a)));
        },
        [Number]
    ),
    'when creating Right and calling ap with Right should be correct value': λ.check(
        function(a) {
            return equals(Either.Right(inc).ap(Either.Right(a)))(Either.Right(inc(a)));
        },
        [Number]
    ),
    'when creating Right and calling ap with Left should be correct value': λ.check(
        function(a) {
            return equals(Either.Right(inc).ap(Either.Left(a)))(Either.Left(a));
        },
        [Number]
    ),
    'when creating Left and calling ap with Right should be correct value': λ.check(
        function(a) {
            return equals(Either.Left(inc).ap(Either.Right(a)))(Either.Left(inc));
        },
        [Number]
    ),
    'when creating Left and calling concat with Right should return correct value': λ.check(
        function(a) {
            return equals(Either.Left(a).concat(Either.Right(a)))(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Left and calling concat with Left should return correct value': λ.check(
        function(a) {
            return equals(Either.Left(a).concat(Either.Left(a)))(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Right and calling concat with Left should return correct value': λ.check(
        function(a) {
            return equals(Either.Right(a).concat(Either.Left(a)))(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Right and calling concat with Right should return correct value': λ.check(
        function(a) {
            return Either.Right(a).concat(Either.Right(a)).r === Either.Right(a.concat(a)).r;
        },
        [λ.idOf(Number)]
    ),
    'when creating Left and calling bimap should return correct value': λ.check(
        function(a) {
            return equals(Either.Left(a).bimap(inc, λ.badRight))(Either.Left(inc(a)));
        },
        [Number]
    ),
    'when creating Right and calling bimap should return correct value': λ.check(
        function(a) {
            return equals(Either.Right(a).bimap(λ.badLeft, inc))(Either.Right(inc(a)));
        },
        [Number]
    ),
    'when testing traverse with Right should return correct value': λ.check(
        function(a) {
            return a.traverse(Id.of, Id).value === a.r;
        },
        [λ.rightOf(Number)]
    ),
    'when testing sequence with Right should return correct type': λ.check(
        function(a) {
            return isId(a.sequence());
        },
        [λ.rightOf(λ.idOf(Number))]
    ),
    'when testing sequence with Right should return correct nested type': λ.check(
        function(a) {
            return isRight(a.sequence().value);
        },
        [λ.rightOf(λ.idOf(Number))]
    ),
    'when testing sequence with Right should return correct value': λ.check(
        function(a) {
            return a.sequence().value.r === a.r.value;
        },
        [λ.rightOf(λ.idOf(Number))]
    ),
    'when testing traverse with Left should return correct value': λ.check(
        function(a) {
            return a.traverse(identity, Id).value.l === a.l;
        },
        [λ.leftOf(Number)]
    ),
    'when testing sequence with Left should return correct type': λ.check(
        function(a) {
            return isId(a.sequence());
        },
        [λ.leftOf(λ.idOf(Number))]
    ),
    'when testing sequence with Left should return correct nested type': λ.check(
        function(a) {
            return isLeft(a.sequence().value);
        },
        [λ.leftOf(λ.idOf(Number))]
    ),
    'when testing sequence with Left should return correct value': λ.check(
        function(a) {
            return a.sequence().value.l.value === a.l.value;
        },
        [λ.leftOf(λ.idOf(Number))]
    )
};
