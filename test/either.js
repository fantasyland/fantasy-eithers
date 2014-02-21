var λ = require('./lib/test'),
    applicative = λ.applicative,
    functor = λ.functor,
    monad = λ.monad,

    identity = λ.identity,

    Either = λ.Either,
    Identity = λ.Identity;

function run(a) {
    return a.run.x;
}

exports.either = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Either, identity),
    'Identity (Applicative)': applicative.identity(λ)(Either, identity),
    'Composition (Applicative)': applicative.composition(λ)(Either, identity),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Either, identity),
    'Interchange (Applicative)': applicative.interchange(λ)(Either, identity),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Either.of, identity),
    'Identity (Functor)': functor.identity(λ)(Either.of, identity),
    'Composition (Functor)': functor.composition(λ)(Either.of, identity),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Either, identity),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Either, identity),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Either, identity),
    'Associativity (Monad)': monad.associativity(λ)(Either, identity),

    'when creating Left and calling swap should be Right': λ.check(
        function(a) {
            return λ.equals(Either.Left(a).swap())(Either.Right(a));
        },
        [λ.AnyVal]
    ),
    'when creating Right and calling swap should be Left': λ.check(
        function(a) {
            return λ.equals(Either.Right(a).swap())(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Left and calling concat with Right should return correct value': λ.check(
        function(a) {
            return λ.equals(Either.Left(a).concat(Either.Right(a)))(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Left and calling concat with Left should return correct value': λ.check(
        function(a) {
            return λ.equals(Either.Left(a).concat(Either.Left(a)))(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Right and calling concat with Left should return correct value': λ.check(
        function(a) {
            return λ.equals(Either.Right(a).concat(Either.Left(a)))(Either.Left(a));
        },
        [λ.AnyVal]
    ),
    'when creating Right and calling concat with Right should return correct value': λ.check(
        function(a) {
            return Either.Right(a).concat(Either.Right(a)).r === Either.Right(a.concat(a)).r;
        },
        [String]
    ),
    'when creating Left and calling bimap should return correct value': λ.check(
        function(a) {
            return λ.equals(Either.Left(a).bimap(λ.inc, λ.badRight))(Either.Left(λ.inc(a)));
        },
        [Number]
    ),
    'when creating Right and calling bimap should return correct value': λ.check(
        function(a) {
            return λ.equals(Either.Right(a).bimap(λ.badLeft, λ.inc))(Either.Right(λ.inc(a)));
        },
        [Number]
    ),
    'when testing traverse with Right should return correct value': λ.check(
        function(a) {
            return a.traverse(Identity.of, Identity).x === a.r;
        },
        [λ.rightOf(Number)]
    ),
    'when testing sequence with Right should return correct type': λ.check(
        function(a) {
            return λ.isIdentity(a.sequence());
        },
        [λ.rightOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Right should return correct nested type': λ.check(
        function(a) {
            return λ.isRight(a.sequence().x);
        },
        [λ.rightOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Right should return correct value': λ.check(
        function(a) {
            return a.sequence().x.r === a.r.x;
        },
        [λ.rightOf(λ.identityOf(Number))]
    ),
    'when testing traverse with Left should return correct value': λ.check(
        function(a) {
            return a.traverse(identity, Identity).x.l === a.l;
        },
        [λ.leftOf(Number)]
    ),
    'when testing sequence with Left should return correct type': λ.check(
        function(a) {
            return λ.isIdentity(a.sequence());
        },
        [λ.leftOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Left should return correct nested type': λ.check(
        function(a) {
            return λ.isLeft(a.sequence().x);
        },
        [λ.leftOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Left should return correct value': λ.check(
        function(a) {
            return a.sequence().x.l.x === a.l.x;
        },
        [λ.leftOf(λ.identityOf(Number))]
    )
};

exports.eitherT = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Either.EitherT(Identity), run),
    'Identity (Applicative)': applicative.identity(λ)(Either.EitherT(Identity), run),
    'Composition (Applicative)': applicative.composition(λ)(Either.EitherT(Identity), run),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Either.EitherT(Identity), run),
    'Interchange (Applicative)': applicative.interchange(λ)(Either.EitherT(Identity), run),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Either.EitherT(Identity).of, run),
    'Identity (Functor)': functor.identity(λ)(Either.EitherT(Identity).of, run),
    'Composition (Functor)': functor.composition(λ)(Either.EitherT(Identity).of, run),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Either.EitherT(Identity), run),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Either.EitherT(Identity), run),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Either.EitherT(Identity), run),
    'Associativity (Monad)': monad.associativity(λ)(Either.EitherT(Identity), run)
};
