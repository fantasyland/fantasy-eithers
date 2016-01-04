'use strict';

const daggy = require('daggy');
const {compose, identity} = require('fantasy-combinators');

const Either = daggy.taggedSum({
    Left:  ['l'],
    Right: ['r']
});

// Methods
Either.prototype.fold = function(f, g) {
    return this.cata({
        Left: f,
        Right: g
    });
};
Either.of = Either.Right;
Either.prototype.swap = function() {
    return this.fold(
        (l) => Either.Right(l),
        (r) => Either.Left(r)
    );
};
Either.prototype.bimap = function(f, g) {
    return this.fold(
        (l) => Either.Left(f(l)), 
        (r) => Either.Right(g(r))
    );
};
Either.prototype.chain = function(f) {
    return this.fold((l) => Either.Left(l), f);
};
Either.prototype.concat = function(b) {
    return this.fold(
        (l) => Either.Left(l),
        (r) => {
            return b.chain((t) => Either.Right(r.concat(t)));
        }
    );
};

// Derived
Either.prototype.map = function(f) {
    return this.chain((a) => Either.of(f(a)));
};
Either.prototype.ap = function(a) {
    return this.chain((f) => a.map(f));
};

Either.prototype.sequence = function(p) {
    return this.traverse(identity, p);
};
Either.prototype.traverse = function(f, p) {
    return this.cata({
        Left: (l) => p.of(Either.Left(l)),
        Right: (r) => f(r).map(Either.Right)
    });
};

// Transformer
Either.EitherT = (M) => {
    const EitherT = daggy.tagged('run');
    EitherT.prototype.fold = (f, g) => {
        return this.run.chain((o) => M.of(o.fold(f, g)));
    };
    EitherT.of = (x) => {
        return EitherT(M.of(Either.Right(x)));
    };
    EitherT.prototype.swap = function() {
        return this.fold(
            (l) => Either.Right(l),
            (r) => Either.Left(r)
        );
    };
    EitherT.prototype.bimap = function(f, g) {
        return this.fold(
            (l) => Either.Left(f(l)),
            (r) => Either.Right(g(r))
        );
    };
    EitherT.prototype.chain = function(f) {
        return EitherT(this.run.chain((o) => {
            return o.fold(
                (a) => M.of(Either.Left(a)),
                (a) => f(a).run
            );
        }));
    };
    EitherT.prototype.map = function(f) {
        return this.chain((a) => EitherT.of(f(a)));
    };
    EitherT.prototype.ap = function(a) {
        return this.chain((f) => a.map(f));
    };
    return EitherT;
};

// Export
if(typeof module != 'undefined')
    module.exports = Either;
