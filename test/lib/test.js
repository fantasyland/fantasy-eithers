'use strict';

const λ = require('fantasy-check/src/adapters/nodeunit');
const applicative = require('fantasy-check/src/laws/applicative');
const functor = require('fantasy-check/src/laws/functor');
const monad = require('fantasy-check/src/laws/monad');
    
const daggy = require('daggy');

const {isInstanceOf} = require('fantasy-helpers');
const {constant, identity} = require('fantasy-combinators');

const Identity = require('fantasy-identities');
const Either = require('../../fantasy-eithers');

const isIdentity = isInstanceOf(Identity);
const isEither = isInstanceOf(Either);
const isLeft = isInstanceOf(Either.Left);
const isRight = isInstanceOf(Either.Right);
const isLeftOf = isInstanceOf(leftOf);
const isRightOf = isInstanceOf(rightOf);
const isIdentityOf = isInstanceOf(identityOf);

function inc(a) {
    return a + 1;
}
function equals(a) {
    return (b) => {
        return a.fold(
            (x) => b.fold((y) => x === y, constant(false)),
            (x) => b.fold(constant(false), (y) => x === y)
        );
    };
}
function error(a) {
    return () => {
        throw new Error(a);
    };
}

Identity.prototype.traverse = function(f, p) {
    return p.of(f(this.x));
};

function identityOf(type) {
    const self = this.getInstance(this, identityOf);
    self.type = type;
    return self;
}

function leftOf(type) {
    const self = this.getInstance(this, leftOf);
    self.type = type;
    return self;
}

function rightOf(type) {
    const self = this.getInstance(this, rightOf);
    self.type = type;
    return self;
}

const λʹ = λ
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
        return Either.Left(this.arb(a.type, b - 1))
    })
    .property('rightOf', rightOf)
    .method('arb', isRightOf, function(a, b) {
        return Either.Right(this.arb(a.type, b - 1));
    });


// Export
if(typeof module != 'undefined')
    module.exports = λʹ;
