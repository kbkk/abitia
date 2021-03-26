export type Left<T> = {
    readonly _tag: 'left';
    readonly left: T;
}

export type Right<T> = {
    readonly _tag: 'right';
    readonly right: T;
}

export type Either<T1, T2> = Left<T1> | Right<T2>;

export const left = <T>(e: T): Left<T> => ({ _tag: 'left', left: e });

export const right = <T>(e: T): Right<T> => ({ _tag: 'right', right: e });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertLeft<T>(e: Either<T, any>): asserts e is Left<T> {
    if(e._tag !== 'left') {
        throw new Error('Expected a Left Either');
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertRight<T>(e: Either<any, T>): asserts e is Right<T> {
    if(e._tag !== 'right') {
        throw new Error('Expected a Right Either');
    }
}

export const match = <T1, T2, R1, R2>(
    either: Either<T1, T2>,
    onLeft: (value: T1) => R1,
    onRight: (value: T2) => R2,
): R1 | R2 => {
    if(either._tag === 'left') {
        return onLeft(either.left);
    } else {
        return onRight(either.right);
    }
};
