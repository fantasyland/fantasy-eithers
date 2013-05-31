var daggy = require('daggy'),
    Either = daggy.taggedSum({
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
        function(l) {
            return Either.Right(l);
        },
        function(r) {
            return Either.Left(r);
        }
    );
};
Either.prototype.bimap = function(f, g) {
    return this.fold(
        function(l) {
            return Either.Left(f(l));
        },
        function(r) {
            return Either.Right(g(r));
        }
    );
};
Either.prototype.chain = function(f) {
    return this.fold(
        function(l) {
            return Either.Left(l);
        },
        function(r) {
            return f(r);
        }
    );
};
Either.prototype.concat = function(b) {
    return this.fold(
        function(l) {
            return Either.Left(l);
        },
        function(r) {
            return b.chain(function(t) {
                return Either.Right(r.concat(t));
            });
        }
    );
};

// Derived
Either.prototype.map = function(f) {
    return this.chain(function(a) {
        return Either.of(f(a));
    });
};
Either.prototype.ap = function(a) {
    return this.chain(function(f) {
        return a.map(f);
    });
};

// Export
if(typeof module != 'undefined')
    module.exports = Either;
