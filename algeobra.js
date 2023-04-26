// Copyright 2023 sibaku

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";


/**
 * @module algeobra
 */
/**
 * Merges all properties of source recursively into target
 * @param {Object} target 
 * @param {Object} source 
 * @returns target
 */
function mergeObjectInto(target, source) {
    const assignables = [[target, source]];

    const isObject = o => (o && typeof o === 'object' && !Array.isArray(o));
    while (assignables.length > 0) {
        // target needs to be an object to be assignable
        const [targetLocal, sourceLocal] = assignables.pop();

        if (!isObject(targetLocal) || !isObject(sourceLocal)) {
            continue;
        }

        for (const key of Object.keys(sourceLocal)) {
            const val = sourceLocal[key];

            if (isObject(val)) {

                // assign key, if it doesn't exist
                if (!targetLocal[key]) {
                    Object.assign(targetLocal, {
                        [key]: {}
                    });
                }
                // we need to go down
                assignables.push([targetLocal[key], val]);

            } else {
                // assign non object directly
                Object.assign(targetLocal, { [key]: val })
            }
        }
    }

    return target;
}

/**
 * Creates a new object from a base with another object being merged into it.
 * Properties specified in properties overwrite the base
 * @param {Object} base 
 * @param {Object} properties 
 * @returns {Object}
 */
function createFromTemplate(base, properties) {
    const s = mergeObjectInto({}, base);

    return mergeObjectInto(s, properties);
}

/**
 * Grouping of basic 2D vector operations
 */
class Vec2 {
    /**
 * Create an object that can be treated as a 2D vector
 * @param {Number} x 
 * @param {Number} y 
 * @returns {{x:Number, y:Number}} A 2D vector
 */
    static vec2(x = 0, y = 0) {
        return { x, y };
    }
    /**
     * Adds two vector like objects
     * @param {{x:Number, y:Number}} a 
     * @param {{x:Number, y:Number}} b 
     * @returns {{x:Number, y:Number}} a+b
     */
    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    /**
     * Subtracts two vector like objects
     * @param {{x:Number, y:Number}} a 
     * @param {{x:Number, y:Number}} b 
     * @returns {{x:Number, y:Number}} a+b
     */
    static sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    /**
     * Adds a vector like object by a scalar
     * @param {{x:Number, y:Number}} a 
     * @param {Number} b 
     * @returns {{x:Number, y:Number}} a*v
     */
    static scale(a, v) {
        return { x: a.x * v, y: a.y * v };
    }
    /**
     * Multiplies two vector like objects component-wise
     * @param {{x:Number, y:Number}} a 
     * @param {{x:Number, y:Number}} b 
     * @returns {{x:Number, y:Number}} Component-wise multiplication of a and b
     */
    static cwiseMult(a, b) {
        return { x: a.x * b.x, y: a.y * b.y };
    }
    /**
     * Divides two vector like objects component-wise
     * @param {{x:Number, y:Number}} a 
     * @param {{x:Number, y:Number}} b 
     * @returns {{x:Number, y:Number}} Component-wise division of a and b
     */
    static cwiseDiv(a, b) {
        return { x: a.x / b.x, y: a.y / b.y };
    }

    /**
     * Rotates a vector by a given angle
     * @param {{x:Number, y:Number}} v The vector to rotate
     * @param {Number} alpha The angle around which to rotate
     * @param {Number} ca [Math.cos(alpha)] The cosine of alpha can be provided. If many points are rotated, this saves computing the cosine multiple times
     * @param {Number} sa [Math.sin(alpha)] he sine of alpha can be provided. If many points are rotated, this saves computing the sine multiple times
     * @returns {{x:Number, y:Number}} The rotated vector
     */
    static rotate(v, alpha, ca = Math.cos(alpha), sa = Math.sin(alpha)) {
        return {
            x: v.x * ca - v.y * sa,
            y: v.x * sa + v.y * ca
        };
    }
    /**
     * Computes the dot product of two vector like objects
     * @param {{x:Number, y:Number}} a 
     * @param {{x:Number, y:Number}} b 
     * @returns {Number} The dot product
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    /**
     * Computes the squared length of a vector like objects
     * @param {{x:Number, y:Number}} a 
     * @returns {Number} The squared length
     */
    static len2(a) {
        return a.x * a.x + a.y * a.y;
    }
    /**
     * Computes the length of a vector like objects
     * @param {{x:Number, y:Number}} a 
     * @returns {Number} The length
     */
    static len(a) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    }
    /**
     * Creates a 2D cartesian vector from its polar coordinates
     * @param {Number} r The radius
     * @param {Number} alpha The angle
     * @returns {{x:Number, y:Number}} The vector
     */
    static polar(r, alpha) {
        return { x: r * Math.cos(alpha), y: r * Math.sin(alpha) };
    }
    /**
     * Creates a new normalized vector
     * @param {{x:Number, y:Number}} v The vector to normalized
     * @returns {{x:Number, y:Number}} The normalized vector
     */
    static normalize(v) {
        return Vec2.scale(v, 1.0 / Vec2.len(v));
    }

    /**
     * Creates a new normalized vector, if the vector is not zero, otherwise does not change the values
     * @param {{x:Number, y:Number}} v The vector to normalized
     * @param {Number} eps [1E-10] The epsilon to check whether a vector is approximately zero or not
     * @returns {{x:Number, y:Number}} The normalized vector
     */
    static normalizeIfNotZero(v, eps = 1E-10) {
        const v2 = Vec2.len2(v);

        if (v2 > eps) {
            v = Vec2.scale(v, 1.0 / Math.sqrt(v2));
        }

        return v;
    }

    /**
     * Computes the linear interpolation (1-t)*a + t*b
     * @param {{x:Number, y:Number}} a 
     * @param {{x:Number, y:Number}} b 
     * @param {Number} t 
     * @returns {{x:Number, y:Number}} The linearly interpolated vector
     */
    static lerp(a, b, t) {
        const ti = 1 - t;
        return Vec2.add(
            Vec2.scale(a, ti),
            Vec2.scale(b, t)
        );
    }

    /**
     * Computes the normal [-y,x] for the given vector [x,y]
     * @param {{x:Number, y:Number}} v The input vector
     * @returns {{x:Number, y:Number}} The normal
     */
    static normal2D(v) {
        return { x: -v.y, y: v.x };
    }
}

// Use a different name vor Vec2 static methods to make them easier to write
const {
    vec2: vVec2,
    add: vAdd,
    sub: vSub,
    scale: vScale,
    cwiseMult: vCwiseMult,
    cwiseDiv: vCwiseDiv,
    rotate: vRotate,
    dot: vDot,
    len2: vLen2,
    len: vLen,
    polar: vPolar,
    normalize: vNormalize,
    normalizeIfNotZero: vNormalizeIfNotZero,
    lerp: vLerp,
    normal2D: normal2D,
} = Vec2;

/**
 * Grouping of complex number functions.
 * Complex numbers are represented as 2-element arrays for simplicity, so this is not its own type 
 */
class Complex {
    /**
 * Simple complex number representation as an array with two components.
 * The first component is the real and the second the imaginary part.
 * So the number a + bi is represented as [a,b]
 * @param {Number} a The real component
 * @param {Number} b The imaginary component
 * @returns {Number[]} The imaginary number as entries [a,b]
 */
    static num(a = 0, b = 0) {
        return [a, b];
    }
    /**
     * Adds two complex numbers
     * @param {Number[]} z0 The first number
     * @param {Number[]} z1 The second number
     * @returns {Number[]} The imaginary number as entries [a,b]
     */
    static add(z0, z1) {
        return [z0[0] + z1[0], z0[1] + z1[1]];
    };
    /**
     * Subtracts two complex numbers
     * @param {Number[]} z0 The first number
     * @param {Number[]} z1 The second number
     * @returns {Number[]} The imaginary number as entries [a,b]
     */
    static sub(z0, z1) {
        return [z0[0] - z1[0], z0[1] - z1[1]];
    };
    /**
     * Multiplies two complex numbers
     * @param {Number[]} z0 The first number
     * @param {Number[]} z1 The second number
     * @returns {Number[]} The imaginary number as entries [a,b]
     */
    static mult(z0, z1) {
        return [z0[0] * z1[0] - z0[1] * z1[1], z0[0] * z1[1] + z0[1] * z1[0]];
    };
    /**
     * Divides two complex numbers
     * @param {Number[]} z0 The first number
     * @param {Number[]} z1 The second number
     * @returns {Number[]} The imaginary number as entries [a,b]
     */
    static div(z0, z1) {
        const [a, b] = z0;
        const [c, d] = z1;
        const denom = c * c + d * d;
        return [(a * c + b * d) / denom, (b * c - a * d) / denom];
    };
    /**
     * Computes the complex conjugate a - bi for the number a + bi
     * @param {Number[]} z The number
     * @returns {Number[]} The imaginary number as entries [a,b]
     */
    static conj(z) {
        return [z[0], -z[1]];
    };
    /**
     * Negates the complex number a + bi to give -a - bi
     * @param {Number[]} z The number
     * @returns {Number[]} The imaginary number as entries [a,b]
     */
    static neg(z) {
        return [-z[0], -z[1]];
    }
    /**
     * Computes the absolute value sqrt(a^2 + b^2) for the number a + bi
     * @param {Number[]} z The number
     * @returns {Number} The absolute value
     */
    static abs(z) {
        const [a, b] = z;
        return Math.sqrt(a * a + b * b);
    }
    /**
     * Computes the absolute value squared a^2 + b^2 for the number a + bi
     * @param {Number[]} z The number
     * @returns {Number} The absolute value squared
     */
    static abs2(z) {
        const [a, b] = z;
        return a * a + b * b;
    }
    /**
     * Checkes, whether two complex numbers are approximately equal
     * @param {Number[]} z0 The first number
     * @param {Number[]} z1 The second number
     * @param {Number} eps [1E-10] The epsilon value to check for approximate equality
     * @returns {Boolean} True, if the two numbers are approximately equal, false otherwise
     */
    static equals(z0, z1, eps = 1E-10) {
        return Complex.abs(Complex.sub(z0, z1)) < eps;
    }
    /**
     * Extracts the real part a of the number a + bi
     * @param {Number[]} z The number
     * @returns {Number} The real component
     */
    static real(z) { return z[0]; };
    /**
     * Extracts the imaginary part b of the number a + bi
     * @param {Number[]} z The number
     * @returns {Number} The imaginary component
     */
    static imag(z) { return z[1]; };

    /**
     * Computes the principal square root sign(b) * sqrt(a + bi) of the complex number a + bi
     * @param {Number[]} z The number
     * @returns {Number} The real component
     */
    static sqrt(z) {
        const r = Complex.abs(z);
        const [a, b] = z;
        const s = b < 0 ? -1 : 1;

        return Complex.num(
            Math.sqrt((r + a) * 0.5),
            s * Math.sqrt((r - a) * 0.5)
        );
    }
}

// Use different names for the Complex static methods to make them easier to write
const {
    num: cNum,
    add: cAdd, sub: cSub,
    mult: cMult, div: cDiv,
    conj: cConj, neg: cNeg,
    abs: cAbs, abs2: cAbs2,
    equals: cEquals,
    real: cReal, imag: cImag,
    sqrt: cSqrt
} = Complex;



class Roots {

    /**
     * Computes the real solutions to ax + b  = 0
     * @param {Number} a linear coefficient
     * @param {Number} b constant coefficient
     */
    static solveLinear(a, b, eps = 1E-10) {
        if (Math.abs(a) < eps) {
            return [];
        }
        return [-b / a];
    }
    /**
     * Computes the real solutions to ax^2 + bx + c = 0
     * @param {Number} a quadratic coefficient
     * @param {Number} b linear coefficient
     * @param {Number} c constant coefficient
     * @returns {Number[]} An array containing all real roots
     */
    static solveQuadratic(a, b, c, eps = 1E-10) {
        if (Math.abs(a) < eps) {
            // linear
            return Roots.solveLinear(b, c, eps);
        }
        let discr = b * b - 4 * a * c;
        if (discr < -eps) {
            return [];
        }
        discr = Math.max(0, discr);
        if (discr < eps) {
            // discriminant = 0
            return [-b / (2 * a)];
        }

        const root = Math.sqrt(discr);
        return [(-b + root) / (2 * a), (-b - root) / (2 * a)];
    }
    /**
     * Computes the complex solutions to ax^2 + bx + c = 0 with real coefficients
     * @param {Number} a quadratic coefficient
     * @param {Number} b linear coefficient
     * @param {Number} c constant coefficient
     * @returns {Number[]} An array containing all real roots
     */
    static solveQuadraticComplex(a, b, c, eps = 1E-10) {
        if (Math.abs(a) < eps) {
            // linear
            return Roots.solveLinear(b, c, eps).map(v => cNum(v));
        }
        let discr = b * b - 4 * a * c;
        if (discr < -eps) {
            // complex roots
            const bd2a = b / (2 * a);
            const real = -bd2a;
            const imag = Math.sqrt(Math.abs(bd2a * bd2a - c / a))
            return [cNum(real, imag), cNum(real, -imag)];
        }
        discr = Math.max(0, discr);
        if (Math.abs(discr) < eps) {
            // discriminant = 0
            return [cNum(-b / (2 * a))];
        }

        const root = Math.sqrt(discr);
        return [(-b + root) / (2 * a), (-b - root) / (2 * a)];
    }

    /**
     * Computes the complex solutions to ax^3 + bx^2 + cx + d = 0  with real coefficients
     * @param {Number} A cubic coefficient
     * @param {Number} B quadratic coefficient
     * @param {Number} C linear coefficient
     * @param {Number} D constant coefficient
     * @param {Number} eps [1E-10] The epsilon value to use in comparisons
     * @returns {Array<Number[]>} The three complex roots
     */
    static solveCubicComplex(A, B, C, D, eps = 1E-10) {
        if (Math.abs(A) < eps) {
            // quadratic
            return Roots.solveQuadraticComplex(B, C, D, eps);
        }

        // following https://www.mosismath.com/Cardano/Cardano.html


        // normalize, such that cubic coefficient is 1
        // x^3 + a'x^2 + b'x + c' = 0
        const a = B / A;
        const b = C / A;
        const c = D / A;

        // convert to canonical cubic
        // y^3 + py + q = 0
        const p = b - a * a / 3;
        const q = 2 * a * a * a / 27 - a * b / 3 + c;

        // check type of root
        let d = p * p * p / 27 + q * q / 4;
        if (d > eps) {
            // one real root
            const DRoot = Math.sqrt(d);
            const u0 = Math.cbrt(-q / 2 + DRoot);
            const v0 = Math.cbrt(-q / 2 - DRoot);

            const y0 = u0 + v0;
            const x0 = cNum(y0 - a / 3);

            const x1 = cNum(-(u0 + v0) / 2 - a / 3, Math.sqrt(3.0) / 2 * (u0 - v0));
            const x2 = cConj(x1);

            return [x0, x1, x2];;
        }

        // double root
        if (Math.abs(d) < eps) {
            const u0 = Math.cbrt(-q / 2);
            const v0 = u0;

            const y0 = u0 + v0;
            const y1 = -(u0 + v0) * 0.5;

            const x0 = cNum(y0 - a / 3);
            const x1 = cNum(y1 - a / 3);
            // double
            return [x0, x1, x1];
        }

        // three real roots -> causus irreducibilis
        d = Math.min(d, 0.0);
        const r = Math.sqrt(-p * p * p / 27);
        const DMRoot = Math.sqrt(-d);
        // get correct quadrant
        const alpha = Math.atan2(DMRoot, -q / 2);

        const rCubeRoot = Math.cbrt(r);
        const x0 = rCubeRoot * (Math.cos(alpha / 3) + Math.cos((6 * Math.PI - alpha) / 3)) - a / 3;
        const x1 = rCubeRoot * (Math.cos((2 * Math.PI + alpha) / 3) + Math.cos((4 * Math.PI - alpha) / 3)) - a / 3;
        const x2 = rCubeRoot * (Math.cos((4 * Math.PI + alpha) / 3) + Math.cos((2 * Math.PI - alpha) / 3)) - a / 3;

        return [cNum(x0), cNum(x1), cNum(x2)];
    }

    /**
     * Computes the four complex solutions to the biquadratic quartic x^4 + px^2 + r = 0  with real coefficients
     * @param {Number} p The first coefficient
     * @param {Number} r The second coefficient
     * @param {Number} eps [1E-10] The epsilon value to use in comparisons
     * @returns {Array<Number[]>} The roots
     */
    static solveBiquadraticQuarticComplex(p, r, eps = 1E-10) {
        // x^4 + px^2 + r = 0

        // general formulas 
        // x_{1,2} = +- sqrt((-p + sqrt(p^2 - 4r))/2)
        // x_{1,2} = +- sqrt((-p - sqrt(p^2 - 4r))/2)

        // make it complex to handle all cases directly
        // easier to read/implement
        const discr = cNum(p * p - 4 * r);

        const z0 = cSqrt(cMult(cAdd(cNum(-p), cSqrt(discr)), cNum(0.5)));
        const z1 = cSqrt(cMult(cSub(cNum(-p), cSqrt(discr)), cNum(0.5)));

        return [z0, cNeg(z0), z1, cNeg(z1)];
    }

    /**
     * Computes the four complex solutions to the depressed quartic x^4 + p x^2 + q x + r = 0  with real coefficients
     * @param {Number} p The first coefficient
     * @param {Number} q The second coefficient
     * @param {Number} r The third coefficient
     * @param {Number} eps [1E-10] The epsilon value to use in comparisons
     * @returns {Array<Number[]>} The roots
     */
    static solveDepressedQuarticComplex(p, q, r, eps = 1E-10) {
        // y^4 + p y^2 + q y + r = 0

        const cz = v => Math.abs(v) < eps ? 0 : v;
        p = cz(p);
        q = cz(q);
        r = cz(r);

        // paper theorem 1:
        // p = q = r = 0 => all roots are the same and zero (in the depressed quartic, will be adjusted by -b/4a)
        if (p === 0 && q === 0 && r === 0) {
            // check for equality since we gatherd the epsilon surroundings
            return [cNum(0), cNum(0), cNum(0), cNum(0)];
        }

        if (Math.abs(q) < eps) {
            // biquadratic
            // We could classify this as a special type of biquadratic following the paper, but the general biquadratic solution seems good enough
            return Roots.solveBiquadraticQuarticComplex(p, r, eps);
        }


        // if p = q = r = 0 => S is empty
        let S = [];
        let alpha_s = 0;

        let s = cNum(0);
        let sabs = 0;
        // clamp parameters to zero


        // this could probably avoided by checking all the cases, but this will make it easier to read
        S = Roots.solveCubicComplex(1, 2 * p, p * p - 4 * r, -q * q, eps);

        // find non-zero root
        // From the paper, there will always be non-zero roots here
        // taking the largest one will keep sqrt(s) away from 0, thus making 1/sqrt(s) hopefully more well behaved
        for (let root of S) {
            const rabs = cAbs(root);
            if (rabs > eps && rabs > sabs) {
                // non zero root
                alpha_s = cDiv(cNum(-2 * q), cSqrt(root));
                s = root;
                sabs = rabs;
            }
        }

        // general root formula
        // (xi sqrt(s) +- sqrt(xi alpha_s - 2p - s))/2
        // x = +-1
        // s in S
        const result = [];

        {
            const xi = cNum(1);
            let discr = cSub(cSub(cMult(xi, alpha_s), cNum(2 * p)), s);

            let xb = cMult(xi, cSqrt(s));
            let x0 = cAdd(xb, cSqrt(discr));
            x0 = cMult(x0, cNum(0.5));
            let x1 = cSub(xb, cSqrt(discr));
            x1 = cMult(x1, cNum(0.5));

            result.push(x0, x1);
        }
        {
            const xi = cNum(-1);
            let discr = cSub(cSub(cMult(xi, alpha_s), cNum(2 * p)), s);

            let xb = cMult(xi, cSqrt(s));
            let x0 = cAdd(xb, cSqrt(discr));
            x0 = cMult(x0, cNum(0.5));
            let x1 = cSub(xb, cSqrt(discr));
            x1 = cMult(x1, cNum(0.5));

            result.push(x0, x1);
        }


        return result;
    }

    /**
     * Computes the four complex solutions to the depressed quartic a x^4 + b x^3 + c x^2 + d x + e = 0  with real coefficients
     * @param {Number} a The first coefficient
     * @param {Number} b The second coefficient
     * @param {Number} c The third coefficient
     * @param {Number} d The fourth coefficient
     * @param {Number} e The fifth coefficient
     * @param {Number} eps [1E-10] The epsilon value to use in comparisons
     * @returns {Array<Number[]>} The roots
     */
    static solveQuarticComplex(a, b, c, d, e, eps = 1E-10) {
        if (Math.abs(a) < eps) {
            return Roots.solveCubicComplex(b, c, d, e, eps);
        }
        // general solution given in "A Complete Review of the General Quartic Equation with Real Coefficients and Multiple Roots" by Chávez-Pichardo et al.
        // NOTE: This could be further amended to check the various cases given in the paper
        // We only handle the biquadratic case separately and use complex arithmetic

        // depressed quartic
        // y^4 + p y^2 + q y + r = 0

        // p = (8ac - 3b^2)/(8a^2)
        const p = (8 * a * c - 3 * b * b) / (8 * a * a);
        // q = (b^3 - 4abc + 8a^2d)/(8a^3)
        const q = (b * b * b - 4 * a * b * c + 8 * a * a * d) / (8 * a * a * a);
        // r = (16ab^2c -64a^2bd - 3b^4 + 256a^3e)/(256a^4)
        const r = (16 * a * b * b * c - 64 * a * a * b * d - 3 * b * b * b * b + 256 * a * a * a * e) / (256 * a * a * a * a);

        const roots = Roots.solveDepressedQuarticComplex(p, q, r, eps);

        // reconvert solutions to x
        // root y_0 => x_0 = y_0 - b/(4a)
        const result = [];
        for (const root of roots) {
            result.push(cSub(root, cNum(b / (4 * a))));
        }
        return result;
    }
}

// Extract static methods to make it easier to write
const {
    solveLinear,
    solveQuadratic,
    solveCubicComplex,
    solveBiquadraticQuarticComplex,
    solveDepressedQuarticComplex,
    solveQuarticComplex,
} = Roots;


/**
 * Type specifier for a boolean type
 */
const TYPE_BOOLEAN = "boolean";
/**
 * Type specifier for a number type
 */
const TYPE_NUMBER = "number";
/**
 * Type specifier for an angle type
 */
const TYPE_ANGLE = "angle";
/**
 * Type specifier for a point type
 */
const TYPE_POINT = "point";
/**
 * Type specifier for a polar coordinate type
 */
const TYPE_POLAR = "polar";
/**
 * Type specifier for a vector type
 */
const TYPE_VECTOR = "vector";
/**
 * /**
 * Type specifier for a coordinate system type
 */
const TYPE_COORD_SYSTEM = "coordSystem";
/**
 * Type specifier for a line type
 */
const TYPE_LINE = "line";
/**
 * Type specifier for a line strip type
 */
const TYPE_LINE_STRIP = "lineStrip";
/**
 * Type specifier for a polygon type
 */
const TYPE_POLYGON = "polygon";
/**
 * Type specifier for an arc type
 */
const TYPE_ARC = "arc";
/**
 * Type specifier for a ellipse type
 */
const TYPE_ELLIPSE = "ellipse";
/**
 * Type specifier for a Bezier curve type
 */
const TYPE_BEZIER = "bezier";
/**
 * Type specifier for a Bezier spline type
 */
const TYPE_BEZIER_SPLINE = "bezSpline";
/**
 * Type specifier for a text type
 */
const TYPE_TEXT = "text";

/**
 * Specifies an INVALID value
 * This could be something like the intersection of objects that do not intersect
 */
const INVALID = Object.create({});
/**
 * Specifies an optional dependency
 * These allows to leave out some values and for example use default values instead
 */
const EMPTY = Object.create({ type: "NONE" });

/**
 * Checkes, whether a parameter is valid
 * @param {*} value The value to check
 * @returns True, if the value is not INVALID, false otherwise
 */
function isParamValid(value) {
    return value !== INVALID;
}
/**
 * Checkes, whether a parameter is empty
 * @param {*} value The value to check
 * @returns True, if the value is EMPTY, false otherwise
 */
function isParamEmpty(value) {
    return value === EMPTY;
}

/**
 * Checks whether all given dependencies exist and are not EMPTY. If any dependency does not satisfy this condition, an exception is thrown
 * @param  {...any} dependencies Dependencies to check
 */
function assertExistsAndNotOptional(...dependencies) {
    for (let d of dependencies) {
        if (!d || isParamEmpty(d)) {
            throw new Error(`Expected existing parameter, got ${JSON.stringify(d)}`);
        }
    }
}


/**
 * Container for information used in object definitions
 */
class CreateInfo {


    /**
     * 
     * @param {String} name The name of the create struct. Only needs to be unique per definition type
     * @param {Array|Object} dependencies The objects the definition depends on. Might be an array or an object as a table (only key->val pairs)
     *  The keys of the dependencies will be replicated for consumption in definitions.
     *  When creating the definitions, the values should be the indices gained from the GeometryScene object or EMPTY, if the specific dependency is optional.
     *  Definitions will receve a CreateInfo like object containing the same keys as the one specified at the beginning, but filled with the requested dependencies.
     *  One may also fill a CreateInfo with values instead of index handles themselves and pass them to the compute method of a definition
     * @param {Array|Object} params Any parameters that are not dependant on the scene, but instead provide additional information for a specific construction method
     * @param {Boolean} ignoreInvalids Specifies, whether INVALID values are ignored, when gathering dependencies. 
     *  Generally, a definition can only be valid, if its dependencies are valid. Sometimes, it might be useful to use INVALID inputs anyways. 
     * For example, when gathering the results of multiple intersections, which might not all be defined. This way, INVALID parts can just be filtered out
     */
    constructor(name, dependencies = {}, params = {}, ignoreInvalids = false) {
        this.name = name;
        this.dependencies = dependencies;
        this.params = params;
        this.ignoreInvalids = ignoreInvalids;
    }

    /**
     * Create a new CreatInfo instance
     * @param {String} name The name of the create struct. Only needs to be unique per definition type
     * @param {Array|Object} dependencies The objects the definition depends on. Might be an array or an object as a table (only key->val pairs)
     *  The keys of the dependencies will be replicated for consumption in definitions.
     *  When creating the definitions, the values should be the indices gained from the GeometryScene object or EMPTY, if the specific dependency is optional.
     *  Definitions will receve a CreateInfo like object containing the same keys as the one specified at the beginning, but filled with the requested dependencies.
     *  One may also fill a CreateInfo with values instead of index handles themselves and pass them to the compute method of a definition
     * @param {Array|Object} params Any parameters that are not dependant on the scene, but instead provide additional information for a specific construction method
     * @param {Boolean} ignoreInvalids Specifies, whether INVALID values are ignored, when gathering dependencies. 
     *  Generally, a definition can only be valid, if its dependencies are valid. Sometimes, it might be useful to use INVALID inputs anyways. 
     * For example, when gathering the results of multiple intersections, which might not all be defined. This way, INVALID parts can just be filtered out
     * @returns A new CreateInfo instance
     */
    static new(name, dependencies = {}, params = {}, ignoreInvalids = false) {
        return new CreateInfo(name, dependencies, params, ignoreInvalids);
    }
}

/**
 * Fixed value to specify explicitely, that a definition does not need any additional information
 */
const EMPTY_INFO = new CreateInfo("empty_info");


/**
 * Calculates the bezier parameter(s) of a point on a Bezier curve.
 * This will compute the exact solutions (modulo numerical issues) and so is only defined for curves up to degree 4
 * @param {{x:Number, y:Number}} p The point to find the parameter for
 * @param {Array<{x:Number, y:Number}>} points The control points
 * @param {Number} eps [1E-10] The epsilon value to use in comparisons
 * @returns {Number[]} The parameters that result in the given points, might be empty or contain multiple possible solutions
 */
function calcBezierParameterOfPoint(p, points, eps = 1E-10) {
    // we will go go the following route, which works up until degree 4!
    // compute q(t) - p = 0
    // this will give two coupled equations
    // we will solve each independently, get all real roots and check if there are shared ones

    // while there might be smarter methods, this one is easy to write down
    const deg = points.length - 1;
    if (deg < 1) {
        // empty or singular -> no solution
        return [];
    }

    let rootsX = [];
    let rootsY = [];

    const filterReal = a => a.filter(z => Math.abs(cImag(z)) < eps).map(z => cReal(z));
    if (deg === 1) {
        // line -> linear equation
        const [p0, p1] = points;
        // q(t) = (1-t) p_0 +  t p_1 = t (p_1 - p_0) + p_0 = t q_1 + q_0
        // solve q(t) - p = 0 => t q_1 + q_0 - p
        const q1 = vSub(p1 - p0);
        const q0 = p0;
        const tx = solveLinear(q1.x, q0.x - p.x, eps);
        const ty = solveLinear(q1.y, q0.y - p.y, eps);
        rootsX = tx;
        rootsY = ty;
    } else if (deg === 2) {
        // quadratic curve
        const [q0, q1, q2] = convertQuadraticBezierToParamBase(...points);
        // q(t) = t^2 q_2 + t q_1 + q_0
        // solve q(t) - p = 0 => t^2 q_2 + t q_1 + q_0 - p
        const tx = solveQuadratic(q2.x, q1.x, q0.x - p.x);
        const ty = solveQuadratic(q2.y, q1.y, q0.y - p.y);
        rootsX = tx;
        rootsY = ty;
    } else if (deg === 3) {
        // cubic curve
        const [q0, q1, q2, q3] = convertCubicBezierToParamBase(...points);
        const tx = solveCubicComplex(q3.x, q2.x, q1.x, q0.x - p.x);
        const ty = solveCubicComplex(q3.y, q2.y, q1.y, q0.y - p.y);

        // get only real solutions
        rootsX = filterReal(tx);
        rootsY = filterReal(ty);
    } else if (deg === 4) {
        // quartic curve
        const [q0, q1, q2, q3, q4] = convertQuarticBezierToParamBase(...points);
        const tx = solveQuarticComplex(q4.x, q3.x, q2.x, q1.x, q0.x - p.x);
        const ty = solveQuarticComplex(q4.y, q3.y, q2.y, q1.y, q0.y - p.y);

        // get only real solutions
        rootsX = filterReal(tx);
        rootsY = filterReal(ty);
    }

    // try to find common roots
    const result = [];
    for (const rx of rootsX) {
        for (const ry of rootsY) {
            if (Math.abs(rx - ry) < eps) {
                // check validity
                if (rx >= 0 && rx <= 1) {
                    result.push(rx);
                }
            }
        }
    }

    return result;
}

/**
 * Calculates the Bezier curve that is the derivative of the given one
 * @param {Array<{x:Number, y:Number}>} points The control points
 * @returns {Array<{x:Number, y:Number}>} The derivative curve
 */
function calcBezierPointsDerivative(points) {
    const qs = [];
    const n = points.length - 1;
    for (let i = 0; i < n; i++) {
        qs.push(vScale(vSub(points[i + 1], points[i]), n));
    }
    return qs;
}

/**
 * Computes a point on a Bezier curve using the de Castlejau algorithm
 * @param {{Array<{x:Number, y:Number}>}} points The control points
 * @param {Number} t The curve parameter
 * @returns {{x:Number, y:Number}} The point on the curve
 */
function deCastlejau(points, t) {
    // to override values
    points = [...points];
    const n = points.length - 1;
    for (let j = 1; j <= n; j++) {
        for (let i = 0; i <= n - j; i++) {
            points[i] = vLerp(points[i], points[i + 1], t);
        }
    }

    return points[0];
}

/**
 * Creates two new sets of control points, such that the left set creates the given Bezier curve up to the parameter t, while the right set creates the rest of the original curve.
 * @param {{Array<{x:Number, y:Number}>}} points The control points
 * @param {Number} t The curve parameter
 * @returns {{left: Array<{x:Number, y:Number}>, right: Array<{x:Number, y:Number}>}} The subdivided curve control points
 */
function subdivideBezierControlPoints(points, t) {
    // to override values
    points = [...points];
    if (points.length === 1) {
        return { left: points, right: points };
    }
    const left = [points[0]];
    const right = [points[points.length - 1]];
    const n = points.length - 1;
    for (let j = 1; j <= n; j++) {
        for (let i = 0; i <= n - j; i++) {
            points[i] = vLerp(points[i], points[i + 1], t);
        }
        left.push(points[0]);
        right.push(points[n - j]);
    }

    return { left, right: right.reverse() };
}

/**
 * Computes the control points for a Bezier curve of the same degree as the given one that starts and ends at the given parameters of the original curve.
 * @param {{Array<{x:Number, y:Number}>}} points The control points
 * @param {Number} t0 The lower curve parameter in [0,1]
 * @param {Number} t1 The upper curve parameter in [0,1]
 * @returns {{Array<{x:Number, y:Number}>}} The new control points
 */
function subintervalBezierControlPoints(points, t0, t1) {
    // divide for upper t
    ({ left: points } = subdivideBezierControlPoints(points, t1));
    // reparametrize lower t
    let t = t0 / t1;
    ({ right: points } = subdivideBezierControlPoints(points, t));
    return points;
}

/**
 * Subdivides a Bezier curve in such a way, that the points can be drawn as line segments that do not differ more from the curve than the given error parameter
 * @param {{Array<{x:Number, y:Number}>}} points The Bezier control points
 * @param {Number} [eps] Subdivision error parameter
 * @returns {{Array<{x:Number, y:Number}>}} The subdivided curve
 */
function subdivideBezierAdaptive(points, eps = 1) {
    if (points.length < 3) {
        return points;
    }
    const queue = [[points, 0, 1]];
    // we always draw the first point and each subdivision only adds its end
    const output = [points[0]];

    const eps2 = eps * eps;
    while (queue.length > 0) {
        const [p, tmin, tmax] = queue.pop();

        // check, if curve can be approximated by a line
        const p0 = p[0];
        // last point
        const pn = p[p.length - 1];
        const v = Vec2.sub(pn, p0);
        // we use the formulation dist^2 =  (q - p0)^2 - ((q-p0)* v)^2
        // here, v is normalized and the formulat follows from the pythagorean theorem, with the point distances being the hypotenuse, and the projection (second term) being tone of the sides, with the distance being the other
        // if v is zero and we just leave it as it is, then the second term will be zero and the formula reduces to a point distance
        const vn = Vec2.normalizeIfNotZero(v);

        let isLinear = true;
        for (let i = 1; i < p.length - 1; i++) {
            const q = p[i];
            const qp0 = Vec2.sub(q, p0);
            const proj = Vec2.dot(qp0, v);
            // point may lie outside of line interval, but is still on the infinite line
            if (proj < 0 || proj > 1) {
                isLinear = false;
                break;
            }

            // else check distance
            const d2 = Vec2.len2(qp0) - proj * proj;
            if (d2 > eps2) {
                isLinear = false;
                break;
            }
        }

        if (isLinear) {
            // can be approximated by a line
            // we only output the final point, since we already processed the beginning
            output.push(pn);
        } else {
            // subdivide
            const tmid = (tmin + tmax) * 0.5;
            const { left, right } = subdivideBezierControlPoints(p, tmid);
            // push right interval first, so left one is computed earlier
            queue.push([right, tmid, tmax]);
            queue.push([left, tmin, tmid]);
        }

    }

    return output;
}

/**
 * Creates a Boolean type object of type TYPE_BOOLEAN
 * Any object that has the following fields can be treated as a Boolean value:
 * { value: Boolean, type = TYPE_BOOLEAN }
 * @param {Boolean} value The value
 * @returns {{value : Boolean, type: String}}
 */
function makeBoolean(value = false) {
    return {
        value, type: TYPE_BOOLEAN
    };
}
/**
 * Creates a Number type object of type TYPE_NUMBER
 * Any object that has the following fields can be treated as a Number value:
 * { value: Number, type = TYPE_NUMBER }
 * @param {Number} value The value
 * @returns {{value : Number, type: String}}
 */
function makeNumber(value = 0) {
    return {
        value, type: TYPE_NUMBER
    };
}
/**
 * Creates a Point type object of type TYPE_POINT
 * Any object that has the following fields can be treated as a Point value:
 * { x: Number, y: Number, type = TYPE_POINT }
 * @param {Number} x The x coordinate
 * @param {Number} y The y coordinate
 * @param {*} rest Other fields that get included in the object
 * @returns {{x : Number, y : Number, type: String}}
 */
function makePoint({
    x = 0, y = 0, ...rest
} = {}) {
    return {
        x, y, ...rest, type: TYPE_POINT
    };
}
/**
 * Creates a Polar coordinate type object of type TYPE_POLAR
 * Any object that has the following fields can be treated as a Polar coordinate value:
 * { r: Number, alpha: Number, type = TYPE_POLAR }
 * @param {Number} r The r coordinate
 * @param {Number} alpha The alpha coordinate
 * @returns {{r : Number, alpha : Number, type: String}}
 */
function makePolarCoordinate({
    r = 1, alpha = 0
} = {}) {
    return {
        r, alpha, type: TYPE_POLAR
    };
}
/**
 * Creates a Vector type object of type TYPE_VECTOR
 * Any object that has the following fields can be treated as a Vector value:
 * { x: Number, y: Number, ref: {x:Number, y:Number}, type = TYPE_VECTOR }
 * @param {Number} x The x coordinate
 * @param {Number} y The y coordinate
 * @param {{x:Number, y:Number}} ref A point to which the vector attaches to
 * @returns {{x : Number, y : Number, ref: {x:Number, y:Number}, type: String}}
 */
function makeVector({
    x = 0,
    y = 0,
    ref = {
        x: 0,
        y: 0
    }
} = {}) {
    return {
        x, y, ref, type: TYPE_VECTOR
    };
}

/**
 * Creates a coordinate system type object of type TYPE_COORD_SYSTEM
 * Any object that has the following fields can be treated as a coordinate system value:
 * { origin: {x:Number, y:Number}, u: {x:Number, y:Number}, v: {x:Number, y:Number}, type = TYPE_COORD_SYSTEM }
 * @param {{x:Number, y:Number}} origin The origin
 * @param {{x:Number, y:Number}} u The first axis
 * @param {{x:Number, y:Number}} v The second axis
 * @returns {{origin : {x:Number, y:Number}, u : {x:Number, y:Number}, y: {x:Number, y:Number}, type: String}}
 */
function makeCoordinateSystem(origin, u, v) {
    return {
        origin, u, v, type: TYPE_COORD_SYSTEM
    };
}

/**
 * Creates an Angle type object of type TYPE_ANGLE
 * Any object that has the following fields can be treated as an Angle value:
 * { value: Number, value: Number, type = TYPE_ANGLE }
 * @param {Number} value The angle
 * @param {Number} start The angle at which this angle begins
 * @param {{x:Number, y:Number}} ref A point to which the angle attaches to
 * @returns {{value : Number, start: Number, ref: {x:Number, y:Number}, type: String}}
 */
function makeAngle({
    value = 0,
    start = 0,
    ref = {
        x: 0,
        y: 0
    }
} = {}) {
    value = normalizeAngle(value);
    start = normalizeAngle(start);
    return {
        value, start, ref, type: TYPE_ANGLE
    };
}

/**
 * Creates a Line type object of type TYPE_LINE
 * Any object that has the following fields can be treated as a Line value:
 * { {p0 : {x:Number, y:Number}, p1 : {x:Number, y:Number}, leftOpen : Boolean, rightOpen : Boolean, type = TYPE_LINE }
 * @param {{x:Number, y:Number}} p0 The first point
 * @param {{x:Number, y:Number}} p1 The second point
 * @param {Boolean} leftOpen Whether the line extends to infinity from the first point
 * @param {Boolean} rightOpen Whether the line extends to infinity from the second point
 * @returns {{p0 : {x:Number, y:Number}, p1 : {x:Number, y:Number}, leftOpen : Boolean, rightOpen : Boolean, type: String}}
 */
function makeLine({
    p0 = { x: 0, y: 0 },
    p1 = { x: 0, y: 0 },
    leftOpen = false,
    rightOpen = false
} = {}) {
    return {
        p0, p1,
        leftOpen, rightOpen,
        type: TYPE_LINE
    };
}

/**
 * Creates a Line strip type object of type TYPE_LINE_STRIP
 * Any object that has the following fields can be treated as a Line strip value:
 * { points : Array<{x:Number,y:Number}>, type = TYPE_LINE_STRIP }
 * @param {Array<{x:Number,y:Number}>} points The line strip points
 * @returns {{points : Array<{x:Number,y:Number}>, type: String}}
 */
function makeLineStrip({
    points = []
} = {}) {
    return {
        points,
        type: TYPE_LINE_STRIP
    };
}
/**
 * Creates a Polygon type object of type TYPE_POLYGON
 * Any object that has the following fields can be treated as a Polygon value:
 * { points : Array<{x:Number,y:Number}>, type = TYPE_POLYGON }
 * @param {Array<{x:Number,y:Number}>} points The polygon points
 * @returns {{points : Array<{x:Number,y:Number}>, type: String}}
 */
function makePolygon({
    points = []
} = {}) {
    return {
        points,
        type: TYPE_POLYGON
    };
}
/**
 * Creates a Bezier curve type object of type TYPE_BEZIER
 * Any object that has the following fields can be treated as a Bezier curve value:
 * { points : Array<{x:Number,y:Number}>, degree: Number, type = TYPE_BEZIER }
 * @param {Array<{x:Number,y:Number}>} points The Bezier control points
 * @returns {{points : Array<{x:Number,y:Number}>, degree: Number, type: String}}
 */
function makeBezier({
    points = []
} = {}) {
    return {
        points,
        degree: points.length - 1,
        type: TYPE_BEZIER
    };
}

/**
 * Creates a Bezier spline type object of type TYPE_BEZIER_SPLINE
 * Any object that has the following fields can be treated as a Bezier curve value:
 * { points : Array<{x:Number,y:Number}>, degree: Number, type = TYPE_BEZIER_SPLINE }
 * @param {Array<{x:Number,y:Number}>} points The Bezier control points
 * @param {Number} degree The degree for the spline. 
 * Each consecutive curve segment uses the last segment's endpoint as its start. So for a degree d curve, each new segment only needs to specify d new points
 * @returns {{points : Array<{x:Number,y:Number}>, degree: Number, type: String}}
 */
function makeBezierSpline({
    points, degree
} = {}) {
    return {
        points,
        degree,
        type: TYPE_BEZIER_SPLINE
    };
}
/**
 * Creates an Arc type object of type TYPE_ARC
 * Any object that has the following fields can be treated as an Arc value:
 * { center: {x:Number, y:Number}, r: Number, startAngle: Number, endAngle: Number, type = TYPE_ARC }
 * @param {{x:Number, y:Number}} center The center of the arc
 * @param {Number} rx The radius
 * @param {Number} startAngle The angle at which the arc begins (counterclockwise)
 * @param {Number} endAngle The angle at which the arc ends (counterclockwise)
 * @returns {{center: {x:Number, y:Number}, r: Number, startAngle: Number, endAngle: Number, type: String}}
 */
function makeArc({
    r = 1,
    startAngle = 0,
    endAngle = 2.0 * Math.PI,
    center = { x: 0, y: 0 }
} = {}) {
    return {
        r, startAngle, endAngle, center, type: TYPE_ARC
    };
}

/**
 * Creates an Ellipse type object of type TYPE_ELLIPSE
 * Any object that has the following fields can be treated as an Ellipse value:
 * { center: {x:Number, y:Number}, rx: Number, ry: Number, startAngle: Number, endAngle: Number, rotation: Number, type = TYPE_ELLIPSE }
 * @param {{x:Number, y:Number}} center The center of the ellipse
 * @param {Number} rx The eccentricity in local x-direction
 * @param {Number} ry The eccentricity in local y-direction
 * @param {Number} startAngle The angle at which the ellipse begins (counterclockwise)
 * @param {Number} endAngle The angle at which the ellipse ends (counterclockwise)
 * @param {Number} rotation The rotation angle of the ellipse (counterclockwise)
 * @returns {{center: {x:Number, y:Number}, rx: Number, ry: Number, startAngle: Number, endAngle: Number, rotation: Number, type: String}}
 */
function makeEllipse({
    center = { x: 0, y: 0 },
    rx = 1,
    ry = 1,
    startAngle = 0,
    endAngle = 2.0 * Math.PI,
    rotation = 0,
}) {
    return {
        center,
        rx,
        ry,
        startAngle,
        endAngle,
        rotation,
        type: TYPE_ELLIPSE
    };
}

/**
 * Creates a Text type object of type TYPE_TEXT
 * Any object that has the following fields can be treated as an Text value:
 * { text : String, ref: {x:Number, y:Number}, type = TYPE_TEXT }
 * @param {String} text The text
 * @param {{x:Number, y:Number}} ref A point to which the text attaches to
 * @returns {{text : String, ref: {x:Number, y:Number}, type: String}}
 */
function makeText({
    text = "",
    ref = { x: 0, y: 0 }
} = {}) {
    return {
        text, ref, type: TYPE_TEXT
    };
}

/**
 * Converts an object into readable text
 * @param {*} obj The object to stringify
 * @param {Object} params
 * @param {Number} params.maxDecimals maximum numbers of decimals to be used for numbers
 * @param {Object} params.formatter A formatter object to format numbers
 * @returns {String} The stringified object 
 */
function objectToString(obj, {
    maxDecimals = 2,
    formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals
    })
} = {}) {

    if (Array.isArray(obj)) {
        return `[${obj.map(v => objectToString(v)).join(", ")}]`;
    } else if (obj === EMPTY) {
        return "Empty";
    } else if (obj === INVALID) {
        return "Invalid";
    } else if (obj.type === TYPE_BOOLEAN) {
        return `${obj.value}`;
    }
    else if (obj.type === TYPE_NUMBER) {
        return formatter.format(obj.value);
    } else if (obj.type === TYPE_POINT) {
        return `Point(${formatter.format(obj.x)}, ${formatter.format(obj.y)})`;
    } else if (obj.type === TYPE_VECTOR) {
        return `Vector(${formatter.format(obj.x)}, ${formatter.format(obj.y)})`;
    } else if (obj.type === TYPE_ANGLE) {
        return `Angle(${formatter.format(rad2deg(obj.value))}°)`;
    } else if (obj.type === TYPE_LINE) {
        const leftOpen = obj.leftOpen ? "(" : "[";
        const rightOpen = obj.rightOpen ? ")" : "]";
        const { p0, p1 } = obj;
        return `Line${leftOpen} (${formatter.format(p0.x)}, ${formatter.format(p0.y)}), (${formatter.format(p1.x)}, ${formatter.format(p1.y)})${rightOpen} `;
    } else if (obj.type === TYPE_ARC) {
        let { center, r, startAngle, endAngle } = obj;
        startAngle = rad2deg(startAngle);
        endAngle = rad2deg(endAngle);
        return `Arc(${formatter.format(r)}, (${formatter.format(center.x)}, ${formatter.format(center.y)}), ${formatter.format(startAngle)}°,${formatter.format(endAngle)}°)`;
    } else if (obj.type === TYPE_TEXT) {
        return formatter.format(obj.text);
    }


    return obj.toString();
}

function normalizeAngle(angle) {
    const pi2 = 2.0 * Math.PI;
    // negative values round down -> 2pi gets added
    // also clamp to avoid boundary inaccuracies
    return Math.min(pi2, Math.max(0.0, angle - pi2 * Math.floor(angle / pi2)));
}

/**
 * Computes the angle of a vector
 * @param {Number} x The x coordinate
 * @param {Number} y The y coordinate
 * @returns The angle that the vector points to in [0,2pi]
 */
function calcAngle(x, y) {
    return normalizeAngle(Math.atan2(y, x));
}


/**
 * Checks, whether the given object is an infinite line
 * @param {Object} l TYPE_LINE object 
 * @returns True, if the parameter is an infinite line, false otherwise
 */
function isLine(l) {
    return l.type === TYPE_LINE && l.leftOpen && l.rightOpen;
}

/**
 * Checks, whether the given object is a one-sided infinite line
 * @param {Object} l TYPE_LINE object 
 * @returns True, if the parameter is a one-sided infinite line, false otherwise
 */
function isRay(l) {
    return l.type === TYPE_LINE && ((l.leftOpen && !l.rightOpen) || (!l.leftOpen && l.rightOpen));
}

/**
 * Checks, whether the given object is a line segment
 * @param {Object} l TYPE_LINE object 
 * @returns True, if the parameter is a line segment, false otherwise
 */
function isLineSegment(l) {
    return l.type === TYPE_LINE && !l.leftOpen && !l.rightOpen;
}

/**
 * Computes the minimum absolute angle separating the two given ones
 * @param {Number} a The first angle
 * @param {Number} b The second angle
 * @returns {Number} The minimum absolute difference angle
 */
function miminumAbsoluteDifferenceAngle(a, b) {
    return Math.min(normalizeAngle(a - b), normalizeAngle(b - a));
}

/**
 * Computes the oriented angle of v relative to u
 * @param {{x:Number, y:Number}} u The first vector
 * @param {{x:Number, y:Number}} v The second vector
 * @returns {Number} The oriented angle
 */
function orientedAngle(u, v) {
    const { x: x1, y: y1 } = u;
    const { x: x2, y: y2 } = v;

    let angle = Math.atan2(y2, x2) - Math.atan2(y1, x1);
    angle = normalizeAngle(angle);
    return angle;
}
/**
 * Converts an angle in degree to one in radians
 * @param {Number} deg The angle in degrees
 * @returns {Number} The angle in radians
 */
function deg2rad(deg) {
    return Math.PI * deg / 180.0;
}
/**
 * Converts an angle in radians to one in degrees
 * @param {Number} rad The angle in radians
 * @returns {Number} The angle in degrees
 */
function rad2deg(rad) {
    return 180.0 * rad / Math.PI;
}

/**
 * Transforms points into the coordinate system in which the specified ellipse is a unit circle
 * @param {Array<{x:Number,y:Number}>} points The input points
 * @param {{x:Number,y:Number}} center The ellipse center
 * @param {Number} rotation The ellipse rotation
 * @param {Number} rx The eccentricity in x direction
 * @param {Number} ry The eccentricity in y direction
 * @param {Boolean} isVector Whether the given points are vectors. If so, they are not translated
 * @returns {Array<{x:Number,y:Number}>} The transformed points
 */
function convertPointToLocalEllipse(points, center, rotation, rx, ry, isVector = false) {
    const ca = Math.cos(-rotation);
    const sa = Math.sin(-rotation);
    if (!isVector) {
        points = points.map(p => vSub(p, center));
    }
    points = points.map(p => vRotate(p, -rotation, ca, sa));
    points = points.map(p => vCwiseDiv(p, vVec2(rx, ry)));
    return points;
}
/**
 * Transforms points from the coordinate system in which the specified ellipse is a unit circle to world
 * @param {Array<{x:Number,y:Number}>} points The input points
 * @param {{x:Number,y:Number}} center The ellipse center
 * @param {Number} rotation The ellipse rotation
 * @param {Number} rx The eccentricity in x direction
 * @param {Number} ry The eccentricity in y direction
 * @param {Boolean} isVector Whether the given points are vectors. If so, they are not translated
 * @returns {Array<{x:Number,y:Number}>} The transformed points
 */
function convertPointFromLocalEllipse(points, center, rotation, rx, ry, isVector = false) {
    const ca = Math.cos(rotation);
    const sa = Math.sin(rotation);
    // restore points
    points = points.map(p => vCwiseMult(p, vVec2(rx, ry)));
    points = points.map(p => vRotate(p, rotation, ca, sa));
    if (!isVector) {
        points = points.map(p => vAdd(p, center));
    }
    return points;
}

/**
 * Removes colinear line segments, which cause issues in some algorithms
 * @param {Array<{x:Number,y:Number}>} lines Line segments
 * @param {Number} eps The epsilon value to use in comparisons
 * @returns {Array<{x:Number,y:Number}>} The line segments without colinearities
 */
function removeColinear(lines, eps = 1E-10) {
    const output = [];
    for (let i = 0; i < lines.length; i++) {
        const pi = lines[i];
        if (output.length > 1) {
            const a = output[output.length - 2];
            const b = output[output.length - 1];
            const u = vSub(b, a);
            const v = vSub(pi, b);
            // compute perpdot product
            const pd = u.x * v.y - u.y * v.x;
            if (Math.abs(pd) < eps) {
                // colinear/zero, replace last point
                output[output.length - 1] = pi;
            } else {
                // not colinear, add
                output.push(pi);
            }
        } else {
            output.push(pi);
        }
    }
    return output;
}
/**
 * Computes the convex hull of the given points
 * @param {Array<{x:Number,y:Number}>} points The input points
 * @returns {Array<{x:Number,y:Number}>} The vertices of the convex hull in order
 */
function calcConvexHull(points) {
    // gift wrapping algorithm from "Computational Geometry in C"
    // TODO use more efficient algorithm like Graham or incremental


    points = removeColinear(points);
    if (points.length < 4) {
        // 2 non-colinear points are a line, which is its own convex hull
        // 3 non-colinear points are a triangle, which is its own convex hull
        return points;
    }
    // find lowest point (y)
    let i0 = 0;
    let lowestY = points[0].y;

    for (let i = 1; i < points.length; i++) {
        const pi = points[i];
        if (pi.y < lowestY) {
            lowestY = pi.y;
            i0 = i;
        }
    }

    const output = [points[i0]];
    let i = i0;
    // repeat until i = i0
    do {
        let minAngle = Infinity;
        let minIndex = -1;

        let prevEdge;
        if (output.length === 1) {
            // use x dir as first edge
            prevEdge = { x: 1, y: 0 };
        } else {
            // previous edge
            prevEdge = vSub(output[output.length - 1], output[output.length - 2]);
        }

        const curPoint = output[output.length - 1];
        // for each j != i
        for (let j = 0; j < points.length; j++) {
            if (j === i) {
                continue;
            }
            const edge = vSub(points[j], curPoint);
            // skip zero length
            // should have been removed by the colinearity check
            // if (vLen2(edge) < 1E-10) {
            //     continue;
            // }
            const a = orientedAngle(prevEdge, edge);
            if (a < minAngle) {
                minAngle = a;
                minIndex = j;
            }
        }

        const nextPoint = points[minIndex];
        output.push(nextPoint);
        i = minIndex;
    } while (i !== i0);
    return output;
}

/**
 * Intersects two lines
 * @param {{x:Number,y:Number}} a0 The first point of the first line
 * @param {{x:Number,y:Number}} a1 The second point of the first line
 * @param {{x:Number,y:Number}} b0 The first point of the second line
 * @param {{x:Number,y:Number}} b1 The second point of the second line
 * @param {Object} options
 * @param {Number} options.minA The minimum parameter of the first line. For a segment, that is 0
 * @param {Number} options.maxA The maximum parameter of the first line. For a segment, that is 1
 * @param {Number} options.minB The minimum parameter of the second line. For a segment, that is 0
 * @param {Number} options.maxB The maximum parameter of the second line. For a segment, that is 1
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {{x: Number, y:Number, ua: Number, ub: Number} | null} The intersection with respective parameters or null, if no intersection exists
 */
function intersectLines(a0, a1, b0, b1, {
    minA = -Infinity, maxA = Infinity,
    minB = -Infinity, maxB = Infinity,
    eps = 1E-10
} = {}) {
    const { x: x1, y: y1 } = a0;
    const { x: x2, y: y2 } = a1;

    const { x: x3, y: y3 } = b0;
    const { x: x4, y: y4 } = b1;

    const det = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // parallel -> no intersection
    if (Math.abs(det) < eps) {
        return null;
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / det;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / det;

    // check parameters
    if (ua < minA || ua > maxA) {
        return null;
    }

    if (ub < minB || ub > maxB) {
        return null;
    }

    // intersection found

    const x = x1 + ua * (x2 - x1);
    const y = y1 + ua * (y2 - y1);

    return { x, y, ua, ub };
}

/**
 * Converts a quadratic Bezier curve (1-t)^2 p0 + 2(1-t)t p1 + t^2 p1 to the form q0 + t q1 + t^2 q2
 * @param {{x:Number,y:Number}} p0 The first point
 * @param {{x:Number,y:Number}} p1 The second point
 * @param {{x:Number,y:Number}} p2 The third point
 * @returns {Array<{x:Number,y:Number}>} The array [q0,q1,q2]
 */
function convertQuadraticBezierToParamBase(p0, p1, p2) {
    // t^2 (p0 - 2p1 + p2) + t(2p1 - 2p0) + p0 = q0 + t q1 + t^2 q2

    const q2 = vAdd(vSub(p0, vScale(p1, 2)), p2);
    const q1 = vSub(vScale(p1, 2), vScale(p0, 2));
    const q0 = p0;

    return [q0, q1, q2];
}
/**
 * Converts a cubic Bezier curve t^3*p3 + t^2*p2*(3 - 3*t) + 3*t*p1*(1 - t)^2 + p0*(1 - t)^3 to the form q0 + q1*t + q2*t^2 + q3*t^3
 * @param {{x:Number,y:Number}} p0 The first point
 * @param {{x:Number,y:Number}} p1 The second point
 * @param {{x:Number,y:Number}} p2 The third point
 * @param {{x:Number,y:Number}} p3 The fourth point
 * @returns {Array<{x:Number,y:Number}>} The array [q0,q1,q2,q2]
 */
function convertCubicBezierToParamBase(p0, p1, p2, p3) {
    // t^3*p_3 + t^2*p_2*(3 - 3*t) + 3*t*p_1*(1 - t)^2 + p_0*(1 - t)^3 =
    // t^3*(-p_0 + 3*p_1 - 3*p_2 + p_3) + t^2*(3*p_0 - 6*p_1 + 3*p_2) + t*(-3*p_0 + 3*p_1) + p_0
    // q_0 + q_1*t + q_2*t^2 + q_3*t^3
    // Term for power 1:
    // x_0
    const q0 = p0;
    // Term for power t:
    // -3*x_0 + 3*x_1 = -3(x_0 - x_1)
    const q1 = vScale(vSub(p0, p1), -3);
    // Term for power t^2:
    // 3*x_0 - 6*x_1 + 3*x_2 = 3(x_0 - 2*x_1 + x_2) = 3(x_0 + x_2 - 2*x_1)
    const q2 = vScale(vSub(vAdd(p0, p2), vScale(p1, 2)), 3);
    // Term for power t^3:
    // -x_0 + 3*x_1 - 3*x_2 + x_3 = x_3 - x_0 + 3(x_1 - x_2)
    const q3 = vAdd(vSub(p3, p0), vScale(vSub(p1, p2), 3));
    return [q0, q1, q2, q3];
}

/**
 * Converts a quartic Bezier curve to the form q0 + q1*t + q2*t^2 + q3*t^3 + q4*t^4
 * @param {{x:Number,y:Number}} p0 The first point
 * @param {{x:Number,y:Number}} p1 The second point
 * @param {{x:Number,y:Number}} p2 The third point
 * @param {{x:Number,y:Number}} p3 The fourth point
 * @param {{x:Number,y:Number}} p4 The fifth point
 * @returns {Array<{x:Number,y:Number}>} The array [q0,q1,q2,q3,q4]
 */
function convertQuarticBezierToParamBase(p0, p1, p2, p3, p4) {

    // q_0 + q_1*t + q_2*t^2 + q_3*t^3 + q_4*t^4

    // Term for power 1:
    // x_0
    const q0 = p0;
    // ----------
    // Term for power t:
    // -4*x_0 + 4*x_1 = 4(x_1 - x_0)
    const q1 = vScale(vSub(p1, p0), 4);
    // ----------
    // Term for power t^2:
    // 6*x_0 - 12*x_1 + 6*x_2 = 6(x_0 + x_2 - 2x_1)
    const q2 = vScale(
        vSub(vAdd(p0, p2),
            vScale(p1, 2))
        , 6);
    // ----------
    // Term for power t^3:
    // -4*x_0 + 12*x_1 - 12*x_2 + 4*x_3 = 4(x_3 - x_0 + 3(x_1 - x_2))
    const q3 = vScale(
        vAdd(
            vSub(p3, p0),
            vScale(
                vSub(p1, p2),
                3)),
        4);
    // ----------
    // Term for power t^4:
    // x_0 - 4*x_1 + 6*x_2 - 4*x_3 + x_4 = x_0 + x_4 + 6x_2 - 4(x_1 + x_3) 
    const q4 = vSub(vAdd(
        vAdd(p0, p4),
        vScale(p2, 6)),
        vScale(
            vAdd(p1, p3),
            4)
    );

    return [q0, q1, q2, q3, q4];
}

/**
 * Computes the four possible intersections of two quadratic Bezier curves
 * @param {Array<{x:Number,y:Number}>} points0 The first control points
 * @param {Array<{x:Number,y:Number}>} points1 The second control points
 * @param {Object} options
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectQuadraticBezier(points0, points1, {
    eps = 1E-10
} = {}) {
    // reduce curves to parameter form
    const [p0, p1, p2] = convertQuadraticBezierToParamBase(...points0);
    // p_i = (a_i,b_i)
    // p_0 s^2 + p_1 s + p_2
    const [q0, q1, q2] = convertQuadraticBezierToParamBase(...points1);
    // q_i = (u_i,v_i)
    // q_0 t^2 + q_1 t + q_2

    // WARNING: This is madness

    // you could derive and write this down by hand, but that sounds horrible
    // the equations/code for (A-E) below was generated

    // the basic procedure is:
    // given two curves p(s) = q(t) => p(s) - q(t) = 0
    // this gives two equations (for x and y) which are polynomials in s and t
    // use resultants to eliminate one of the variables (here s)
    // this results in a quartic equation in t, which we can solve for

    const { x: a_2, y: b_2 } = p2;
    const { x: a_1, y: b_1 } = p1;
    const { x: a_0, y: b_0 } = p0;

    const { x: u_2, y: v_2 } = q2;
    const { x: u_1, y: v_1 } = q1;
    const { x: u_0, y: v_0 } = q0;

    // find quartic parameter solving for t

    // t^4*(a_0^2*v_0^2 - 2*a_0*b_0*u_0*v_0 + b_0^2*u_0^2) + 

    // t^3*(2*a_0^2*v_0*v_1 - 2*a_0*b_0*u_0*v_1 - 2*a_0*b_0*u_1*v_0 + 2*b_0^2*u_0*u_1) + 

    // t^2*(-2*a_0^2*b_2*v_0 + 2*a_0^2*v_0*v_2 + a_0^2*v_1^2 + a_0*a_1*b_1*v_0 + 2*a_0*a_2*b_0*v_0 + 2*a_0*b_0*b_2*u_0 - 2*a_0*b_0*u_0*v_2 - 2*a_0*b_0*u_1*v_1 - 2*a_0*b_0*u_2*v_0 - a_0*b_1^2*u_0 - a_1^2*b_0*v_0 + a_1*b_0*b_1*u_0 - 2*a_2*b_0^2*u_0 + 2*b_0^2*u_0*u_2 + b_0^2*u_1^2) + 

    // t*(-2*a_0^2*b_2*v_1 + 2*a_0^2*v_1*v_2 + a_0*a_1*b_1*v_1 + 2*a_0*a_2*b_0*v_1 + 2*a_0*b_0*b_2*u_1 - 2*a_0*b_0*u_1*v_2 - 2*a_0*b_0*u_2*v_1 - a_0*b_1^2*u_1 - a_1^2*b_0*v_1 + a_1*b_0*b_1*u_1 - 2*a_2*b_0^2*u_1 + 2*b_0^2*u_1*u_2) +

    // a_0^2*b_2^2 - 2*a_0^2*b_2*v_2 + a_0^2*v_2^2 - a_0*a_1*b_1*b_2 + a_0*a_1*b_1*v_2 - 2*a_0*a_2*b_0*b_2 + 2*a_0*a_2*b_0*v_2 + a_0*a_2*b_1^2 + 2*a_0*b_0*b_2*u_2 - 2*a_0*b_0*u_2*v_2 - a_0*b_1^2*u_2 + a_1^2*b_0*b_2 - a_1^2*b_0*v_2 - a_1*a_2*b_0*b_1 + a_1*b_0*b_1*u_2 + a_2^2*b_0^2 - 2*a_2*b_0^2*u_2 + b_0^2*u_2^2 

    // quartic A t^4 + B t^3 + C t^2 + D t + E
    const A = Math.pow(a_2, 2) * Math.pow(v_2, 2) - 2 * a_2 * b_2 * u_2 * v_2 + Math.pow(b_2, 2) * Math.pow(u_2, 2);

    const B = 2 * Math.pow(a_2, 2) * v_1 * v_2 - 2 * a_2 * b_2 * u_1 * v_2 - 2 * a_2 * b_2 * u_2 * v_1 + 2 * Math.pow(b_2, 2) * u_1 * u_2;

    const C = 2 * a_0 * a_2 * b_2 * v_2 - 2 * a_0 * Math.pow(b_2, 2) * u_2 - Math.pow(a_1, 2) * b_2 * v_2 + a_1 * a_2 * b_1 * v_2 + a_1 * b_1 * b_2 * u_2 - 2 * Math.pow(a_2, 2) * b_0 * v_2 + 2 * Math.pow(a_2, 2) * v_0 * v_2 + Math.pow(a_2, 2) * Math.pow(v_1, 2) + 2 * a_2 * b_0 * b_2 * u_2 - a_2 * Math.pow(b_1, 2) * u_2 - 2 * a_2 * b_2 * u_0 * v_2 - 2 * a_2 * b_2 * u_1 * v_1 - 2 * a_2 * b_2 * u_2 * v_0 + 2 * Math.pow(b_2, 2) * u_0 * u_2 + Math.pow(b_2, 2) * Math.pow(u_1, 2);

    const D = 2 * a_0 * a_2 * b_2 * v_1 - 2 * a_0 * Math.pow(b_2, 2) * u_1 - Math.pow(a_1, 2) * b_2 * v_1 + a_1 * a_2 * b_1 * v_1 + a_1 * b_1 * b_2 * u_1 - 2 * Math.pow(a_2, 2) * b_0 * v_1 + 2 * Math.pow(a_2, 2) * v_0 * v_1 + 2 * a_2 * b_0 * b_2 * u_1 - a_2 * Math.pow(b_1, 2) * u_1 - 2 * a_2 * b_2 * u_0 * v_1 - 2 * a_2 * b_2 * u_1 * v_0 + 2 * Math.pow(b_2, 2) * u_0 * u_1;

    const E = Math.pow(a_0, 2) * Math.pow(b_2, 2) - a_0 * a_1 * b_1 * b_2 - 2 * a_0 * a_2 * b_0 * b_2 + a_0 * a_2 * Math.pow(b_1, 2) + 2 * a_0 * a_2 * b_2 * v_0 - 2 * a_0 * Math.pow(b_2, 2) * u_0 + Math.pow(a_1, 2) * b_0 * b_2 - Math.pow(a_1, 2) * b_2 * v_0 - a_1 * a_2 * b_0 * b_1 + a_1 * a_2 * b_1 * v_0 + a_1 * b_1 * b_2 * u_0 + Math.pow(a_2, 2) * Math.pow(b_0, 2) - 2 * Math.pow(a_2, 2) * b_0 * v_0 + Math.pow(a_2, 2) * Math.pow(v_0, 2) + 2 * a_2 * b_0 * b_2 * u_0 - a_2 * Math.pow(b_1, 2) * u_0 - 2 * a_2 * b_2 * u_0 * v_0 + Math.pow(b_2, 2) * Math.pow(u_0, 2);

    const ts = solveQuarticComplex(A, B, C, D, E);

    const result = [];

    for (const tc of ts) {
        if (Math.abs(cImag(tc)) > eps) {
            // complex solution
            continue;
        }
        const t = cReal(tc);
        if (t < 0 || t > 1) {
            // outside of valid range of second curve
            continue;
        }

        const rp = vAdd(vScale(q2, t * t), vAdd(vScale(q1, t), q0));

        // To find s, solve the quadratic equation in x first, then y and find the common t value
        {
            // p_i = (a_i,b_i)
            // p_0 s^2 + p_1 s + p_2
            // rp is the found point on both curves
            // so we set rp = p_0 s^2 + p_1 s + p_2 => p_0 s^2 + p_1 s + p_2 - rp = 0

            // we use a slightly bigger epsilon, since the quartic computation and the exponents may create issues
            // Alternatively, we could have computed the resultant with t eliminated and checked the different combinations of roots of s/t
            // As the two polynomials don't have mixed variables, this here seems like the easier and maybe more robust solution, since it only involves solving a quadratic instead of another quartic
            const ssx = solveQuadratic(p2.x, p1.x, p0.x - rp.x, eps * 2);
            const ssy = solveQuadratic(p2.y, p1.y, p0.y - rp.y, eps * 2);
            ssx.sort();
            ssy.sort();

            if (ssx.length < 1 || ssy.length < 1) {
                // should not happen
                continue;
            }
            let ms = -1;
            let sdif = Infinity;
            for (let i = 0; i < ssx.length; i++) {
                const si = ssx[i];
                for (let j = 0; j < ssy.length; j++) {
                    const sj = ssy[j];
                    const dif = Math.abs(si - sj);
                    if (dif < sdif) {
                        ms = si;
                        sdif = dif;
                    }
                }
            }

            if (sdif > 2 * eps) {
                // should not happen, x/y should share a common parameter
                continue;
            }

            if (ms < 0 || ms > 1) {
                // outside of range
                continue;
            }

        }

        result.push(rp);
    }

    return result;
}

/**
 * Computes the intersections of two Bezier curves. 
 * For such an intersection to be exactly computable, the product of the degrees of both curves must not be greater than 4
 * @param {Array<{x:Number,y:Number}>} points0 The first control points
 * @param {Array<{x:Number,y:Number}>} points1 The second control points
 * @param {Object} options
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectBezierBezier(points0, points1, {
    eps = 1E-10
} = {}) {
    // order, such that largest is first
    if (points1.length > points0.length) {
        [points0, points1] = [points1, points0];
    }

    const deg0 = points0.length - 1;
    const deg1 = points1.length - 1;
    if (deg0 === 3 || deg0 === 4) {
        // cubic or quartic bezier
        // can only intersect lines (deg1)
        if (deg1 === 1) {
            return intersectLineBezier(points1[0], points1[1], points0, {
                minA: 0, maxA: 1, eps
            });

        }

    } else if (deg0 === 2) {
        // deg 2 can intersect deg 2 and deg 1
        if (deg1 === 2) {
            return intersectQuadraticBezier(points0, points1, { eps });
        }
        if (deg1 === 1) {
            return intersectLineBezier(points1[0], points1[1], points0, {
                minA: 0, maxA: 1, eps
            });
        }
    } else if (deg0 === 1) {
        // deg 1 can intersect deg 1

        if (deg1 === 1) {
            return intersectLines(points0[0], points0[1], points1[0], points1[1], {
                minA: 0, maxA: 1,
                minB: 0, maxB: 1,
                eps
            });
        }
    }

    throw new Error(`Intersection between degrees ${deg0} and ${deg1} not supported`);
}

/**
 * Applies a line intersection function to each segment in a Line strip
 * @param {function({x:Number,y:Number},{x:Number,y:Number}) : {x:Number,y:Number} | Array<{x:Number,y:Number}>} inter A function computing intersections with a line segment
 * @param {Array<{x:Number,y:Number}>} points 
 * @param {Object} options
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectorApplyToLineSegments(inter, points, {
    wrapPoints = false,
} = {}) {
    // could be optimized with precomputed bounds and stuff
    // for now, naive implementation
    const intersections = [];
    const num = wrapPoints ? points.length : points.length - 1;

    for (let i = 0; i < num; i++) {
        const pi = points[i];
        const pj = points[(i + 1) % points.length];
        const p = inter(pi, pj);
        if (p) {
            if (Array.isArray(p)) {
                intersections.push(...p);
            } else {
                intersections.push(p);
            }
        }
    }

    return intersections;
}

/**
 * Create an implicit representation ax + by + c = 0
 * @param {{x:Number,y:Number}} a0 The first line point
 * @param {{x:Number,y:Number}} a1 The second line point
 * @returns {Number[]} [a,b,c]
 */
function calcLineImplicit(a0, a1) {
    const v = vSub(a1, a0);
    const n = normal2D(v);

    const c = -vDot(a0, n);
    return [n.x, n.y, c];
}
/**
 * For a line: a0 + t(a1 - a0), compute t, such that a0 + t(a1 -a1) = p
 * @param {{x:Number,y:Number}} a0 The first line point
 * @param {{x:Number,y:Number}} a1 The second line point
 * @param {{x:Number,y:Number}} p The point
 * @returns {Number} t
 */
function calcParamOnLine(a0, a1, p) {

    const v = vSub(a1, a0);
    const q = vSub(p, a0);
    const dq = vDot(v, q);
    const l = vLen2(v);
    return dq / l;
}

/**
 * Computes the intersections of a line and a Bezier curves. 
 * For such an intersection to be exactly computable, the degree of the curve must not exceed 4
 * @param {{x:Number,y:Number}} a0 The first line point
 * @param {{x:Number,y:Number}} a1 The second line point
 * @param {Array<{x:Number,y:Number}>} points The Bezier control points
 * @param {Object} options
 * @param {Number} options.minA The minimum parameter of the line. For a segment, that is 0
 * @param {Number} options.maxA The maximum parameter of the line. For a segment, that is 1
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectLineBezier(a0, a1, points, {
    minA = -Infinity, maxA = Infinity,
    eps = 1E-10
} = {}) {

    if (points.length === 0) {
        return [];
    }
    const lineEq = calcLineImplicit(a0, a1);
    if (points.length === 1) {
        // just a point
        // just check if it lies on the plane
        const [p] = points;
        const d = lineEq[0] * p.x + lineEq[1] * p.y + lineEq[2];
        if (Math.abs(d) < eps) {
            // check if in range
            const t = calcParamOnLine(a0, a1, p);
            if (t < minA || t > maxA) {
                // outside of line
                return [];
            }
            return p;
        } else {
            return [];
        }
    } else if (points.length === 2) {
        // curve is a line
        const [p0, p1] = points;

        return intersectLines(a0, a1, p0, p1, {
            minA, maxA,
            minB: 0, maxB: 1
        });
    } else if (points.length === 3) {
        // quadratic bezier
        const [p0, p1, p2] = points;
        // quadratic bezier is: (1-t)^2 p0 + 2(1-t)t p1 + t^2 p2
        // we will plug this into ax + bx + c = 0 to get a quadratic equation in t
        // first write it in terms of t
        // t^2 (p0 - 2p1 + p2) + t(2p1 - 2p0) + p0 = t^2 q0 + t q1 + q2
        // then the line is:
        // t^2(a q0x + b q0y) + t (a q1x + b q1y) + a q2x + b q2y + c
        // = t^2 m0 + t m1 +  m2
        const q0 = vAdd(vSub(p0, vScale(p1, 2)), p2);
        const q1 = vSub(vScale(p1, 2), vScale(p0, 2));
        const q2 = p0;
        const [a, b, c] = lineEq;
        const m0 = a * q0.x + b * q0.y;
        const m1 = a * q1.x + b * q1.y;
        const m2 = a * q2.x + b * q2.y + c;

        // solve
        const roots = solveQuadratic(m0, m1, m2);

        const result = [];

        for (const t of roots) {
            // check if t is valid on bezier (t in [0,1])
            if (t < 0 || t > 1) {
                continue;
            }
            // compute point t^2 q0 + t q1 + q2
            const p = vAdd(vScale(q0, t * t),
                vAdd(vScale(q1, t), q2)
            );

            // check if param is on line
            const tl = calcParamOnLine(a0, a1, p);
            if (tl < minA || tl > maxA) {
                continue;
            }

            result.push(p);
        }
        return result;

    } else if (points.length === 4) {
        // cubic bezier
        const [q0, q1, q2, q3] = convertCubicBezierToParamBase(...points);

        const [n_x, n_y, d] = lineEq;
        const { x: a_0, y: b_0 } = q0;
        const { x: a_1, y: b_1 } = q1;
        const { x: a_2, y: b_2 } = q2;
        const { x: a_3, y: b_3 } = q3;
        // m_0 + m_1 t + m_2 t^2 + m_3 t^3 = 0
        const m_0 = a_0 * n_x + b_0 * n_y + d;
        const m_1 = a_1 * n_x + b_1 * n_y;
        const m_2 = a_2 * n_x + b_2 * n_y;
        const m_3 = a_3 * n_x + b_3 * n_y;
        // solve
        const roots = solveCubicComplex(m_3, m_2, m_1, m_0, eps);

        const result = [];

        for (const tc of roots) {
            if (Math.abs(cImag(tc)) > eps) {
                // complex solution
                continue;
            }
            const t = cReal(tc);
            // check if t is valid on bezier (t in [0,1])
            if (t < 0 || t > 1) {
                continue;
            }
            // compute point q0 + q1 t + q2 t^2 + q3 t^3 = q0 + t (q1 + t(q2 + t q3))
            let p = q3;
            p = vAdd(vScale(p, t), q2);
            p = vAdd(vScale(p, t), q1);
            p = vAdd(vScale(p, t), q0);

            // check if param is on line
            const tl = calcParamOnLine(a0, a1, p);
            if (tl < minA || tl > maxA) {
                continue;
            }

            result.push(p);
        }
        return result;

    } else if (points.length === 5) {

        const [q0, q1, q2, q3, q4] = convertQuarticBezierToParamBase(...points);

        const [n_x, n_y, d] = lineEq;
        const { x: a_0, y: b_0 } = q0;
        const { x: a_1, y: b_1 } = q1;
        const { x: a_2, y: b_2 } = q2;
        const { x: a_3, y: b_3 } = q3;
        const { x: a_4, y: b_4 } = q4;
        // m_0 + m_1 t + m_2 t^2 + m_3 t^3 = 0
        const m_0 = a_0 * n_x + b_0 * n_y + d;
        const m_1 = a_1 * n_x + b_1 * n_y;
        const m_2 = a_2 * n_x + b_2 * n_y;
        const m_3 = a_3 * n_x + b_3 * n_y;
        const m_4 = a_4 * n_x + b_4 * n_y;
        // solve
        const roots = solveQuarticComplex(m_4, m_3, m_2, m_1, m_0, eps);

        const result = [];

        for (const tc of roots) {
            if (Math.abs(cImag(tc)) > eps) {
                // complex solution
                continue;
            }
            const t = cReal(tc);
            // check if t is valid on bezier (t in [0,1])
            if (t < 0 || t > 1) {
                continue;
            }
            // compute point q0 + q1 t + q2 t^2 + q3 t^3 = q0 + t (q1 + t(q2 + t q3))
            let p = q4;
            p = vAdd(vScale(p, t), q3);
            p = vAdd(vScale(p, t), q2);
            p = vAdd(vScale(p, t), q1);
            p = vAdd(vScale(p, t), q0);

            // check if param is on line
            const tl = calcParamOnLine(a0, a1, p);
            if (tl < minA || tl > maxA) {
                continue;
            }

            result.push(p);
        }
        return result;

    } else {
        throw new Error(`Intersection with bezier only defined up to degree 3, got ${points.length - 1}`);
    }

}

/**
 * Computes the intersections of an arc and a Bezier curves. 
 * For such an intersection to be exactly computable, the degree of the curve must not exceed 2
 * @param {{x:Number,y:Number}} center The arc center
 * @param {Number} r The arc radius
 * @param {Array<{x:Number,y:Number}>} points The Bezier control points
 * @param {Object} options
 * @param {Number} options.angleMin The minimum arc angle
 * @param {Number} options.angleMax The maximum arc angle
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectArcBezier(center, r, points, {
    angleMin = 0, angleMax = 2.0 * Math.PI,
    eps = 1E-10
} = {}) {

    if (points.length === 0) {
        return [];
    }

    if (points.length === 1) {
        // just a point
        // just check if it lies on the circle
        const [p] = points;
        if (Math.abs(d) < eps) {
            // check if in range
            // distance to circle
            const cp = vSub(p, center);
            const d2 = vLen2(cp);
            if (Math.abs(d2 - r * r) < eps) {
                // outside of circle
                return [];
            }
            return p;
        } else {
            return [];
        }
    } else if (points.length === 2) {
        // curve is a line
        const [p0, p1] = points;

        return intersectLineArc(p0, p1, center, r, {
            minA: 0, maxA: 1,
            angleMin, angleMax, eps
        });
    } else if (points.length === 3) {

        let [p0, p1, p2] = points;
        p0 = vSub(p0, center);
        p1 = vSub(p1, center);
        p2 = vSub(p2, center);

        // quadratic bezier
        let [q0, q1, q2] = convertQuadraticBezierToParamBase(p0, p1, p2);
        // quadratic bezier is: (1-t)^2 p0 + 2(1-t)t p1 + t^2 p2
        // we will plug this into x^2 + y^2 - r^2 = 0 to get a quartic equation in t
        // but for that we will center on the circle center

        let { x: a_0, y: b_0 } = q0;
        let { x: a_1, y: b_1 } = q1;
        let { x: a_2, y: b_2 } = q2;

        // = t^4 m0 + t^3 m1 +  t^2 m2 + t m3 + m4
        const E = a_0 * a_0 + b_0 * b_0 - r * r;

        const D = 2 * a_0 * a_1 + 2 * b_0 * b_1;

        const C = 2 * a_0 * a_2 + a_1 * a_1 + 2 * b_0 * b_2 + b_1 * b_1;

        const B = 2 * a_1 * a_2 + 2 * b_1 * b_2;

        const A = a_2 * a_2 + b_2 * b_2;

        // solve
        const roots = solveQuarticComplex(A, B, C, D, E, eps);
        // cull nearly equal roots
        // might not be needed, as it basically never triggers
        const rootsCulled = [];
        for (let i = 0; i < roots.length; i++) {
            const ri = roots[i];
            let foundCopy = false;
            for (let j = i + 1; j < roots.length; j++) {
                const rj = roots[j];
                if (cAbs(cSub(ri, j)) < eps) {
                    foundCopy = true;
                    break;
                }
            }
            if (!foundCopy) {
                rootsCulled.push(ri);
            }
        }
        const result = [];

        for (const tc of rootsCulled) {
            if (Math.abs(cImag(tc)) > eps) {
                // complex solution
                continue;
            }
            const t = cReal(tc);
            // check if t is valid on bezier (t in [0,1])
            if (t < 0 || t > 1) {
                continue;
            }
            // compute point t^2 p2 + t p1 + p0
            const p = vAdd(vScale(q2, t * t), vAdd(vScale(q1, t), q0));

            // check if param is on circle
            // point are already in circle coordinates
            let pa = calcAngle(p.x, p.y);

            if (!isAngleInRange(pa, angleMin, angleMax)) {
                continue;
            }

            result.push(vAdd(p, center));
        }
        return result;

    } else {
        throw new Error(`Intersection with bezier only defined up to degree 2, got ${points.length - 1}`);
    }

}

/**
 * Computes the intersections of a line and an arc. 
 * @param {{x:Number,y:Number}} a0 The first line point
 * @param {{x:Number,y:Number}} a1 The second line point
 * @param {{x:Number,y:Number}} center The arc center
 * @param {Number} r The arc radius
 * @param {Object} options
 * @param {Number} options.minA The minimum parameter of the line. For a segment, that is 0
 * @param {Number} options.maxA The maximum parameter of the line. For a segment, that is 1
 * @param {Number} options.angleMin The minimum arc angle
 * @param {Number} options.angleMax The maximum arc angle
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectLineArc(a0, a1, center, r, {
    minA = -Infinity, maxA = Infinity,
    angleMin = 0, angleMax = 2.0 * Math.PI,
    eps = 1E-10
} = {}) {

    angleMin = normalizeAngle(angleMin);
    angleMax = normalizeAngle(angleMax);
    // line between a0 and a1 is o + d * u, where o = a1 and u = a1 - a0
    const { x: ox, y: oy } = a0;
    const ux = a1.x - a0.x;
    const uy = a1.y - a0.y;

    // circle is defined by ||x-c||^2 = r^2
    const { x: cx, y: cy } = center;

    // line parameter d is computed by
    // (-[dot(u, o-c)] +- sqrt(dot(u, o-c)^2 - u^2 ((o-c)^2 -r^2))) / u^2

    // length of u squared
    const lu2 = ux * ux + uy * uy;

    // vector from c to o
    const cox = ox - cx;
    const coy = oy - cy;

    // discriminant
    const dotuoc = ux * cox + uy * coy;
    // length of (o-c) squared
    const lco2 = cox * cox + coy * coy;

    let discr = dotuoc * dotuoc - lu2 * (lco2 - r * r);

    if (discr < -eps) {
        // no solutions exist
        return [];
    }
    discr = Math.max(0, discr);

    if (discr < eps) {
        // only one solution exists
        const d = -dotuoc / lu2;
        // check range
        if (d < minA || d > maxA) {
            // outside of range -> no solution
            return [];
        }

        const x = ox + d * ux;
        const y = oy + d * uy;

        // check angular constraint
        let pa = calcAngle(x - cx, y - cy);

        if (!isAngleInRange(pa, angleMin, angleMax)) {
            return [];
        }
        return [{
            x, y
        }];
    }

    // two solutions possibly exist
    let d0 = (-dotuoc + Math.sqrt(discr)) / lu2;
    let d1 = (-dotuoc - Math.sqrt(discr)) / lu2;

    if (d1 < d0) {
        [d0, d1] = [d1, d0];
    }
    let tempResult = [];
    // check ranges
    if (d0 >= minA && d0 < maxA) {
        // inside -> compute point
        tempResult.push({
            x: ox + d0 * ux,
            y: oy + d0 * uy
        });
    }
    if (d1 >= minA && d1 < maxA) {
        // inside -> compute point
        tempResult.push({
            x: ox + d1 * ux,
            y: oy + d1 * uy
        });
    }
    const result = [];
    for (let i = 0; i < tempResult.length; i++) {
        const pi = tempResult[i];
        // check angular constraint
        let pa = calcAngle(pi.x - cx, pi.y - cy);

        if (isAngleInRange(pa, angleMin, angleMax)) {
            result.push(pi);
        }
    }

    return result;
}

/**
 * Checks whether a point's angle is in the range specified by [a,b]
 * @param {{x:Number,y:Number}} p The pojnt
 * @param {Number} a The start angle
 * @param {Number} b The end angle
 * @returns {Boolean} True, if the point is in the range, false otherwise
 */
function isPointInAngleRange(p, a, b) {
    const n = normalizeAngle(Math.atan2(p.y, p.x));

    return isAngleInRange(n, a, b);
}
/**
 * Checks whether an angle is in the range specified by [a,b]
 * @param {Number} p The pojnt
 * @param {Number} a The start angle
 * @param {Number} b The end angle
 * @returns {Boolean} True, if the angle is in the range, false otherwise
 */
function isAngleInRange(n, a, b) {
    if (a < b) {
        return n >= a && n <= b;
    }

    return n >= a || n <= b;
}

/**
 * Computes the intersections of two arcs. 
 * @param {{x:Number,y:Number}} ca The first arc's center
 * @param {Number} r0 The first arc's radius
 * @param {{x:Number,y:Number}} cb The second arc's center
 * @param {Number} r1 The second arc's radius
 * @param {Object} options
 * @param {Number} options.angleMinA The minimum first arc angle
 * @param {Number} options.angleMaxA The maximum first arc angle
 * @param {Number} options.angleMinB The minimum second arc angle
 * @param {Number} options.angleMaxB The maximum second arc angle
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectArcArc(ca, r0, cb, r1, { angleMinA = 0, angleMaxA = 2.0 * Math.PI,
    angleMinB = 0, angleMaxB = 2.0 * Math.PI,
    eps = 1E-10
} = {}) {
    // based on http://paulbourke.net/geometry/circlesphere/

    const p0 = ca;
    const p1 = cb;

    // distnace between points
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;

    const d2 = dx * dx + dy * dy;

    const rd = r1 + r0;
    const rm = r1 - r0;

    if (d2 > rd * rd) {
        // circles separate -> no intersections
        return [];
    }

    if (d2 < rm * rm) {
        // once circle inside the other -> no intersections
        return [];
    }
    const d = Math.sqrt(d2);
    const a = (r0 * r0 - r1 * r1 + d2) / (2.0 * d);

    const p2x = p0.x + a * dx / d;
    const p2y = p0.y + a * dy / d;

    const h2 = r0 * r0 - a * a;

    // if h is 0, only one solution exists, since a = r0, and it must be p2
    const p2 = {
        x: p2x,
        y: p2y
    };

    const aMin = normalizeAngle(angleMinA);
    const aMax = normalizeAngle(angleMaxA);
    const bMin = normalizeAngle(angleMinB);
    const bMax = normalizeAngle(angleMaxB);

    if (Math.abs(h2) < eps) {

        // check ranges
        if (isPointInAngleRange({
            x: p2.x - p0.x,
            y: p2.y - p0.y
        }, aMin, aMax) &&
            isPointInAngleRange({
                x: p2.x - p1.x,
                y: p2.y - p1.y
            }, bMin, bMax)
        ) {
            return [p2];
        } else {
            return [];
        }
    }

    const h = Math.sqrt(h2);

    const intersectPoints = [];

    intersectPoints.push({
        x: p2x + h * dy / d,
        y: p2y - h * dx / d
    });

    intersectPoints.push({
        x: p2x - h * dy / d,
        y: p2y + h * dx / d
    });

    const result = [];
    for (let i = 0; i < intersectPoints.length; i++) {
        const p3 = intersectPoints[i];
        if (isPointInAngleRange({
            x: p3.x - p0.x,
            y: p3.y - p0.y
        }, aMin, aMax) &&
            isPointInAngleRange({
                x: p3.x - p1.x,
                y: p3.y - p1.y
            }, bMin, bMax)
        ) {
            result.push(p3);
        }
    }

    return result;
}

/**
 * Computes the intersections of two ellipses. 
 * @param {{rx:Number,ry:Number, rotation: Number, startAngle: Number, endAngle: Number, center: {x:Number, y:Number}}} ellipse0 The first ellipse
 * @param {{rx:Number,ry:Number, rotation: Number, startAngle: Number, endAngle: Number, center: {x:Number, y:Number}}} ellipse1 The second ellipse
 * @param {Object} options
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The intersections
 */
function intersectEllipseEllipse(ellipse0, ellipse1, { eps = 1E-10 } = {}) {
    // intersecting two ellipses can be done in different ways
    // we use the common parametric into implicit version

    // a parametric ellipse is given by: c + R(alpha)*S(a,b)*[cos(t), sin(t)]
    // c is the center, R is a rotation, S is a scaling matrix and t is the angular parameter

    // equivalently, the implicit equation is given by:
    // (x-c_x)^2 / a^2 + (y-c_y)^2 / b^2 - 1 = 0 <=>
    // b^2 (x-c_x)^2 + a^2(y - c_y)^2 - a^2 b^2 = 0

    // One way to go about would be to inverse the parametric equation to transform the ellipse to a unit circle. The implicit equation would transform inversly to that though... so we would just get the original transform
    // So we just plug in the parametric into the implicit

    // Afterwards we use the tangent half-angle substitution (https://en.wikipedia.org/wiki/Tangent_half-angle_substitution)
    // u = tan(t/2) => sin(t) = 2u/(1+u^2), cos(t) = (1-u^2)/(1+u^2)
    // this will replace the sine and cosine terms with rational polynomials
    // as we have an explicit equation = 0, we can multiply by (1+u^2)^2 to get rid of the rational parts.
    // Then we are just left with a quartic equation that we can solve for u and then for t

    // The following code is mostly generated from doing this with a symbolic math library to avoid mistypings

    // Ellipse 0 values
    const {
        rx: r_x, ry: r_y,
        center: center_0,
        rotation: alpha

    } = ellipse0;
    const { x: c_x, y: c_y } = center_0;

    const {
        rx: s_x, ry: s_y,
        center: center_1,
        rotation: beta

    } = ellipse1;
    const { x: d_x, y: d_y } = center_1;

    // compute factors to calculate quadric
    const cos = Math.cos;
    const sin = Math.sin;

    // WARNING: MADNESS

    // This was generated by a computer algebra system
    // Even a "nicer" version that first constructs a polynomial in x,y and then uses Weierstrass substitution is only marginally shorter

    // just a few cosine and sine terms will be found/replaced to only compute them once
    const cos2Beta = cos(2 * beta);
    const sin2Beta = sin(2 * beta);
    const cosAlpha = cos(alpha);
    const sinAlpha = sin(alpha);

    const cosAlphaM2Beta = cos(alpha - 2 * beta);
    const sinAlphaM2Beta = sin(alpha - 2 * beta);

    const cos2AlphaM2Beta = cos(2 * alpha - 2 * beta);
    const sin2AlphaM2Beta = sin(2 * alpha - 2 * beta);

    const a0 = -c_x * c_x * s_x * s_x * cos2Beta / 2 + c_x * c_x * s_x * s_x / 2 + c_x * c_x * s_y * s_y * cos2Beta / 2 + c_x * c_x * s_y * s_y / 2 - c_x * c_y * s_x * s_x * sin2Beta + c_x * c_y * s_y * s_y * sin2Beta + c_x * d_x * s_x * s_x * cos2Beta - c_x * d_x * s_x * s_x - c_x * d_x * s_y * s_y * cos2Beta - c_x * d_x * s_y * s_y + c_x * d_y * s_x * s_x * sin2Beta - c_x * d_y * s_y * s_y * sin2Beta + c_x * r_x * s_x * s_x * cosAlpha - c_x * r_x * s_x * s_x * cosAlphaM2Beta + c_x * r_x * s_y * s_y * cosAlpha + c_x * r_x * s_y * s_y * cosAlphaM2Beta + c_y * c_y * s_x * s_x * cos2Beta / 2 + c_y * c_y * s_x * s_x / 2 - c_y * c_y * s_y * s_y * cos2Beta / 2 + c_y * c_y * s_y * s_y / 2 + c_y * d_x * s_x * s_x * sin2Beta - c_y * d_x * s_y * s_y * sin2Beta - c_y * d_y * s_x * s_x * cos2Beta - c_y * d_y * s_x * s_x + c_y * d_y * s_y * s_y * cos2Beta - c_y * d_y * s_y * s_y + c_y * r_x * s_x * s_x * sinAlpha + c_y * r_x * s_x * s_x * sinAlphaM2Beta + c_y * r_x * s_y * s_y * sinAlpha - c_y * r_x * s_y * s_y * sinAlphaM2Beta - d_x * d_x * s_x * s_x * cos2Beta / 2 + d_x * d_x * s_x * s_x / 2 + d_x * d_x * s_y * s_y * cos2Beta / 2 + d_x * d_x * s_y * s_y / 2 - d_x * d_y * s_x * s_x * sin2Beta + d_x * d_y * s_y * s_y * sin2Beta - d_x * r_x * s_x * s_x * cosAlpha + d_x * r_x * s_x * s_x * cosAlphaM2Beta - d_x * r_x * s_y * s_y * cosAlpha - d_x * r_x * s_y * s_y * cosAlphaM2Beta + d_y * d_y * s_x * s_x * cos2Beta / 2 + d_y * d_y * s_x * s_x / 2 - d_y * d_y * s_y * s_y * cos2Beta / 2 + d_y * d_y * s_y * s_y / 2 - d_y * r_x * s_x * s_x * sinAlpha - d_y * r_x * s_x * s_x * sinAlphaM2Beta - d_y * r_x * s_y * s_y * sinAlpha + d_y * r_x * s_y * s_y * sinAlphaM2Beta - r_x * r_x * s_x * s_x * cos2AlphaM2Beta / 2 + r_x * r_x * s_x * s_x / 2 + r_x * r_x * s_y * s_y * cos2AlphaM2Beta / 2 + r_x * r_x * s_y * s_y / 2 - s_x * s_x * s_y * s_y;

    const a1 = 2 * r_y * (-c_x * s_x * s_x * sinAlpha + c_x * s_x * s_x * sinAlphaM2Beta - c_x * s_y * s_y * sinAlpha - c_x * s_y * s_y * sinAlphaM2Beta + c_y * s_x * s_x * cosAlpha + c_y * s_x * s_x * cosAlphaM2Beta + c_y * s_y * s_y * cosAlpha - c_y * s_y * s_y * cosAlphaM2Beta + d_x * s_x * s_x * sinAlpha - d_x * s_x * s_x * sinAlphaM2Beta + d_x * s_y * s_y * sinAlpha + d_x * s_y * s_y * sinAlphaM2Beta - d_y * s_x * s_x * cosAlpha - d_y * s_x * s_x * cosAlphaM2Beta - d_y * s_y * s_y * cosAlpha + d_y * s_y * s_y * cosAlphaM2Beta + r_x * s_x * s_x * sin2AlphaM2Beta - r_x * s_y * s_y * sin2AlphaM2Beta);

    const a2 = -c_x * c_x * s_x * s_x * cos2Beta + c_x * c_x * s_x * s_x + c_x * c_x * s_y * s_y * cos2Beta + c_x * c_x * s_y * s_y - 2 * c_x * c_y * s_x * s_x * sin2Beta + 2 * c_x * c_y * s_y * s_y * sin2Beta + 2 * c_x * d_x * s_x * s_x * cos2Beta - 2 * c_x * d_x * s_x * s_x - 2 * c_x * d_x * s_y * s_y * cos2Beta - 2 * c_x * d_x * s_y * s_y + 2 * c_x * d_y * s_x * s_x * sin2Beta - 2 * c_x * d_y * s_y * s_y * sin2Beta + c_y * c_y * s_x * s_x * cos2Beta + c_y * c_y * s_x * s_x - c_y * c_y * s_y * s_y * cos2Beta + c_y * c_y * s_y * s_y + 2 * c_y * d_x * s_x * s_x * sin2Beta - 2 * c_y * d_x * s_y * s_y * sin2Beta - 2 * c_y * d_y * s_x * s_x * cos2Beta - 2 * c_y * d_y * s_x * s_x + 2 * c_y * d_y * s_y * s_y * cos2Beta - 2 * c_y * d_y * s_y * s_y - d_x * d_x * s_x * s_x * cos2Beta + d_x * d_x * s_x * s_x + d_x * d_x * s_y * s_y * cos2Beta + d_x * d_x * s_y * s_y - 2 * d_x * d_y * s_x * s_x * sin2Beta + 2 * d_x * d_y * s_y * s_y * sin2Beta + d_y * d_y * s_x * s_x * cos2Beta + d_y * d_y * s_x * s_x - d_y * d_y * s_y * s_y * cos2Beta + d_y * d_y * s_y * s_y + r_x * r_x * s_x * s_x * cos2AlphaM2Beta - r_x * r_x * s_x * s_x - r_x * r_x * s_y * s_y * cos2AlphaM2Beta - r_x * r_x * s_y * s_y + 2 * r_y * r_y * s_x * s_x * cos2AlphaM2Beta + 2 * r_y * r_y * s_x * s_x - 2 * r_y * r_y * s_y * s_y * cos2AlphaM2Beta + 2 * r_y * r_y * s_y * s_y - 2 * s_x * s_x * s_y * s_y;

    const a3 = 2 * r_y * (-c_x * s_x * s_x * sinAlpha + c_x * s_x * s_x * sinAlphaM2Beta - c_x * s_y * s_y * sinAlpha - c_x * s_y * s_y * sinAlphaM2Beta + c_y * s_x * s_x * cosAlpha + c_y * s_x * s_x * cosAlphaM2Beta + c_y * s_y * s_y * cosAlpha - c_y * s_y * s_y * cosAlphaM2Beta + d_x * s_x * s_x * sinAlpha - d_x * s_x * s_x * sinAlphaM2Beta + d_x * s_y * s_y * sinAlpha + d_x * s_y * s_y * sinAlphaM2Beta - d_y * s_x * s_x * cosAlpha - d_y * s_x * s_x * cosAlphaM2Beta - d_y * s_y * s_y * cosAlpha + d_y * s_y * s_y * cosAlphaM2Beta - r_x * s_x * s_x * sin2AlphaM2Beta + r_x * s_y * s_y * sin2AlphaM2Beta);

    const a4 = -c_x * c_x * s_x * s_x * cos2Beta / 2 + c_x * c_x * s_x * s_x / 2 + c_x * c_x * s_y * s_y * cos2Beta / 2 + c_x * c_x * s_y * s_y / 2 - c_x * c_y * s_x * s_x * sin2Beta + c_x * c_y * s_y * s_y * sin2Beta + c_x * d_x * s_x * s_x * cos2Beta - c_x * d_x * s_x * s_x - c_x * d_x * s_y * s_y * cos2Beta - c_x * d_x * s_y * s_y + c_x * d_y * s_x * s_x * sin2Beta - c_x * d_y * s_y * s_y * sin2Beta - c_x * r_x * s_x * s_x * cosAlpha + c_x * r_x * s_x * s_x * cosAlphaM2Beta - c_x * r_x * s_y * s_y * cosAlpha - c_x * r_x * s_y * s_y * cosAlphaM2Beta + c_y * c_y * s_x * s_x * cos2Beta / 2 + c_y * c_y * s_x * s_x / 2 - c_y * c_y * s_y * s_y * cos2Beta / 2 + c_y * c_y * s_y * s_y / 2 + c_y * d_x * s_x * s_x * sin2Beta - c_y * d_x * s_y * s_y * sin2Beta - c_y * d_y * s_x * s_x * cos2Beta - c_y * d_y * s_x * s_x + c_y * d_y * s_y * s_y * cos2Beta - c_y * d_y * s_y * s_y - c_y * r_x * s_x * s_x * sinAlpha - c_y * r_x * s_x * s_x * sinAlphaM2Beta - c_y * r_x * s_y * s_y * sinAlpha + c_y * r_x * s_y * s_y * sinAlphaM2Beta - d_x * d_x * s_x * s_x * cos2Beta / 2 + d_x * d_x * s_x * s_x / 2 + d_x * d_x * s_y * s_y * cos2Beta / 2 + d_x * d_x * s_y * s_y / 2 - d_x * d_y * s_x * s_x * sin2Beta + d_x * d_y * s_y * s_y * sin2Beta + d_x * r_x * s_x * s_x * cosAlpha - d_x * r_x * s_x * s_x * cosAlphaM2Beta + d_x * r_x * s_y * s_y * cosAlpha + d_x * r_x * s_y * s_y * cosAlphaM2Beta + d_y * d_y * s_x * s_x * cos2Beta / 2 + d_y * d_y * s_x * s_x / 2 - d_y * d_y * s_y * s_y * cos2Beta / 2 + d_y * d_y * s_y * s_y / 2 + d_y * r_x * s_x * s_x * sinAlpha + d_y * r_x * s_x * s_x * sinAlphaM2Beta + d_y * r_x * s_y * s_y * sinAlpha - d_y * r_x * s_y * s_y * sinAlphaM2Beta - r_x * r_x * s_x * s_x * cos2AlphaM2Beta / 2 + r_x * r_x * s_x * s_x / 2 + r_x * r_x * s_y * s_y * cos2AlphaM2Beta / 2 + r_x * r_x * s_y * s_y / 2 - s_x * s_x * s_y * s_y;


    const ts = solveQuarticComplex(a4, a3, a2, a1, a0);

    const result = [];

    for (const tc of ts) {
        if (Math.abs(cImag(tc)) > eps) {
            // complex solution
            continue;
        }
        const u = cReal(tc);

        // reverse weierstrass
        let t = Math.atan(u) * 2;

        // check if t is valid for ellipse_0
        if (!isAngleInRange(normalizeAngle(t), ellipse0.startAngle, ellipse0.endAngle)) {
            continue;
        }

        // parameter of first ellipse
        const tcos = (1 - u * u) / (1 + u * u);
        const tsin = 2 * u / (1 + u * u);
        let p = vCwiseMult(vVec2(r_x, r_y), vVec2(tcos, tsin));
        p = vRotate(p, alpha);
        p = vAdd(p, center_0);

        // check point on ellipse_1
        // transform into local and check angle there
        const [q] = convertPointToLocalEllipse([p], center_1, beta, s_x, s_y);
        const qa = calcAngle(q.x, q.y);
        if (!isAngleInRange(qa, ellipse1.startAngle, ellipse1.endAngle)) {
            continue;
        }
        result.push(p);
    }


    return result;


}

/**
 * Computes the points on an arc going through a given point, if they exist. 
 * @param {{x:Number,y:Number}} p The point
 * @param {{x:Number,y:Number}} c The arc's center
 * @param {Number} r The arc's radius
 * @param {Object} options
 * @param {Number} options.angleMin The minimum first arc angle
 * @param {Number} options.angleMax The maximum first arc angle
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The tangent points
 */
function calcCirclePointTangentPoints(p, c, r, { angleMin = 0, angleMax = 2.0 * Math.PI,
    eps = 1E-10
} = {}) {
    // find tangent points: q_i
    // vector t = q_i - p is perpendicular to radius vector v = q_i - c
    // this forms a right triangle with the center and the point
    // therefore we can find |t| via pythagoras
    // |t|^ + |v|^2 = |p-c|^2 => |t|^ + r^2 = |p-c|^2 => |t|^2  = |p-c|^2 - r^2
    // from that we can make a circle with radius |t| around p and intersect that with the given circle
    // calling the intersect function will handle the ranges of the arc

    const t2 = vLen2(vSub(p, c)) - r * r;
    const t = Math.sqrt(t2);

    return intersectArcArc(c, r, p, t, {
        angleMinA: angleMin, angleMaxA: angleMax,
        eps
    });
}


/**
 * Checks whether a point's direction lies in the angle range specified by the given arc
 * @param {{x:Number,y:Number}} p The point
 * @param {{r:Number, startAngle:Number, endAngle: Number, center: {x:Number,y:Number}}} arc The arc
 * @returns True, if the point is valid, false otherwise
 */
function isPointDirectionValidOnArc(p, arc) {

    const prel = vSub(p, arc.center);

    return isPointInAngleRange({
        x: prel.x,
        y: prel.y
    }, arc.startAngle, arc.endAngle);
}

/**
 * Computes the points on two arc's outer tangents, if they exist. 
 * @param {{r:Number, startAngle:Number, endAngle: Number, center: {x:Number,y:Number}}} arc0 The first arc
 * @param {{r:Number, startAngle:Number, endAngle: Number, center: {x:Number,y:Number}}} arc0 The second arc
 * @param {Object} options
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The tangent points. They come in pairs of point on first arc and point on second arc
 */
function calcOuterTangentPoints(arc0, arc1, {
    eps = 1E-10
} = {}) {

    let switched = false;
    // order to have arc0 be the larger one
    if (arc1.r > arc0.r) {
        [arc0, arc1] = [arc1, arc0];
        switched = true;
    }

    const v = vSub(arc1.center, arc0.center);
    const hypotenuse = vLen(v);
    const r3 = arc0.r - arc1.r;

    let arg = r3 / hypotenuse;
    if (Math.abs(arg) > 1 + eps) {
        // No tangents can be found
        return [];
    }
    arg = Math.min(1, Math.max(-1, arg));

    const phi = Math.acos(arg);
    const phi0 = Math.atan2(v.y, v.x);
    const phi1 = phi0 + phi;
    const phi2 = phi0 - phi;

    const pPolar0 = vPolar(1, phi1);
    const pPolar1 = vPolar(1, phi2);

    const points = [];

    // first tangent
    points.push(vAdd(vScale(pPolar0, arc0.r), arc0.center));
    points.push(vAdd(vScale(pPolar0, arc1.r), arc1.center));

    points.push(vAdd(vScale(pPolar1, arc0.r), arc0.center));
    points.push(vAdd(vScale(pPolar1, arc1.r), arc1.center));

    // filter
    const result = [];

    for (let i = 0; i < points.length; i += 2) {
        let p0 = points[i + 0];
        let p1 = points[i + 1];

        if (!isPointDirectionValidOnArc(p0, arc0) || !isPointDirectionValidOnArc(p1, arc1)) {
            continue;
        }

        if (switched) {
            [p0, p1] = [p1, p0];
        }
        result.push(p0, p1);
    }
    return result;

}

/**
 * Computes the points on two arc's inner tangents, if they exist. 
 * @param {{r:Number, startAngle:Number, endAngle: Number, center: {x:Number,y:Number}}} arc0 The first arc
 * @param {{r:Number, startAngle:Number, endAngle: Number, center: {x:Number,y:Number}}} arc0 The second arc
 * @param {Object} options
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {Array<{x:Number,y:Number}>} The tangent points. They come in pairs of point on first arc and point on second arc
 */
function calcInnerTangentPoints(arc0, arc1, {
    eps = 1E-10
} = {}) {

    let switched = false;
    // order to have arc0 be the larger one
    if (arc1.r > arc0.r) {
        [arc0, arc1] = [arc1, arc0];
        switched = true;
    }

    const v = vSub(arc1.center, arc0.center);
    const hypotenuse = vLen(v);
    const r3 = arc0.r + arc1.r;

    const phi0 = Math.atan2(v.y, v.x);
    let arg = r3 / hypotenuse;
    if (Math.abs(arg) > 1 + eps) {
        // No tangents can be found
        return [];
    }
    arg = Math.min(1, Math.max(-1, arg));
    const phi = Math.asin(arg) - Math.PI / 2;
    const phi1 = phi0 + phi;
    const phi2 = phi0 - phi;

    const pPolar0 = vPolar(1, phi1);
    const pPolar1 = vPolar(1, phi2);

    const points = [];

    // first tangent
    points.push(vAdd(vScale(pPolar0, arc0.r), arc0.center));
    points.push(vAdd(vScale(vPolar(1, phi1 + Math.PI), arc1.r), arc1.center));

    points.push(vAdd(vScale(pPolar1, arc0.r), arc0.center));
    points.push(vAdd(vScale(vPolar(1, phi2 + Math.PI), arc1.r), arc1.center));

    // filter
    const result = [];

    for (let i = 0; i < points.length; i += 2) {
        let p0 = points[i + 0];
        let p1 = points[i + 1];

        if (!isPointDirectionValidOnArc(p0, arc0) || !isPointDirectionValidOnArc(p1, arc1)) {
            continue;
        }

        if (switched) {
            [p0, p1] = [p1, p0];
        }
        result.push(p0, p1);
    }
    return result;

}

/**
 * Computes the number of segments of a Bezier spline where each consecutive segment uses the last point of the previous one
 * @param {Array<{x:Number,y:Number}>} points The control points
 * @param {Number} degree The Bezier degree
 * @returns {Number} The number of segments
 */
function numSegmentsBezierSpline(points, degree) {
    if ((points.length - (degree + 1)) % degree !== 0) {
        throw new Error("Wrong number of input points");
    }

    if (degree === 1) {
        return points.length - 1;
    }
    // This should be right
    // The first spline part adds deg+1 points
    // as the next point shares its first with the last, only deg points are added
    // this leads to the total number of points: deg + 1 + i*deg, where i is the number of additional points
    // if deg > 1, we can do integer division: 
    // div(deg + 1 + i*deg, deg) = div(deg,deg) + div(1,deg) + div(i*deg,deg) 
    //  = 1 + 0 + i = 1 + i
    // There is probably a nicer formula including deg = 1...
    return Math.floor(points.length / degree);
}

/**
 * Computes the segment i of a Bezier spline where each consecutive segment uses the last point of the previous one
 * @param {Array<{x:Number,y:Number}>} points The control points
 * @param {Number} degree The Bezier degree
 * @param {Number} i The index of the segment
 * @returns {Array<{x:Number,y:Number}>} The segments
 */
function getBezierSplineSegment(points, degree, i) {
    if ((points.length - (degree + 1)) % degree !== 0) {
        throw new Error("Wrong number of input points");
    }
    const offset = i * degree;
    const result = new Array(degree + 1);
    for (let j = 0; j <= degree; j++) {
        result[j] = points[offset + j];
    }

    return result;
}

/**
 * Currently implemented default intersections
 * 
 * Brackets indicate additional information. 
 * For Bezier, this will list the maximum degree for which the intersection is defined.
 * 
 * Line: Line, Vector, Arc, Line strip, Polygon, Bezier (max deg 4), Bezier spline(mag deg 4), Ellipse
 * Vector: Line, Vector, Arc, Line strip, Polygon, Bezier (max deg 4), Bezier spline(mag deg 4), Ellipse
 * Arc: Line, Vector, Arc, Line strip, Polygon, Bezier (max deg 2), Bezier spline(mag deg 2), Ellipse
 * Line strip: Line, Vector, Arc, Line strip, Polygon, Bezier (max deg 4), Bezier spline(mag deg 4), Ellipse
 * Polygon: Line, Vector, Arc, Line strip, Polygon, Bezier (max deg 4), Bezier spline(mag deg 4), Ellipse
 * Bezier: Line (max deg 4), Vector (max deg 4), Arc (max deg 2), Line strip (max deg 4), Polygon(max deg 4), Bezier (deg A * deg B < 5), Bezier spline(deg A * deg B < 5), Ellipse (max deg 2)
 * Bezier spline: Line (max deg 4), Vector (max deg 4), Arc (max deg 2), Line strip (max deg 4), Polygon(max deg 4), Bezier (deg A * deg B < 5) , Bezier spline(deg A * deg B < 5), Ellipse (max deg 2)
 * Ellipse: Line, Vector, Arc, Line strip, Polygon, Bezier (max deg 2), Bezier spline(mag deg 2), Ellipse
 */
class IntersectionRegistry {

    static intersectors = {};

    /**
     * 
     * @param {String} typeA The type of the first object
     * @param {String} typeB The type of the second object
     * @param {function(Object,Object) : Array<{x:Number, y:Number}> | null} intersector The intersection function taking objects of the specified types and returning intersections. May also return null, if none exist
     * @param {Boolean} addReverse If true, an additional function with swapped arguments (if they are different) is added automatically
     */
    static setIntersector(typeA, typeB, intersector, addReverse = true) {

        const k1 = IntersectionRegistry.intersectors[typeA] ?? {};
        k1[typeB] = intersector;

        IntersectionRegistry.intersectors[typeA] = k1;

        if (typeA !== typeB && addReverse) {
            const reverse = (b, a) => intersector(a, b);

            const k2 = IntersectionRegistry.intersectors[typeB] ?? {};
            k2[typeA] = reverse;

            IntersectionRegistry.intersectors[typeB] = k2;
        }
    }

    /**
     * Get the intersector for the given types
     * @param {String} typeA The type of the first object
     * @param {String} typeB The type of the second object
     * @returns {undefined | function(Object,Object) : Array<{x:Number, y:Number}> | null} The intersector, if it exists
     */
    static getIntersector(typeA, typeB) {
        const k1 = IntersectionRegistry.intersectors[typeA] ?? {};
        return k1[typeB];
    }

    /**
     * Computes the intersection of two typed objects
     * @param {{type : String}} a The first object with a type
     * @param {{type : String}} b The second object with a type
     * @returns {Array<{x:Number, y:Number}> | null} The intersections, if they exist.  May also return null, if none exist
     */
    static intersect(a, b) {

        const typeA = a.type;
        const typeB = b.type;

        const inter = IntersectionRegistry.getIntersector(typeA, typeB);

        return inter(a, b);
    }

    static {
        // Default intersectors

        // Type order Line, Vector, Arc, Line strip, Polygon, Bezier, Bezier Spline, Ellipse
        // For a slightly better overview, they will be sorted that way 

        // ---------
        // Line
        // ---------
        IntersectionRegistry.setIntersector(TYPE_LINE, TYPE_LINE, (a, b) => {
            const p = intersectLines(a.p0, a.p1, b.p0, b.p1, {
                minA: a.leftOpen ? -Infinity : 0,
                maxA: a.rightOpen ? Infinity : 1,
                minB: b.leftOpen ? -Infinity : 0,
                maxB: b.rightOpen ? Infinity : 1
            });

            if (!p) {
                return null;
            }

            return makePoint({
                ...p
            });
        });
        // ---------
        // Vector
        // ---------
        IntersectionRegistry.setIntersector(TYPE_VECTOR, TYPE_LINE, (a, b) => {
            const v = vAdd(a.ref, a);
            const p = intersectLines(a.ref, v, b.p0, b.p1, {
                minA: 0,
                maxA: 1,
                minB: b.leftOpen ? -Infinity : 0,
                maxB: b.rightOpen ? Infinity : 1
            });

            if (!p) {
                return null;
            }

            return makePoint({
                ...p
            });
        });
        IntersectionRegistry.setIntersector(TYPE_VECTOR, TYPE_VECTOR, (a, b) => {
            const v = vAdd(a.ref, a);
            const w = vAdd(b.ref, b);
            const p = intersectLines(a.ref, v, b.ref, w, {
                minA: 0,
                maxA: 1,
                minB: 0,
                maxB: 1
            });

            if (!p) {
                return null;
            }

            return makePoint({
                ...p
            });
        });
        // ---------
        // Arc
        // ---------
        IntersectionRegistry.setIntersector(TYPE_ARC, TYPE_LINE, (a, b) => {
            const p = intersectLineArc(b.p0, b.p1, { x: a.center.x, y: a.center.y }, a.r, {
                minA: b.leftOpen ? -Infinity : 0,
                maxA: b.rightOpen ? Infinity : 1,
                angleMin: a.startAngle,
                angleMax: a.endAngle,
            });

            const result = [];
            for (let i = 0; i < p.length; i++) {
                result.push(makePoint({ ...p[i] }));
            }

            return result;


        });
        IntersectionRegistry.setIntersector(TYPE_ARC, TYPE_VECTOR, (a, b) => {
            const v = vAdd(b.ref, b);
            const p = intersectLineArc(b.ref, v,
                a.center, a.r, {
                minA: 0,
                maxA: 1,
                angleMin: a.startAngle,
                angleMax: a.endAngle
            });

            return p.map(v => makePoint({
                ...v
            }));

        });
        IntersectionRegistry.setIntersector(TYPE_ARC, TYPE_ARC, (a, b) => {
            const p = intersectArcArc(a.center, a.r, b.center, b.r, {
                angleMinA: a.startAngle, angleMaxA: a.endAngle,
                angleMinB: b.startAngle, angleMaxB: b.endAngle,
            });
            const result = [];
            for (let i = 0; i < p.length; i++) {
                result.push(makePoint({ ...p[i] }));
            }

            return result;

        });
        // ---------
        // Line strip
        // ---------
        IntersectionRegistry.setIntersector(TYPE_LINE_STRIP, TYPE_LINE, (a, b) => {
            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const { p0, p1 } = b;

            const intersections = intersectorApplyToLineSegments(
                (q0, q1) => {
                    return intersectLines(p0, p1, q0, q1, {
                        minA: b.leftOpen ? -Infinity : 0,
                        maxA: b.rightOpen ? Infinity : 1,
                        minB: 0,
                        maxB: 1,
                    })
                }, a.points, { wrapPoints: false }
            );

            return intersections.map(v => makePoint({
                ...v
            }));

        });
        IntersectionRegistry.setIntersector(TYPE_LINE_STRIP, TYPE_VECTOR, (a, b) => {
            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const [p0, p1] = [b.ref, vAdd(b.ref, b)];
            const intersections = intersectorApplyToLineSegments(
                (q0, q1) => {
                    return intersectLines(p0, p1, q0, q1, {
                        minA: 0,
                        maxA: 1,
                        minB: 0,
                        maxB: 1,
                    })
                }, a.points, { wrapPoints: false }
            );

            return intersections.map(v => makePoint({
                ...v
            }));

        });
        IntersectionRegistry.setIntersector(TYPE_LINE_STRIP, TYPE_ARC, (a, b) => {
            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const { points } = a;
            const intersections = intersectorApplyToLineSegments((pi, pj) => {
                return intersectLineArc(pi, pj, b.center, b.r, {
                    angleMin: b.startAngle,
                    angleMax: b.endAngle,
                    minA: 0, maxA: 1,
                });
            }, points, { wrapPoints: false });

            return intersections.map(v => makePoint({
                ...v
            }));

        });
        IntersectionRegistry.setIntersector(TYPE_LINE_STRIP, TYPE_LINE_STRIP, (a, b) => {

            const { points: points0 } = a;
            const { points: points1 } = b;

            const intersections = intersectorApplyToLineSegments(
                (p0, p1) => {
                    return intersectorApplyToLineSegments(
                        (q0, q1) => {
                            return intersectLines(p0, p1, q0, q1, {
                                minA: 0, maxA: 1,
                                minB: 0, maxB: 1,
                            });
                        }, points0, { wrapPoints: false });
                }, points1, { wrapPoints: false }
            );

            return intersections.map(v => makePoint({
                ...v
            }));
        });
        // ---------
        // Polygon
        // ---------
        IntersectionRegistry.setIntersector(TYPE_POLYGON, TYPE_LINE, (a, b) => {

            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const { points } = a;

            const intersections = intersectorApplyToLineSegments(
                (p0, p1) => {
                    return intersectLines(p0, p1, b.p0, b.p1, {
                        minB: b.leftOpen ? -Infinity : 0,
                        maxB: b.rightOpen ? Infinity : 1,
                        minA: 0, maxA: 1,
                    })
                }, points, { wrapPoints: true }
            );

            return intersections.map(v => makePoint({
                ...v
            }));
        });
        IntersectionRegistry.setIntersector(TYPE_POLYGON, TYPE_VECTOR, (a, b) => {

            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const { points } = a;
            const [p0, p1] = [b.ref, vAdd(b.ref, b)];

            const intersections = intersectorApplyToLineSegments(
                (q0, q1) => {
                    return intersectLines(p0, p1, q0, q1, {
                        minB: 0,
                        maxB: 1,
                        minA: 0, maxA: 1,
                    })
                }, points, { wrapPoints: true }
            );

            return intersections.map(v => makePoint({
                ...v
            }));
        });
        IntersectionRegistry.setIntersector(TYPE_POLYGON, TYPE_ARC, (a, b) => {
            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const { points } = a;

            const intersections = intersectorApplyToLineSegments(
                (p0, p1) => {
                    return intersectLineArc(p0, p1, b.center, b.r, {
                        minA: 0, maxA: 1,
                        angleMin: b.startAngle,
                        angleMax: b.endAngle
                    })
                }, points, { wrapPoints: true }
            );

            return intersections.map(v => makePoint({
                ...v
            }));

        });

        IntersectionRegistry.setIntersector(TYPE_POLYGON, TYPE_LINE_STRIP, (a, b) => {
            const { points: points0 } = a;
            const { points: points1 } = b;


            const intersections = intersectorApplyToLineSegments(
                (p0, p1) => {
                    return intersectorApplyToLineSegments(
                        (q0, q1) => {
                            return intersectLines(p0, p1, q0, q1, {
                                minA: 0, maxA: 1,
                                minB: 0, maxB: 1,
                            });
                        }, points0, { wrapPoints: true });
                }, points1, { wrapPoints: false }
            );

            return intersections.map(v => makePoint({
                ...v
            }));

        });
        IntersectionRegistry.setIntersector(TYPE_POLYGON, TYPE_POLYGON, (a, b) => {

            const { points: points0 } = a;
            const { points: points1 } = b;

            const intersections = intersectorApplyToLineSegments(
                (p0, p1) => {
                    return intersectorApplyToLineSegments(
                        (q0, q1) => {
                            return intersectLines(p0, p1, q0, q1, {
                                minA: 0, maxA: 1,
                                minB: 0, maxB: 1,
                            });
                        }, points0, { wrapPoints: true });
                }, points1, { wrapPoints: true }
            );

            return intersections.map(v => makePoint({
                ...v
            }));
        });
        // ---------
        // Bezier
        // ---------
        IntersectionRegistry.setIntersector(TYPE_BEZIER, TYPE_LINE, (a, b) => {
            const p = intersectLineBezier(b.p0, b.p1, a.points, {
                minA: b.leftOpen ? -Infinity : 0,
                maxA: b.rightOpen ? Infinity : 1,
            });

            const result = [];
            for (let i = 0; i < p.length; i++) {
                result.push(makePoint({ ...p[i] }));
            }

            return result;

        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER, TYPE_VECTOR, (a, b) => {

            const [p0, p1] = [b.ref, vAdd(b.ref, b)];

            const p = intersectLineBezier(p0, p1, a.points, {
                minA: 0,
                maxA: 1,
            });

            const result = [];
            for (let i = 0; i < p.length; i++) {
                result.push(makePoint({ ...p[i] }));
            }

            return result;

        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER, TYPE_ARC, (a, b) => {
            const p = intersectArcBezier(b.center, b.r, a.points, {
                angleMin: b.startAngle,
                angleMax: b.endAngle
            });

            const result = [];
            for (let i = 0; i < p.length; i++) {
                result.push(makePoint({ ...p[i] }));
            }

            return result;

        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER, TYPE_LINE_STRIP, (a, b) => {
            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const { points: pointsBezier } = a;

            const intersections = intersectorApplyToLineSegments(
                (p0, p1) => {
                    return intersectLineBezier(p0, p1, pointsBezier, {
                        minA: 0,
                        maxA: 1,
                    })
                }, b.points, { wrapPoints: false }
            );

            return intersections.map(v => makePoint({
                ...v
            }));

        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER, TYPE_POLYGON, (a, b) => {
            // could be optimized with precomputed bounds and stuff
            // for now, naive implementation

            const { points: pointsBezier } = a;

            const intersections = intersectorApplyToLineSegments(
                (p0, p1) => {
                    return intersectLineBezier(p0, p1, pointsBezier, {
                        minA: 0,
                        maxA: 1,
                    })
                }, b.points, { wrapPoints: true }
            );

            return intersections.map(v => makePoint({
                ...v
            }));

        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER, TYPE_BEZIER, (a, b) => {

            const p = intersectBezierBezier(a.points, b.points, {
            });

            const result = [];
            for (let i = 0; i < p.length; i++) {
                result.push(makePoint({ ...p[i] }));
            }

            return result;

        });
        // ---------
        // Bezier spline
        // ---------
        IntersectionRegistry.setIntersector(TYPE_BEZIER_SPLINE, TYPE_LINE, (a, b) => {

            const { points, degree } = a;
            if ((points.length - (degree + 1)) % degree !== 0) {
                throw new Error("Wrong number of input points");
            }

            const intersections = [];
            const lPoints = new Array(degree + 1);
            for (let i = 0; i < points.length - 1; i += degree) {
                for (let j = 0; j < degree + 1; j++) {
                    lPoints[j] = points[i + j];
                }
                const p = intersectLineBezier(b.p0, b.p1, lPoints, {
                    minA: b.leftOpen ? -Infinity : 0,
                    maxA: b.rightOpen ? Infinity : 1,
                });
                if (p) {
                    if (Array.isArray(p)) {
                        intersections.push(...p);
                    } else {
                        intersections.push(p);
                    }
                }
            }

            return intersections.map(v => makePoint(v));
        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER_SPLINE, TYPE_VECTOR, (a, b) => {

            const { points, degree } = a;
            if ((points.length - (degree + 1)) % degree !== 0) {
                throw new Error("Wrong number of input points");
            }

            const intersections = [];
            const lPoints = new Array(degree + 1);
            const [p0, p1] = [b.ref, vAdd(b.ref, b)];
            for (let i = 0; i < points.length - 1; i += degree) {
                for (let j = 0; j < degree + 1; j++) {
                    lPoints[j] = points[i + j];
                }
                const p = intersectLineBezier(p0, p1, lPoints, {
                    minA: b.leftOpen ? -Infinity : 0,
                    maxA: b.rightOpen ? Infinity : 1,
                });
                if (p) {
                    if (Array.isArray(p)) {
                        intersections.push(...p);
                    } else {
                        intersections.push(p);
                    }
                }
            }

            return intersections.map(v => makePoint(v));
        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER_SPLINE, TYPE_ARC, (a, b) => {

            const { points, degree } = a;
            if ((points.length - (degree + 1)) % degree !== 0) {
                throw new Error("Wrong number of input points");
            }

            const intersections = [];
            const lPoints = new Array(degree + 1);
            const { center, r, startAngle, endAngle } = b;
            for (let i = 0; i < points.length - 1; i += degree) {
                for (let j = 0; j < degree + 1; j++) {
                    lPoints[j] = points[i + j];
                }
                const p = intersectArcBezier(center, r, lPoints, {
                    angleMin: startAngle, angleMax: endAngle
                });

                if (p) {
                    if (Array.isArray(p)) {
                        intersections.push(...p);
                    } else {
                        intersections.push(p);
                    }
                }
            }

            return intersections.map(v => makePoint(v));
        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER_SPLINE, TYPE_LINE_STRIP, (a, b) => {

            const { points, degree } = a;
            if ((points.length - (degree + 1)) % degree !== 0) {
                throw new Error("Wrong number of input points");
            }

            const intersections = [];
            const lPoints = new Array(degree + 1);
            for (let i = 0; i < points.length - 1; i += degree) {
                for (let j = 0; j < degree + 1; j++) {
                    lPoints[j] = points[i + j];
                }
                const p = intersectorApplyToLineSegments(
                    (p0, p1) => {
                        return intersectLineBezier(p0, p1, lPoints, {
                            minA: 0,
                            maxA: 1,
                        })
                    }, b.points, { wrapPoints: false }
                );

                if (p) {
                    if (Array.isArray(p)) {
                        intersections.push(...p);
                    } else {
                        intersections.push(p);
                    }
                }
            }

            return intersections.map(v => makePoint(v));
        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER_SPLINE, TYPE_POLYGON, (a, b) => {

            const { points, degree } = a;
            if ((points.length - (degree + 1)) % degree !== 0) {
                throw new Error("Wrong number of input points");
            }

            const intersections = [];
            const lPoints = new Array(degree + 1);
            for (let i = 0; i < points.length - 1; i += degree) {
                for (let j = 0; j < degree + 1; j++) {
                    lPoints[j] = points[i + j];
                }
                const p = intersectorApplyToLineSegments(
                    (p0, p1) => {
                        return intersectLineBezier(p0, p1, lPoints, {
                            minA: 0,
                            maxA: 1,
                        })
                    }, b.points, { wrapPoints: true }
                );

                if (p) {
                    if (Array.isArray(p)) {
                        intersections.push(...p);
                    } else {
                        intersections.push(p);
                    }
                }
            }

            return intersections.map(v => makePoint(v));
        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER_SPLINE, TYPE_BEZIER, (a, b) => {

            const { points, degree } = a;
            if ((points.length - (degree + 1)) % degree !== 0) {
                throw new Error("Wrong number of input points");
            }

            const intersections = [];
            const lPoints = new Array(degree + 1);
            for (let i = 0; i < points.length - 1; i += degree) {
                for (let j = 0; j < degree + 1; j++) {
                    lPoints[j] = points[i + j];
                }
                const p = intersectBezierBezier(b.points, lPoints, {});
                if (p) {
                    if (Array.isArray(p)) {
                        intersections.push(...p);
                    } else {
                        intersections.push(p);
                    }
                }
            }

            return intersections.map(v => makePoint(v));
        });
        IntersectionRegistry.setIntersector(TYPE_BEZIER_SPLINE, TYPE_BEZIER_SPLINE, (a, b) => {

            const { points: points0, degree: degree0 } = a;
            const { points: points1, degree: degree1 } = b;
            if ((points0.length - (degree0 + 1)) % degree0 !== 0) {
                throw new Error("Wrong number of input points");
            }
            if ((points1.length - (degree1 + 1)) % degree1 !== 0) {
                throw new Error("Wrong number of input points");
            }

            const intersections = [];
            const lPoints0 = new Array(degree0 + 1);
            const lPoints1 = new Array(degree1 + 1);
            for (let i = 0; i < points0.length - 1; i += degree0) {
                for (let j = 0; j < degree0 + 1; j++) {
                    lPoints0[j] = points0[i + j];
                }

                for (let k = 0; k < points1.length - 1; k += degree1) {
                    for (let j = 0; j < degree1 + 1; j++) {
                        lPoints1[j] = points1[k + j];
                    }
                    // TODO exclude endpoints?
                    const p = intersectBezierBezier(lPoints0, lPoints1, {});
                    if (p) {
                        if (Array.isArray(p)) {
                            intersections.push(...p);
                        } else {
                            intersections.push(p);
                        }
                    }
                }

            }

            return intersections.map(v => makePoint(v));
        });
        // ---------
        // Ellipse
        // ---------
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_LINE, (a, b) => {
            // convert line into local ellipse coordinates
            let lpoints = [b.p0, b.p1];
            lpoints = convertPointToLocalEllipse(lpoints, a.center, a.rotation, a.rx, a.ry);

            const arcInter = IntersectionRegistry.getIntersector(TYPE_LINE, TYPE_ARC);
            const localLine = makeLine({ p0: lpoints[0], p1: lpoints[1] });
            const unitArc = makeArc({
                r: 1, startAngle: a.startAngle,
                endAngle: a.endAngle, center: { x: 0, y: 0 }
            });
            let p = arcInter(localLine, unitArc);

            // restore points
            p = convertPointFromLocalEllipse(p, a.center, a.rotation, a.rx, a.ry);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_VECTOR, (a, b) => {
            // convert line into local ellipse coordinates
            let lpoints = [b.ref, vAdd(b.ref, b)];
            lpoints = convertPointToLocalEllipse(lpoints, a.center, a.rotation, a.rx, a.ry);

            const arcInter = IntersectionRegistry.getIntersector(TYPE_LINE, TYPE_ARC);
            const localLine = makeLine({ p0: lpoints[0], p1: lpoints[1] });
            const unitArc = makeArc({
                r: 1, startAngle: a.startAngle,
                endAngle: a.endAngle, center: { x: 0, y: 0 }
            });
            let p = arcInter(localLine, unitArc);

            // restore points
            p = convertPointFromLocalEllipse(p, a.center, a.rotation, a.rx, a.ry);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_ARC, (a, b) => {

            const circleEllipse = makeEllipse({
                center: b.center, rx: b.r, ry: b.r, startAngle: b.startAngle, endAngle: b.endAngle, rotation: 0
            });
            const p = intersectEllipseEllipse(a, circleEllipse);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_LINE_STRIP, (a, b) => {
            // convert line into local ellipse coordinates
            let lpoints = b.points;
            lpoints = convertPointToLocalEllipse(lpoints, a.center, a.rotation, a.rx, a.ry);

            const arcInter = IntersectionRegistry.getIntersector(TYPE_LINE_STRIP, TYPE_ARC);
            const localLineStrip = makeLineStrip({ points: lpoints });
            const unitArc = makeArc({
                r: 1, startAngle: a.startAngle,
                endAngle: a.endAngle, center: { x: 0, y: 0 }
            });
            let p = arcInter(localLineStrip, unitArc);

            // restore points
            p = convertPointFromLocalEllipse(p, a.center, a.rotation, a.rx, a.ry);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_POLYGON, (a, b) => {
            // convert line into local ellipse coordinates
            let lpoints = b.points;
            lpoints = convertPointToLocalEllipse(lpoints, a.center, a.rotation, a.rx, a.ry);

            const arcInter = IntersectionRegistry.getIntersector(TYPE_POLYGON, TYPE_ARC);
            const localPolygon = makePolygon({ points: lpoints });
            const unitArc = makeArc({
                r: 1, startAngle: a.startAngle,
                endAngle: a.endAngle, center: { x: 0, y: 0 }
            });
            let p = arcInter(localPolygon, unitArc);

            // restore points
            p = convertPointFromLocalEllipse(p, a.center, a.rotation, a.rx, a.ry);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_BEZIER, (a, b) => {
            // convert line into local ellipse coordinates
            // bezier curves are invariant to affine transforms, so we can do this
            let lpoints = b.points;
            lpoints = convertPointToLocalEllipse(lpoints, a.center, a.rotation, a.rx, a.ry);

            const inter = IntersectionRegistry.getIntersector(TYPE_BEZIER, TYPE_ARC);
            const localBez = makeBezier({ points: lpoints });
            const unitArc = makeArc({
                r: 1, startAngle: a.startAngle,
                endAngle: a.endAngle, center: { x: 0, y: 0 }
            });
            let p = inter(localBez, unitArc);

            // restore points
            p = convertPointFromLocalEllipse(p, a.center, a.rotation, a.rx, a.ry);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_BEZIER_SPLINE, (a, b) => {
            // convert line into local ellipse coordinates
            // bezier curves are invariant to affine transforms, so we can do this
            let lpoints = b.points;
            lpoints = convertPointToLocalEllipse(lpoints, a.center, a.rotation, a.rx, a.ry);

            const inter = IntersectionRegistry.getIntersector(TYPE_BEZIER_SPLINE, TYPE_ARC);
            const localBez = makeBezierSpline({ points: lpoints, degree: b.degree });
            const unitArc = makeArc({
                r: 1, startAngle: a.startAngle,
                endAngle: a.endAngle, center: { x: 0, y: 0 }
            });
            let p = inter(localBez, unitArc);

            // restore points
            p = convertPointFromLocalEllipse(p, a.center, a.rotation, a.rx, a.ry);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
        IntersectionRegistry.setIntersector(TYPE_ELLIPSE, TYPE_ELLIPSE, (a, b) => {

            const p = intersectEllipseEllipse(a, b);

            const result = [];
            for (let i = 0; i < p.length; i++) {

                result.push(makePoint({ ...p[i] }));
            }

            return result;
        });
    }
}

/**
 * Computes the closest point on a line
 * @param {{x:Number,y:Number}} p The input point
 * @param {{x:Number,y:Number}} a0 The first point of the first line
 * @param {{x:Number,y:Number}} a1 The second point of the first line
 * @param {Object} options
 * @param {Number} options.minA The minimum parameter of the first line. For a segment, that is 0
 * @param {Number} options.maxA The maximum parameter of the first line. For a segment, that is 1
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {{x: Number, y:Number}} The closest point on the given line
 */
function closestPointLine(p, a0, a1, { minA = -Infinity, maxA = Infinity,
    eps = 1E-10
} = {}) {
    // project onto line and clamp with bounds

    const dx = a1.x - a0.x;
    const dy = a1.y - a0.y;

    const d2 = dx * dx + dy * dy;
    if (d2 < eps) {
        // line is just a point
        return { x: a0.x, y: a0.y, t: 0 };
    }

    let prelx = p.x - a0.x;
    let prely = p.y - a0.y;

    // dot(prel, d) = projection * |d|
    let t = prelx * dx + prely * dy;

    // divide by d^2 = projection / |d|
    // when projection is |d|, this will be 1
    t = t / d2;

    // clamp sides
    t = Math.min(maxA, Math.max(minA, t));

    const cx = a0.x + t * dx;
    const cy = a0.y + t * dy;

    return {
        x: cx, y: cy, t
    };

}

/**
 * Computes the closest point on an arc
 * @param {{x:Number,y:Number}} p The input point
 * @param {{x:Number,y:Number}} c The arc center
 * @param {Number} r The arc radius
 * @param {Object} options
 * @param {Number} options.minA The minimum parameter of the line. For a segment, that is 0
 * @param {Number} options.maxA The maximum parameter of the line. For a segment, that is 1
 * @param {Number} options.angleMin The minimum arc angle
 * @param {Number} options.angleMax The maximum arc angle
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {{x:Number,y:Number}} The closest point
 */
function closestPointArc(p, c, r, { angleMin = 0, angleMax = 2.0 * Math.PI,
    eps = 1E-10
} = {}) {
    // get closest point on circle first
    const dx = p.x - c.x;
    const dy = p.y - c.y;

    const d2 = dx * dx + dy * dy;
    // if we are in the middle, there are infinitely many closest points
    // we choose the one in x dir

    if (d2 < eps) {
        return { x: c.x + r, y: c.y };
    }
    const d = Math.sqrt(d2);

    const angle = calcAngle(dx, dy);

    if (angle >= angleMin && angle < angleMax) {
        // valid point, return
        // closest point
        const qx = c.x + dx * r / d;
        const qy = c.y + dy * r / d;
        return { x: qx, y: qy };
    } else {
        // point is outside valid range, so closest point is one the boundary points
        const al = miminumAbsoluteDifferenceAngle(angle, angleMin);
        const ar = miminumAbsoluteDifferenceAngle(angle, angleMax);

        const minAngle = al < ar ? angleMin : angleMax;

        // compute final point
        const qx = c.x + r * Math.cos(minAngle);
        const qy = c.y + r * Math.sin(minAngle);
        return { x: qx, y: qy };

    }

}
/**
 * Computes the closest point on a Bezier curves. 
 * For such a point to be exactly computable, the degree of the curve must not exceed 2
 * @param {{x:Number,y:Number}} p The input point
 * @param {Array<{x:Number,y:Number}>} points The Bezier control points
 * @param {Object} options
 * @param {Number} options.eps The epsilon value used for comparisons
 * @returns {{x:Number,y:Number}} The closest point. If multiple such points exist, one is chosen
 */
function closestPointBezier(p, points, { eps = 1E-10 } = {}) {
    const deg = points.length - 1;
    if (deg < 0) {
        throw new Error("No Bezier control points given");

    }
    if (deg > 2) {
        throw new Error("Closest Bezier point only defined for up to degree 2");
    }

    if (deg === 0) {
        // curve is a point
        return points[0];
    }

    if (deg === 1) {
        // curve is a line
        return closestPointLine(p, points[0], points[1], {
            minA: 0, maxA: 1, eps
        });
    }

    // closest point on quadratic bezier
    let [q0, q1, q2] = convertQuadraticBezierToParamBase(...points);
    // quadratic bezier is: (1-t)^2 p0 + 2(1-t)t p1 + t^2 p2
    // we will plug this into x^2 + y^2 - r^2 = 0 to get a quartic equation in t
    // but for that we will center on the circle center

    let { x: a_0, y: b_0 } = q0;
    let { x: a_1, y: b_1 } = q1;
    let { x: a_2, y: b_2 } = q2;

    const { x, y } = p;
    // solve by d/dt|p-bez(t)|^2 = 0
    // this results in a cubic polynomial with the following terms for powers of t:

    // m_0 + t m_1 + t^2 m_2 + t^3 m_3
    // ----------
    // 'Term for power 1: m_0
    // 2*a_0*a_1 - 2*a_1*x + 2*b_0*b_1 - 2*b_1*y
    const m_0 = 2 * a_0 * a_1 - 2 * a_1 * x + 2 * b_0 * b_1 - 2 * b_1 * y;
    // ----------
    // Term for power t: m_1
    // 4*a_0*a_2 + 2*a_1 * a_1 - 4*a_2*x + 4*b_0*b_2 + 2*b_1 * b_1 - 4*b_2*y
    const m_1 = 4 * a_0 * a_2 + 2 * a_1 * a_1 - 4 * a_2 * x + 4 * b_0 * b_2 + 2 * b_1 * b_1 - 4 * b_2 * y;
    // ----------
    // Term for power t^2: m_2
    // 6*a_1*a_2 + 6*b_1*b_2
    const m_2 = 6 * a_1 * a_2 + 6 * b_1 * b_2;
    // ----------
    // Term for power t^3: m_3
    // 4*a_2 * a_2 + 4*b_2 * b_2
    const m_3 = 4 * a_2 * a_2 + 4 * b_2 * b_2;

    // solve polynomial
    const roots = solveCubicComplex(m_3, m_2, m_1, m_0, eps);

    let minDist = Infinity;
    let minP = null;
    // we could also check the second derivative for its sign, 
    // but in this case it seems faster/easier to read to just calculate the smallest distance
    // TODO: Maybe return multiple solutions if they have the same distance
    for (const tc of roots) {
        if (Math.abs(cImag(tc)) > eps) {
            // complex solution
            continue;
        }
        let t = cReal(tc);

        // clamp t at the boundary points
        t = Math.min(1, Math.max(0, t));
        let pt = q2;
        pt = vAdd(vScale(pt, t), q1);
        pt = vAdd(vScale(pt, t), q0);

        const d2 = vLen2(vSub(pt, p));
        if (d2 < minDist) {
            minDist = d2;
            minP = pt;
        }
    }

    return minP;
}

/**
 * Registry for closest point operations on types
 * Currently supported:
 * 
 * Point, Line, Vector, Arc, Line strip, Polygon, Bezier (max deg 2), Bezier Curve (max deg 2), Ellipse
 */
class ClosestPointRegistry {
    static closest = {};


    /**
     * Set the closest point function for a given type
     * @param {String} type The object type
     * @param {function({x:Number, y:Number}) : {x:Number, y:Number}} closestPoint Function computing the closest point for the given type
     */
    static setClosestPointFunction(type, closestPoint) {
        ClosestPointRegistry[type] = closestPoint;
    }
    /**
    * Get the closest point function for a given type
    * @param {String} type The object type
    * @returns {undefined | function({x:Number, y:Number}) : {x:Number, y:Number}} Function computing the closest point for the given type, if it exists
    */
    static getClosestPointFunction(type) {
        return ClosestPointRegistry[type];
    }

    /**
     * Compute the closest point for the given point and object
     * @param {{x:Number, y:Number}} p The input point
     * @param {{type: String}} obj The typed object
     * @returns {{x:Number, y:Number}} The closest point
     */
    static closestPoint(p, obj) {

        const type = obj.type;

        const cl = ClosestPointRegistry.getClosestPointFunction(type);

        return cl(p, obj);
    }

    static {
        // closest point on a point is just that point
        ClosestPointRegistry.setClosestPointFunction(TYPE_POINT, (p, obj) => {
            return obj;
        });
        ClosestPointRegistry.setClosestPointFunction(TYPE_LINE, (p, obj) => {
            const c = closestPointLine(p, obj.p0, obj.p1, {
                minA: obj.leftOpen ? -Infinity : 0,
                maxA: obj.rightOpen ? Infinity : 1,
            });

            return makePoint({ ...c });
        });
        ClosestPointRegistry.setClosestPointFunction(TYPE_VECTOR, (p, obj) => {
            const v = vAdd(obj.ref, obj);
            const c = closestPointLine(p, obj.ref, v, {
                minA: 0,
                maxA: 1,
            });

            return makePoint(c);
        });
        ClosestPointRegistry.setClosestPointFunction(TYPE_ARC, (p, obj) => {
            const c = closestPointArc(p, obj.center, obj.r, {
                angleMin: obj.startAngle,
                angleMax: obj.endAngle
            });

            return makePoint({ ...c });
        });

        ClosestPointRegistry.setClosestPointFunction(TYPE_LINE_STRIP, (p, obj) => {
            const { points } = obj;

            let dmin = Infinity;
            let pmin = null;
            const n = points.length - 1;
            for (let i = 0; i < n; i++) {
                const pi = points[i];
                const pj = points[i + 1];

                const c = closestPointLine(p, pi, pj, {
                    minA: 0,
                    maxA: 1,
                });

                const d2 = vLen2(vSub(p, c));
                if (d2 < dmin) {
                    dmin = d2;
                    pmin = c;
                }
            }


            return makePoint({ ...pmin, d2: dmin });
        });

        ClosestPointRegistry.setClosestPointFunction(TYPE_POLYGON, (p, obj) => {
            const { points } = obj;

            let dmin = Infinity;
            let pmin = null;
            const n = points.length;
            for (let i = 0; i < n; i++) {
                const pi = points[i];
                const pj = points[(i + 1) % points.length];

                const c = closestPointLine(p, pi, pj, {
                    minA: 0,
                    maxA: 1,
                });

                const d2 = vLen2(vSub(p, c));
                if (d2 < dmin) {
                    dmin = d2;
                    pmin = c;
                }
            }

            return makePoint({ ...pmin, d2: dmin });
        });

        ClosestPointRegistry.setClosestPointFunction(TYPE_BEZIER, (p, obj) => {
            const c = closestPointBezier(p, obj.points, {});
            if (!c) {
                return INVALID;
            }
            return makePoint(c);
        });
        ClosestPointRegistry.setClosestPointFunction(TYPE_BEZIER_SPLINE, (p, obj) => {
            const { points, degree } = obj;
            if ((points.length - (degree + 1)) % degree !== 0) {
                throw new Error("Wrong number of input points");
            }

            let dmin = Infinity;
            let pmin = null;

            const lPoints = new Array(degree + 1);
            for (let i = 0; i < points.length - 1; i += degree) {
                for (let j = 0; j < degree + 1; j++) {
                    lPoints[j] = points[i + j];
                }
                const c = closestPointBezier(p, lPoints, {});
                if (!c) {
                    continue;
                }
                const d2 = vLen2(vSub(p, c));
                if (d2 < dmin) {
                    dmin = d2;
                    pmin = c;
                }
            }

            return pmin ? makePoint(pmin) : INVALID;
        });

        ClosestPointRegistry.setClosestPointFunction(TYPE_ELLIPSE, (p, obj) => {
            const [q] = convertPointToLocalEllipse([p], obj.center, obj.rotation, obj.rx, obj.ry);

            // closest point to unice circle
            let c = closestPointArc(q, { x: 0, y: 0 }, 1, {
                angleMin: obj.startAngle,
                angleMax: obj.endAngle
            });

            [c] = convertPointFromLocalEllipse([c], obj.center, obj.rotation, obj.rx, obj.ry);
            return makePoint({ ...c });
        });
    }
}

/**
 * Checks whether an object is one of the types given
 * @param {{type: String}} obj The dependency to check
 * @param  {...String} types A number of types that the object should be one of
 * @returns True, if the object is of the give type. Throws an error otherwise
 */
function assertType(obj, ...types) {
    for (let type of types) {
        // find matching type
        if (obj.type === type) {
            return;
        }
    }
    throw new Error(`Expected type ${type}, got ${obj.type}`);
}

/**
 * Definition of a vector that can be constructed a number of ways
 * A vector consists of x and y coordinates specifying its direction and length and a reference point to which it is attached to.
 * While a mathematical vector is of course not bound to a specific point, this makes working with and displaying vectors easier
 */
class DefVector {
    /**
     * Constructor sets default values
     * @param {Object} params
     * @param {Number} params.x The default x coordinate
     * @param {Number} params.y The default y coordinate
     * @param {{x:Number, y:Number}} params.ref The point to which this vector is attached to
     * @param {Boolean} params.normalize Whether or not this vector should be normalized
     */
    constructor({ x = 0, y = 0, ref = { x: 0, y: 0 }, normalize = false } = {}) {
        this.x = x;
        this.y = y;
        this.ref = ref;
        this.normalize = normalize;
    }

    /**
     * Creates a new vector from the position vector of a point.
     * @param {Object} params
     * @param {Number | Object} [params.p] Either the index or value of a TYPE_POINT. The position
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromPosition({ p, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("pc", { p, ref, normalize });
    }
    /**
     * Creates a new vector from another vector and reference position.
     * If only a vector and no reference is given, the other vector's reference is used
     * @param {Object} params
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @param {Number | Object} [params.v] Either the index or value of a TYPE_VECTOR. The vector
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromRefVector({ ref = EMPTY, v = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("rv", {
            ref, v, normalize
        });
    }

    /**
     * Creates a new vector from individual values
     * @param {Object} params
     * @param {Number | Object} [params.x] Either the index or value of a TYPE_NUMBER. The x coordinate
     * @param {Number | Object} [params.y] Either the index or value of a TYPE_NUMBER. The y coordinate
     * @param {Number | Object} [params.refX] Either the index or value of a TYPE_NUMBER. The reference x coordinate
     * @param {Number | Object} [params.refY] Either the index or value of a TYPE_NUMBER. The reference y coordinate
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromCoordinates({ x = EMPTY, y = EMPTY, refX = EMPTY, refY = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("c", {
            x, y, refX, refY, normalize
        });
    }

    /**
     * Creates a new vector from a line segment
     * The vector will use the first line point as a reference and point to the second point
     * @param {Number | Object} line  Either the index or value of a TYPE_LINE. The line
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromLineSegment(line, normalize = EMPTY) {
        return CreateInfo.new("l", {
            line, normalize
        });
    }
    /**
     * Creates a new vector from two points
     * The vector will use the first point as a reference and point to the second point
     * @param {Number | Object} p0  Either the index or value of a TYPE_POINT. The first point
     * @param {Number | Object} p1  Either the index or value of a TYPE_POINT. The second point
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(p0, p1, normalize = EMPTY) {
        return CreateInfo.new("pp", {
            p0, p1, normalize
        });
    }

    /**
     * Creates a new vector from polar coordinates
     * @param {Object} params
     * @param {Number | Object} params.polar Either the index or value of a TYPE_POLAR. The polar coordinate
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromPolar({ polar, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("pol", { polar, ref, normalize });
    }

    /**
     * Computes the value of this definition
     * @param {CreateInfo} createInfo 
     * @returns {Object} The computed vector with type TYPE_VECTOR
     */
    compute(createInfo) {

        const { dependencies } = createInfo;
        let { x, y, ref, normalize } = this;


        if (createInfo.name === "rv") {
            const { ref: referencePoint, v: vector, normalize: normalizeN } = dependencies;

            if (!isParamEmpty(referencePoint)) {
                assertType(referencePoint, TYPE_POINT);
                ref = referencePoint;
            }
            if (!isParamEmpty(vector)) {
                assertType(vector, TYPE_VECTOR);
                x = vector.x;
                y = vector.y;
            }

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else if (createInfo.name === "c") {
            const { x: vx, y: vy, refX, refY, normalize: normalizeN } = dependencies;
            if (!isParamEmpty(vx)) {
                assertType(vx, TYPE_NUMBER);
                x = vx.value;
            }

            if (!isParamEmpty(vy)) {
                assertType(vy, TYPE_NUMBER);

                y = vy.value;
            }
            if (!isParamEmpty(refX)) {
                assertType(refX, TYPE_NUMBER);
                ref.x = refX.value;
            }
            if (!isParamEmpty(refY)) {
                assertType(refY, TYPE_NUMBER);

                ref.y = refY.value;
            }

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else if (createInfo.name === "pc") {
            const { p, normalize: normalizeN, ref: refN } = dependencies;

            if (!isParamEmpty(p)) {
                assertType(p, TYPE_POINT);
                x = p.x;
                y = p.y;
            }

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }

            if (!isParamEmpty(refN)) {
                assertType(refN, TYPE_POINT);
                ref = refN;
            }

        } else if (createInfo.name === "l") {
            const { line, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(line);
            assertType(line, TYPE_LINE);

            const { p0, p1 } = line;
            ({ x, y } = vSub(p1, p0));
            ref = p0;


            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }

        } else if (createInfo.name === "pp") {
            const { p0, p1, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(p0, p1);
            assertType(p0, TYPE_POINT);
            assertType(p1, TYPE_POINT);

            ref = p0;

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }


            ({ x, y } = vSub(p1, p0));
        } else if (createInfo.name === "pol") {
            const { polar, ref: refN, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(polar);

            assertType(polar, TYPE_POLAR);

            const { r, alpha } = polar;
            ({ x, y } = vPolar(r, alpha));

            if (!isParamEmpty(refN)) {
                assertType(refN, TYPE_POINT);
                ref = refN;
            }

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }

        } else if (createInfo !== EMPTY_INFO) {
            throw new Error(`No suitable parameters found to construct Vector`);
        }

        if (normalize) {
            ({ x, y } = vNormalizeIfNotZero(vVec2(x, y)));
        }
        return makeVector({
            x, y, ref
        });
    }
}

/**
 * Easier access to some common vector operations.
 * These could also easily be implemented by a DefFunc
 */
class DefVectorOps {

    /**
     * Attaches the second vector at the tip of the first. 
     * The result is a vector that points from the first vector's reference point to the tip of the second.
     * Optionally, a new reference point may be specified. 
     * The result will be of type TYPE_VECTOR
     * NOTE: This will be equivalent to adding the vectors and placing them at the reference, if they share the same reference point.
     * 
     * @param {Number | Object} a Either the index or value of a TYPE_VECTOR. The first vector
     * @param {Number | Object} b Either the index or value of a TYPE_VECTOR. The vector to be attached
     * @param {Number | Object} [ref] Either the index or value of a TYPE_POINT. The new reference
     * @returns {CreateInfo} The creation info
     */
    static fromAttach(a, b, ref = EMPTY) {
        return CreateInfo.new("att", { a, b, ref });
    }

    /**
     * Computes the dot product of two vectors.
     * The result will be of type TYPE_NUMBER
     * @param {Number | Object} a Either the index or value of a TYPE_VECTOR. The first vector
     * @param {Number | Object} b Either the index or value of a TYPE_VECTOR. The second vector
     * @returns {CreateInfo} The creation info
     */
    static fromDot(a, b) {
        return CreateInfo.new("dot", { a, b });
    }

    /**
     * Negates the given vectors
     * Optionally, the reference point can be switched to the old arrow tip, so the arrow overall stays in the same place
     * The result will be of type TYPE_VECTOR
     * 
     * @param {Number | Object} a Either the index or value of a TYPE_VECTOR. The vector
     * @param {Boolean} [attachAtEndPoint] Whether or not the new vector will be attached at the old arrow tip
     * @returns {CreateInfo} The creation info
     */
    static fromNegate(a, attachAtEndPoint = false) {
        return CreateInfo.new("neg", { a }, { attachAtEndPoint });
    }

    /**
     * Transforms a given vector by rotation and scaling
     * Optionally, a new reference point may be specified. 
     * The result will be of type TYPE_VECTOR
     * 
     * @param {Number | Object} a Either the index or value of a TYPE_VECTOR. The vector
     * @param {Object} params
     * @param {Number | Object} [params.alpha] Either the index or value of a TYPE_NUMBER. The rotation angle
     * @param {Number | Object} [params.scale] Either the index or value of a TYPE_NUMBER. The scaling factor
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized before scaling
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The new reference point
     * @param {Object} [defaultValues]
     * @param {Number} [defaultValues.alpha = 0] Default value for the rotation angle
     * @param {Number} [defaultValues.scale = 1] Default value for the scaling factor
     * @param {Number} [defaultValues.normalize = false] Default value for the normalization
     * @returns {CreateInfo} The creation info
     */
    static fromTransform(a, { alpha = EMPTY, scale = EMPTY, normalize = EMPTY, ref = EMPTY, },
        defaultValues = {}) {
        const { alpha: alpha0 = 0, scale: scale0 = 1, normalize: normalize0 = false } = defaultValues;
        return CreateInfo("tr", { a, alpha, scale, normalize, ref, }, {
            alpha: alpha0, scale: scale0, normalize: normalize0
        });
    }

    /**
     * Computes the specified operation
     * @param {CreateInfo} info The creation info
     * @returns The result of the operation of the type specified for the different from methods
     */
    compute(info) {
        const { dependencies, params } = info;

        if (info.name === "att") {
            const { a, b, ref } = dependencies;
            assertExistsAndNotOptional(a, b);
            assertType(a, TYPE_VECTOR);
            assertType(b, TYPE_VECTOR);
            const ab = Vec2.add(a, b);

            let refp = a.ref;
            if (!isParamEmpty(ref)) {
                assertType(ref, TYPE_POINT);
                refp = ref;
            }

            return makeVector({ x: ab.x, y: ab.y, ref: refp });
        } else if (info.name === "dot") {
            const { a, b } = dependencies;
            assertExistsAndNotOptional(a, b);
            assertType(a, TYPE_VECTOR);
            assertType(b, TYPE_VECTOR);
            const dot = Vec2.dot(a, b);

            return makeNumber(dot);
        } else if (info.name === "neg") {
            const { a } = dependencies;
            const { attachAtEndPoint } = params;
            const v = Vec2.scale(a, -1);
            let ref = a.ref;
            if (attachAtEndPoint) {
                ref = Vec2.add(ref, a);
            }

            return makeVector({ x: v.x, y: v.y, ref });
        } else if (info.name === "tr") {
            const { a, alpha: alpha0,
                scale: scale0, normalize: normalize0, ref: ref0 } = dependencies;
            let { alpha, scale, normalize } = params;

            assertExistsAndNotOptional(a);
            assertType(a, TYPE_VECTOR);

            if (!isParamEmpty(t0)) {
                assertType(t0, TYPE_VECTOR);
                t = t0;
            }

            if (!isParamEmpty(alpha0)) {
                assertType(alpha0, TYPE_NUMBER);
                alpha = alpha0.value;
            }

            if (!isParamEmpty(scale0)) {
                assertType(scale0, TYPE_NUMBER);
                scale = scale0.value;
            }

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, TYPE_BOOLEAN);
                normalize = normalize0.value;
            }

            let ref = a.ref;

            if (!isParamEmpty(ref0)) {
                assertType(ref0, TYPE_POINT);
                ref = ref0;
            }

            let vf = a;

            if (normalize) {
                vf = Vec2.normalizeIfNotZero(vf);
            }
            vf = Vec2.scale(vf, scale);
            vf = Vec2.rotate(vf, alpha);

            return makeVector({ x: vf.x, y: vf.y, ref });

        } else {
            throw new Error("No suitable constructor");
        }

    }
}

/**
 * Definition of a coordinate system
 * 
 * Coordinte systems may be placed relative to other coordinate systems. They are specified by two local axes and a local origin.
 * 
 * When computing the value, the final coordinates of origin and axes will be in the same coordinate frame as the parent. 
 * Thus, in  general, the result will be in world coordinates, as each parent, will itself be specified in its parent's system, until there is a system with no parent (implicit world coordinates)
 * 
 * This makes it easy to define vectors and points locally, with DefCoordSystemOps  and still use those resulting  vectors together with arbitrary other ones, without the issue if different coordinate frames
 */
class DefCoordSystem {

    /**
     * Creates a coordinate system structure for the given parameters
     * If origin is not given, it defaults to the usual (0,0)
     * If u is not given, it defaults to the usual x-axis (1,0)
     * If v is not given, it defaults to the normal vector to u.
     * @param {Object} [params]
     * @param {{x:Number, y:Number}} [params.origin] The origin
     * @param {{x:Number, y:Number}} [params.u] The first axis
     * @param {{x:Number, y:Number}} [params.v] The second axis
     * @returns {{origin: {x:Number, y:Number}, u: {x:Number, y:Number}, v: {x:Number, y:Number}}}
     */
    static createSystem({ origin, u, v } = {}) {
        origin = origin ?? Vec2.vec2(0, 0);
        // u needs to be specified, otherwise v is set back
        if (!u) {
            v = null;
        }
        u = u ?? Vec2.vec2(1, 0);
        v = v ?? Vec2.normal2D(u);
        return { origin, u, v };
    }

    /**
     * Computes the contravariant basis for a given basis
     * 
     * As the basis vectors are not required to be normalized or orthogonal, the contravariant basis can be used to determine the coordinates of a vector in the given basis
     * 
     * @param {{x:Number, y:Number}} u The first axis
     * @param {{x:Number, y:Number}} v The second axis
     * @returns {{u: {x:Number, y:Number}, v: {x:Number, y:Number}}} The contravariant basis vectors
     */
    static computeContravariantBasis(u, v) {
        const u2 = Vec2.len2(u);
        const v2 = Vec2.len2(v);
        const dotUV = Vec2.dot(u, v);
        const a = 1 / (u2 * v2 - dotUV * dotUV);

        const up = Vec2.add(Vec2.scale(u, a * v2), Vec2.scale(v, -a * dotUV));
        const vp = Vec2.add(Vec2.scale(u, -a * dotUV), Vec2.scale(v, a * u2));

        return { u: up, v: vp };
    }
    /**
     * Computes the world coordinates of a vector specified in the local coordinates
     * 
     * As a vector has no position, this just depends on the axes
     * 
     * @param {{x:Number, y:Number}} coords The local coordintaes
     * @param {Object} coordSystem
     * @param {{x:Number, y:Number}} coordSystem.u The first axis
     * @param {{x:Number, y:Number}} coordSystem.v The second axis
     * @returns {{x:Number, y:Number}} The world vector
     */
    static vectorFromCoordSystem(coords, { u, v }) {
        return Vec2.add(Vec2.scale(u, coords.x), Vec2.scale(v, coords.y));
    }

    /**
     * Computes the world coordinates of a point specified in the local coordinates
     * 
     * @param {{x:Number, y:Number}} coords The local coordintaes
     * @param {Object} coordSystem
     * @param {{x:Number, y:Number}} coordSystem.origin The origin
     * @param {{x:Number, y:Number}} coordSystem.u The first axis
     * @param {{x:Number, y:Number}} coordSystem.v The second axis
     * @returns {{x:Number, y:Number}} The world point
     */
    static pointFromCoordSystem(coords, { origin, u, v }) {
        return Vec2.add(origin, Vec2.add(Vec2.scale(u, coords.x), Vec2.scale(v, coords.y)));
    }

    /**
     * Computes, whether a coordinate system is right-handed
     * @param {{x:Number, y:Number}} u The first axis
     * @param {{x:Number, y:Number}} v The second axis
     * @returns True, if the coordinate system is right-handed, otherwise false
     */
    static isRightHanded(u, v) {
        // check whether the determinant of the matrix made up of both base cectors is non-negative
        return u.x * v.y - u.y * v.x >= 0;
    }

    /**
     * Default values
     * @param {Object} [params]
     * @param {{orign : {x:Number, y:Number}, u : {x:Number, y:Number}, v: {x:Number, y:Number}}} [params.local] The local coordinate system
     * @param {{orign : {x:Number, y:Number}, u : {x:Number, y:Number}, v: {x:Number, y:Number}}} [params.prent] The parent coordinate system
     */
    constructor({ local = {}, parent = {} } = {}) {

        this.local = local;
        this.parent = parent;
    }

    /**
     * Creates a coordinate system by specifying local origin and axes
     * 
     * If the first axis (u) is given, the second default value will be overriden by the given second axis (v) as well, even if that is empty.
     * That means, if u is not given, v will also be set to empty and used the default values, if they are set.
     * If v is empty, it will be computed as the normal to u.
     * 
     * When not given any values, the defaults are the usual coordinate axies with origin (0,0) and u = (1,0), v = (0,1)
     * 
     * @param {Object} [params]
     * @param {Number | Object} [params.origin] Either the index or value of a TYPE_POINT. The local origin
     * @param {Number | Object} [params.u] Either the index or value of a TYPE_VECTOR. The first axis
     * @param {Number | Object} [params.v] Either the index or value of a TYPE_VECTOR. The second axis
     * @param {Number | Object} [params.parent] Either the index or value of a TYPE_COORD_SYSTEM. The parent coordinate system
     * @returns {CreateInfo} The creation info
     */
    static fromValues({ origin = EMPTY, u = EMPTY, v = EMPTY, parent = EMPTY } = {}) {
        return CreateInfo.new("v", { origin, u, v, parent });
    }

    /**
     * Creates a coordinate system by specifying a transformation of the local axes
     * 
     * @param {Object} [params]
     * @param {Number | Object} [params.translation] Either the index or value of a TYPE_VECTOR. The translation of the origin
     * @param {Number | Object} [params.rotation] Either the index or value of a TYPE_NUMBER. The rotation angle of the first axis
     * @param {Number | Object} [params.scale] Either the index or value of either type TYPE_VECTOR or TYPE_NUMBER. The scaling factor
     * @param {Number | Object} [params.parent] Either the index or value of a TYPE_COORD_SYSTEM. The parent coordinate system
     * @param {Object} [defaultValues]
     * @param {{x: Number, y:Number}} [defaultValues.translation] Default value for the translation
     * @param {Number} [defaultValues.rotation] Default value for the rotation angle
     * @param {Number | {x: Number, y:Number}} [defaultValues.scale] Default value for the scale
     * @returns {CreateInfo} The creation info
     */
    static fromTransform({ translation = EMPTY, rotation = EMPTY, scale = EMPTY, parent = EMPTY }, defaultValues) {
        const { translation: t = { x: 0, y: 0 }, rotation: rot = 0, scale: s = { x: 1, y: 1 } } = defaultValues;
        return CreateInfo.new("t", { translation, rotation, scale, parent }, {
            translation: t, rotation: rot, scale: s
        });
    }

    /**
     * Creates a coordinate system that consist of the same origin but the contravarint base vectors as the given system
     * 
     * @param {Number | Object} system Either the index or value of a TYPE_COORD_SYSTEM. The system which this one is based on
     * @param {Number | Object} [parent] Either the index or value of a TYPE_COORD_SYSTEM. The parent coordinate system
     * @returns {CreateInfo} The creation info
     */
    static fromContravariant(system, parent = EMPTY) {
        return CreateInfo.new("c", { system, parent });
    }

    /**
     * Computes the coordinate system
     * @param {CreateInfo} info The creation info
     * @returns {Object} An object of type TYPE_COORD_SYSTEM
     */
    compute(info) {
        const { dependencies, params } = info;

        let { local, parent } = this;
        // copy values so they can be overriden
        local = Object.assign({}, local);
        parent = Object.assign({}, parent);

        if (info.name === "v") {
            const { origin, u, v, parent: parent0 } = dependencies;

            if (!isParamEmpty(origin)) {
                assertType(origin, TYPE_POINT);
                local.origin = origin;
            }

            if (!isParamEmpty(u)) {
                assertType(u, TYPE_VECTOR);
                local.u = u;
            }
            if (!isParamEmpty(v)) {
                assertType(v, TYPE_VECTOR);
                local.v = v;
            } else {
                local.v = null;
            }

            if (!isParamEmpty(parent0)) {
                assertType(parent0, TYPE_COORD_SYSTEM);
                parent = parent0;
            }

        } else if (info.name === "t") {
            let { translation, rotation, scale } = params;
            if (typeof scale === "number") {
                scale = Vec2.vec2(scale, scale);
            }
            const { translation: t0, rotation: r0, scale: s0, parent: parent0 } = dependencies;

            if (!isParamEmpty(t0)) {
                assertType(t0, TYPE_VECTOR);
                translation = t0;
            }
            if (!isParamEmpty(s0)) {
                assertType(s0, TYPE_VECTOR, TYPE_NUMBER);
                if (s0.type === TYPE_VECTOR) {
                    scale = s0;
                } else {
                    scale = Vec2.vec2(s0.value, s0.value);
                }
            }

            if (!isParamEmpty(r0)) {
                assertType(r0, TYPE_NUMBER);
                rotation = r0.value;
            }

            // compute T * R * S
            let u = Vec2.vec2(scale.x, 0);
            let v = Vec2.vec2(0, scale.y);
            u = Vec2.rotate(u, rotation);
            v = Vec2.rotate(v, rotation);
            local.u = u;
            local.v = v;
            local.origin = translation;

            if (!isParamEmpty(parent0)) {
                assertType(parent0, TYPE_COORD_SYSTEM);
                parent = parent0;
            }
        } else if (info.name === "c") {
            const { origin, u, v, parent: parent0 } = dependencies;

            if (!isParamEmpty(origin)) {
                assertType(origin, TYPE_POINT);
                local.origin = origin;
            }

            if (!isParamEmpty(u)) {
                assertType(u, TYPE_VECTOR);
                local.u = u;
            }
            if (!isParamEmpty(v)) {
                assertType(v, TYPE_VECTOR);
                local.v = v;
            } else {
                local.v = null;
            }

            if (!isParamEmpty(parent0)) {
                assertType(parent0, TYPE_COORD_SYSTEM);
                parent = parent0;
            }

            // we want to have everything in world space
            // as the contravariant base vectors transform inversely to the covariant ones, we will do the computation here
            local = DefCoordSystem.createSystem(local);
            parent = DefCoordSystem.createSystem(parent);
            const o = Vec2.add(parent.origin,
                DefCoordSystem.vectorFromCoordSystem(local.origin, parent))
            let uc = DefCoordSystem.vectorFromCoordSystem(local.u, parent);
            let vc = DefCoordSystem.vectorFromCoordSystem(local.v, parent);

            ({ u: uc, v: vc } = DefCoordSystem.computeContravariantBasis(uc, vc));
            return makeCoordinateSystem(o, uc, vc);

        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        // we do this geometrically by specifying the final axes as linear combinations of the parent
        // a matrix view is the same, but might be easier to read/generalize

        // compute the origin in the parent coordinates
        // here, we always assume the parent to be specified in world coordinates
        // this way, all vectors computed from this system can be treated the same way as other vectors
        local = DefCoordSystem.createSystem(local);
        parent = DefCoordSystem.createSystem(parent);
        const origin = Vec2.add(parent.origin,
            DefCoordSystem.vectorFromCoordSystem(local.origin, parent))
        const u = DefCoordSystem.vectorFromCoordSystem(local.u, parent);
        const v = DefCoordSystem.vectorFromCoordSystem(local.v, parent);

        return makeCoordinateSystem(origin, u, v);
    }
}

/**
 * Some operations for working with coordinatae systems
 */
class DefCoordSystemOps {

    /**
     * Computes the world coordinates of a point defined in the given coordinate system
     * 
     * The resulting type is the same as the one of v
     * 
     * @param {Number | Object} v Either the index or value of TYPE_POINT or TYPE_VECTOR. The input point or vector
     * @param {Number | Object} [system] Either the index or value of a TYPE_COORD_SYSTEM. The system in which the point or vector is defined in
     * @returns {CreateInfo} The creation info
     */
    static fromPointOrVec(v, coordSystem = EMPTY) {
        return CreateInfo.new("v", { v, coordSystem });
    }

    /**
     * Computes the local coordinates in the given coordinate system of a point defined in world space
     * 
     * The resulting type is the same as the one of v.
     * 
     * For vectors, the reference is transformed as well
     * 
     * @param {Number | Object} v Either the index or value of TYPE_POINT or TYPE_VECTOR. The input point or vector
     * @param {Number | Object} [system] Either the index or value of a TYPE_COORD_SYSTEM. The system
     * @returns {CreateInfo} The creation info
     */
    static fromToCoordinates(v, coordSystem = EMPTY) {
        return CreateInfo.new("c", { v, coordSystem });
    }

    /**
     * Computes, whether the given coordinte system is left or right-handed.
     * 
     * The resulting type is TYPE_BOOLEAN
     * 
     * @param {Number | Object} system Either the index or value of a TYPE_COORD_SYSTEM. The system
     * @returns {CreateInfo} The creation info
     */
    static fromIsRightHanded(coordSystem) {
        return CreateInfo.new("r", { coordSystem });
    }

    /**
     * Computes the operation
     * 
     * @param {CreateInfo} info The creation info
     * @returns {Object} An object with a type dependent on the specified operation
     */
    compute(info) {
        const { dependencies, params } = info;
        if (info.name === "v") {
            const { v, coordSystem } = dependencies;
            assertExistsAndNotOptional(v);
            assertType(v, TYPE_POINT, TYPE_VECTOR);

            let cs = coordSystem;
            if (!isParamEmpty(cs)) {
                assertType(cs, TYPE_COORD_SYSTEM);
            } else {
                cs = DefCoordSystem.createSystem();
            }

            // coords relative to coord origin
            let vw = DefCoordSystem.vectorFromCoordSystem(v, cs);
            if (v.type === TYPE_POINT) {
                vw = Vec2.add(vw, cs.origin);
                return makePoint(vw);
            } else {
                let ref = DefCoordSystem.vectorFromCoordSystem(v.ref, cs);
                ref = Vec2.add(cs.origin, ref);
                return makeVector({ x: vw.x, y: vw.y, ref });
            }
        } else if (info.name === "c") {
            const { v, coordSystem } = dependencies;
            assertExistsAndNotOptional(v);
            assertType(v, TYPE_POINT, TYPE_VECTOR);

            let cs = coordSystem;
            if (!isParamEmpty(cs)) {
                assertType(cs, TYPE_COORD_SYSTEM);
            } else {
                cs = DefCoordSystem.createSystem();
            }

            // coordintes are computes with the covariant base
            const { u: uc, v: vc } = DefCoordSystem.computeContravariantBasis(cs.u, cs.v);
            let p = v;
            if (v.type === TYPE_POINT) {
                p = Vec2.sub(p, cs.origin);
                let pu = Vec2.dot(p, uc);
                let pv = Vec2.dot(p, vc);
                return makePoint({ x: pu, y: pv });
            } else {
                let pu = Vec2.dot(p, uc);
                let pv = Vec2.dot(p, vc);

                let ref = Vec2.sub(v.ref, cs.origin);
                let ru = Vec2.dot(ref, uc);
                let rv = Vec2.dot(ref, vc);

                return makeVector({
                    x: pu, y: pv, ref: {
                        x: ru, y: rv
                    }
                });
            }

        } else if (info.name === "r") {
            const { coordSystem } = dependencies;
            assertExistsAndNotOptional(coordSystem);
            assertType(coordSystem, TYPE_COORD_SYSTEM);
            return makeBoolean(DefCoordSystem.isRightHanded(coordSystem.u, coordSystem.v));
        } else {
            throw new Error("No suitable constructor");
        }
    }
}
/**
 * Definition of a normal vector  that can be constructed in various ways. 
 * A vector consists of x and y coordinates specifying its direction and length and a reference point to which it is attached to.
 * While a mathematical vector is of course not bound to a specific point, this makes working with and displaying vectors easier
 */
class DefNormalVector {

    /**
     * Constructor sets default values
     * @param {Object} params
     * @param {{x:Number, y:Number}} params.ref The point to which this vector is attached to
     * @param {Boolean} params.normalize Whether or not this vector should be normalized
     */
    constructor({
        normalize = false,
        ref = { x: 0, y: 0 },
    } = {}) {
        this.normalize = normalize;
        this.ref = ref;
    }

    /**
     * Creates a new normal vector from the position vector of a point.
     * @param {Object} params
     * @param {Number | Object} params.p Either the index or value of a TYPE_POINT. The position
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromPointCoordinates({ p, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("pc", { p, ref, normalize });
    }

    /**
     * Creates a new normal vector from a line segment
     * The vector will use the first line point as a reference and point to the second point
     * @param {Number | Object} line  Either the index or value of a TYPE_LINE. The line
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromLine({ line, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("l", { line, ref, normalize });
    }
    /**
     * Creates a new normal vector from another vector.
     * If only a vector and no reference is given, the other vector's reference is used
     * @param {Object} params
     * @param {Number | Object} params.v Either the index or value of a TYPE_VECTOR. The vector
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromVector({ v, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("v", { v, ref, normalize });
    }

    /**
     * Creates a new normal vector from individual vector components
     * @param {Object} params
     * @param {Number | Object} params.x Either the index or value of a TYPE_NUMBER. The x coordinate
     * @param {Number | Object} params.y Either the index or value of a TYPE_NUMBER. The y coordinate
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromCoordinates({ x, y, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("c", { x, y, ref, normalize });
    }

    /**
     * Creates a new normal vector from two points
     * The vector will use the first point as a reference and point to the second point
     * @param {Object} params
     * @param {Number | Object} params.p0  Either the index or value of a TYPE_POINT. The first point
     * @param {Number | Object} params.p1  Either the index or value of a TYPE_POINT. The second point
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromPoints({ p0, p1, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("pp", { p0, p1, ref, normalize });
    }

    /**
     * Creates a normal at a point with respect to the given arc/circle.
     * The point is the reference point as well.
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @param {Number | Object} arc Either the index or value of a TYPE_ARC. The circle
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromArc(p, arc, normalize = EMPTY) {
        return CreateInfo.new("arc", { p, arc, normalize });
    }
    /**
     * Creates a normal at a point with respect to the given ellipse.
     * The point is the reference point as well.
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @param {Number | Object} ellipse Either the index or value of a TYPE_ELLIPSE. The ellipse
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromEllipse(p, ellipse, normalize = EMPTY) {
        return CreateInfo.new("eli", { p, ellipse, normalize });
    }

    /**
     * Computes the normal of a point with respect to a circle.
     * Will be scaled according to 2 / r^2 [x,y]
     * @param {{x:Number, y:Number}} p The point
     * @param {{x:Number, y:Number}} center The circle center
     * @param {Number} r The circle radius
     * @returns {{x:Number, y:Number}} The circle normal
     */
    static circleNormal(p, center, r) {
        // compute the normal
        // implicit arc is (one version)
        // x^2 / r^2 + y^2 / r^2 - 1 = 0   

        // normal is the gradient
        // 2 / r^2 [x, y]
        p = vSub(p, center);
        return vScale(p, 2 / (r * r));
    }

    /**
     * Computes the normal of a point with respect to an ellipse.
     * Will be scaled according to  [2x / rx^2 , 2y / ry^2]
     * @param {{x:Number, y:Number}} p The point
     * @param {{x:Number, y:Number}} center The ellipse center
     * @param {Number} rx The ellipse x-eccentricity
     * @param {Number} ry The ellipse y-eccentricity
     * @param {Number} rotation The ellipse rotation
     * @returns {{x:Number, y:Number}} The normal
     */
    static ellipseNormal(p, center, rx, ry, rotation) {
        // unrotated ellipse is e(x,y) =  x^2 / a^2 +  y^2 / b^2 - 1 = 0
        // we choose this version so the normal vectors resemble the length of polar coordinates
        // normal = grad e = [2x / a^2 , 2y / b^2]

        // to get (x,y), we just transform q into the local system (not unit circle)
        // then we rotate the final result back

        let q = vSub(p, center);
        q = vRotate(q, -rotation);
        let n = vVec2(2 * q.x / (rx * rx), 2 * q.y / (ry * ry));
        // rotate
        n = vRotate(n, rotation);

        return n;
    }

    /**
     * Computes the normal vector value
     * @param {CreateInfo} createInfo The create information
     * @returns {Object} The normal with type TYPE_VECTOR
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let { normalize, ref } = this;

        let n;
        if (createInfo.name === "pc") {
            const { p, ref: refp, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(p);
            assertType(p, TYPE_POINT);

            if (!isParamEmpty(refp)) {
                assertType(refp, TYPE_POINT);
                ref = refp;
            }

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }

            n = normal2D(p);

        } else if (createInfo.name === "l") {
            const { line, ref: refp, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(line);
            assertType(line, TYPE_LINE);

            const { p0, p1 } = line;

            n = normal2D(vSub(p1, p0));
            ref = p0;

            if (!isParamEmpty(refp)) {
                assertType(refp, TYPE_POINT);
                ref = refp;
            }
            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else if (createInfo.name === "v") {
            const { v, ref: refp, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(v);
            assertType(v, TYPE_VECTOR);

            n = normal2D(v);
            ref = v.ref;

            if (!isParamEmpty(refp)) {
                assertType(refp, TYPE_POINT);
                ref = refp;
            }
            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else if (createInfo.name === "c") {
            const { x: xv, y: yv, ref: refp, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(xv, yv);
            assertType(xv, TYPE_NUMBER);
            assertType(yv, TYPE_NUMBER);

            n = normal2D(vVec2(xv.val, yv.val));
            if (!isParamEmpty(refp)) {
                assertType(refp, TYPE_POINT);
                ref = refp;
            }
            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else if (createInfo.name === "pp") {
            const { p0, p1, ref: refp, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(p0, p1);
            assertType(p0, TYPE_POINT);
            assertType(p1, TYPE_POINT);

            n = normal2D(vSub(p1, p0));
            ref = p0;

            if (!isParamEmpty(refp)) {
                assertType(refp, TYPE_POINT);
                ref = refp;
            }
            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else if (createInfo.name === "arc") {
            const { p, arc, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(p, arc);
            assertType(p, TYPE_POINT);
            assertType(arc, TYPE_ARC);

            const { r, center } = arc;

            n = DefNormalVector.circleNormal(p, center, r);

            ref = p;

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else if (createInfo.name === "eli") {
            const { p, ellipse, normalize: normalizeN } = dependencies;
            assertExistsAndNotOptional(p, ellipse);
            assertType(p, TYPE_POINT);
            assertType(ellipse, TYPE_ELLIPSE);

            const { rx, ry, rotation, center } = ellipse;

            n = DefNormalVector.ellipseNormal(p, center, rx, ry, rotation);

            ref = p;
            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
        } else {
            throw new Error(`No suitable constructor found`);
        }


        if (normalize) {
            n = vNormalizeIfNotZero(n);
        }
        return makeVector({ x: n.x, y: n.y, ref });

    }
}

/**
 * Definition of a perpendicular line going through a point
 */
class DefPerpendicularLine {

    /**
     * Creates a new perpendicular line from a vector or a line.
     * The line will use the first point of a line or the vector reference as a point through which it goes
     * @param {Object} params
     * @param {Number | Object} params.v  Either the index or value of a TYPE_POINT | TYPE_LINE. The vector or line
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @returns {CreateInfo} The creation info
     */
    static fromVectorsOrLine({ v, ref = EMPTY }) {
        return CreateInfo.new("vl", { v, ref });
    }
    /**
     * Computes the perpendicular line
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The line with TYPE_LINE
     */
    compute(createInfo) {

        const { dependencies } = createInfo;

        let ref = { x: 0, y: 0 };
        let v = { x: 0, y: 0 };

        if (createInfo.name === "vl") {
            const { v: vn, ref: refn } = dependencies;
            if (isParamEmpty(vn)) {
                throw new Error(`Expected non-empty parameter`);
            }
            if (vn.type === TYPE_VECTOR) {
                ref = vn.ref;
                v = Object.assign({}, vn);
            } else if (vn.type === TYPE_LINE) {
                const { p0, p1 } = vn;
                ref = p0;
                v = vSub(p1, p0);
            } else {
                throw new Error(`Expected vector or line`);
            }
            if (!isParamEmpty(refn)) {
                if (refn.type !== TYPE_POINT) {
                    throw new Error(`Expected point`);
                }
                ref = refn;
            }
        } else {
            throw new Error(`No suitable constructor found`);
        }

        const n = normal2D({ x: v.x, y: v.y });
        const pn = vAdd(ref, n);
        return makeLine({
            p0: ref, p1: pn, leftOpen: true, rightOpen: true
        });
    }
}
/**
 * Definition of a parallel line being a certain distance away from another
 */
class DefParallelLine {
    /**
     * Default values
     * @param {Object} params
     * @param {Number} distance The distance the parallel line should be displaced by
     */
    constructor({ distance = 1 } = {}) {
        this.distance = distance;
    }


    #createFromRefDir(ref, dir, dist) {
        const n = normal2D(dir);

        // normalize n
        const nl = vLen(n);
        if (nl < 1E-10) {
            return INVALID;
        }
        n.x /= nl;
        n.y /= nl;

        // move ref along n
        const p0 = vAdd(ref, vScale(n, dist));

        const p1 = vAdd(p0, dir);

        return makeLine({
            p0, p1, leftOpen: true, rightOpen: true
        });
    }

    /**
     * Creates a new parallel line from a vector or a line.
     * @param {Object} params
     * @param {Number | Object} params.v  Either the index or value of a TYPE_POINT | TYPE_LINE. The vector or line
     * @param {Number | Object} [params.distance] Either the index or value of a TYPE_NUMBER. The distance to the input line or vector
     * @returns {CreateInfo} The creation info
     */
    static fromVectorsOrLine({
        v, distance = EMPTY
    }) {
        return CreateInfo.new("vld", { v, distance });
    }
    /**
     * Creates a new parallel line from a vector or a line.
     * The line will use the first point of a line or the vector reference as a point through which it goes
     * @param {Object} params
     * @param {Number | Object} params.v  Either the index or value of a TYPE_POINT | TYPE_LINE. The vector or line
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @returns {CreateInfo} The creation info
     */
    static fromVectorsOrLineRef({
        v, ref = EMPTY
    }) {
        return CreateInfo.new("vlr", { v, ref });
    }

    /**
     * Computes the parallel line
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} Parallel line of TYPE_LINE
     */
    compute(createInfo) {
        const { dependencies } = createInfo;

        let { distance } = this;
        let ref = { x: 0, y: 0 };
        let v = { x: 0, y: 0 };

        if (createInfo.name === "vlr") {
            const { v: obj, ref: refn } = dependencies;

            if (isParamEmpty(obj)) {
                throw new Error(`Expected non-empty`);
            }

            if (obj.type === TYPE_VECTOR) {
                v = obj;
                ref = obj.ref;
            } else if (obj.type === TYPE_LINE) {
                const { p0, p1 } = obj;
                v = vSub(p1, p0);
                ref = p0;
            } else {
                throw new Error(`Expected vector or line`);
            }

            if (!isParamEmpty(refn)) {
                if (refn.type !== TYPE_POINT) {
                    throw new Error(`Expected point`);
                }
                ref = refn;
                distance = 0;
            }
        } else if (createInfo.name === "vld") {
            const { v: obj, distance: distancen } = dependencies;

            if (isParamEmpty(obj)) {
                throw new Error(`Expected non-empty`);
            }

            if (obj.type === TYPE_VECTOR) {
                v = obj;
                ref = obj.ref;
            } else if (obj.type === TYPE_LINE) {
                const { p0, p1 } = obj;
                v = vSub(p1, p0);
                ref = p0;
            } else {
                throw new Error(`Expected vector or line`);

            }


            if (!isParamEmpty(distancen)) {
                if (distancen.type !== TYPE_NUMBER) {
                    throw new Error(`Expected number`);
                }
                distance = distancen.value;
            }
        } else {
            throw new Error("No suitable constructor found");
        }

        return this.#createFromRefDir(ref, v, distance);
    }
}

/**
 * Definition of a vector reflected along a normal
 */
class DefReflection {
    /**
     * Default values
     * @param {Boolean} normalize Whether the vector should be normalized
     */
    constructor(normalize = false) {
        this.normalize = normalize;
    }

    /**
     * Computes the reflection of a vector along a normal.
     * @param {Object} params
     * @param {Number | Object} params.v Either the index or value of a TYPE_VECTOR. The vector to be reflected
     * @param {Number | Object} params.n Either the index or value of a TYPE_VECTOR. The normal
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromVectorNormal({
        v, n, ref = EMPTY, normalize = EMPTY
    }) {
        return CreateInfo.new("vn", { v, n, ref, normalize });
    }

    /**
     * Computes the reflection of an incident diretion I along a vector N: I - 2.0 * dot(N, I) * N
     * @param {{x:Number, y:Number}} i The incident direction
     * @param {{x:Number, y:Number}} n The normal
     * @returns {{x:Number, y:Number}} The reflected vector
     */
    static reflectVector(i, n) {
        // I - 2.0 * dot(N, I) * N. 
        const dotni = vDot(i, n);
        return vSub(i, vScale(n, 2.0 * dotni));
    }

    /**
     * Computes the reflection
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The reflection with type TYPE_VECTOR
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let { normalize } = this;

        if (createInfo.name === "vn") {
            const { v, n, ref: refn, normalize: normalizeN } = dependencies;

            assertExistsAndNotOptional(v, n);
            assertType(v, TYPE_VECTOR);
            assertType(n, TYPE_VECTOR);

            let ref = v.ref;

            let r = DefReflection.reflectVector(v, n);

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
            if (normalize) {
                r = vNormalizeIfNotZero(r);
            }

            if (!isParamEmpty(refn)) {
                assertType(refn, TYPE_POINT);
                ref = refn;
            }
            return makeVector({ x: r.x, y: r.y, ref });

        } else {
            throw new Error("No suitable constructor found");
        }
    }
}
/**
 * Definition of a vector refracted along a normal
 */
class DefRefraction {

    /**
     * Default values
     * @param {Object} params
     * @param {Number} params.eta Ratio of the index of refractions of the two media
     * @param {Boolean} params.normalize  Whether the vector should be normalized
     */
    constructor({ eta = 1, normalize = false } = {}) {
        this.eta = eta;
        this.normalize = normalize;
    }
    /**
     * Computes the refraction of a vector along a normal.
     * @param {Object} params
     * @param {Number | Object} params.v Either the index or value of a TYPE_VECTOR. The vector to be refracted
     * @param {Number | Object} params.n Either the index or value of a TYPE_VECTOR. The normal
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @param {Number | Object} [params.eta] Either the index or value of a TYPE_NUMBER. The ratio of refractive indices. 
     * Will be inverted, if the incoming direction points into the same half space as the normal
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromVectorNormal({
        v, n, ref = EMPTY, eta = EMPTY, normalize = EMPTY
    }) {
        return CreateInfo.new("vn", { v, n, ref, eta, normalize });
    }

    /**
     * Computes the refraction of an incident diretion I along a vector N
     * @param {{x:Number, y:Number}} i The incident direction
     * @param {{x:Number, y:Number}} n The normal
     * @param {Number} eta The ratio of refractive indices. 
     * Will be inverted, if the incoming direction points into the same half space as the normal
     * @returns {{x:Number, y:Number} | null} The refracted vector. In case of total internal reflection, null will be returned
     */
    static refractVector(i, n, eta) {
        n = Object.assign({}, n);
        let dotni = vDot(i, n);
        if (dotni > 0) {
            dotni = -dotni;
            n.x *= -1;
            n.y *= -1;
            eta = 1.0 / eta;
        }

        // following glsl
        // k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
        //     if (k < 0.0)
        //     R = genType(0.0);       // or genDType(0.0)
        // else
        //     R = eta * I - (eta * dot(N, I) + sqrt(k)) * N;
        const k = 1.0 - eta * eta * (1.0 - dotni * dotni);
        if (k < 0.0) {
            return null;
        } else {
            return vSub(
                vScale(i, eta),
                vScale(n, eta * dotni + Math.sqrt(k))
            )
        }

    }

    /**
     * Computes the refraction
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The refraction vector with type TYPE_VECTOR
     */
    compute(createInfo) {
        const { dependencies } = createInfo;

        if (createInfo.name === "vn") {
            const { v, n, ref: refn, normalize: normalizeN, eta: etaN } = dependencies;

            let { eta, normalize } = this;

            assertExistsAndNotOptional(v, n);
            assertType(v, TYPE_VECTOR);
            assertType(n, TYPE_VECTOR);

            let ref = v.ref;

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }

            if (!isParamEmpty(etaN)) {
                assertType(etaN, TYPE_NUMBER);
                eta = etaN.value;
            }
            if (!isParamEmpty(refn)) {
                assertType(refn, TYPE_POINT);
                ref = refn;
            }
            let r = DefRefraction.refractVector(v, n, eta);

            if (!r) {
                return INVALID;
            }

            if (normalize) {
                r = vNormalizeIfNotZero(r);
            }


            return makeVector({ x: r.x, y: r.y, ref });

        } else {
            throw new Error("No suitable constructor found");
        }
    }
}

/**
 * Definition of a polar vector described by its polar coordinates. Will create a TYPE_VECTOR
 */
class DefPolarVector {
    /**
     * Default values
     * @param {Object} params
     * @param {Number} params.r The radius
     * @param {Number} params.alpha The angle
     * @param {{x:Number, y:Number}} params.ref The reference point
     */
    constructor({ r = 1, alpha = 0, ref = { x: 0, y: 0 } } = {}) {
        this.r = r;
        this.alpha = alpha;
        this.ref = ref;
    }
    /**
     * Creates a new vector from polar coordinates.
     * @param {Number | Object} polar Either the index or value of a TYPE_POLAR. The polar coordinates
     * @param {Number | Object} [ref] Either the index or value of a TYPE_POINT. The reference point
     * @returns {CreateInfo} The creation info
     */
    static fromPolar(polar, ref = EMPTY) {
        return CreateInfo.new("pol", { polar, ref });
    }

    /**
     * Creates a new vector from an angle measured from a starting angle.
     * If no start angle is given, the one from the angle object is used
     * @param {Object} params
     * @param {Number | Object} params.angle Either the index or value of a TYPE_ANGLE. The angle
     * @param {Number | Object} [params.startAngle] Either the index or value of a TYPE_NUMBER. The start angle
     * @param {Number | Object} [params.r] Either the index or value of a TYPE_NUMBER. The radius
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @returns {CreateInfo} The creation info
     */
    static fromAngle({ angle, startAngle = EMPTY, r = EMPTY, ref = EMPTY, }) {
        return CreateInfo.new("ang", {
            angle, startAngle, r, ref
        });
    }

    /**
     * Creates a new vector from an angle and a radius
     * @param {Object} params
     * @param {Number | Object} [params.r] Either the index or value of a TYPE_NUMBER. The radius
     * @param {Number | Object} [params.alpha] Either the index or value of a TYPE_NUMBER. The angle
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @returns {CreateInfo} The creation info
     */
    static fromRadiusAngle({ r = EMPTY, alpha = EMPTY, ref = EMPTY }) {
        return CreateInfo.new("ra", { r, alpha, ref });
    }

    /**
     * Creates the vector
     * @param {CreateInfo} info The creation info
     * @returns {Object} Polar vector of type TYPE_VECTOR
     */
    compute(info) {
        let { r, alpha, ref } = this;
        const { dependencies } = info;

        if (info.name === "ra") {
            const { r: rn, alpha: alphan, ref: refn } = dependencies;
            if (!isParamEmpty(rn)) {
                assertType(rn, TYPE_NUMBER);
                r = rn.value;
            }
            if (!isParamEmpty(alphan)) {
                assertType(alphan, TYPE_NUMBER);
                alpha = alphan.value;
            }

            if (!isParamEmpty(refn)) {
                assertType(refn, TYPE_POINT);
                ref = refn;
            }
        } else if (info.name === "ang") {
            const { angle, startAngle, r: rn, ref: refn } = dependencies;
            assertExistsAndNotOptional(angle);
            assertType(angle, TYPE_ANGLE);

            const { value, start } = angle;

            ref = angle.ref;
            if (!isParamEmpty(rn)) {
                assertType(rn, TYPE_NUMBER);
                r = rn.value;
            }

            if (!isParamEmpty(startAngle)) {
                assertType(startAngle, TYPE_NUMBER);
                start = startAngle.value;
            }

            if (!isParamEmpty(refn)) {
                assertType(refn, TYPE_POINT);
                ref = refn;
            }

            alpha = start + value;
        } else if (info.name === "pol") {
            const { polar, ref: refn } = dependencies;
            assertExistsAndNotOptional(polar);
            assertType(polar, TYPE_POLAR);
            ({ r, alpha } = polar);

            if (!isParamEmpty(refn)) {
                assertType(refn, TYPE_POINT);
                ref = refn;
            }
        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor found");
        }

        const { x, y } = vPolar(r, alpha);
        return makeVector({
            x, y, ref
        });
    }
}

/**
 * Definition of a simple number. Creates an object of TYPE_NUMBER
 */
class DefNumber {
    /**
     * Default value
     * @param {Number} val The number
     */
    constructor(val) {
        this.value = val;
    }

    /**
     * Extract a field from a given object and make a number out of it.
     * If no such field exists, INVALID will be created
     * @param {Number | Object} obj The object of which the value is extracted
     * @param {*} key The key
     * @param {Function} [transform] A transform taking the value obj[key], if it exists and returns a new one
     * @returns {CreateInfo} The creation info
     */
    static fromField(obj, key, transform = null) {
        return CreateInfo.new("ok", { obj }, { key, transform });
    }

    /**
     * Create a number by computing the value of a given function and a parameter
     * @param {function(Number)} f The function f(x) to compute
     * @param {Number | Object | Number[] | Object[]} x Either the indices or values of a TYPE_NUMBER. The parameters to f
     * @returns {CreateInfo} The creation info
     */
    static fromFunc(f, x) {
        if (Array.isArray(x)) {
            return CreateInfo.new("f", x, { f });
        } else {
            return CreateInfo.new("f", [x], { f });

        }
    }
    /**
     * Creates the number
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} An object of TYPE_NUMBER or INVALID
     */
    compute(createInfo) {
        let { value } = this;
        const { dependencies, params } = createInfo;
        if (createInfo.name === "ok") {
            const { obj } = dependencies;
            assertExistsAndNotOptional(obj);
            const { key, transform } = createInfo.params;
            value = obj[key];
            if (value === undefined) {
                return INVALID;
            }

            if (typeof value !== "number") {
                throw new Error("Trying to create number from non-number field");
            }

            if (transform && transform instanceof Function) {
                value = transform(value);
            }

        } else if (createInfo.name === "f") {
            const { f } = params;

            if (!Array.isArray(dependencies)) {
                throw new Error("Expected array");
            }
            let paramsX = [];
            for (let x of dependencies) {
                assertExistsAndNotOptional(x);

                assertType(x, TYPE_NUMBER);
                paramsX.push(x.value);
            }

            value = f(...paramsX);
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }
        return makeNumber(value);
    }
}

/**
 * Definition of a boolean value of type TYPE_BOOLEAN
 */
class DefBoolean {
    /**
     * Default value
     * @param {Boolean} val The value
     */
    constructor(val) {
        this.value = val;
    }

    /**
     * Creates a boolean by applying a predicate on the specified dependencies
     * @param {function(*) : Boolean} predicate A predicate function taking dependencies and returning a boolean value
     * @param {Object | Array} dependencies Either the indices or values stored in an Array or shallow Object of the values this predicate depends on
     * @returns {CreateInfo} The creation info
     */
    static fromPredicate(predicate, dependencies) {
        return CreateInfo.new("p", dependencies, { predicate })
    }

    /**
     * Creates a new bool value that is the negation of the argument
     * @param {Number | Object} boolValue Either the index or value of a TYPE_BOOLEAN. The value to be negated
     * @returns {CreateInfo} The creation info
     */
    static fromNot(boolValue) {
        return CreateInfo.new("not", { boolValue });
    }

    /**
     * Signifies an AND operation
     */
    static OP_AND = 0;
    /**
     * Signifies an OR operation
     */
    static OP_OR = 1;

    /**
     * Create a new bool value that is the result of applying a boolean binary operation successively on all inputs.
     * @param {Object | Array} boolValues Either the indices or values stored in an Array or shallow Object of the values combined with the chosen operation
     * @param {Number} operation The operation. Possible values are stored as static variables in this class prefixed by OP_
     * @returns {CreateInfo} The creation info
     */
    static fromOp(boolValues, operation) {
        return CreateInfo.new("op", boolValues, { operation });
    }

    /**
     * Creates the boolean value
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The boolean value of type TYPE_BOOLEAN
     */
    compute(createInfo) {
        let { value } = this;
        const { dependencies, params } = createInfo;
        if (createInfo.name === "p") {
            const { predicate } = params;

            return makeBoolean(predicate(dependencies));
        } else if (createInfo.name === "not") {
            const { boolValue } = dependencies;
            assertExistsAndNotOptional(boolValue);
            assertType(boolValue, TYPE_BOOLEAN);

            return makeBoolean(!boolValue.value);
        } else if (createInfo.name === "op") {
            const { boolValues } = dependencies;
            assertExistsAndNotOptional(boolValues);

            const { operation } = params;

            const vals = [];
            for (const b of boolValues) {
                assertType(b, TYPE_BOOLEAN);
                vals.push(b.value);
            }

            let result;

            if (operation === DefBoolean.OP_AND) {
                result = vals.reduce((p, cur) => p && cur, true);
            } else if (operation === DefBoolean.OP_OR) {
                result = vals.reduce((p, cur) => p || cur, false);
            } else {
                throw new Error("Requested Boolean operation not supported");
            }

            return makeBoolean(result);
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }
        return makeBoolean(value);
    }
}

/**
 * Definition of a conditional expression, that defines objects based on some condtion
 */
class DefConditional {

    /**
     * Defines an object based on a condition.
     * If the condition is true, the given object value will be returned, otherwise INVALID
     * @param {Number | Object} obj Either the index or value of an object
     * @param {Number | Object} condition Either the index or value of a TYPE_BOOLEAN. The condition value
     * @returns {CreateInfo} The creation info
     */
    static fromCondition(obj, condition) {
        return CreateInfo.new("c", { obj, condition });
    }
    /**
     * Defines an object based on a condition.
     * If the condition is true, the first object value will be returned, otherwise the second
     * @param {Number | Object} obj0 Either the index or value of an object
     * @param {Number | Object} obj1 Either the index or value of an object
     * @param {Number | Object} condition Either the index or value of a TYPE_BOOLEAN. The condition value
     * @returns {CreateInfo} The creation info
     */
    static fromEitherOr(obj0, obj1, condition) {
        return CreateInfo.new("eo", {
            obj0,
            obj1,
            condition
        });
    }

    /**
     * Computes the conditional expression
     * @param {CreateInfo} info The creation info
     * @returns {*} An object based on the inputs
     */
    compute(info) {
        const { dependencies } = info;

        if (info.name === "c") {
            const { obj, condition } = dependencies;
            assertExistsAndNotOptional(obj, condition);
            assertType(condition, TYPE_BOOLEAN);

            if (condition.value) {
                return obj;
            } else {
                return INVALID;
            }
        } else if (info.name === "eo") {
            const { obj0, obj1, condition } = dependencies;
            assertExistsAndNotOptional(obj0, obj1, condition);
            assertType(condition, TYPE_BOOLEAN);

            return condition.value ? obj0 : obj1;
        } else {
            throw new Error("No suitable constructor");
        }
    }
}
/**
 * Definition for a parameter of a point on a curve
 * Will calculate the parameter, if the point lies on the curve. In some cases, there might me multiple possible parameters
 * 
 * Supported curve objects are:
 * Line, vector (treated as a line from reference to arrow tip), arc, line strip, Bezier, Bezier spline, ellipse
 */
class DefCurveParam {

    /**
     * Computes the paramter of a point on a curve
     * @param {Number | Object} curve Either the index or value of a curve object. The supported types are specified at the documention of this class
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @param {Object} params
     * @param {Number} [params.takeIndex] The index of the parameter to use. 
     * If < 0, then the returned result will be used. 
     * If = 0, either the first entry in an parameter array or the parameter will be returned
     * If > 0, the indicated index in an array of parameters
     * 
     * If any requested parameter does not exist (for example requesting the second one, when only one exists) will result in INVALID
     * @param {Number} [params.eps] The epsilon value used for comparisons
     * @returns {CreateInfo} The creation info
     */
    static fromCurve(curve, p, { eps = 1E-10,
        takeIndex = -1 } = {}) {
        return CreateInfo.new("curve", {
            curve, p
        }, {
            eps,
            takeIndex,
        });
    }
    /**
     * Computes the parameter of a point on a Bezier curve. 
     * @param {Object} curve The curve object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static bezierParam(curve, p, eps = 1E-10) {
        return calcBezierParameterOfPoint(p, curve.points, eps);

    }

    /**
     * Computes the parameter of a point on an arc. 
     * @param {Object} arc The arc object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static arcParam(arc, p, eps = 1E-10) {
        let { center, r, startAngle, endAngle } = arc;
        // in the case of the circle wrapping over, just add 2pi to take care of that
        if (startAngle > endAngle) {
            endAngle += 2.0 * Math.PI;
        }
        const da = endAngle - startAngle;

        let pr = vSub(p, center);

        if (Math.abs(vLen2(pr) - r * r) > eps) {
            // point not on circle
            return [];
        }

        const pa = calcAngle(pr.x, pr.y);

        const t = (pa - startAngle) / da;
        return [t];
    }

    /**
     * Computes the parameter of a point on an ellipse. 
     * @param {Object} ellipse The ellipse object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static ellipseParam(ellipse, p, eps = 1E-10) {

        let { center, rx, ry, rotation, startAngle, endAngle } = ellipse;
        // in the case of the circle wrapping over, just add 2pi to take care of that
        if (startAngle > endAngle) {
            endAngle += 2.0 * Math.PI;
        }
        const da = endAngle - startAngle;

        let [pr] = convertPointToLocalEllipse([p], center, rotation, rx, ry);

        if (Math.abs(vLen2(pr) - 1) > eps) {
            // point not on circle
            return [];
        }

        const pa = calcAngle(pr.x, pr.y);

        const t = (pa - startAngle) / da;

        return [t];
    }
    /**
     * Computes the parameter of a point on a line. 
     * @param {Object} line The line object
     * @param {{x:Number, y :Number}} p The point
     * @param {Object} params
     * @param {Number} [params.eps] The epsilon value used for comparisons
     * @param {Number} [params.minT] The minimum t value
     * @param {Number} [params.maxT] The maximum t value
     * @returns {Number[]} The possible t values
     */
    static lineParam(line, p, { eps = 1E-10, minT = 0, maxT = 1 } = {}) {

        let { p0, p1 } = line;
        const v = vSub(p1, p0);
        const n = normal2D(v);

        const dot = vDot(n, vSub(p, p0));

        if (Math.abs(dot) > eps) {
            // point not on line
            return [];
        }


        const t = calcParamOnLine(p0, p1, p);
        if (t < minT || t > maxT) {
            return [];
        }

        return [t];
    }

    /**
     * Computes the parameter of a point on a vector. 
     * The vector is treated as a line segment from the reference to the arrow tip
     * @param {Object} v The vector object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static vectorParam(v, p, eps = 1E-10) {
        const n = normal2D(v);

        const dot = vDot(n, vSub(p, v.ref));

        if (Math.abs(dot) > eps) {
            // point not on line
            return [];
        }


        const t = calcParamOnLine(v.ref, vAdd(v, v.ref), p);
        if (t < 0 || t > 1) {
            return [];
        }
        return [t];
    }

    /**
     * Computes the parameter of a point on a line strip. 
     * @param {Object} lineStrip The line strip object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static lineStripParam(lineStrip, p, eps = 1E-10) {
        const result = [];
        const { points } = lineStrip;
        const num = points.length - 1;
        for (let i = 0; i < num; i++) {
            let [p0, p1] = [points[i], points[i + 1]];
            const v = vSub(p1, p0);
            const n = normal2D(v);

            const dot = vDot(n, vSub(p, p0));

            if (Math.abs(dot) > eps) {
                // point not on line
                continue;
            }

            const t = calcParamOnLine(p0, p1, p);
            if (t < 0 || t > 1) {
                continue;
            }
            result.push((t + i) / num);
        }

        return result;
    }
    /**
     * Computes the parameter of a point on a polygon. 
     * @param {Object} poly The polygon object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static polygonParam(poly, p, eps = 1E-10) {
        const result = [];
        const { points } = poly;
        const num = points.length;
        for (let i = 0; i < num; i++) {
            let [p0, p1] = [points[i], points[(i + 1) % points.length]];
            const v = vSub(p1, p0);
            const n = normal2D(v);

            const dot = vDot(n, vSub(p, p0));

            if (Math.abs(dot) > eps) {
                // point not on line
                continue;
            }

            const t = calcParamOnLine(p0, p1, p);
            if (t < 0 || t > 1) {
                continue;
            }
            result.push((t + i) / num);
        }
        return result;
    }

    /**
     * Computes the parameter of a point on a Bezier spline. 
     * @param {Object} spline The Bezier spline object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static bezierSplineParam(spline, p, eps = 1E-10) {
        const result = [];
        const { points, degree } = spline;
        const num = numSegmentsBezierSpline(points, degree);
        for (let i = 0; i < num; i++) {

            const curvePoints = getBezierSplineSegment(points, degree, i);

            const ts = calcBezierParameterOfPoint(p, curvePoints, eps);

            result.push(...ts.map(t => (t + i) / num));
        }
        return result;
    }

    /**
     * @param {Object} curve The curve object
     * @param {{x:Number, y :Number}} p The point
     * @param {Number} eps The epsilon value used for comparisons
     * @returns {Number[]} The possible t values
     */
    static curveParam(obj, p, eps) {
        const type = obj.type;

        if (type === TYPE_BEZIER) {
            return DefCurveParam.bezierParam(obj, p, eps);
        } else if (type === TYPE_ARC) {
            return DefCurveParam.arcParam(obj, p);
        } else if (type === TYPE_ELLIPSE) {
            return DefCurveParam.ellipseParam(obj, p);
        } else if (type === TYPE_LINE) {
            return DefCurveParam.lineParam(obj, p, {
                eps,
                minT: obj.leftOpen ? -Infinity : 0,
                maxT: obj.rightOpen ? Infinity : 1
            });
        } else if (type === TYPE_VECTOR) {
            return DefCurveParam.vectorParam(obj, p, eps);
        } else if (type === TYPE_LINE_STRIP) {
            return DefCurveParam.lineStripParam(obj, p, eps);
        } else if (type === TYPE_POLYGON) {
            return DefCurveParam.polygonParam(obj, p, eps);
        } else if (type === TYPE_BEZIER_SPLINE) {
            return DefCurveParam.bezierSplineParam(obj, p, eps);
        } else {
            throw new Error(`Object type ${type} not supported`);
        }
    }

    /**
     * Computes the parameter on a curve
     * @param {CreateInfo} info The creation info
     * @returns {Array} The t values of type TYPE_NUMBER
     */
    compute(info) {
        const { dependencies } = info;
        if (info.name === "curve") {
            const { curve, p } = dependencies;
            const { eps, takeIndex } = info.params;
            assertExistsAndNotOptional(curve, p);
            assertType(p, TYPE_POINT);

            const result = DefCurveParam.curveParam(curve, p, eps);

            if (takeIndex >= 0) {
                if (takeIndex >= result.length) {
                    return INVALID;
                }

                return makeNumber(result[takeIndex]);
            }

            return result.map(v => makeNumber(v));
        } else {
            throw new Error("No suitable constructor");
        }
    }
}

/**
 * Definition of a text object that can be attached at a position and be created from input objects
 */
class DefText {

    /**
     * Default values
     * @param {Object} params
     * @param {String | function(String) : String} params.text Display text or transform function for text
     * @param {{x:Number, y:Number}} params.ref The point the text is attached to
     */
    constructor({
        text = "",
        ref = { x: 0, y: 0 }
    } = {}) {
        this.text = text;
        this.ref = ref;
    }

    /**
     * Creates a new text from an object and a position
     * @param {Object} params
     * @param {Number | Object} [params.obj] Either the index or value of an object. The object to be turned into text
     * If no text transformer is used, the object is just converted using the objectToString function
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT. The reference point
     * @returns {CreateInfo} The creation info
     */
    static fromObjectRef({ obj = EMPTY, ref = EMPTY }) {
        return CreateInfo.new("or", { obj, ref });
    }

    /**
     * Computes the text
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} Object of type TYPE_TEXT
     */
    compute(createInfo) {
        let { text, ref } = this;
        const { dependencies } = createInfo;
        if (createInfo.name === "or") {
            const { obj, ref: refn } = dependencies;
            if (!isParamEmpty(obj)) {
                if (text instanceof Function) {
                    text = text(obj);
                } else {
                    text = objectToString(obj);
                }
            }
            if (!isParamEmpty(refn)) {
                assertType(refn, TYPE_POINT);

                ref = refn;
            }
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor found");
        }

        if (text instanceof Function) {
            text = text();
        }

        return makeText({ text, ref });
    }
}

/**
 * Definition of an oriented angle placed at a reference point
 */
class DefAngle {

    /**
        * When computing an angle, if it is greater than Pi (180°), choose the opposite one
        */
    static USE_SMALLER_ANGLE = -1;
    /**
     * When computing an angle choose it
     */
    static USE_COMPUTED_ANGLE = 0;
    /**
     * When computing an angle, if it is smaller than Pi (180°), choose the opposite one
     */
    static USE_LARGER_ANGLE = 1;

    /**
     * Creates an angle from two objects that can each be either lines or vectors.
     * The reference point is placed where the infinitl lines through the objects intersect
     * @param {Number | Object} v0 Either the index or value of one of the types [TYPE_VECTOR, TYPE_LINE]
     * @param {Number | Object} v1 Either the index or value of one of the types [TYPE_VECTOR, TYPE_LINE]
     * @param {Number} [useAngle] One of the values DefAngle.(USE_SMALLER_ANGLE, USE_COMPUTED_ANGLE, USE_LARGER_ANGLE)
     * @returns {CreateInfo} The creation info
     */
    static fromVectorsOrLines(v0, v1, useAngle = DefAngle.USE_COMPUTED_ANGLE) {
        return CreateInfo.new("vl", { v0, v1 }, {
            useAngle
        });
    }



    /**
     * Creates an angle from three points. The angle is measured around the middle one.
     * The reference point is placed at the middle point
     * @param {Number | Object} p0 Either the index or value of a TYPE_POINT
     * @param {Number | Object} p1 Either the index or value of a TYPE_POINT
     * @param {Number | Object} p2 Either the index or value of a TYPE_POINT
     * @param {Number} [useAngle] One of the values DefAngle.(USE_SMALLER_ANGLE, USE_COMPUTED_ANGLE, USE_LARGER_ANGLE)
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(p0, p1, p2, useAngle = DefAngle.USE_COMPUTED_ANGLE) {
        return CreateInfo.new("ppp", { p0, p1, p2 }, {
            useAngle
        });
    }

    /**
     * Creates an angle from a fixed direction and a line or vector
     * @param {Object} params
     * @param {Number | Object} params.v Either the index or value of one of the types [TYPE_VECTOR, TYPE_LINE]. The direction
     * If no text transformer is used, the object is just converted using the objectToString function
     * @param {{x:Number, y:Number}} [params.fixedDir] A fixed direction from which to compute the angle from
     * @param {Number} [params.useAngle] One of the values DefAngle.(USE_SMALLER_ANGLE, USE_COMPUTED_ANGLE, USE_LARGER_ANGLE)
     * @returns {CreateInfo} The creation info
     */
    static fromFixedDir({ v, fixedDir = { x: 1, y: 0 }, useAngle = DefAngle.USE_COMPUTED_ANGLE }) {
        return CreateInfo.new("fd", { v }, {
            useAngle,
            fixedDir,
        });
    }

    /**
     * Compute the angle
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} An angle of type TYPE_ANGLE
     */
    compute(createInfo) {
        const { dependencies, params } = createInfo;
        if (createInfo.name === "vl") {
            // angle between 
            let p0;
            let d0;

            let p1;
            let d1;

            const { v0, v1 } = dependencies;

            if (v0.type === TYPE_LINE) {
                p0 = v0.p0;
                d0 = vSub(v0.p1, v0.p0);
            } else if (v0.type === TYPE_VECTOR) {
                p0 = v0.ref;
                d0 = v0;
            } else {
                throw new Error(`Expected line or vector, got ${v0.type} `);
            }

            if (v1.type === TYPE_LINE) {
                p1 = v1.p0;
                d1 = vSub(v1.p1, v1.p0);

            } else if (v1.type === TYPE_VECTOR) {
                p1 = v1.ref;
                d1 = v1;
            } else {
                throw new Error(`Expected line or vector, got ${v1.type} `);
            }


            // measure angle from intersection
            let inter = intersectLines(p0, vAdd(p0, d0), p1, vAdd(p1, d1));
            if (!inter) {
                inter = p0;
            }

            // oriented angle
            const a = orientedAngle(d0, d1);
            const start = orientedAngle({ x: 1, y: 0 }, d0);

            let a0 = start;
            let a1 = a0 + a;

            if (a1 < a0) {
                a1 += 2 * Math.PI;
            }

            const { useAngle } = params;
            const adif = a1 - a0;
            if (useAngle === DefAngle.USE_SMALLER_ANGLE) {
                // angle is > 180° -> use the other side
                if (adif > Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            } else if (useAngle === DefAngle.USE_LARGER_ANGLE) {
                // angle is < 180° -> use other side
                if (adif < Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            }

            return makeAngle({ value: (a1 - a0), start: a0, ref: inter });

        } else if (createInfo.name === "ppp") {
            const { p0, p1, p2 } = dependencies;

            if (p0.type !== TYPE_POINT || p1.type !== TYPE_POINT || p2.type !== TYPE_POINT) {
                throw new Error(`Expected points, got ${p0.type}, ${p1.type}, ${p2.type} `);
            }

            const q0 = p1;
            const d0 = vSub(p0, q0);
            const d1 = vSub(p2, q0);

            const a = orientedAngle(d0, d1);
            const start = orientedAngle({ x: 1, y: 0 }, d0);

            let a0 = start;
            let a1 = a0 + a;

            if (a1 < a0) {
                a1 += 2 * Math.PI;
            }

            const { useAngle } = params;
            const adif = a1 - a0;
            if (useAngle === DefAngle.USE_SMALLER_ANGLE) {
                // angle is > 180° -> use the other side
                if (adif > Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            } else if (useAngle === DefAngle.USE_LARGER_ANGLE) {
                // angle is < 180° -> use other side
                if (adif < Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            }


            return makeAngle({ value: (a1 - a0), start: a0, ref: q0 });
        } else if (createInfo.name === "fd") {
            // angle between 
            let p0;
            let d0;

            const { v } = dependencies;

            assertExistsAndNotOptional(v);
            assertType(v, TYPE_VECTOR, TYPE_LINE);

            const { fixedDir, useAngle } = params;

            if (v.type === TYPE_LINE) {
                p0 = v.p0;
                d0 = vSub(v.p1, v.p0);
            } else if (v.type === TYPE_VECTOR) {
                p0 = v.ref;
                d0 = v;
            }
            // oriented angle
            const a = orientedAngle(fixedDir, d0);
            const start = orientedAngle({ x: 1, y: 0 }, fixedDir);

            let a0 = start;
            let a1 = a0 + a;

            if (a1 < a0) {
                a1 += 2 * Math.PI;
            }
            const adif = a1 - a0;
            if (useAngle === DefAngle.USE_SMALLER_ANGLE) {
                // angle is > 180° -> use the other side
                if (adif > Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            } else if (useAngle === DefAngle.USE_LARGER_ANGLE) {
                // angle is < 180° -> use other side
                if (adif < Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            }


            return makeAngle({ value: (a1 - a0), start: a0, ref: p0 });

        }
        throw new Error(`No suitable constructor found`);

    }
}
/**
 * Definition of a polar coordinate defined by a radius ang angle
 */
class DefPolarCoord {
    /**
     * Default values
     * @param {Object} params
     * @param {Number} params.r The radius
     * @param {Number} params.alpha The angle
     */
    constructor({ r = 1, alpha = 0 } = {}) {
        this.r = r;
        this.alpha = alpha;
    }
    /**
     * Creates polar coordinates of a point
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @returns {CreateInfo} The creation info
     */
    static fromPointOrVector(p) {
        return CreateInfo.new("pv", { p });
    }

    /**
     * Creates an angle from three points. The angle is measured around the middle one.
     * The reference point is placed at the middle point
     * @param {Object} params
     * @param {Number | Object} [params.r] Either the index or value of a TYPE_NUMBER. The radius
     * @param {Number | Object} [params.alpha] Either the index or value of a TYPE_NUMBER. The angle
     * @returns {CreateInfo} The creation info
     */
    static fromValues({ r = EMPTY, alpha = EMPTY }) {
        return CreateInfo.new("v", { r, alpha });
    }

    /**
     * Compute the polar coordinates
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} A polar coordinate of type TYPE_POLAR
     */
    compute(createInfo) {
        let { r, alpha } = this;
        const { dependencies } = createInfo;
        if (createInfo.name === "pv") {
            const { p } = dependencies;
            assertExistsAndNotOptional(p);
            assertType(p, TYPE_POINT, TYPE_VECTOR);

            r = vLen(p);
            alpha = calcAngle(p.x, p.y);

        } else if (createInfo.name === "v") {
            const { r: rN, alpha: alphaN } = dependencies;

            if (!isParamEmpty(rN)) {
                assertType(rN, TYPE_NUMBER);
                r = rN.value;
            }

            if (!isParamEmpty(alphaN)) {
                assertType(alphaN, TYPE_NUMBER);
                alpha = alphaN.value;
            }

        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makePolarCoordinate({ r, alpha });
    }
}
/**
 * Definition of a point.
 */
class DefPoint {

    /**
     * Default values
     * @param {Number} x The x coordinate
     * @param {Number} y The y coordinate
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Creates a point from another point or vector.
     * A point created from a vector is located at the tip of the vector that is placed at its reference point
     * @param {Number | Object} other Either the index or value of one of the types [TYPE_POINT, TYPE_VECTOR]
     * @returns {CreateInfo} The creation info
     */
    static fromPointOrVector(other) {
        return CreateInfo.new("p", {
            p: other
        });
    }

    /**
     * Creates a point from coordinates
     * @param {Object} params
     * @param {Number | Object} [params.x] Either the index or value of a TYPE_NUMBER
     * @param {Number | Object} [params.y] Either the index or value of a TYPE_NUMBER
     * @returns {CreateInfo} The creation info
     */
    static fromCoordinates({ x = EMPTY, y = EMPTY } = {}) {
        return CreateInfo.new("xy", {
            x, y
        });
    }
    /**
     * Creates a point from a vector attached to a point
     * @param {Number | Object} p Either the index or value of a TYPE_POINT
     * @param {Number | Object} v Either the index or value of a TYPE_VECTOR
     * @returns {CreateInfo} The creation info
     */
    static fromAttachedVector(p, v) {
        return CreateInfo.new("pv", {
            p, v
        });
    }

    /**
     * Creates a point from a polar coordinates
     * @param {Number | Object} polar Either the index or value of a TYPE_POLAR
     * @returns {CreateInfo} The creation info
     */
    static fromPolar(polar) {
        return CreateInfo.new("pol", { polar });
    }

    /**
     * Computes the point
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} A point of type TYPE_POINT
     */
    compute(createInfo) {
        let { x, y } = this;
        const { dependencies } = createInfo;
        if (createInfo.name === "p") {
            const { p } = dependencies;
            if (isParamEmpty(p) || (p.type !== TYPE_POINT && p.type !== TYPE_VECTOR)) {
                throw new Error(`Point from point or vector requires 1 valid point or vector no suitable parameter set available`);
            }
            if (p.type === TYPE_POINT) {
                x = p.x;
                y = p.y;
            }
            else if (p.type === TYPE_VECTOR) {
                const { ref } = p;
                // construct from vector reference point
                ({ x, y } = vAdd(ref, p));
            }
        } else if (createInfo.name === "xy") {
            const { x: xn, y: yn } = dependencies;

            if (!isParamEmpty(xn)) {
                if (xn.type !== TYPE_NUMBER) {
                    throw new Error(`Point from coordinates requires x to be either empty or a number`);
                }
                x = xn.value;
            }
            if (!isParamEmpty(yn)) {
                if (yn.type !== TYPE_NUMBER) {
                    throw new Error(`Point from coordinates requires y to be either empty or a number`);
                }
                y = yn.value;
            }
        } else if (createInfo.name === "pv") {
            const { p, v } = dependencies;
            if (isParamEmpty(p) || isParamEmpty(v)) {
                throw new Error(`Point from point and vector requires non - empty parameter`);
            }
            if (p.type !== TYPE_POINT || v.type !== TYPE_VECTOR) {
                throw new Error(`Point from point and vector requires a point and a vector`);
            }
            ({ x, y } = vAdd(p, v));
        } else if (createInfo.name === "pol") {
            const { polar } = dependencies;
            assertExistsAndNotOptional(polar);
            assertType(polar, TYPE_POLAR);

            ({ x, y } = vPolar(polar.r, polar.alpha));
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error(`Point: No suitable parameter set available`);
        }

        return makePoint({ x, y });
    }
}
/**
 * Definition for a point on a curve
 * Will calculate the point given a parameter
 * 
 * Supported curve objects are:
 * Line, vector (treated as a line from reference to arrow tip), arc, line strip, Bezier, Bezier spline, ellipse
 */
class DefCurvePoint {
    /**
     * Default values
     * @param {Number} [t] The t value
     */
    constructor(t = 0) {
        this.t = t;
    }


    /**
     * Computes the point on a curve
     * @param {Number | Object} obj Either the index or value of a curve object. The supported types are specified at the documention of this class
     * @param {Number | Object} [t] Either the index or value of a TYPE_NUMBER. The curve parameter
     * @returns {CreateInfo} The creation info
     */
    static fromCurve({ obj, t = EMPTY }) {
        return CreateInfo.new("obj", {
            obj, t
        });
    }

    /**
     * Computes the point on a ellipse. 
     * @param {{x:Number, y:Number}} center The ellipse center
     * @param {Number} rx The ellipse x-eccentricity
     * @param {Number} ry The ellipse y-eccentricity
     * @param {Number} rotation The ellipse rotation
     * @param {Number} alpha The angle
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static ellipsePoint(center, rx, ry, rotation, alpha) {
        let q = vPolar(1, alpha);
        [q] = convertPointFromLocalEllipse([q], center, rotation, rx, ry);
        return q;
    }

    /**
     * Computes the point on a circle. 
     * @param {{x:Number, y:Number}} center The circle center
     * @param {Number} r The circle radius
     * @param {Number} alpha The angle
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static circlePoint(center, r, alpha) {
        return vAdd(center, vPolar(r, alpha));
    }
    /**
     * Computes the point on a line. 
     * @param {{x:Number, y:Number}} p0 The first line point
     * @param {{x:Number, y:Number}} p1 The second line point
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static linePoint(p0, p1, t) {
        return vLerp(p0, p1, t);
    }

    /**
     * Computes the point on a vector.
     * The vector is treated as a line segment from the reference to the arrow tip
     * @param {Object} v The vector of type TYPE_VECTOR
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static vectorPoint(v, t) {
        return vAdd(v.ref, vScale(v, t));
    }
    /**
     * Computes the point on a line strip. 
     * @param {Object} points The line strip points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static lineStripPoint(points, t) {
        const num = points.length - 1;

        t = num * t;
        const idx = Math.floor(t);
        t = t % 1.0;
        const [p0, p1] = [points[idx], points[idx + 1]];
        return vLerp(p0, p1, t);
    }
    /**
     * Computes the point on a polygon. 
     * @param {Object} points The polygon points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static polygonPoint(points, t) {
        const num = points.length;

        t = num * t;
        const idx = Math.floor(t);
        t = t % 1.0;
        const [p0, p1] = [points[idx], points[(idx + 1) % points.length]];
        return vLerp(p0, p1, t);
    }
    /**
     * Computes the point on a Bezier curve. 
     * @param {Object} points The control points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static bezierPoint(points, t) {
        return deCastlejau(points, t);
    }
    /**
     * Computes the point on a Bezier spline. 
     * @param {Object} points The control points
     * @param {Number} degree The spline degree
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static bezierSplinePoint(points, degree, t) {
        // stretch t with segment number
        const numSegs = numSegmentsBezierSpline(points, degree);
        t *= numSegs;
        const idx = Math.floor(t);
        t = t % 1.0;

        const segPoints = getBezierSplineSegment(points, degree, idx);

        return deCastlejau(segPoints, t);
    }
    /**
     * Computes the point on a curve. 
     * Supported types are documented at the top of this class
     * @param {Object} obj The curve object
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting point
     */
    static curvePoint(obj, t) {
        const otype = obj.type;
        if (otype === TYPE_ELLIPSE) {
            const ellipse = obj;

            let { center, rx, ry, rotation, startAngle, endAngle } = ellipse;
            // in the case of the circle wrapping over, just add 2pi to take care of that
            if (startAngle > endAngle) {
                endAngle += 2.0 * Math.PI;
            }
            const da = endAngle - startAngle;

            const a = startAngle + t * da;


            let q = DefCurvePoint.ellipsePoint(center, rx, ry, rotation, a);
            return makePoint(q);

        } else if (otype === TYPE_ARC) {
            const arc = obj;

            let { center, r, startAngle, endAngle } = arc;
            // in the case of the circle wrapping over, just add 2pi to take care of that
            if (startAngle > endAngle) {
                endAngle += 2.0 * Math.PI;
            }
            const da = endAngle - startAngle;

            const a = startAngle + t * da;

            return makePoint(DefCurvePoint.circlePoint(center, r, a));

        } else if (otype === TYPE_LINE) {
            const line = obj;

            let { p0, p1 } = line;

            return makePoint(DefCurvePoint.linePoint(p0, p1, t));
        } else if (otype === TYPE_VECTOR) {
            const v = obj;

            return makePoint(DefCurvePoint.vectorPoint(v, t));
        } else if (otype === TYPE_LINE_STRIP) {
            const lineStrip = obj;

            let { points } = lineStrip;
            if (points.length < 2) {
                return INVALID;
            }

            const num = points.length - 1;

            t = num * t;
            const idx = Math.floor(t);
            t = t % 1.0;
            const [p0, p1] = [points[idx], points[idx + 1]];
            return makePoint(vLerp(p0, p1, t));
        } else if (otype === TYPE_POLYGON) {
            const poly = obj;

            let { points } = poly;
            if (points.length < 3) {
                return INVALID;
            }

            return makePoint(DefCurvePoint.polygonPoint(points, t));
        } else if (otype === TYPE_BEZIER) {
            const curve = obj;

            let { points } = curve;

            return makePoint(DefCurvePoint.bezierPoint(points, t));
        } else if (otype === TYPE_BEZIER_SPLINE) {
            const curve = obj;

            let { points, degree } = curve;

            return makePoint(DefCurvePoint.bezierSplinePoint(points, degree, t));
        } else {
            throw new Error("Can't create point from given object");
        }
    }

    /**
     * Computes the curve point
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} An object of type TYPE_POINT
     */
    compute(createInfo) {
        const { dependencies } = createInfo;

        if (createInfo.name === "obj") {
            let { t } = this;
            const { obj, t: tn } = dependencies;

            assertExistsAndNotOptional(obj);

            if (!isParamEmpty(tn)) {
                assertType(tn, TYPE_NUMBER);
                t = tn.value;
            }

            return DefCurvePoint.curvePoint(obj, t);
        } else {
            throw new Error("No suitable constructor");
        }
    }
}
/**
 * Definition for a tangent on a curve
 * Will calculate the tangent given a parameter
 * 
 * Supported curve objects are:
 * Line, vector (treated as a line from reference to arrow tip), arc, line strip, Bezier, Bezier spline, ellipse
 */
class DefCurveTangent {

    /**
     * Default values
     * @param {Number} [t] The t value
     * @param {Boolean} [normalize] Whether the resulting vector should be normalized
     * @param {Number} [scale] Scaling of the resulting vector
     */
    constructor({ t = 0, normalize = false, scale = 1 } = {}) {
        this.t = t;
        this.normalize = normalize;
        this.scale = scale;
    }

    /**
     * Computes the tangent on a curve
     * @param {Number | Object} obj Either the index or value of a curve object. The supported types are specified at the documention of this class
     * @param {Number | Object} [t] Either the index or value of a TYPE_NUMBER. The curve parameter
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether result will be normalized
     * @param {Number | Object} [scale] Either the index or value of a TYPE_NUMBER. Scaling of result
     * @returns {CreateInfo} The creation info
     */
    static fromCurve({ obj, t = EMPTY, normalize = EMPTY, scale = EMPTY }) {
        return CreateInfo.new("obj", {
            obj, t, normalize, scale
        });
    }

    // Compute funcitons

    /**
     * Computes the tangent on a line. 
     * @param {{x:Number, y:Number}} p0 The first line point
     * @param {{x:Number, y:Number}} p1 The second line point
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static lineTangent(p0, p1) {
        return vSub(p1, p0);
    }
    /**
     * Computes the tangent on a circle. 
     * @param {Number} r The circle radius
     * @param {Number} alpha The angle
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static circleTangent(r, alpha) {
        // parametric: [r cos(alpha), r sin(alpha)]

        // d/d alpha = [-r sin(alpha), r cos(alpha)]

        return vVec2(-r * Math.sin(alpha), r * Math.cos(alpha));
    }
    /**
     * Computes the tangent on a ellipse. 
     * @param {Number} rx The ellipse x-eccentricity
     * @param {Number} ry The ellipse y-eccentricity
     * @param {Number} rotation The ellipse rotation
     * @param {Number} alpha The angle
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static ellipseTangent(rx, ry, rotation, alpha) {
        // unrotated and centered position is [a*cos(alpha), b*sin(alpha)]
        // derive to get the tangent:
        // [-a * sin(alpha), b * cos(alpha)]
        let v = vVec2(-rx * Math.sin(alpha), ry * Math.cos(alpha));
        v = vRotate(v, rotation);
        return v;
    }

    /**
     * Computes the tangent on a Bezier curve. 
     * @param {Object} points The control points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static bezierTangent(points, t) {
        const qs = calcBezierPointsDerivative(points);
        const tan = deCastlejau(qs, t);

        return tan;
    }

    /**
     * Computes the tangent on a line strip. 
     * @param {Object} points The line strip points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static lineStripTangent(points, t) {
        const num = points.length - 1;
        t = num * t;
        const idx = Math.floor(t);
        t = t % 1.0;
        const [p0, p1] = [points[idx], points[idx + 1]];

        return vSub(p1, p0);
    }
    /**
     * Computes the tangent on a polygon. 
     * @param {Object} points The polygon points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static polygonTangent(points, t) {
        const num = points.length;
        t = num * t;
        const idx = Math.floor(t);
        t = t % 1.0;
        const [p0, p1] = [points[idx], points[(idx + 1) % points.length]];
        return vSub(p1, p0);
    }

    /**
     * Computes the tangent on a Bezier spline. 
     * @param {Object} points The control points
     * @param {Number} degree The spline degree
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static bezierSplineTangent(points, degree, t) {
        // stretch t with segment number
        const numSegs = numSegmentsBezierSpline(points, degree);
        t *= numSegs;
        const idx = Math.floor(t);
        t = t % 1.0;

        const segPoints = getBezierSplineSegment(points, degree, idx);
        const qs = calcBezierPointsDerivative(segPoints);

        return deCastlejau(qs, t);

    }

    /**
     * Computes the point on a vector.
     * The vector is treated as a line segment from the reference to the arrow tip
     * @param {Object} v The vector
     * @returns {{x:Number, y:Number}} The resulting tangent
     */
    static vectorTangent(v) {
        return v;
    }

    /**
     * Computes the tangent and corresponding reference point on a curve. 
     * Supported types are documented at the top of this class
     * @param {Object} obj The curve object
     * @param {Number} t The curve parameter
     * @returns {{v: {x:Number, y:Number}, ref: {x:Number, y:Number}}} The resulting tangent and reference point
     */
    static curveTangentRef(obj, t) {
        const otype = obj.type;
        if (otype === TYPE_ARC) {
            const arc = obj;

            let { center, r, startAngle, endAngle } = arc;
            // in the case of the circle wrapping over, just add 2pi to take care of that
            if (startAngle > endAngle) {
                endAngle += 2.0 * Math.PI;
            }
            const da = endAngle - startAngle;

            const a = startAngle + t * da;
            // tangent at circle is normal to radius vector
            const ref = DefCurvePoint.circlePoint(center, r, a);
            let v = DefCurveTangent.circleTangent(r, a);

            return { v, ref };

        } else if (otype === TYPE_ELLIPSE) {

            const ellipse = obj;

            let { center, rx, ry, rotation, startAngle, endAngle } = ellipse;
            // in the case of the circle wrapping over, just add 2pi to take care of that
            if (startAngle > endAngle) {
                endAngle += 2.0 * Math.PI;
            }
            const da = endAngle - startAngle;
            const a = startAngle + t * da;

            let v = DefCurveTangent.ellipseTangent(rx, ry, rotation, a);
            const ref = DefCurvePoint.ellipsePoint(center, rx, ry, rotation, a);

            return { v, ref };

        } else if (otype === TYPE_LINE) {
            const line = obj;

            let { p0, p1 } = line;

            const ref = DefCurvePoint.linePoint(p0, p1, t);
            let v = DefCurveTangent.lineTangent(p0, p1);

            return { v, ref };
        } else if (otype === TYPE_VECTOR) {
            let v = obj;

            const ref = vAdd(v.ref, vScale(v, t));

            return { v: DefCurveTangent.vectorTangent(v), ref };
        } else if (otype === TYPE_LINE_STRIP) {

            const lineStrip = obj;


            let { points } = lineStrip;
            if (points.length < 2) {
                return null;
            }

            const ref = DefCurvePoint.lineStripPoint(points, t);
            let v = DefCurveTangent.lineStripTangent(points, t);

            return { v, ref };
        } else if (otype === TYPE_POLYGON) {

            const poly = obj;

            let { points } = poly;
            if (points.length < 3) {
                return null;
            }

            const ref = DefCurvePoint.polygonPoint(points, t);
            let v = DefCurveTangent.polygonTangent(points, t);

            return { v, ref };
        } else if (otype === TYPE_BEZIER) {
            const curve = obj;

            const { points } = curve;

            const ref = DefCurvePoint.bezierPoint(points, t);
            let v = DefCurveTangent.bezierTangent(points, t);

            return { v, ref };

        } else if (otype === TYPE_BEZIER_SPLINE) {
            const curve = obj;

            let { points, degree } = curve;

            const ref = DefCurvePoint.bezierSplinePoint(points, degree, t);
            let v = DefCurveTangent.bezierSplineTangent(points, degree, t);

            return { v, ref };
        } else {
            throw new Error("Can't compute tangent from given object");
        }
    }

    /**
     * Computes the curve tangent
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} An object of type TYPE_VECTOR
     */
    compute(info) {
        const { dependencies } = info;
        let { t, normalize, scale } = this;

        if (info.name === "obj") {
            const { obj, t: tn, normalize: normalizeN, scale: scaleN } = dependencies;

            assertExistsAndNotOptional(obj);

            if (!isParamEmpty(tn)) {
                assertType(tn, TYPE_NUMBER);
                t = tn.value;
            }

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;
            }
            if (!isParamEmpty(scaleN)) {
                assertType(scaleN, TYPE_NUMBER);
                scale = scaleN.value;
            }

            const result = DefCurveTangent.curveTangentRef(obj, t);
            let { v, ref } = result;

            if (normalize) {
                v = vNormalizeIfNotZero(v);
            }

            v = vScale(v, scale);
            return makeVector({ x: v.x, y: v.y, ref });
        } else {
            throw new Error("No suitable constructor");
        }
    }
}
/**
 * Definition for a normal on a curve
 * Will calculate the normal given a parameter
 * 
 * Supported curve objects are:
 * Line, vector (treated as a line from reference to arrow tip), arc, line strip, Bezier, Bezier spline, ellipse
 */
class DefCurveNormal {
    /**
     * Default values
     * @param {Number} [t] The t value
     * @param {Boolean} [normalize] Whether the resulting vector should be normalized
     * @param {Number} [scale] Scaling of the resulting vector
     */
    constructor({ t = 0, normalize = false, scale = 1 } = {}) {
        this.t = t;
        this.normalize = normalize;
        this.scale = scale;
    }
    /**
     * Computes the normal on a curve
     * @param {Number | Object} obj Either the index or value of a curve object. The supported types are specified at the documention of this class
     * @param {Number | Object} [t] Either the index or value of a TYPE_NUMBER. The curve parameter
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether result will be normalized
     * @param {Number | Object} [scale] Either the index or value of a TYPE_NUMBER. Scaling of result
     * @returns {CreateInfo} The creation info
     */
    static fromCurve({ obj, t = EMPTY, normalize = EMPTY, scale = EMPTY }) {
        return CreateInfo.new("obj", {
            obj, t, normalize, scale
        });
    }
    /**
     * Computes the normal on a circle. 
     * @param {Number} r The circle radius
     * @param {Number} alpha The angle
     * @returns {{x:Number, y:Number}} The resulting normal
     */
    static circleNormal(r, alpha) {
        // compute the normal from r
        // we keep the same convention as the point based version to have it scaled as  2*n/r^2
        let n = vPolar(r, alpha);

        return vScale(n, 2 / (r * r));
    }
    /**
     * Computes the normal on a ellipse. 
     * @param {Number} rx The ellipse x-eccentricity
     * @param {Number} ry The ellipse y-eccentricity
     * @param {Number} rotation The ellipse rotation
     * @param {Number} alpha The angle
     * @returns {{x:Number, y:Number}} The resulting normal
     */
    static ellipseNormal(rx, ry, rotation, alpha) {
        // unrotated ellipse is e(x,y) =  x^2 / a^2 +  y^2 / b^2 - 1 = 0
        // we choose this version so the normal vectors resemble the length of polar coordinates
        // normal = grad e = [2x / a^2 , 2y / b^2]

        // to get (x,y), we just transform q into the local system (not unit circle)
        // then we rotate the final result back

        let q = vVec2(rx * Math.cos(alpha), ry * Math.sin(alpha));
        let n = vVec2(2 * q.x / (rx * rx), 2 * q.y / (ry * ry));
        // rotate
        n = vRotate(n, rotation);

        return n;

    }
    /**
     * Computes the normal on a line. 
     * @param {{x:Number, y:Number}} p0 The first line point
     * @param {{x:Number, y:Number}} p1 The second line point
     * @returns {{x:Number, y:Number}} The resulting normal
     */
    static lineNormal(p0, p1) {
        return normal2D(vSub(p1, p0));
    }
    /**
     * Computes the normal on a line strip. 
     * @param {Object} points The line strip points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting normal
     */
    static lineStripNormal(points, t) {
        const num = points.length - 1;
        t = num * t;
        const idx = Math.floor(t);
        t = t % 1.0;
        const [p0, p1] = [points[idx], points[idx + 1]];

        return normal2D(vSub(p1, p0));
    }
    /**
     * Computes the normal on a polygon. 
     * @param {Object} points The polygon points
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting normal
     */
    static polygonNormal(points, t) {
        const num = points.length;
        t = num * t;
        const idx = Math.floor(t);
        t = t % 1.0;
        const [p0, p1] = [points[idx], points[(idx + 1) % points.length]];
        return normal2D(vSub(p1, p0));
    }
    /**
      * Computes the normal on a Bezier curve. 
      * @param {Object} points The control points
      * @param {Number} t The curve parameter
      * @returns {{x:Number, y:Number}} The resulting normal
      */
    static bezierNormal(points, t) {
        // normal from tangent
        const qs = calcBezierPointsDerivative(points);
        const tan = deCastlejau(qs, t);

        return normal2D(tan);
    }
    /**
     * Computes the normal on a Bezier spline. 
     * @param {Object} points The control points
     * @param {Number} degree The spline degree
     * @param {Number} t The curve parameter
     * @returns {{x:Number, y:Number}} The resulting normal
     */
    static bezierSplineNormal(points, degree, t) {
        // stretch t with segment number
        const numSegs = numSegmentsBezierSpline(points, degree);
        t *= numSegs;
        const idx = Math.floor(t);
        t = t % 1.0;

        const segPoints = getBezierSplineSegment(points, degree, idx);
        const qs = calcBezierPointsDerivative(segPoints);

        return normal2D(deCastlejau(qs, t));

    }

    /**
     * Computes the normal and corresponding reference point on a curve. 
     * Supported types are documented at the top of this class
     * @param {Object} obj The curve object
     * @param {Number} t The curve parameter
     * @returns {{v: {x:Number, y:Number}, ref: {x:Number, y:Number}}} The resulting normal and reference point
     */
    static normalRefFromObject(obj, t) {
        if (obj.type === TYPE_ARC) {
            const arc = obj;

            let { center, r, startAngle, endAngle } = arc;
            // in the case of the circle wrapping over, just add 2pi to take care of that
            if (startAngle > endAngle) {
                endAngle += 2.0 * Math.PI;
            }
            const da = endAngle - startAngle;

            const a = startAngle + t * da;

            let n = DefCurveNormal.circleNormal(r, a);
            const ref = DefCurvePoint.circlePoint(center, r, a);

            return { n, ref };

        } else if (obj.type === TYPE_ELLIPSE) {
            const ellipse = obj;

            let { center, rx, ry, rotation, startAngle, endAngle } = ellipse;
            // in the case of the circle wrapping over, just add 2pi to take care of that
            if (startAngle > endAngle) {
                endAngle += 2.0 * Math.PI;
            }
            const da = endAngle - startAngle;

            const a = startAngle + t * da;

            const ref = DefCurvePoint.ellipsePoint(center, rx, ry, rotation, a);
            let n = DefCurveNormal.ellipseNormal(rx, ry, rotation, a);

            return { n, ref };

        } else if (obj.type === TYPE_LINE) {
            const line = obj;

            let { p0, p1 } = line;

            const ref = DefCurvePoint.linePoint(p0, p1, t);
            let n = DefCurveNormal.lineNormal(p0, p1);

            return { n, ref };
        } else if (obj.type === TYPE_VECTOR) {
            let v = obj;

            const ref = vAdd(v.ref, vScale(v, t));
            let n = normal2D(v);

            return { n, ref };
        } else if (obj.type === TYPE_LINE_STRIP) {

            const lineStrip = obj;

            let { points } = lineStrip;
            if (points.length < 2) {
                return INVALID;
            }

            const ref = DefCurvePoint.lineStripPoint(points, t);
            let n = DefCurveNormal.lineStripNormal(points, t);

            return { n, ref };
        } else if (obj.type === TYPE_POLYGON) {
            const poly = obj;

            let { points } = poly;
            if (points.length < 3) {
                return INVALID;
            }

            const ref = DefCurvePoint.polygonPoint(points, t);
            let n = DefCurveNormal.polygonNormal(points, t);

            return { n, ref };
        } else if (obj.type === TYPE_BEZIER) {
            const curve = obj;
            const { points } = curve;

            const ref = DefCurvePoint.bezierPoint(points, t);
            let n = DefCurveNormal.bezierNormal(points, t);

            return { n, ref };

        } else if (obj.type === TYPE_BEZIER_SPLINE) {
            const curve = obj;

            let { points, degree } = curve;

            const ref = DefCurvePoint.bezierSplinePoint(points, degree, t);
            let n = DefCurveNormal.bezierSplineNormal(points, degree, t);

            return { n, ref };
        } else {
            throw new Error("Can't compute tangent on given object");
        }
    }
    /**
     * Computes the curve normal
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} An object of type TYPE_VECTOR
     */
    compute(info) {
        const { dependencies, params } = info;
        let { t, normalize, scale } = this;

        if (info.name === "obj") {
            const { obj, t: tn, normalize: normalizeN, scale: scaleN } = dependencies;
            assertExistsAndNotOptional(obj);

            if (!isParamEmpty(tn)) {
                assertType(tn, TYPE_NUMBER);
                t = tn.value;
            }

            if (!isParamEmpty(normalizeN)) {
                assertType(normalizeN, TYPE_BOOLEAN);
                normalize = normalizeN.value;

            }

            if (!isParamEmpty(scaleN)) {
                assertType(scaleN, TYPE_NUMBER);
                scale = scaleN.value;
            }

            let { n, ref } = DefCurveNormal.normalRefFromObject(obj, t, normalize);


            if (normalize) {
                n = vNormalizeIfNotZero(n);
            }
            n = vScale(n, scale);

            return makeVector({ x: n.x, y: n.y, ref });

        } else {
            throw new Error("No suitable constructor");
        }
    }
}

/**
 * Definition of the points of tangents touching arcs and ellipses
 */
class DefTangentPoints {

    /**
     * Computes the points on the tangents on an arc going through the given point.
     * Due to the start and end angles of the arc, they may not exist even for points outside the arc.
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @param {Number | Object} arc Either the index or value of a TYPE_ARC. The arc
     * @returns {CreateInfo} The creation info
     */
    static fromPointArc(p, arc) {
        return CreateInfo.new("pa", { p, arc });
    }
    /**
     * Computes the points on the outer tangents of two arcs.
     * Due to the start and end angles of the arcs, they may not exist even for valid points on the corresponding circles.
     * Points come in pairs of points on the first and second arc.
     * @param {Number | Object} arc0 Either the index or value of a TYPE_ARC. The first arc
     * @param {Number | Object} arc1 Either the index or value of a TYPE_ARC. The second arc
     * @returns {CreateInfo} The creation info
     */
    static fromOuterTangents(arc0, arc1) {
        return CreateInfo.new("ot", { arc0, arc1 });
    }
    /**
     * Computes the points on the inner tangents of two arcs.
     * Due to the start and end angles of the arcs, they may not exist even for valid points on the corresponding circles.
     * Points come in pairs of points on the first and second arc.
     * @param {Number | Object} arc0 Either the index or value of a TYPE_ARC. The first arc
     * @param {Number | Object} arc1 Either the index or value of a TYPE_ARC. The second arc
     * @returns {CreateInfo} The creation info
     */
    static fromInnerTangents(arc0, arc1) {
        return CreateInfo.new("it", { arc0, arc1 });
    }
    /**
     * Computes the points on the tangents on an ellipse going through the given point.
     * Due to the start and end angles of the arc, they may not exist even for points outside the ellipse.
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @param {Number | Object} ellipse Either the index or value of a TYPE_ELLIPSE. The ellipse
     * @returns {CreateInfo} The creation info
     */
    static fromPointEllipse(p, ellipse) {
        return CreateInfo.new("pe", { p, ellipse });
    }

    /**
     * Computes the tangent points
     * @param {CreateInfo} info The creation info
     * @returns {Object | Array} The tangent points of TYPE_POINT in an array or INVALID, if non exist
     */
    compute(info) {
        const { dependencies } = info;
        if (info.name === "pa") {
            const { p, arc } = dependencies;
            assertExistsAndNotOptional(p, arc);
            assertType(p, TYPE_POINT);
            assertType(arc, TYPE_ARC);

            const points = calcCirclePointTangentPoints(p, arc.center, arc.r, {
                angleMin: arc.startAngle, angleMax: arc.endAngle
            });
            if (!points || points.length === 0) {
                return INVALID;
            }

            return points.map(v => makePoint(v));
        } if (info.name === "pe") {
            const { p, ellipse } = dependencies;
            assertExistsAndNotOptional(p, ellipse);
            assertType(p, TYPE_POINT);
            assertType(ellipse, TYPE_ELLIPSE);

            const { center, rx, ry, rotation, startAngle, endAngle } = ellipse;
            const [pl] = convertPointToLocalEllipse([p], center, rotation, rx, ry);
            let points = calcCirclePointTangentPoints(pl, vVec2(0, 0), 1, {
                angleMin: startAngle, angleMax: endAngle
            });
            if (!points || points.length === 0) {
                return INVALID;
            }

            points = convertPointFromLocalEllipse(points, center, rotation, rx, ry);
            // could be either 1 or two lines
            return points.map(v => makePoint(v));
        } else if (info.name === "ot") {
            const { arc0, arc1 } = dependencies;
            assertExistsAndNotOptional(arc0, arc1);
            assertType(arc0, TYPE_ARC);
            assertType(arc1, TYPE_ARC);

            const points = calcOuterTangentPoints(arc0, arc1);
            if (!points || points.length === 0 || points.length % 2 !== 0) {
                return INVALID;
            }

            return points.map(v => makePoint(v));
        } else if (info.name === "it") {
            const { arc0, arc1 } = dependencies;
            assertExistsAndNotOptional(arc0, arc1);
            assertType(arc0, TYPE_ARC);
            assertType(arc1, TYPE_ARC);

            const points = calcInnerTangentPoints(arc0, arc1);
            if (!points || points.length === 0 || points.length % 2 !== 0) {
                return INVALID;
            }
            return points.map(v => makePoint(v));
        } else {
            throw new Error("No suitable constructor");
        }
    }
}
/**
 * Definition of the tangent lines touching arcs and ellipses
 */
class DefTangentLines {
    /**
     * Computes the tangent lines on an arc going through the given point.
     * Due to the start and end angles of the arc, they may not exist even for points outside the arc.
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @param {Number | Object} arc Either the index or value of a TYPE_ARC. The arc
     * @param {Object} params
     * @param {Boolean} [params.leftOpen] Whether the resulting line extends from the first point
     * @param {Boolean} [params.rightOpen] Whether the resulting line extends from the second point
     * @returns {CreateInfo} The creation info
     */
    static fromPointArc(p, arc, { leftOpen = false, rightOpen = false } = {}) {
        return CreateInfo.new("pa", { p, arc }, { leftOpen, rightOpen });
    }
    /**
     * Computes the tangent lines on an ellipse going through the given point.
     * Due to the start and end angles of the arc, they may not exist even for points outside the ellipse.
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The point
     * @param {Number | Object} ellipse Either the index or value of a TYPE_ELLIPSE. The ellipse
     * @param {Object} params
     * @param {Boolean} [params.leftOpen] Whether the resulting line extends from the first point
     * @param {Boolean} [params.rightOpen] Whether the resulting line extends from the second point
     * @returns {CreateInfo} The creation info
     */
    static fromPointEllipse(p, ellipse, { leftOpen = false, rightOpen = false } = {}) {
        return CreateInfo.new("pe", { p, ellipse }, { leftOpen, rightOpen });
    }

    /**
     * Computes the outer tangents of two arcs.
     * Due to the start and end angles of the arcs, they may not exist even for valid points on the corresponding circles.
     * @param {Number | Object} arc0 Either the index or value of a TYPE_ARC. The first arc
     * @param {Number | Object} arc1 Either the index or value of a TYPE_ARC. The second arc
     * @param {Object} params
     * @param {Boolean} [params.leftOpen] Whether the resulting line extends from the first point
     * @param {Boolean} [params.rightOpen] Whether the resulting line extends from the second point
     * @returns {CreateInfo} The creation info
     */
    static fromOuterTangents(arc0, arc1, { leftOpen = false, rightOpen = false } = {}) {
        return CreateInfo.new("ot", { arc0, arc1 }, { leftOpen, rightOpen });
    }
    /**
     * Computes the inner tangents of two arcs.
     * Due to the start and end angles of the arcs, they may not exist even for valid points on the corresponding circles.
     * @param {Number | Object} arc0 Either the index or value of a TYPE_ARC. The first arc
     * @param {Number | Object} arc1 Either the index or value of a TYPE_ARC. The second arc
     * @param {Object} params
     * @param {Boolean} [params.leftOpen] Whether the resulting line extends from the first point
     * @param {Boolean} [params.rightOpen] Whether the resulting line extends from the second point
     * @returns {CreateInfo} The creation info
     */
    static fromInnerTangents(arc0, arc1, { leftOpen = false, rightOpen = false } = {}) {
        return CreateInfo.new("it", { arc0, arc1 }, { leftOpen, rightOpen });
    }
    /**
     * Computes the tangent points
     * @param {CreateInfo} info The creation info
     * @returns {Object | Array} The tangents of TYPE_LINE in an array or INVALID, if non exist
     */
    compute(info) {
        const { dependencies } = info;
        const { params } = info;
        if (info.name === "pa") {
            const { p, arc } = dependencies;
            const { leftOpen, rightOpen } = params;
            assertExistsAndNotOptional(p, arc);
            assertType(p, TYPE_POINT);
            assertType(arc, TYPE_ARC);

            const points = calcCirclePointTangentPoints(p, arc.center, arc.r, {
                angleMin: arc.startAngle, angleMax: arc.endAngle
            });
            if (!points || points.length === 0) {
                return INVALID;
            }
            // could be either 1 or two lines
            const result = [];
            const p0 = makePoint(p);
            for (let q of points) {
                const p1 = makePoint(q);
                result.push(makeLine({ p0, p1, leftOpen, rightOpen }));
            }

            return result;
        } if (info.name === "pe") {
            const { p, ellipse } = dependencies;
            const { leftOpen, rightOpen } = params;
            assertExistsAndNotOptional(p, ellipse);
            assertType(p, TYPE_POINT);
            assertType(ellipse, TYPE_ELLIPSE);

            const { center, rx, ry, rotation, startAngle, endAngle } = ellipse;
            const [pl] = convertPointToLocalEllipse([p], center, rotation, rx, ry);
            let points = calcCirclePointTangentPoints(pl, vVec2(0, 0), 1, {
                angleMin: startAngle, angleMax: endAngle
            });
            if (!points || points.length === 0) {
                return INVALID;
            }

            points = convertPointFromLocalEllipse(points, center, rotation, rx, ry);
            // could be either 1 or two lines
            const result = [];
            const p0 = makePoint(p);
            for (let q of points) {
                const p1 = makePoint(q);
                result.push(makeLine({ p0, p1, leftOpen, rightOpen }));
            }

            return result;
        } else if (info.name === "ot") {
            const { arc0, arc1 } = dependencies;
            const { leftOpen, rightOpen } = params;
            assertExistsAndNotOptional(arc0, arc1);
            assertType(arc0, TYPE_ARC);
            assertType(arc1, TYPE_ARC);

            const points = calcOuterTangentPoints(arc0, arc1);
            if (!points || points.length === 0 || points.length % 2 !== 0) {
                return INVALID;
            }
            const result = [];
            for (let i = 0; i < points.length; i += 2) {
                const p0 = points[i + 0];
                const p1 = points[i + 1];

                result.push(makeLine({ p0, p1, leftOpen, rightOpen }));
            }
            return result;



        } else if (info.name === "it") {
            const { arc0, arc1 } = dependencies;
            const { leftOpen, rightOpen } = params;
            assertExistsAndNotOptional(arc0, arc1);
            assertType(arc0, TYPE_ARC);
            assertType(arc1, TYPE_ARC);

            const points = calcInnerTangentPoints(arc0, arc1);
            if (!points || points.length === 0 || points.length % 2 !== 0) {
                return INVALID;
            }
            const result = [];
            for (let i = 0; i < points.length; i += 2) {
                const p0 = points[i + 0];
                const p1 = points[i + 1];

                result.push(makeLine({ p0, p1, leftOpen, rightOpen }));
            }
            return result;
        } else {
            throw new Error("No suitable constructor");
        }
    }
}
/**
 * Definition for a midpoint.
 * Points are their own midpoint.
 * Arcs and ellipses have their center as a midpoint
 * For a collection of points, their mean value is the midpoint
 */
class DefMidPoint {
    /**
     * Computes the midpoint of an object
     * @param {Number | Object} obj Either the index or value of one of [TYPE_POINT, TYPE_LINE, TYPE_ARC, TYPE_ELLIPSE] or an array of TYPE_POINT
     * @returns {CreateInfo} The creation info
     */
    static fromObject(obj) {
        return CreateInfo.new("o", { obj });
    }
    /**
     * Computes the midpoint of a number of points
     * @param {...(Number | Object)} obj Either the index or value of objects of TYPE_POINT
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(...points) {
        return CreateInfo.new("p", [...points]);
    }

    /**
     * Computes the midpoint
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} An object of TYPE_POINT
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        if (createInfo.name === "o") {
            const { obj } = dependencies;
            assertExistsAndNotOptional(obj);

            // Allow for computing the midpoint of a set of points
            if (Array.isArray(obj)) {
                let x = 0;
                let y = 0;

                let n = 0;
                for (let i = 0; i < obj.length; i++) {
                    const oi = obj[i];
                    if (oi.type === TYPE_POINT) {
                        x += oi.x;
                        y += oi.y;
                        n++;
                    } else {
                        throw new Error(`MidPoint of array defined for points only`);
                    }
                }

                x /= n;
                y /= n;

                return makePoint({ x, y });
            }
            else if (obj.type === TYPE_POINT) {
                return obj;
            } else if (obj.type === TYPE_LINE) {
                let x = obj.p0.x + obj.p1.x;
                let y = obj.p0.y + obj.p1.y;

                x *= 0.5;
                y *= 0.5;
                return makePoint({ x, y });
            } else if (obj.type === TYPE_VECTOR) {
                return makePoint(vAdd(obj.ref, vScale(obj, 0.5)));
            } else if (obj.type === TYPE_ARC) {
                return makePoint(obj.center);
            } else if (obj.type === TYPE_ELLIPSE) {
                return makePoint(obj.center);
            }
            throw new Error(`Object type not supported`);

        } else if (createInfo.name === "p") {
            if (!Array.isArray(dependencies)) {
                throw new Error("Expected array");
            }
            let x = 0;
            let y = 0;
            for (let i = 0; i < dependencies.length; i++) {
                const pi = dependencies[i];
                assertType(pi, TYPE_POINT);
                x += pi.x;
                y += pi.y;
            }
            x /= dependencies.length;
            y /= dependencies.length;
            return makePoint({ x, y });
        }

        throw new Error(`No suitable constructor available`);



    }
}
/**
 * Definition of the focus points of an ellipse
 */
class DefEllipseFocus {
    /**
     * Computes the focus points of an ellipse
     * @param {Number | Object} ellipse Either the index or value of a TYPE_ELLIPSE. The ellipse
     * @returns {CreateInfo} The creation info
     */
    static fromEllipse(ellipse) {
        return CreateInfo.new("eli", { ellipse });
    }

    /**
     * Computes the Elipse Focii
     * @param {CreateInfo} createInfo The creation info
     * @returns {Array} An array containing the focus points of type TYPE_POINT. Generally these are two, but in the case of a circle, there is only one, the center
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        if (createInfo.name === "eli") {
            const { ellipse } = dependencies;
            assertExistsAndNotOptional(ellipse);
            assertType(ellipse, TYPE_ELLIPSE);

            const { center, rx, ry, rotation } = ellipse;
            // given the major axis a and minor axis b, the distance of the focus to the center is defined by c^2 = a^2 - b^2
            // so we can solve via root

            if (Math.abs(rx, ry) < 1E-10) {
                // circle -> focus is the center
                return [makePoint(center)];
            }

            const a = Math.max(rx, ry);
            const b = Math.min(rx, ry);

            const f = Math.sqrt(a * a - b * b);

            let focii = [];

            if (rx >= ry) {
                // rx is major axis, so focii lie there
                focii.push(vVec2(f, 0));
                focii.push(vVec2(-f, 0));
            } else {
                focii.push(vVec2(0, f));
                focii.push(vVec2(0, -f));
            }

            focii = focii.map(p => vRotate(p, rotation));
            focii = focii.map(p => vAdd(p, center));

            return focii.map(p => makePoint(p));


        } else {
            throw new Error(`No suitable constructor available`);
        }




    }
}

/**
 * Definition of a generic function
 */
class DefFunc {
    /**
     * @param {Function} f The function to be computed. 
     * The function will be called like f(dependencies, params), where those parameters are specified by the creation info
     */
    constructor(f) {
        this.f = f;
    }

    /**
     * Defines the signature of a function
     * @param {Object | Array} dependencies Either the indices or values of the objects this function depends on
     * @param {Object | Array} params Additional parameters
     * @param {Boolean} ignoreInvalids If true, this function is called even if any inputs are INVALID
     * @returns {CreateInfo} The creation info
     */
    static from(dependencies = {}, params = {}, ignoreInvalids = false) {
        return CreateInfo.new("f", dependencies, params, ignoreInvalids);
    }

    /**
     * Computes the result of this.f on the given arguments
     * @param {CreateInfo} createInfo The creation info
     * @returns The result of this.f(dependencies, params)
     */
    compute(createInfo) {
        const { dependencies, params } = createInfo;
        if (createInfo.name === "f") {
            return this.f(dependencies, params);
        } else {
            throw new Error("No suitable constructor");
        }
    }
}

/**
 * Definition of a line.
 * A line is defined by two points. The line might be extended to infinity for the first, second, neither or both of those two points
 */
class DefLine {

    /**
     * Default values
     * @param {Object} params
     * @param {{x:Number, y:Number}} p0 The first point on the line
     * @param {{x:Number, y:Number}} p1 The second point on the line
     * @param {Boolean} leftOpen Whether the line is extended from the first point
     * @param {Boolean} rightOpen Whether the line is extended from the second point
     */
    constructor({
        p0 = { x: 0, y: 0 }, p1 = { x: 0, y: 0 },
        leftOpen = false,
        rightOpen = false,
    } = {}) {
        this.p0 = p0;
        this.p1 = p1;
        this.leftOpen = leftOpen;
        this.rightOpen = rightOpen;
    }
    /**
     * Computes a line from a vector.
     * The line is extended through the vector reference point and in its direction
     * @param {Number | Object} v Either the index or value of a TYPE_VECTOR. The vector
     * @returns {CreateInfo} The creation info
     */
    static fromVector(v) {
        return CreateInfo.new("v", { v });
    }
    /**
     * Computes a line from a point in the direction of a vector.
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The starting point
     * @param {Number | Object} v Either the index or value of a TYPE_VECTOR. The vector direction
     * @returns {CreateInfo} The creation info
     */
    static fromPointVector(p, v) {
        return CreateInfo.new("pv", {
            p, v
        });
    }
    /**
     * Computes a line through two points
     * @param {Number | Object} p0 Either the index or value of a TYPE_POINT. The starting point
     * @param {Number | Object} p0 Either the index or value of a TYPE_POINT. The end point
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(p0, p1) {
        return CreateInfo.new("pp", {
            p0, p1
        });
    }

    /**
     * Compute the line
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} An object of type TYPE_LINE
     */
    compute(createInfo) {

        const { dependencies } = createInfo;
        let { p0, p1, leftOpen, rightOpen } = this;

        if (createInfo.name === "v") {
            const { v } = dependencies;
            if (v.type !== TYPE_VECTOR) {
                throw new Error(`Require vector, got ${v.type} `);
            }

            p0 = v.ref;
            p1 = vAdd(p0, v);
        } else if (createInfo.name === "pv") {
            const { p, v } = dependencies;
            if (p.type !== TYPE_POINT) {
                throw new Error(`Require point, got ${p.type} `);
            }
            if (v.type !== TYPE_VECTOR) {
                throw new Error(`Require vector, got ${v.type} `);
            }

            p0 = p;
            p1 = vAdd(p0, v);

        } else if (createInfo.name === "pp") {
            const { p0: q0, p1: q1 } = dependencies;
            if (q0.type !== TYPE_POINT) {
                throw new Error(`Require point, got ${q0.type} `);
            }
            if (q1.type !== TYPE_POINT) {
                throw new Error(`Require vector, got ${q1.type} `);
            }
            p0 = q0;
            p1 = q1;
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable LineSegment constructor found");
        }

        return makeLine({
            p0, p1, leftOpen, rightOpen
        });
    }
}
/**
 * Definition of a line strip, defined by a sequence of points
 */
class DefLineStrip {

    /**
     * Default value
     * @param {Array<{x:Number, y:Number}>} points An array of points
     */
    constructor(points = []) {
        this.points = points;
    }

    /**
     * Computes a line strip from an array of points
     * @param {Array<Number | Object>} points Either the indices or values of TYPE_POINT. The points from which to make the line strip of
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this line strip
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(points, attach = false) {
        return CreateInfo.new("p", points, { attach });
    }
    /**
     * Computes a line strip from an array of points stored as a value
     * @param {Number | Object} pointArray Either the index or value of an array of points of type TYPE_POINT. The point array
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this line strip
     * @returns {CreateInfo} The creation info
     */
    static fromPointArray(pointArray, attach = false) {
        return CreateInfo.new("pa", { pointArray }, { attach });
    }
    /**
     * Computes a line strip from the points of a polygon
     * @param {Number | Object} poly Either the index or value of a TYPE_POLYGON. The polygon
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this line strip
     * @returns {CreateInfo} The creation info
     */
    static fromPolygon(poly, attach = false) {
        return CreateInfo.new("poly", { poly }, { attach });
    }

    /**
     * Computes the line strip
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} A line strip of type TYPE_LINE_STRIP
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let { points } = this;
        const { attach } = createInfo.params;

        if (createInfo.name === "p") {
            if (!attach) {
                points = [];
            } else {
                points = [...points];
            }
            for (const p of dependencies) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
                points.push(p);
            }
        } else if (createInfo.name === "poly") {
            const { poly } = dependencies;
            assertExistsAndNotOptional(poly);
            assertType(poly, TYPE_POLYGON);

            if (!attach) {
                points = [...poly.points];
            } else {
                points.push(...poly.points);
            }
        } else if (createInfo.name === "pa") {
            const { pointArray } = dependencies;
            assertExistsAndNotOptional(pointArray);
            if (!Array.isArray(pointArray)) {
                throw new Error("Expected array");
            }

            for (const p of pointArray) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
            }
            if (attach) {
                points = [...points, ...pointArray];
            } else {
                points = pointArray;
            }
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makeLineStrip({ points });
    }
}
/**
 * Definition of a polyon.
 * A polygon is specified by its vertices and differs from a line strip in that it is closed
 */
class DefPolygon {
    /**
     * Default value
     * @param {Array<{x:Number, y:Number}>} points An array of points
     */
    constructor(points = []) {
        this.points = points;
    }
    /**
     * Computes a polygon from an array of points
     * @param {Array<Number | Object>} points Either the indices or values of TYPE_POINT. The points from which to make the polygon of
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this polygon
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(points, attach = false) {
        return CreateInfo.new("p", points, { attach });
    }
    /**
     * Computes a polygon from an array of points stored as a value
     * @param {Number | Object} pointArray Either the index or value of an array of points of type TYPE_POINT. The point array
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this polygon
     * @returns {CreateInfo} The creation info
     */
    static fromPointArray(pointArray, attach = false) {
        return CreateInfo.new("pa", { pointArray }, { attach });
    }
    /**
     * Computes a polygon from the points of a line strip
     * @param {Number | Object} poly Either the index or value of a TYPE_LINE_STRIP. The line strip
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this polygon
     * @returns {CreateInfo} The creation info
     */
    static fromLineStrip(lineStrip, attach = false) {
        return CreateInfo.new("ls", { lineStrip }, { attach });
    }
    /**
     * Computes the polygon
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} A polygon of type TYPE_POLYGON
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let { points } = this;
        const { attach } = createInfo.params;

        if (createInfo.name === "p") {
            if (!attach) {
                points = [];
            } else {
                points = [...points];
            }
            for (const p of dependencies) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
                points.push(p);
            }
        } else if (createInfo.name === "ls") {
            const { lineStrip } = dependencies;
            assertExistsAndNotOptional(lineStrip);
            assertType(lineStrip, TYPE_LINE_STRIP);
            if (!attach) {
                points = [...lineStrip.points];
            } else {
                points.push(...points);
            }
        } else if (createInfo.name === "pa") {
            const { pointArray } = dependencies;
            assertExistsAndNotOptional(pointArray);
            if (!Array.isArray(pointArray)) {
                throw new Error("Expected array");
            }

            for (const p of pointArray) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
            }
            if (attach) {
                points = [...points, ...pointArray];
            } else {
                points = pointArray;
            }
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makePolygon({ points });
    }
}
/**
 * Definition of a Bezier curve.
 * A Bezier curve is specified by its control points
 */
class DefBezier {
    /**
     * Default value
     * @param {Array<{x:Number, y:Number}>} points An array of control points
     */
    constructor(points = []) {
        this.points = points;
    }
    /**
     * Computes a Bezier curve from an array of control points
     * @param {Array<Number | Object>} points Either the indices or values of TYPE_POINT. The points from which to make the Bezier curve of
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this Bezier curve
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(points, attach = false) {
        return CreateInfo.new("p", points, { attach });
    }
    /**
     * Computes a Bezier curve from an array of control points stored as a value
     * @param {Number | Object} pointArray Either the index or value of an array of points of type TYPE_POINT. The point array
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this Bezier curve
     * @returns {CreateInfo} The creation info
     */
    static fromPointArray(pointArray, attach = false) {
        return CreateInfo.new("pa", { pointArray }, { attach });
    }

    /**
     * Computes a Cubic Hermite Bezier curve
     * @param {Number | Object} p0 Either the index or value of an array of points of type TYPE_POINT. The point array
     * @param {Number | Object} t0 Either the index or value of an array of points of type TYPE_VECTOR. The point array
     * @param {Number | Object} p1 Either the index or value of an array of points of type TYPE_POINT. The point array
     * @param {Number | Object} t1 Either the index or value of an array of points of type TYPE_VECTOR. The point array
     * @returns {CreateInfo} The creation info
     */
    static fromHermite(p0, t0, p1, t1) {
        return CreateInfo.new("hm", { p0, t0, p1, t1 });

    }

    /**
     * Converts a hermite to a Bezier curve
     * @param {{x:Number, y:Number}} p0 The first point
     * @param {{x:Number, y:Number}} t0 The first tangent
     * @param {{x:Number, y:Number}} p1 The second point
     * @param {{x:Number, y:Number}} t1 The second tangent
     * @returns {Array<{x:Number, y:Number}>} The equivalent cubic Bezier control points
     */
    static hermiteToCubic(p0, t0, p1, t1) {
        const q0 = p0;
        const q1 = Vec2.add(p0, Vec2.scale(t0, 1.0 / 3.0));
        const q2 = Vec2.sub(p1, Vec2.scale(t1, 1.0 / 3.0));
        const q3 = p1;

        return [q0, q1, q2, q3];
    }

    /**
     * Computes the Bezier curve
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} A Bezier curve of type TYPE_BEZIER
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let { points } = this;
        const { attach } = createInfo.params;

        if (createInfo.name === "p") {
            if (!attach) {
                points = [];
            } else {
                points = [...points];
            }
            for (const p of dependencies) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
                points.push(p);
            }
        } else if (createInfo.name === "pa") {
            const { pointArray } = dependencies;
            assertExistsAndNotOptional(pointArray);
            if (!Array.isArray(pointArray)) {
                throw new Error("Expected array");
            }

            for (const p of pointArray) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
            }
            if (attach) {
                points = [...points, ...pointArray];
            } else {
                points = pointArray;
            }
        } else if (createInfo.name === "hm") {

            const { p0, t0, p1, t1 } = dependencies;
            assertExistsAndNotOptional(p0, t0, p1, t1);
            assertType(p0, TYPE_POINT);
            assertType(t0, TYPE_VECTOR);
            assertType(p1, TYPE_POINT);
            assertType(t1, TYPE_VECTOR);

            points = DefBezier.hermiteToCubic(p0, t0, p1, t1);
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makeBezier({ points });
    }
}
/**
 * Definition of a Bezier spline.
 * A Bezier spline is specified by its control points and degree. It differs from a Bezier curve in that it is a sequence of connected curves.
 * The last control point of each segment is the first control point of the next one
 */
class DefBezierSpline {
    /**
     * Default value
     * @param {Object} params
     * @param {Array<{x:Number, y:Number}>} [params.points] An array of control points
     * @param {Number} [params.degree] The degree of the spline
     */
    constructor({ points = [], degree = 1 } = {}) {
        this.points = points;
        this.degree = degree;
    }
    /**
     * Computes a Bezier spline from an array of control points
     * @param {Array<Number | Object>} points Either the indices or values of TYPE_POINT. The points from which to make the Bezier spline of
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this Bezier spline
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(points, attach = false) {
        return CreateInfo.new("p", points, { attach });
    }
    /**
     * Computes a Bezier spline from an array of control points stored as a value
     * @param {Number | Object} pointArray Either the index or value of an array of points of type TYPE_POINT. The point array
     * @param {Boolean} attach Whether the points should be attached to the points already specified for this Bezier spline
     * @returns {CreateInfo} The creation info
     */
    static fromPointArray(pointArray, attach = false) {
        return CreateInfo.new("pa", { pointArray }, { attach });
    }

    /**
    * Computes a Catmull-Rom spline from an array of points. The curve will go through all points.
    * @param {Array<Number | Object> | Number | Array} points Either the indices or values of TYPE_POINT or the index of value of an array containing points. The points from which to make the Bezier spline of
    * @returns {CreateInfo} The creation info
    */
    static fromCatmullRom(points) {
        if (!Array.isArray(points)) {
            points = [points];
        }
        return CreateInfo.new("cm", points);
    }

    /**
     * Computes the Bezier spline
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} A Bezier spline of type TYPE_BEZIER_SPLINE
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let { points } = this;
        let { degree } = this;
        const { attach } = createInfo.params;

        if (createInfo.name === "p") {
            if (!attach) {
                points = [];
            } else {
                points = [...points];
            }
            for (const p of dependencies) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
                points.push(p);
            }
        } else if (createInfo.name === "pa") {
            const { pointArray } = dependencies;
            assertExistsAndNotOptional(pointArray);
            if (!Array.isArray(pointArray)) {
                throw new Error("Expected array");
            }

            for (const p of pointArray) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
            }
            if (attach) {
                points = [...points, ...pointArray];
            } else {
                points = pointArray;
            }
        } else if (createInfo.name === "cm") {

            let input = dependencies;

            // we allow the input to be either a number of points or an array containing the points
            if (input.length === 1 && Array.isArray(input[0])) {
                input = input[0];
            }

            for (const p of input) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT);
            }

            if (input.length < 2) {
                throw new Error("Need at least two points for Catmull-Rom spline");
            }
            const tangents = [];
            for (let i = 0; i < input.length; i++) {
                // compute tangents
                const il = Math.max(0, i - 1);
                const ir = Math.min(input.length - 1, i + 1);
                const t = Vec2.scale(
                    Vec2.sub(input[ir], input[il]),
                    0.5
                );

                tangents.push(t);
            }

            // convert to piecewise cubics
            degree = 3;
            // each curve segment is made from two points and a tangent
            // the first point is added at the beginning and then ommited
            points = [input[0]];
            for (let i = 0; i < input.length - 1; i++) {
                const p0 = input[i];
                const t0 = tangents[i];
                const p1 = input[i + 1];
                const t1 = tangents[i + 1];

                const [q0, q1, q2, q3] = DefBezier.hermiteToCubic(p0, t0, p1, t1);
                points.push(q1, q2, q3);
            }


        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makeBezierSpline({ points, degree });
    }
}

/**
 * Definition of arc length
 * Computes the arc length of an arc
 */
class DefArcLength {
    /**
     * Compute arc length for an arc
     * @param {Number | Object} arc Either the index or value of a TYPE_ARC
     * @returns {CreateInfo} The creation info
     */
    static fromArc(arc) {
        return CreateInfo.new("arc", { arc });
    }

    /**
     * Compute arc length for an arc
     * @param {Number | Object} r Either the index or value of a TYPE_NUMBER. The arc radius
     * @param {Number | Object} startAngle Either the index or value of a TYPE_NUMBER. The arc starting angle
     * @param {Number | Object} endAngle Either the index or value of a TYPE_NUMBER. The arc end angle
     * @returns {CreateInfo} The creation info
     */
    static fromValues(r, startAngle, endAngle) {
        return CreateInfo.new("v", { r, startAngle, endAngle });
    }


    /**
     * Compute the arc length of an arc
     * @param {Number} r The arc radius
     * @param {Number} startAngle The arc starting angle
     * @param {Number} endAngle The arc end angle
     * @returns {Number} The arc length
     */
    static calcArcLength(r, startAngle, endAngle) {
        startAngle = normalizeAngle(startAngle);
        endAngle = normalizeAngle(endAngle);
        // handle wrap around
        if (endAngle < startAngle) {
            endAngle += 2.0 * Math.PI;
        }
        const da = endAngle - startAngle;
        return da * r;
    }

    /**
     * Compute the arc length
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The arc length as a TYPE_NUMBER
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        if (createInfo.name === "arc") {
            const { arc } = dependencies;
            assertExistsAndNotOptional(arc);
            assertType(arc, TYPE_ARC);
            const { r, startAngle, endAngle } = arc;
            return makeNumber(DefArcLength.calcArcLength(r, startAngle, endAngle));
        } else if (createInfo.name === "v") {
            const { r, startAngle, endAngle } = dependencies;
            return makeNumber(DefArcLength.calcArcLength(r, startAngle, endAngle));
        } else {
            throw new Error("No suitable constructor");
        }
    }
}
/**
 * Definition of the squared length of a vector or between two points
 */
class DefLengthSquared {
    /**
     * Compute squared langth of a vector or the two points specifying a line
     * @param {Number | Object} v Either the index or value of an object of one of [TYPE_VECTOR, TYPE_LINE]
     * @returns {CreateInfo} The creation info
     */
    static fromVectorOrLine(v) {
        return CreateInfo.new("vl", { v });
    }
    /**
     * Compute squared distance between two points
     * @param {Number | Object} p0 Either the index or value of a TYPE_POINT. The first point
     * @param {Number | Object} p1 Either the index or value of a TYPE_POINT. The second point
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(p0, p1) {
        return CreateInfo.new("pp", { p0, p1 });
    }

    /**
     * Computes the squared length
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The squared length as a TYPE_NUMBER
     */
    compute(createInfo) {
        let dx = 0;
        let dy = 0;

        const { dependencies } = createInfo;

        if (createInfo.name === "vl") {
            const { v } = dependencies;
            assertExistsAndNotOptional(v);

            assertType(v, TYPE_VECTOR, TYPE_LINE);

            if (v.type === TYPE_VECTOR) {
                dx = v.x;
                dy = v.y;
            } else if (v.type === TYPE_LINE) {
                const { p0, p1 } = v;
                dx = p1.x - p0.x;
                dy = p1.y - p0.y;
            }

        } else if (createInfo.name === "pp") {
            const { p0, p1 } = dependencies;

            assertExistsAndNotOptional(p0, p1);

            assertType(p0, TYPE_POINT);
            assertType(p1, TYPE_POINT);

            dx = p1.x - p0.x;
            dy = p1.y - p0.y;

        } else {
            throw new Error("No suitable constructor found")
        }

        return makeNumber(dx * dx + dy * dy);
    }
}
/**
 * Definition of the length of a vector or between two points
 */
class DefLength {
    constructor() {
        this.ds = new DefLengthSquared();
    }
    /**
         * Compute squared langth of a vector or the two points specifying a line
         * @param {Number | Object} v Either the index or value of an object of one of [TYPE_VECTOR, TYPE_LINE]
         * @returns {CreateInfo} The creation info
         */
    static fromVectorOrLine(v) {
        return DefLengthSquared.fromVectorOrLine(v);
    }
    /**
    * Compute distance between two points
    * @param {Number | Object} p0 Either the index or value of a TYPE_POINT. The first point
    * @param {Number | Object} p1 Either the index or value of a TYPE_POINT. The second point
    * @returns {CreateInfo} The creation info
    */
    static fromPoints(p0, p1) {
        return DefLengthSquared.fromPoints(p0, p1);
    }
    /**
    * Computes the length
    * @param {CreateInfo} createInfo The creation info
    * @returns {Object} The length as a TYPE_NUMBER
    */
    compute(createInfo) {
        const sqr = this.ds.compute(createInfo);
        sqr.value = Math.sqrt(sqr.value);
        return sqr;
    }
}

/**
 * Select some key from a value and optionally transform it.
 * If the value does not exist, the definition is INVALID
 * Can be used to easily get elements of an array or some other storage where more information is bundled
 */
class DefSelect {
    /**
     * 
     * @param {*} key The key to select
     */
    constructor(key) {
        this.key = key;
    }

    /**
    * Select the key from a given object and optionally transforms it
    * @param {Number | Object} obj Either the index or value of an object
    * @param {Function} [transform] Function to transform the aquired key
    * @returns {CreateInfo} The creation info
    */
    static fromObject(obj, transform = null) {
        return CreateInfo.new("o", { obj }, { transform });
    }

    /**
     * Computes the key selection
     * @param {CreateInfo} createInfo The creation info
     * @returns {*} The value of the key or transformed object
     */
    compute(createInfo) {

        const { dependencies } = createInfo;

        if (createInfo.name === "o") {
            const { obj } = dependencies;
            const { transform } = createInfo.params;
            assertExistsAndNotOptional(obj);
            let val = obj[this.key];
            if (val === undefined) {
                return INVALID;
            }
            if (transform && transform instanceof Function) {
                val = transform(val);
            }
            return val;

        } else {
            throw new Error("No suitable constructor found");
        }
    }
}

/**
 * Apply a series of transformations
 * This allows to process and convert any object into others by combining different steps
 * A special case of the general function type.
 * The type of CreateInfo that needs to be provided depends on the first function in the chain
 */
class DefChainApply {
    /**
     * @param {...(Function | {compute: Function})} args The chain to be applied
     * If an object in the chain is a function, it is directly applied, otherwise the compute field is used as is used in other definitions
     */
    constructor(...args) {
        this.chain = [...args];
    }

    /**
     * Applies the chain
     * @param {CreateInfo} params The creation info
     * @returns {*} The final result of the chain
     */
    compute(params) {
        const c = this.chain;
        let result = params;
        for (let i = 0; i < c.length; i++) {
            const ci = c[i];
            if (ci instanceof Function) {
                result = ci(result);
            } else {
                result = c[i].compute(result);
            }
        }

        return result;
    }
}

/**
 * Maps an array of values to an output using a function.
 * A special case of the general function type.
 */
class DefMap {

    /**
     * 
     * @param {Function | {compute: Function}} f The function to be applied
     * If the object is a function, it is directly applied, otherwise the compute field is used as is used in other definitions
     */
    constructor(f) {
        this.f = f;
    }
    /**
    * Map an array of values
    * @param {Number | Object} array Either the index or value of objects
    * @returns {CreateInfo} The creation info
    */
    static fromArray(array) {

        return CreateInfo.new("a", array);
    }
    /**
    * Map an array of values
    * @param {...(Number | Object)} array Either the indices or values of objects
    * @returns {CreateInfo} The creation info
    */
    static fromValues(...args) {
        return CreateInfo.new("v", [...args]);
    }

    compute(input) {
        const { dependencies } = input;

        const result = new Array(dependencies.length);
        const { f } = this;
        for (let i = 0; i < dependencies.length; i++) {

            if (f instanceof Function) {
                result[i] = f(dependencies[i]);
            } else {
                result[i] = f.compute(dependencies[i]);
            }
        }

        return result;
    }
}


/**
 * Definition of an arc
 */
class DefArc {
    /**
     * Default values
     * @param {Object} params
     * @param {Number} [r=1] The radius
     * @param {{x:Number, y:Number}} [center={x:0,y:0}] The center
     * @param {Number} [startAngle = 0] The starting angle
     * @param {Number} [endAngle = 2.0 * Math.PI] The end angle
     */
    constructor({ r = 1, center = { x: 0, y: 0 }, startAngle = 0, endAngle = 2.0 * Math.PI } = {}) {
        this.r = r;
        this.center = center;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    /**
     * Create an arc from individual values
     * @param {Object} params
     * @param {Number | Object} [params.r] Either the index or value of a TYPE_NUMBER. The radius
     * @param {Number | Object} [params.center] Either the index or value of a TYPE_POINT. The center
     * @param {Number | Object} [params.startAngle] Either the index or value of a TYPE_NUMBER. The starting angle
     * @param {Number | Object} [params.endAngle] Either the index or value of a TYPE_NUMBER. The end angle
     * @returns {CreateInfo} The creation info
     */
    static fromValues({
        r = EMPTY,
        center = EMPTY,
        startAngle = EMPTY,
        endAngle = EMPTY,
    }) {
        return CreateInfo.new("v", { r, center, startAngle, endAngle });
    }
    /**
     * Create an arc from three points
     * @param {Object} params
     * @param {Number | Object} params.p0 Either the index or value of a TYPE_POINT. The first point
     * @param {Number | Object} params.p10 Either the index or value of a TYPE_POINT. The second point
     * @param {Number | Object} params.p2 Either the index or value of a TYPE_POINT. The third point
     * @param {Boolean} [params.fullCircle] If true, the resulting arc will be a circle, otherwise the arc will only be the range specified by the points
     * @returns {CreateInfo} The creation info
     */
    static fromPoints({ p0, p1, p2, fullCircle = false }) {
        return CreateInfo.new("ppp", { p0, p1, p2 }, { fullCircle });

    }
    /**
     * Create an arc from a center and going through the segment specified by two points on the circle
     * @param {Number | Object} center Either the index or value of a TYPE_POINT. The center
     * @param {Number | Object} p0 Either the index or value of a TYPE_POINT. The first point
     * @param {Number | Object} p1 Either the index or value of a TYPE_POINT. The second point
     * @returns {CreateInfo} The creation info
     */
    static fromCenterAndPoints(center, p0, p1, useAngle = DefAngle.USE_COMPUTED_ANGLE) {
        return CreateInfo.new("cap", { center, p0, p1 }, { useAngle });
    }

    /**
     * Create an arc from three points
     * @param {{x:Number, y:Number}} p0 The first point
     * @param {{x:Number, y:Number}} p1 The second point
     * @param {{x:Number, y:Number}} p2 The third point
     * @param {Boolean} fullCircle If true, the resulting arc will be a circle, otherwise the arc will only be the range specified by the points
     * @returns {{  r : Number, center : {x:Number,y:Number}, startAngle: Number, endAngle:Number} | null} The computed arc or null, if no such arc can exist
     */
    static computeParametersFromPoints(p0, p1, p2, fullCircle) {
        // construct circle from points

        // complex solution from https://math.stackexchange.com/questions/213658/get-the-equation-of-a-circle-when-given-3-points

        // simple complex numbers

        // check points
        const z1 = [p0.x, p0.y];
        const z2 = [p1.x, p1.y];
        const z3 = [p2.x, p2.y];

        if (cEquals(z1, z2) || cEquals(z2, z3) || cEquals(z3, z1)) {
            return null;
        }

        const w = cDiv(cSub(z3, z1), cSub(z2, z1));
        if (Math.abs(w[1]) < this.eps) {
            // colinear points
            return null;
        }
        // c = (z2 - z1)*(w - abs(w)**2)     /   (2j*w.imag) + z1  # Simplified denominator
        // r = abs(z1 - c)
        const wabs2 = cMult(w, cConj(w));
        const c = cAdd(
            cDiv(cMult(
                cSub(z2, z1),
                cSub(w, wabs2)
            ),
                cMult([0, 2], [cImag(w), 0])
            ),
            z1
        );

        const r = cAbs(cSub(z1, c));

        if (fullCircle) {
            return {
                r, center: { x: cReal(c), y: cImag(c) }, startAngle: 0, endAngle: 2.0 * Math.PI
            };
        } else {
            const center = { x: cReal(c), y: cImag(c) };
            const angles = [
                calcAngle(p0.x - center.x, p0.y - center.y),
                calcAngle(p1.x - center.x, p1.y - center.y),
                calcAngle(p2.x - center.x, p2.y - center.y),
            ];

            const startAngle = Math.min(...angles);
            const endAngle = Math.max(...angles);
            return {
                r, center, startAngle, endAngle
            };
        }
    }

    /**
     * Compute the arc
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The arc of type TYPE_ARC
     */
    compute(createInfo) {
        let { r, center, startAngle, endAngle } = this;
        const { dependencies, params } = createInfo;
        if (createInfo.name === "v") {
            const { r: rn, center: cn, startAngle: startAngleN, endAngle: endAngleN } = dependencies;

            if (!isParamEmpty(rn)) {
                assertType(rn, TYPE_NUMBER);
                r = rn.value;
            }

            if (!isParamEmpty(cn)) {
                assertType(cn, TYPE_POINT);
                center = cn;
            }

            if (!isParamEmpty(startAngleN)) {
                assertType(startAngleN, TYPE_NUMBER);
                startAngle = startAngleN.value;
            }
            if (!isParamEmpty(endAngleN)) {
                assertType(endAngleN, TYPE_NUMBER);
                endAngle = endAngleN.value;
            }
        } else if (createInfo.name === "ppp") {
            const { p0, p1, p2 } = dependencies;
            assertExistsAndNotOptional(p0, p1, p2);
            assertType(p0, TYPE_POINT);
            assertType(p1, TYPE_POINT);
            assertType(p2, TYPE_POINT);
            const { fullCircle } = createInfo.params;
            const result = DefArc.computeParametersFromPoints(p0, p1, p2, fullCircle);
            if (!result) {
                return INVALID;
            }
            ({ r, center, startAngle, endAngle } = result);
        } else if (createInfo.name === "cap") {
            const { center: cn, p0, p1 } = dependencies;
            assertExistsAndNotOptional(cn, p0, p1);
            assertType(cn, TYPE_POINT);
            assertType(p0, TYPE_POINT);
            assertType(p1, TYPE_POINT);

            const d0x = p0.x - cn.x;
            const d0y = p0.y - cn.y;
            const d02 = d0x * d0x + d0y * d0y;
            const rn = Math.sqrt(d02);
            const d1x = p1.x - cn.x;
            const d1y = p1.y - cn.y;
            const d12 = d1x * d1x + d1y * d1y;

            if (Math.abs(d02 - d12) > 1E-7) {
                // points can't lie on the same circle
                return INVALID;
            }
            // find start and end angle
            startAngle = calcAngle(p0.x - cn.x, p0.y - cn.y);
            endAngle = calcAngle(p1.x - cn.x, p1.y - cn.y);

            let a0 = startAngle;
            let a1 = endAngle;
            if (a1 < a0) {
                a1 += 2.0 * Math.PI;
            }

            const { useAngle } = params;
            const adif = a1 - a0;
            if (useAngle === DefAngle.USE_SMALLER_ANGLE) {
                // angle is > 180° -> use the other side
                if (adif > Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            } else if (useAngle === DefAngle.USE_LARGER_ANGLE) {
                // angle is < 180° -> use other side
                if (adif < Math.PI) {
                    [a0, a1] = [a1, a0];
                }
            }


            startAngle = a0;
            endAngle = a1;

            center = cn;
            r = rn;
            // return makeArc({
            //     r, center,
            //     startAngle,
            //     endAngle
            // });
        } else if (createInfo !== EMPTY_INFO) {
            throw new Error("No suitable constructor found");
        }

        return makeArc({
            r, center,
            startAngle, endAngle,
        });
    }
}
/**
 * Definition of an ellipse
 */
class DefEllipse {
    /**
     * Default values
     * @param {Object} params
     * @param {{x:Number, y:Number}} [center={x:0,y:0}] The center
     * @param {Number} [rx=1] The x-exxentricity
     * @param {Number} [ry=1] The y-exxentricity
     * @param {Number} [startAngle = 0] The starting angle
     * @param {Number} [endAngle = 2.0 * Math.PI] The end angle
     * @param {Number} [rotation = 0] The rotation angle of the ellipse
     */
    constructor({
        center = { x: 0, y: 0 },
        rx = 1,
        ry = 1,
        startAngle = 0,
        endAngle = 2.0 * Math.PI,
        rotation = 0,
    } = {}) {
        this.center = center;
        this.rx = rx;
        this.ry = ry;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.rotation = rotation;
    }
    /**
     * Create an ellipse from individual values
     * @param {Object} params
     * @param {Number | Object} [params.center] Either the index or value of a TYPE_POINT. The center
     * @param {Number | Object} [params.rx] Either the index or value of a TYPE_NUMBER. The x-eccentricity
     * @param {Number | Object} [params.ry] Either the index or value of a TYPE_NUMBER. The y-eccentricity
     * @param {Number | Object} [params.startAngle] Either the index or value of a TYPE_NUMBER. The starting angle
     * @param {Number | Object} [params.endAngle] Either the index or value of a TYPE_NUMBER. The end angle
     * @param {Number | Object} [params.rotation] Either the index or value of a TYPE_NUMBER. The ellipse rotation
     * @returns {CreateInfo} The creation info
     */
    static fromValues({
        center = EMPTY,
        rx = EMPTY,
        ry = EMPTY,
        startAngle = EMPTY,
        endAngle = EMPTY,
        rotation = EMPTY,
    }) {
        return CreateInfo.new("v", {
            center,
            rx,
            ry,
            startAngle,
            endAngle,
            rotation,
        });
    }

    /**
     * Compute the ellipse
     * @param {CreateInfo} info The creation info
     * @returns {Object} The ellipse of type TYPE_ELLIPSE
     */
    compute(info) {
        let {
            center,
            rx,
            ry,
            startAngle,
            endAngle,
            rotation,
        } = this;

        const { dependencies } = info;
        if (info.name === "v") {
            const {
                center: centerN,
                rx: rxN,
                ry: ryN,
                startAngle: startAngleN,
                endAngle: endAngleN,
                rotation: rotationN,
            } = dependencies;

            if (!isParamEmpty(centerN)) {
                assertType(centerN, TYPE_POINT);
                center = centerN;
            }

            if (!isParamEmpty(rxN)) {
                assertType(rxN, TYPE_NUMBER);
                rx = rxN.value;
            }

            if (!isParamEmpty(ryN)) {
                assertType(ryN, TYPE_NUMBER);
                ry = ryN.value;
            }

            if (!isParamEmpty(startAngleN)) {
                assertType(startAngleN, TYPE_NUMBER);
                startAngle = startAngleN.value;
            }

            if (!isParamEmpty(endAngleN)) {
                assertType(endAngleN, TYPE_NUMBER);
                endAngle = endAngleN.value;
            }

            if (!isParamEmpty(rotationN)) {
                assertType(rotationN, TYPE_NUMBER);
                rotation = rotationN.value;
            }
        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makeEllipse({
            center,
            rx,
            ry,
            startAngle,
            endAngle,
            rotation,
        });
    }
}

/**
 * Definition of a closest point to some given point.
 * Supported types can be found at @see{ClosestPointRegistry}
 */
class DefClosestPoint {
    /**
     * Compute the closest point on an object. 
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The query point
     * @param {Number | Object} obj Either the index or value of an object. The object on which the closest point should be found
     * @returns {CreateInfo} The creation info
     */
    static fromObject(p, obj) {
        return CreateInfo.new("o", { p, obj });
    }
    /**
     * Compute the closest point on a collection of object. Supported types can be found at @see{ClosestPointRegistry}.
     * Be careful, as this might be slow to compute, depending on the number and types of the objects
     * @param {Number | Object} p Either the index or value of a TYPE_POINT. The query point
     * @param {Array | Object} collection Either the indices or values of objects. The objects on which the closest point should be found
     * @returns {CreateInfo} The creation info
     */
    static fromCollection(p, collection) {
        const obj = [p];
        if (Array.isArray(collection)) {
            obj.push(...collection);
        } else {
            // move all values inside
            for (const key of Object.keys(collection)) {
                obj.push(collection[key]);
            }
        }
        return CreateInfo.new("mo", obj);
    }

    /**
     * Compute the closest point
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The closet point of type TYPE_POINT
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let c = null;
        if (createInfo.name === "o") {
            const { p, obj } = dependencies;
            assertExistsAndNotOptional(p, obj);
            assertType(p, TYPE_POINT);

            c = ClosestPointRegistry.closestPoint(p, obj);

        } else if (createInfo.name === "mo") {
            const [p, ...collection] = dependencies;
            assertExistsAndNotOptional(p, ...collection);
            assertType(p, TYPE_POINT);
            let minDist = Infinity;
            for (const o of collection) {
                assertExistsAndNotOptional(o);
                const cp = ClosestPointRegistry.closestPoint(p, o);
                if (!cp) {
                    continue;
                }
                const d = vLen2(vSub(cp, p));
                if (d < minDist) {
                    minDist = d;
                    c = cp;
                }
            }
        } else {
            throw new Error("No suitable constructor found");
        }

        if (!c) {
            // there should always be a closest point, but there might be multiple ones or some other issues
            return INVALID;
        }
        return c;
    }
}

/**
 * Definition of the intersection of two objects.
 * Supported types can be found at @see{IntersectionRegistry}
 */
class DefIntersection {
    /**
     * Compute the intersection points of two objects
     * @param {Number | Object} obj0 Either the index or value of an object
     * @param {Number | Object} obj1 Either the index or value of an object
     * @param {Object} params
     * @param {Number} [params.takeIndex] The index of the intersection to use. 
     * If < 0, then the returned result will be used. 
     * If = 0, either the first entry in an intersection array or the intersection point will be returned, depending on the return type of the intersector
     * If > 0, the indicated index in an array of intersections
     * 
     * If any requested intersection does not exist (for example requesting the second point, when only one exists) will result in INVALID
     * @returns {CreateInfo} The creation info
     */
    static fromObjects(obj0, obj1, {
        takeIndex = -1,
    } = {}) {
        return CreateInfo.new("o", { obj0, obj1 }, { takeIndex });
    }
    /**
     * Compute the intersection points
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object | Array} The intersection points. Some intersectors return a single point and others an array, if multiple intersections can exists. 
     * Points are of type TYPE_POINT
     */
    compute(createInfo) {
        const { dependencies, params } = createInfo;

        if (createInfo.name === "o") {
            const { obj0, obj1 } = dependencies;
            const { takeIndex } = params;
            assertExistsAndNotOptional(obj0, obj1);

            let result = IntersectionRegistry.intersect(obj0, obj1);

            if (!result) {
                return INVALID;
            }

            if (!Array.isArray(result)) {
                result = [result];
            }

            if (takeIndex >= 0) {

                if (takeIndex >= result.length) {
                    return INVALID;
                }

                return result[takeIndex];
            }
            return result;
        } else {
            throw new Error("No suitable constructor found");
        }
    }
}

/**
 * Defines an array consisting of other object values
 */
class DefArray {
    /**
     * Make an array out of objects
     * @param {Object | Array} objects Either the indices or values of objects stored in an array or shallow object
     * @param {Object} params
     * @param {Boolean} [params.filterOutInvalid] If true, INVALID values will not be included in the result
     * @param {Boolean} [params.filterOutEmpty] If true, EMPTY values will not be included in the result
     * @param {Boolean} [params.filterOutNull] If true, null values will not be included in the result
     * @param {Boolean} [params.appendArrayDependencies] If true, arrays will not be treated as single elements, but the array elements will be appended to the results
     * @param {Boolean} [params.ignoreInvalids] If true, the array will be constructed, even if there are any INVALID dependencies
     * @returns {CreateInfo} The creation info
     */
    static fromObjects(objects, {
        filterOutInvalid = true,
        filterOutEmpty = true,
        filterOutNull = true,
        appendArrayDependencies = false,
        ignoreInvalids = false } = {}) {
        return CreateInfo.new("o", objects, {
            filterOutInvalid, filterOutEmpty, filterOutNull,
            appendArrayDependencies
        }, ignoreInvalids);
    }

    /**
     * Create the array value
     * @param {CreateInfo} info The creation info
     * @returns {Array} An array containing the specified objects
     */
    compute(info) {
        const { dependencies } = info;
        const { params } = info;

        if (info.name === "o") {
            const { filterOutInvalid, filterOutEmpty,
                filterOutNull, appendArrayDependencies } = params;
            const result = [];

            for (const key of Object.keys(dependencies)) {
                let o = dependencies[key];
                if (o === null && filterOutNull) {
                    continue;
                }
                if (o === EMPTY && filterOutEmpty) {
                    continue;
                }
                if (o === INVALID && filterOutInvalid) {
                    continue;
                }
                if (appendArrayDependencies && Array.isArray(o)) {
                    result.push(...o);
                } else {
                    result.push(o);
                }
            }
            return result;
        } else {
            throw new Error("No suitable constructor");
        }
    }
}

/**
 * Definition of a linear interpolation between two objects of the same type by some parameter t.
 * 
 * Supported types are (type of interpolation in brackets):
 * TYPE_NUMBER (value)
 * TYPE_POINT (coordinates)
 * TYPE_VECTOR (coordinates and reference point)
 * TYPE_POLAR (coordinates)
 * TYPE_ANGLE (angle, start and reference point)
 * TYPE_ARC (center, radius, start angle, end angle)
 * TYPE_ELLIPSE (center, eccentricities, start angle, end angle, rotation)
 * TYPE_LINE (points, Opennness is determined by logical OR)
 * TYPE_LINE_STRIP (points)
 * TYPE_POLYGON (points)
 * TYPE_BEZIER (points)
 * TYPE_BEZIER_SPLINE (points)
 */
class DefInterpolate {
    /**
     * Default value
     * @param {Number} [t] 
     */
    constructor(t = 0.5) {
        this.t = t;
    }
    /**
     * Compute the interpolation of two objects
     * @param {Number | Object} obj0 Either the index or value of an object
     * @param {Number | Object} obj1 Either the index or value of an object
     * @param {Number | Object} [t] Either the index or value of a TYPE_NUMBER. The interpolation parameter in [0,1]
     * @returns {CreateInfo} The creation info
     */
    static fromObjects(obj0, obj1, t = EMPTY) {
        return CreateInfo.new("o", { obj0, obj1, t });
    }
    /**
      * Compute the interpolation of an angle
      * The interpolation interpolates from start to start + value
      * @param {Number | Object} angle Either the index or value of a TYPE_ANGLE. The angle to be interpolated
      * @param {Number | Object} [t] Either the index or value of a TYPE_NUMBER. The interpolation parameter in [0,1]
      * @returns {CreateInfo} The creation info
      */
    static fromAngle(angle, t = EMPTY) {
        return CreateInfo.new("ang", { angle, t });
    }

    /**
     * Compute the interpolation
     * @param {CreateInfo} info The creation info
     * @returns {Object} The interpolated object
     */
    compute(info) {
        const { dependencies } = info;
        let { t } = this;

        if (info.name === "o") {
            const { obj0, obj1, t: tN } = dependencies;

            assertExistsAndNotOptional(obj0, obj1);

            if (!isParamEmpty(tN)) {
                assertType(tN, TYPE_NUMBER);
                t = tN.value;
            }

            if (obj0.type !== obj1.type) {
                throw new Error("Interpolation only defined for objects of same type");
            }

            const type = obj0.type;

            const ti = 1 - t;
            if (type === TYPE_NUMBER) {
                return makeNumber(ti * obj0.value + t * obj1.vallue);
            } else if (type === TYPE_POINT) {
                const pt = vLerp(obj0, obj1, t);
                return makePoint(pt);
            } else if (type === TYPE_VECTOR) {
                const vt = vLerp(obj0, obj1, t);
                const pt = vLerp(obj0.ref, obj1.ref, t);
                return makeVector({ x: vt.x, y: vt.y, ref: pt });
            } else if (type === TYPE_POLAR) {
                const rt = ti * obj0.r + t * obj1.r;
                const at = ti * obj0.alpha + t * obj1.alpha;
                return makePolarCoordinate({ r: rt, alpha: at });
            } else if (type === TYPE_ANGLE) {
                const vt = ti * obj0.value + t * obj1.value;
                const st = ti * obj0.start + t * obj1.start;
                const pt = vLerp(obj0.ref, obj1.ref, t);

                return makeAngle({ value: vt, start: st, ref: pt });
            } else if (type === TYPE_ARC) {
                const rt = ti * obj0.r + t * obj1.r;
                const startT = ti * obj0.startAngle + t * obj1.startAngle;
                const endT = ti * obj0.endAngle + t * obj1.endAngle;
                const pt = vLerp(obj0.center, obj1.center, t);

                return makeArc({ r: rt, startAngle: startT, endAngle: endT, center: pt });
            } else if (type === TYPE_ELLIPSE) {
                const rxT = ti * obj0.rx + t * obj1.rx;
                const ryT = ti * obj0.ry + t * obj1.ry;
                const rotT = ti * obj0.rotation + t * obj1.rotation;
                const startT = ti * obj0.startAngle + t * obj1.startAngle;
                const endT = ti * obj0.endAngle + t * obj1.endAngle;
                const pt = vLerp(obj0.center, obj1.center, t);

                return makeEllipse({ center: pt, rx: rxT, ry: ryT, startAngle: startT, endAngle: endT, rotation: rotT });
            } else if (type === TYPE_LINE) {
                const p0 = vLerp(obj0.p0, obj1.p0, t);
                const p1 = vLerp(obj0.p1, obj1.p1, t);
                return makeLine({ p0, p1, leftOpen: (obj0.leftOpen || obj1.leftOpen), rightOpen: (obj0.rightOpen || obj1.rightOpen) });
            } else if (type === TYPE_LINE_STRIP) {
                const points0 = obj0.points;
                const points1 = obj1.points;

                if (points0.length !== points1.length) {
                    throw new Error("Interpolated points number must be the same");
                }

                const result = new Array(points0.length);
                points0.forEach((v, idx) => {
                    result[idx] = vLerp(v, points1[idx]);
                });
                return makeLineStrip({ points: result });
            } else if (type === TYPE_POLYGON) {
                const points0 = obj0.points;
                const points1 = obj1.points;

                if (points0.length !== points1.length) {
                    throw new Error("Interpolated points number must be the same");
                }

                const result = new Array(points0.length);
                points0.forEach((v, idx) => {
                    result[idx] = vLerp(v, points1[idx]);
                });
                return makePolygon({ points: result });
            } else if (type === TYPE_BEZIER) {
                const points0 = obj0.points;
                const points1 = obj1.points;

                if (points0.length !== points1.length) {
                    throw new Error("Interpolated points number must be the same");
                }

                const result = new Array(points0.length);
                points0.forEach((v, idx) => {
                    result[idx] = vLerp(v, points1[idx]);
                });
                return makeBezier({ points: result });
            } else if (type === TYPE_BEZIER_SPLINE) {
                const points0 = obj0.points;
                const points1 = obj1.points;

                if (points0.length !== points1.length) {
                    throw new Error("Interpolated points number must be the same");
                }

                if (obj0.degree !== obj1.degree) {
                    throw new Error("Interpolation of Bezier splines requires same degree");
                }

                const result = new Array(points0.length);
                points0.forEach((v, idx) => {
                    result[idx] = vLerp(v, points1[idx]);
                });
                return makeBezierSpline({ points: result, degree: obj0.degree });
            } else {
                throw new Error(`Interpolation of given type ${type} not supported`);
            }


        } else if (info.name === "ang") {
            const { angle, t: tN } = dependencies;
            assertExistsAndNotOptional(angle);
            assertType(angle, TYPE_ANGLE);

            if (!isParamEmpty(tN)) {
                assertType(tN, TYPE_NUMBER);
                t = tN.value;
            }

            const { start, value, ref } = angle;

            const vt = t * value;

            return makeAngle({ value: vt, start, ref });

        } else {
            throw new Error("No suitable construcotr");
        }
    }
}

/**
 * Event type handler
 */
class EventType {
    #callbacks;
    #id;
    constructor(name) {
        this.name = name;
        this.#callbacks = [];
        this.#id = 0;
    }

    /**
     * Add a callback to this event type
     * @param {function(Object) : (Boolean | undefined)} cb Callback function that may be called with an event object
     * If true is returned, the event is considered consumed
     * @returns {Number} The id for this callback. Can be used to remove the callback
     */
    addCallback(cb) {
        const id = this.#id++;
        this.#callbacks.push({
            cb, id
        });
        return id;
    }

    /**
     * Removes a callback
     * @param {Number} id The id of the callback to be removed
     */
    removeCallback(id) {
        const idx = this.#callbacks.findIndex(x => x.id === id);
        if (idx >= 0) {
            this.#callbacks.splice(idx, 1);
        }
    }

    /**
     * Notify all callbacks attached to this event
     * @param {Object} event The event object
     */
    notify(event) {
        for (let i = 0; i < this.#callbacks.length; i++) {
            const { cb } = this.#callbacks[i];
            const consumed = cb(event);
            if (consumed) {
                break;
            }
        }
    }
}

/**
 * Event that is fired when a definition is updated in a @see{GeometryScene}.
 * This happens every time its value is computed
 */
class DefinitionUpdateEvent {
    /**
     * 
     * @param {GeometryScene} scene The scene from which this event originated
     * @param {Number} index The index of the changed object
     */
    constructor(scene, index) {
        this.scene = scene;
        this.index = index;
    }
}
/**
 * Event that is fired when a definition is removed from a a @see{GeometryScene}.
 */
class DefinitionRemovedEvent {
    /**
     * 
     * @param {GeometryScene} scene The scene from which this event originated
     * @param {Number} index The index of the removed object
     */
    constructor(scene, index) {
        this.scene = scene;
        this.index = index;
    }
}
/**
 * Event that is fired when a property is updated in a @see{GeometryScene}.
 */
class PropertyUpdateEvent {
    /**
     * 
     * @param {GeometryScene} scene The scene from which this event originated
     * @param {Number} index The index of the changed object
     */
    constructor(scene, index) {
        this.scene = scene;
        this.index = index;
    }
}

/**
 * Manages definitions of objects, properties, dependencies and correct updates
 */
class GeometryScene {

    #values;
    #definitions;
    #createInfos;
    #reverseDependencies;
    #updateOrder;
    #properties;
    #freeList;

    #eventHandlers;

    static EVENT_UPDATE = "update";
    static EVENT_PROPERTY = "property";
    static EVENT_REMOVE = "remove";

    constructor() {
        this.#values = [];
        this.#definitions = [];
        this.#createInfos = [];
        this.#reverseDependencies = [];
        this.#updateOrder = [];
        this.#properties = [];
        this.#freeList = [];
        this.#eventHandlers = {};

        this.#eventHandlers[GeometryScene.EVENT_UPDATE] = new EventType(GeometryScene.EVENT_UPDATE);
        this.#eventHandlers[GeometryScene.EVENT_PROPERTY] = new EventType(GeometryScene.EVENT_PROPERTY);
        this.#eventHandlers[GeometryScene.EVENT_REMOVE] = new EventType(GeometryScene.EVENT_REMOVE);
    }

    /**
     * Register a callback.
     * Event names are given as the static fields EVENT_UPDATE, EVENT_PROPERTY, EVENT_REMOVE
     * @param {String} name The name of the callback
     * @param {function(Object) : (Boolean|undefined)} cb The callback function
     * @returns {Number} The id of the registered callback
     */
    registerCallback(name, cb) {
        const type = this.#eventHandlers[name];
        if (!type) {
            return -1;
        }

        return type.addCallback(cb);
    }

    /**
     * Remove a callback.
     * Event names are given as the static fields EVENT_UPDATE, EVENT_PROPERTY, EVENT_REMOVE
     * @param {String} name The name of the callback
     * @param {Number} id The id of the callback to be removed
     */
    removeCallback(name, id) {
        const type = this.#eventHandlers[name];
        if (!type) {
            return;
        }

        type.removeCallback(id);
    }

    #notify(name, event) {
        const type = this.#eventHandlers[name];
        if (!type) {
            // should never happen
            throw ("Trying to notify events that do not exist");
        }
        type.notify(event);
    }

    #resizeIfNeeded(arr, idx) {
        const l = arr.length;
        if (idx >= l) {
            arr.length = idx + 1;
        }
    }

    #wouldCreateLoop(index, createInfo) {
        // find out, if the new index depends on itself along the way
        const queue = [];
        const createDeps = createInfo.dependencies;

        Object.keys(createDeps).forEach(v => queue.push(createDeps[v]));

        while (queue.length > 0) {
            const idx = queue.pop();
            if (idx === EMPTY || idx < 0) {
                continue;
            }

            if (idx === index) {
                return true;
            }
            // get dependencies
            const deps = this.#createInfos[idx].dependencies;
            Object.keys(deps).forEach(v => queue.push(deps[v]));
        }

        return false;
    }

    /**
     * Add a new definition
     * @param {Object} def The definition
     * @param {CreateInfo} createInfo The creation info.
     * Dependencies specified here must use indices obtained via the GeometryScene class to refer to other objects
     * @param {Object} properties Properties to associate with this definition
     * @returns {Number} The id of the created object
     * Ids are unique, while in use, but may be reused after removal
     */
    add(def, createInfo = null, properties = {}) {

        let idx = this.#definitions.length;
        if (this.#freeList.length > 0) {
            idx = this.#freeList.pop();
        }

        return this.set(idx, def, createInfo, properties);
    }

    /**
     * Get the information about the specified object
     * @param {Number} index The index of the registered object
     * @returns {{value: *, definition: Object, createInfo : CreateInfo, index : Number, properties : {}} | null} Information stored for the object or null, if it doesn't exist
     */
    get(index) {
        if (index >= this.#definitions.length) {
            return null;
        }

        // maybe copy?
        const value = this.#values[index];
        const definition = this.#definitions[index];
        const createInfo = this.#createInfos[index];
        const properties = this.#properties[index];

        return {
            value, definition, createInfo, index, properties
        };
    }

    #computeUpdateOrder(indexStart) {
        // we do a breadth first update, otherwise the following could happen:
        // Imagine the simple dependencty setup:
        //   d
        //  / \
        // b   c
        //  \ /
        //   a
        // When we update a and then recursively update all dependencies, we would update d twice: a -> (b -> d, c -> d)
        // Instead we want to do: a -> (b , c)  -> d
        // This still ensures that every dependency is updated before it is needed and we always stay in a valid state

        // do a topological sort

        // the current nodes to update
        let queue = [indexStart];

        const adjacency = {};

        // use object keys to represent edges
        adjacency[indexStart] = { idx: indexStart, entries: {} };

        const dependentQueue = [indexStart];
        // build up graph
        while (dependentQueue.length > 0) {
            const idx = dependentQueue.shift();

            // gather dependant
            const dependentIndices = this.#reverseDependencies[idx] ?? [];

            const adj = adjacency[idx] ?? { idx, entries: {} };
            for (let di of dependentIndices) {
                // put into graph
                adj.entries[di] = di;
            }
            dependentQueue.push(...dependentIndices);
            adjacency[idx] = adj;
        }
        const indegrees = {};

        indegrees[indexStart] = 0;
        // convert adjacency to indegrees
        for (const ki of Object.keys(adjacency)) {
            const { idx, entries } = adjacency[ki];
            for (const ka of Object.keys(entries)) {
                const deg = indegrees[ka] ?? 0;
                indegrees[ka] = deg + 1;
            }
        }

        // do linear time topological sort
        const deg0Indices = [];
        for (const ki of Object.keys(indegrees)) {
            if (indegrees[ki] === 0) {
                deg0Indices.push(ki);
            }
        }
        const order = [];

        while (deg0Indices.length > 0) {
            const i0 = deg0Indices.shift();
            const { idx, entries } = adjacency[i0];
            order.push(idx);
            for (let ai of Object.keys(entries)) {
                let deg = indegrees[ai];
                deg--;
                if (deg < 1) {
                    deg0Indices.push(ai);
                }
                indegrees[ai] = deg;
            }
        }

        return order;
    }

    #updateValue(indexStart) {

        const order = this.#updateOrder[indexStart];
        // update in order
        for (const index of order) {
            const createInfo = this.#createInfos[index];
            const def = this.#definitions[index];

            this.#values[index] = INVALID;

            if (def) {
                if (createInfo === EMPTY_INFO) {
                    this.#values[index] = def.compute(EMPTY_INFO);
                }
                else {
                    const { dependencies } = createInfo;
                    const inputInfo = {
                        name: createInfo.name,
                        dependencies: Array.isArray(dependencies) ? [] : {},
                        params: createInfo.params,
                        ignoreInvalids: createInfo.ignoreInvalids
                    };
                    const inputDeps = inputInfo.dependencies;
                    let validInput = true;
                    // gather dependencies for current
                    for (const key of Object.keys(dependencies)) {
                        const di = dependencies[key];
                        if (di === EMPTY || di < 0) {
                            inputDeps[key] = EMPTY;
                        } else {
                            let val = this.#values[di];
                            if (!isParamValid(val)) {
                                if (createInfo.ignoreInvalids) {
                                    val = INVALID;
                                } else {
                                    validInput = false;
                                    break;
                                }
                            }
                            inputDeps[key] = val;
                        }
                    }
                    // only update, if inputs are valid
                    if (validInput) {
                        this.#values[index] = def.compute(inputInfo);
                    }
                    else {
                        this.#values[index] = INVALID;
                    }
                }

            }

            this.#notify("update", new DefinitionUpdateEvent(this, index));
        }

    }

    #computeUpdateOrderChain(idx) {
        this.#updateOrder[idx] = this.#computeUpdateOrder(idx);
        const deps = this.#createInfos[idx].dependencies;

        for (const k of Object.keys(deps)) {
            const di = deps[k];
            if (di === EMPTY || di < 0) {
                continue;
            }
            this.#computeUpdateOrderChain(di);
        }
    }

    /**
     * Sets the definition for an index.
     * This should generally not be called directly. Instead call add and use update to change the definitions.
     * Set will remove previous entries and compute dependency preserving update orders, which takes time, so it generally should only be done once to set up the structure.
     * Afterwards, only the definition and property should be updated, if possible.
     * @param {Number} index The index of the object
     * @param {Object} def The definition
     * @param {CreateInfo} [createInfo] The creation info
     * Dependencies specified here must use indices obtained via the GeometryScene class to refer to other objects
     * @param {{}} [properties] The properties
     * @returns {Number} The index
     */
    set(index, def, createInfo = null, properties = {}) {

        if (!createInfo) {
            createInfo = EMPTY_INFO;
        }
        // remove previous create infos, if they exist
        const prevCreateInfo = this.#createInfos[index];

        if (prevCreateInfo) {

            if (this.#wouldCreateLoop(index, createInfo)) {
                throw new Error(`Adding element ${index} with dependencies[${JSON.stringify(createInfo)}] would create a loop`);
            }

            // remove previous
            this.#removeDependencies(index);

        }

        this.#resizeIfNeeded(this.#definitions, index);
        this.#resizeIfNeeded(this.#createInfos, index);
        this.#resizeIfNeeded(this.#reverseDependencies, index);
        this.#resizeIfNeeded(this.#updateOrder, index);
        this.#resizeIfNeeded(this.#values, index);
        this.#resizeIfNeeded(this.#properties, index);

        this.#createInfos[index] = createInfo;
        this.#definitions[index] = def;
        this.#properties[index] = properties;


        const deps = createInfo.dependencies;
        for (const k of Object.keys(deps)) {
            const di = deps[k];
            if (di === EMPTY || di < 0) {
                continue;
            }
            let rv = this.#reverseDependencies[di] ?? [];
            rv.push(index);
            this.#reverseDependencies[di] = rv;
        }

        // this should be empty for new objects, but we allow 
        // we also need to update the order of objects depending on this

        this.#computeUpdateOrderChain(index);

        this.#updateValue(index);
        return index;
    }

    /**
     * Update an object.
     * This is the preferred method over set, as it does not change the dependency relashionships and is thus a lot faster.
     * @param {Number} index The index of the object
     * @param {Object} def The new definition
     */
    update(index, def) {
        if (index >= this.#definitions.length || !this.#definitions[index]) {
            throw new Error(`Trying to update non - existent definition at index ${index} `);
        }

        this.#definitions[index] = def;

        this.#updateValue(index);
    }

    /**
     * Sets the properties of an object. Replaces existing properties
     * @param {Number} index The index of the object
     * @param {Object} properties The properties to set
     */
    setProperties(index, properties) {
        if (index >= this.#definitions.length || !this.#definitions[index]) {
            throw new Error(`Trying to update non - existent property at index ${index} `);
        }

        this.#properties[index] = properties;
        this.#notify("property", new PropertyUpdateEvent(this, index));
    }

    /**
     * This will assign the propertes specified into the object's existing properties
     * @param {Number} index The index of the object
     * @param {Object} properties Property values to update
     */
    updateProperties(index, properties) {
        if (index >= this.#definitions.length || !this.#definitions[index]) {
            throw new Error(`Trying to update non - existent property at index ${index} `);
        }

        mergeObjectInto(this.#properties[index], properties);
        this.#notify("property", new PropertyUpdateEvent(this, index));
    }

    #removeDependencies(index) {
        const createInfo = this.#createInfos[index];
        const deps = createInfo.dependencies;

        this.#createInfos[index] = null;
        this.#values[index] = INVALID;

        // update everything that depends on this
        const idxReverseDeps = this.#reverseDependencies[index] ?? [];
        for (const rdep of idxReverseDeps) {
            this.#updateValue(rdep);
        }
        for (const key of Object.keys(deps)) {
            // index of previous dependency
            const di = deps[key];
            if (di === EMPTY || di < 0) {
                continue;
            }
            // remove index from reverse dependencies
            const rdi = this.#reverseDependencies[di];
            if (rdi === undefined) {
                // should not happen
                throw new Error(`Trying to remove dependency ${index} from ${di} `);
            }
            const findex = rdi.findIndex(x => x === index);
            if (findex < 0) {
                // should not happen
                throw new Error(`Trying to remove dependency ${index} from ${di} `);
            }
            rdi.splice(findex, 1);

            // compute update order of removed index
            this.#computeUpdateOrderChain(di);
        }

    }

    /**
     * Remove an object
     * @param {Number} index The index of the object
     */
    remove(index) {
        if (index >= this.#definitions.length) {
            throw new Error(`Trying to delete non - existent definition at index ${index} `);
        }
        const def = this.#definitions[index];
        if (!def) {
            throw new Error(`Trying to delete non - existent definition at index ${index} `);
        }

        this.#notify("remove", new DefinitionUpdateEvent(this, index));

        // remove dependencies
        this.#removeDependencies(index);

        this.#createInfos[index] = null;
        this.#updateOrder[index] = null;
        this.#definitions[index] = null;
        this.#properties[index] = null;

        this.#freeList.push(index);
    }

    /**
     * Creates an iterable view of the scene
     * @param {Object} params
     * @param {Boolean} [skipInvalidValues] If true, invalid values will be skipped, otherwise not
     * @returns {Symbol.iterator} An iterator for this scne
     */
    view({ skipInvalidValues = true } = {}) {

        let index = 0;
        let defs = this.#definitions;
        let vals = this.#values;
        let scene = this;

        return {
            *[Symbol.iterator]() {
                while (index < defs.length) {
                    // skip over null entries
                    while ((!defs[index] || (skipInvalidValues && !isParamValid(vals[index]))) && index < defs.length) {
                        index++;
                    }
                    if (index < defs.length) {
                        yield scene.get(index);
                        index++;
                    }
                }
            }
        };
    }
}


export {
    // variables
    TYPE_BOOLEAN,
    TYPE_NUMBER,
    TYPE_ANGLE,
    TYPE_POINT,
    TYPE_POLAR,
    TYPE_VECTOR,
    TYPE_COORD_SYSTEM,
    TYPE_LINE,
    TYPE_LINE_STRIP,
    TYPE_POLYGON,
    TYPE_ARC,
    TYPE_ELLIPSE,
    TYPE_BEZIER,
    TYPE_BEZIER_SPLINE,
    TYPE_TEXT,
    INVALID,
    EMPTY,
    EMPTY_INFO,

    // functions
    mergeObjectInto,
    createFromTemplate,
    isParamValid,
    isParamEmpty,
    assertExistsAndNotOptional,
    deg2rad,
    rad2deg,
    calcBezierParameterOfPoint,
    calcBezierPointsDerivative,
    deCastlejau,
    subdivideBezierControlPoints,
    subintervalBezierControlPoints,
    subdivideBezierAdaptive,
    makeBoolean,
    makeNumber,
    makePoint,
    makePolarCoordinate,
    makeVector,
    makeAngle,
    makeLine,
    makeLineStrip,
    makePolygon,
    makeBezier,
    makeBezierSpline,
    makeArc,
    makeEllipse,
    makeText,
    objectToString,
    normalizeAngle,
    calcAngle,
    isLine,
    isRay,
    isLineSegment,
    miminumAbsoluteDifferenceAngle,
    orientedAngle,
    convertPointToLocalEllipse,
    convertPointFromLocalEllipse,
    removeColinear,
    calcConvexHull,
    intersectLines,
    convertQuadraticBezierToParamBase,
    convertCubicBezierToParamBase,
    convertQuarticBezierToParamBase,
    intersectQuadraticBezier,
    intersectBezierBezier,
    intersectorApplyToLineSegments,
    calcLineImplicit,
    calcParamOnLine,
    intersectLineBezier,
    intersectArcBezier,
    intersectLineArc,
    isPointInAngleRange,
    isAngleInRange,
    intersectArcArc,
    intersectEllipseEllipse,
    calcCirclePointTangentPoints,
    isPointDirectionValidOnArc,
    calcOuterTangentPoints,
    calcInnerTangentPoints,
    numSegmentsBezierSpline,
    getBezierSplineSegment,
    closestPointLine,
    closestPointArc,
    closestPointBezier,
    assertType,

    // clases
    Vec2,
    Complex,
    Roots,
    IntersectionRegistry,
    ClosestPointRegistry,
    CreateInfo,
    DefVector,
    DefCoordSystem,
    DefCoordSystemOps,
    DefNormalVector,
    DefPerpendicularLine,
    DefParallelLine,
    DefReflection,
    DefRefraction,
    DefPolarVector,
    DefNumber,
    DefBoolean,
    DefConditional,
    DefCurveParam,
    DefText,
    DefAngle,
    DefPolarCoord,
    DefPoint,
    DefCurvePoint,
    DefCurveTangent,
    DefCurveNormal,
    DefTangentPoints,
    DefTangentLines,
    DefMidPoint,
    DefEllipseFocus,
    DefFunc,
    DefLine,
    DefLineStrip,
    DefPolygon,
    DefBezier,
    DefBezierSpline,
    DefArcLength,
    DefLengthSquared,
    DefLength,
    DefSelect,
    DefChainApply,
    DefMap,
    DefArc,
    DefEllipse,
    DefClosestPoint,
    DefIntersection,
    DefArray,
    DefInterpolate,
    EventType,
    DefinitionUpdateEvent,
    DefinitionRemovedEvent,
    PropertyUpdateEvent,
    GeometryScene,
};