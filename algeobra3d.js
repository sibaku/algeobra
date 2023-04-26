// Copyright 2023 sibaku

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

/**
 * @module algeobra3d
 */

import * as alg from "./algeobra.js";
import {
    TYPE_NUMBER,
    EMPTY,

    CreateInfo,

    assertExistsAndNotOptional,
    assertType,
    isParamEmpty,
    EMPTY_INFO, GeometryScene
} from "./algeobra.js";

import * as THREE from 'three';
import {
    Vector3 as V3,
    Spherical,
} from 'three';


/**
 * Type specifier for a spherical coordinate type
 */
const TYPE_SPHERICAL = "geo3d_spherical";
/**
 * Type specifier for a 3D point type
 */
const TYPE_POINT3 = "geo3d_p3d";
/**
 * Type specifier for a 3D vector type
 */
const TYPE_VECTOR3 = "geo3d_v3d";
/**
 * Type specifier for a plane type
 */
const TYPE_PLANE = "geo3d_plane";
/**
 * Type specifier for a 3D line type
 */
const TYPE_LINE3 = "geo3d_l3d";
/**
 * Type specifier for a sphere type
 */
const TYPE_SPHERE = "geo3d_sphere";

/**
 * Type specifier for a mesh type
 */
const TYPE_MESH = "geo3d_mesh";


/**
 * Helper function to create a spherical coordinate-type object
 * @param {Number} r The radius
 * @param {Number} phi The phi angle
 * @param {Number} theta The theta angle
 * @returns {{r : Number,phi : Number,theta : Number,  type:String}}
 */
function makeSpherical(r, phi, theta) {
    return { r, phi, theta, type: TYPE_SPHERICAL };
}

/**
 * Helper function to create a 3d point-type object
 * @param {THREE.Vector3} p The point
 * @returns {{p : THREE.Vector3, type:String}}
 */
function makePoint3(p) {
    return { p, type: TYPE_POINT3 };
}

/**
 * Helper function to create a 3d line-type object
 * @param {THREE.Vector3} p0 The first line point
 * @param {THREE.Vector3} p1 The second line point
 * @param {Boolean} leftOpen Whether the line extends to infinity from the first point
 * @param {Boolean} rightOpen Whether the line extends to infinity from the second point
 * @returns {{p0 : THREE.Vector3, p1 : THREE.Vector3, leftOpen : Boolean, rightOpen : Boolean, type:String}}
 */
function makeLine3(p0, p1, leftOpen, rightOpen) {
    return { p0, p1, leftOpen, rightOpen, type: TYPE_LINE3 };
}

/**
 * Helper function to create a sphere-type object
 * @param {Number} r The radius
 * @param {THREE.Vector3} center The center
 * @returns {{r : Number, center : Vector3, type:String}}
 */
function makeSphere(r, center) {
    return { r, center, type: TYPE_SPHERE };
}

/**
 * Helper function to create a 3d vector-type object
 * @param {THREE.Vector3} v The vector
 * @param {THREE.Vector3} ref The point the vector is attached to
 * @returns {{v : Vector3, ref : Vector3, type:String}}
 */
function makeVector3(v, ref) {
    return { v, ref, type: TYPE_VECTOR3 };
}

/**
 * Helper function to create a plane-type object
 * @param {THREE.Vector3} origin The plane origin
 * @param {THREE.Vector3} u The first spanning vector
 * @param {THREE.Vector3} b The second spanning vector
 * @param {Boolean} infinite Whether the plane is infinite
 * @returns {{origin : Vector3, u : Vector3, v : Vector3, infinite, type:String}}
 */
function makePlane(origin, u, v, infinite) {
    const n = u.clone().cross(v).normalize();
    const dist = n.dot(origin);
    return { origin, u, v, n, dist, infinite, type: TYPE_PLANE };
}

/**
 * Helper function to create a mesh-type object
 * Only points are mandatory.
 * If other attributes are given, they must have the same size as the points
 * @param {THREE.Vector3[]} points The points
 * @param {THREE.Vector3[]} [normals] The normals
 * @param {THREE.Vector2[]} [uvs] The uvs
 * @returns {{points: THREE.Vector3[], normals: THREE.Vector3[], uvs: THREE.Vector2[], type:String}}
 */
function makeMesh(points, normals = [], uvs = []) {
    return { points, normals, uvs, type: TYPE_MESH };
}

/**
 * Definition of spherical coordinates
 */
class DefSpherical {

    /**
     * Default values
     * @param {Object} [params]
     * @param {Number} [params.r] The radius
     * @param {Number} [params.phi] The phi angle
     * @param {Number} [params.theta] The theta angle
     */
    constructor({ r = 1, phi = 0, theta = 0 } = {}) {
        this.r = r;
        this.theta = theta;
        this.phi = phi;
    }

    /**
     * Computes the coordinates from values
     * If any value is EMPTY, the default values are used
     * @param {Object} params
     * @param {Number | Object} [params.r] Either the index or value of a TYPE_NUMBER. The radius
     * @param {Number | Object} [params.phi] Either the index or value of a TYPE_NUMBER. The phi angle
     * @param {Number | Object} [params.theta] Either the index or value of a TYPE_NUMBER. The theta angle
     * @returns {CreateInfo} The creation info
     */
    static fromValues({ r = EMPTY, phi = EMPTY, theta = EMPTY } = {}) {
        return CreateInfo.new("v", { r, phi, theta });
    }

    /**
     * Compute the coordinates
     * @param {CreateInfo} info The creation info
     * @returns {Object} Object of type TYPE_SPHERICAL
     */
    compute(info) {
        const { dependencies } = info;
        let { r, phi, theta } = this;

        if (info.name === "v") {
            const { r: r0, phi: phi0, theta: theta0 } = dependencies;

            if (!isParamEmpty(r0)) {
                assertType(r0, TYPE_NUMBER);
                r = r0.value;
            }

            if (!isParamEmpty(phi0)) {
                assertType(phi0, TYPE_NUMBER);
                phi = phi0.value;
            }

            if (!isParamEmpty(theta0)) {
                assertType(theta0, TYPE_NUMBER);
                theta = theta0.value;
            }
        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makeSpherical(r, phi, theta);
    }
}

/**
 * Definition of a point in 3D space
 */
class DefPoint3 {

    /**
     * Default values
     * @param {THREE.Vector3} [p] The point
     */
    constructor(p = new V3(0, 0, 0)) {
        this.p = p;
    }

    /**
     * Computes the point from spherical coordinates
     * @param {Number | Object} [s] Either the index or value of a TYPE_SPHERICAL. The spherical coordinates
     * @returns {CreateInfo} The creation info
     */
    static fromSpherical(s) {
        return new CreateInfo("s", { s });
    }

    /**
     * Computes the point from values
     * If any value is EMPTY, the default values are used
     * @param {Object} params
     * @param {Number | Object} [params.x] Either the index or value of a TYPE_NUMBER. The x coordinate
     * @param {Number | Object} [params.y] Either the index or value of a TYPE_NUMBER. The y coordinate
     * @param {Number | Object} [params.z] Either the index or value of a TYPE_NUMBER. The z coordinate
     * @returns {CreateInfo} The creation info
     */
    static fromValues({ x = EMPTY, y = EMPTY, z = EMPTY } = {}) {
        return CreateInfo.new("v", { x, y, z });
    }

    /**
     * Computes the point
     * @param {CreateInfo} info The creation info
     * @returns {Object} Object of type TYPE_POINT3
     */
    compute(info) {
        const { dependencies } = info;
        let { p } = this;
        p = p.clone();
        if (info.name === "s") {
            const { s } = dependencies;
            assertExistsAndNotOptional(s);
            assertType(s, TYPE_SPHERICAL);

            p.setFromSpherical(new Spherical(s.r, s.phi, s.theta));
        } else if (info.name === "v") {
            const { x, y, z } = dependencies;

            if (!isParamEmpty(x)) {
                assertType(x, alg.TYPE_NUMBER);
                p.setX(x.value);
            }
            if (!isParamEmpty(y)) {
                assertType(y, alg.TYPE_NUMBER);
                p.setY(y.value);
            }
            if (!isParamEmpty(z)) {
                assertType(z, alg.TYPE_NUMBER);
                p.setZ(z.value);
            }

        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makePoint3(p);
    }
}

/**
 * Definition of a vector in 3D space
 */
class DefVector3 {

    /**
     * Default values
     * @param {Object} [params] 
     * @param {THREE.Vector3} [params.v] The vector components
     * @param {THREE.Vector3} [params.ref] The point this vector is attached to
     * @param {Boolean} [params.normalize] Whether the vector is normalized
     */
    constructor({ v = new V3(1, 0, 0), ref = new V3(0, 0, 0), normalize = false } = {}) {
        this.v = v;
        this.ref = ref;
        this.normalize = false;
    }

    /**
     * Computes the vector from spherical coordinates
     * If any value is EMPTY, the default values are used
     * @param {Object} params
     * @param {Number | Object} [params.s] Either the index or value of a TYPE_SPHERICAL. The spherical coordinates
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT3. The point this vector is attached to
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. WWhether the vector is normalized
     * @returns {CreateInfo} The creation info
     */
    static fromSpherical({ s, ref = EMPTY, normalize = EMPTY }) {
        return CreateInfo.new("s", { s, ref, normalize });
    }
    /**
     * Computes the vector from values
     * If any value is EMPTY, the default values are used
     * @param {Object} params
     * @param {Number | Object} [params.x] Either the index or value of a TYPE_NUMBER. The x coordinate
     * @param {Number | Object} [params.y] Either the index or value of a TYPE_NUMBER. The y coordinate
     * @param {Number | Object} [params.z] Either the index or value of a TYPE_NUMBER. The z coordinate
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT3. The point this vector is attached to
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. WWhether the vector is normalized
     * @returns {CreateInfo} The creation info
     */
    static fromValues({ x = EMPTY, y = EMPTY, z = EMPTY, ref = EMPTY, normalize = EMPTY } = {}) {
        return CreateInfo.new("v", { x, y, z, ref, normalize });
    }
    /**
     * Computes the vector from another vector
     * If any value is EMPTY, the default values are used
     * @param {Object} params
     * @param {Number | Object} [params.v] Either the index or value of a TYPE_VECTOR3. The other vector
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT3. The point this vector is attached to
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. WWhether the vector is normalized
     * @returns {CreateInfo} The creation info
     */
    static fromVectorRef({ v = EMPTY, ref = EMPTY, normalize = EMPTY } = {}) {
        return CreateInfo.new("vr", { v, ref, normalize });
    }
    /**
     * Computes the vector from a line. 
     * The vector is attached to the first point of the line and points to the second.
     * If any value is EMPTY, the default values are used
     * @param {Number | Object} line Either the index or value of a TYPE_LINE3. The line
     * @param {Object} [params]
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT3. The point this vector is attached to
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. WWhether the vector is normalized
     * @returns {CreateInfo} The creation info
     */
    static fromLineRef(line, { ref = EMPTY, normalize = EMPTY } = {}) {
        return CreateInfo.new("lr", { line, ref, normalize });
    }

    /**
     * Computes the vector
     * @param {CreateInfo} info The creation info
     * @returns {Object} An object of type TYPE_VECTOR3
     */
    compute(info) {
        const { dependencies } = info;
        let { v, ref, normalize } = this;
        v = v.clone();
        ref = ref.clone();

        if (info.name === "s") {
            const { s, ref: ref0, normalize: normalize0 } = dependencies;
            assertExistsAndNotOptional(s);
            assertType(s, TYPE_SPHERICAL);

            if (!isParamEmpty(ref0)) {
                assertType(ref0, TYPE_POINT3);
                ref.copy(ref0);
            }

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, alg.TYPE_BOOLEAN);
                normalize = normalize0.value;
            }

            v.setFromSpherical(new Spherical(s.r, s.phi, s.theta));
        } else if (info.name === "v") {
            const { x, y, z, ref: ref0, normalize: normalize0 } = dependencies;

            if (!isParamEmpty(x)) {
                assertType(x, alg.TYPE_NUMBER);
                v.setX(x.value);
            }
            if (!isParamEmpty(y)) {
                assertType(y, alg.TYPE_NUMBER);
                v.setY(y.value);
            }
            if (!isParamEmpty(z)) {
                assertType(z, alg.TYPE_NUMBER);
                v.setZ(z.value);
            }


            if (!isParamEmpty(ref0)) {
                assertType(ref0, TYPE_POINT3);
                ref.copy(ref0);
            }

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, alg.TYPE_BOOLEAN);
                normalize = normalize0.value;
            }
        } else if (info.name === "vr") {
            const { v: v0, ref: ref0, normalize: normalize0 } = dependencies;

            if (!isParamEmpty(v0)) {
                assertType(v0, TYPE_VECTOR3);
                v.copy(v0);
            }
            if (!isParamEmpty(ref0)) {
                assertType(ref0, TYPE_POINT3);
                ref.copy(ref0);
            }

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, alg.TYPE_BOOLEAN);
                normalize = normalize0.value;
            }
        } else if (info.name === "lr") {
            const { line, ref: ref0, normalize: normalize0 } = dependencies;

            assertExistsAndNotOptional(line);
            assertType(line, TYPE_LINE3);

            const { p0, p1 } = line;
            v = p1.clone().sub(p0);
            ref = p0.clone();

            if (!isParamEmpty(ref0)) {
                assertType(ref0, TYPE_POINT3);
                ref.copy(ref0);
            }

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, alg.TYPE_BOOLEAN);
                normalize = normalize0.value;
            }
        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        if (normalize) {
            v.normalize();
        }
        return makeVector3(v, ref);
    }
}

/**
 * Definition of a line in 3D
 */
class DefLine3 {

    /**
     * Default values
     * @param {Object} [params]
     * @param {THREE.Vector3} [params.p0] The first point on the line
     * @param {THREE.Vector3} [params.p1] The second point on the line
     * @param {Boolean} [params.leftOpen] Whether the line extends to infinity from the first point
     * @param {Boolean} [params.rightOpen] Whether the line extends to infinity from the second point
     */
    constructor({ p0 = new V3(0, 0, 0), p1 = new V3(0, 0, 0), leftOpen = false, rightOpen = false } = {}) {
        this.p0 = p0;
        this.p1 = p1;
        this.leftOpen = leftOpen;
        this.rightOpen = rightOpen;
    }

    /**
     * Computes the line through two points
     * If any value is EMPTY, the default values are used
     * @param {Object} params
     * @param {Number | Object} [params.p0] Either the index or value of a TYPE_POINT3. The first point
     * @param {Number | Object} [params.p1] Either the index or value of a TYPE_POINT3. The second point
     * @param {Number | Object} [params.leftOpen] Either the index or value of a TYPE_BOOLEAN. Whether the line extends to infinity from the first point
     * @param {Number | Object} [params.rightOpen] Either the index or value of a TYPE_BOOLEAN. Whether the line extends to infinity from the second point
     * @returns {CreateInfo} The creation info
     */
    static fromPoints({ p0 = EMPTY, p1 = EMPTY, leftOpen = EMPTY, rightOpen = EMPTY }) {
        return CreateInfo.new("p", { p0, p1, leftOpen, rightOpen });
    }
    /**
     * Computes the line defined by a vector.
     * If any value is EMPTY, the default values are used.
     * If no reference is given, the vector's reference point is used
     * @param {Object} params
     * @param {Number | Object} [params.v] Either the index or value of a TYPE_VECTOR3. The vector
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT3. The reference
     * @param {Number | Object} [params.leftOpen] Either the index or value of a TYPE_BOOLEAN. Whether the line extends to infinity from the first point
     * @param {Number | Object} [params.rightOpen] Either the index or value of a TYPE_BOOLEAN. Whether the line extends to infinity from the second point
     * @returns {CreateInfo} The creation info
     */
    static fromVector({ v, ref = EMPTY, leftOpen = EMPTY, rightOpen = EMPTY }) {
        return CreateInfo.new("v", { v, ref, leftOpen, rightOpen });

    }

    /**
     * Computes the line
     * @param {CreateInfo} info The creation info
     * @returns {Object} An object of type TYPE_LINE3
     */
    compute(info) {
        const { dependencies } = info;
        let { p0, p1, leftOpen, rightOpen } = this;
        if (info.name === "p") {
            const { p0: q0, p1: q1, leftOpen: lo, rightOpen: ro } = dependencies;

            if (!isParamEmpty(q0)) {
                assertType(q0, TYPE_POINT3);
                p0 = q0.p;
            }
            if (!isParamEmpty(q1)) {
                assertType(q1, TYPE_POINT3);
                p1 = q1.p;
            }
            if (!isParamEmpty(lo)) {
                assertType(lo, TYPE_BOOLEAN);
                leftOpen = lo.value;
            }
            if (!isParamEmpty(ro)) {
                assertType(ro, TYPE_BOOLEAN);
                rightOpen = ro.value;
            }
        } else if (info.name === "v") {
            const { v, ref, leftOpen: lo, rightOpen: ro } = dependencies;
            assertExistsAndNotOptional(v);
            assertType(v, TYPE_VECTOR3);

            let d = v.v;
            p0 = v.ref.clone();

            if (!isParamEmpty(ref)) {
                assertType(ref, TYPE_POINT3);
                p0 = ref.p;
            }

            p1 = p0.clone().add(d);

            if (!isParamEmpty(lo)) {
                assertType(lo, TYPE_BOOLEAN);
                leftOpen = lo.value;
            }
            if (!isParamEmpty(ro)) {
                assertType(ro, TYPE_BOOLEAN);
                rightOpen = ro.value;
            }
        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makeLine3(p0, p1, leftOpen, rightOpen);
    }
}

/**
 * Definition of a plane in 3D space
 */
class DefPlane {
    /**
     * Default values
     * @param {Object} params
     * @param {THREE.Vector3} [params.origin] The origin point of the plane
     * @param {THREE.Vector3} [params.u] The first spanning vector
     * @param {THREE.Vector3} [params.v] The second spanning vector
     * @param {Boolean} [infinite] Whether or not the plane is infinite or is bound by its spanning vectors
     */
    constructor({ origin = new V3(0, 0, 0), u = new V3(1, 0, 0), v = new V3(0, 1, 0), infinite = false } = {}) {
        this.origin = origin;
        this.u = u;
        this.v = v;
        this.infinite = infinite;
    }

    /**
     * Computes the plane for the given values
     * If any value is EMPTY, the default values are used
     * @param {Object} params
     * @param {Number | Object} [params.origin] Either the index or value of a TYPE_POINT3. The origin
     * @param {Number | Object} [params.u] Either the index or value of a TYPE_VECTOR3. The first spanning vector
     * @param {Number | Object} [params.v] Either the index or value of a TYPE_VECTOR3. The second spanning vector
     * @param {Number | Object} [params.origin] Either the index or value of a TYPE_BOOLEAN. Whether or not the plane is infinite
     * @param {Boolean} [normalizeAxes] If true, the given spanning vectors will be normalized
     * 
     * @returns {CreateInfo} The creation info
     */
    static fromValues({ origin = EMPTY, u = EMPTY, v = EMPTY, infinite = EMPTY, normalizeAxes = false } = {}) {
        return CreateInfo.new("v", { origin, u, v, infinite }, { normalizeAxes });
    }
    /**
     * Computes the plane for the given values
     * @param {Number | Object} p0 Either the index or value of a TYPE_POINT3. The first point
     * @param {Number | Object} p1 Either the index or value of a TYPE_POINT3. The second point
     * @param {Number | Object} p2 Either the index or value of a TYPE_POINT3. The third point
     * @param {Object} [params]
     * @param {Number | Object} [params.infinite] Either the index or value of a TYPE_BOOLEAN. Whether the plane is infinite
     * @param {Boolean} [params.makeOrthogonal] If true, the computed spanning vectors will be made orthogonal
     * 
     * @returns {CreateInfo} The creation info
     */
    static fromPoints(p0, p1, p2, {
        infinite = EMPTY,
        makeOrthogonal = false } = {}) {
        return CreateInfo.new("p", { p0, p1, p2, infinite }, { makeOrthogonal });
    }

    /**
     * Computes a new plane from another given plane
     * @param {Number | Object} plane Either the index or value of a TYPE_PLANE. The reference plane
     * @param {Object} [params]
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT3. A point to which to attach the new plane
     * @param {Number | Object} [params.minU] Either the index or value of a TYPE_NUMBER. Minimum parameter for the first spanning vector
     * @param {Number | Object} [params.maxU] Either the index or value of a TYPE_NUMBER. Maximum parameter for the first spanning vector
     * @param {Number | Object} [params.minV] Either the index or value of a TYPE_NUMBER. Minimum parameter for the second spanning vector
     * @param {Number | Object} [params.maxV] Either the index or value of a TYPE_NUMBER. Maximum parameter for the second spanning vector
     * @param {Number | Object} [params.infinite] Either the index or value of a TYPE_BOOLEAN. Whether the plane is infinite
     * 
     * @returns {CreateInfo} The creation info
     */
    static fromPlane(plane, {
        ref = EMPTY,
        minU = EMPTY,
        maxU = EMPTY,
        minV = EMPTY,
        maxV = EMPTY,
        infinite = EMPTY,
    } = {}) {
        return CreateInfo.new("pl", { plane, ref, minU, maxU, minV, maxV, infinite });
    }
    /**
     * Computes the plane
     * @param {CreateInfo} info The creation info
     * @returns {Object} A plane of type TYPE_PLANE
     */
    compute(info) {
        const { dependencies, params } = info;
        let { origin, u, v, infinite } = this;

        if (info.name === "v") {
            const { origin: origin0, u: u0, v: v0, infinite: infinite0 } = dependencies;
            const { normalizeAxes } = params;
            if (!isParamEmpty(origin0)) {
                assertType(origin0, TYPE_POINT3);
                origin = origin0.p.clone();
            }
            if (!isParamEmpty(u0)) {
                assertType(u0, TYPE_VECTOR3);
                u = u0.v.clone();
            }
            if (!isParamEmpty(v0)) {
                assertType(v0, TYPE_VECTOR3);
                u = v0.v.clone();
            }
            if (!isParamEmpty(infinite0)) {
                assertType(infinite0, alg.TYPE_BOOLEAN);
                infinite = infinite0.value;
            }

            if (normalizeAxes) {
                u = u.clone().normalize();
                v = v.clone().normalize();
            }
        } else if (info.name === "p") {
            const { p0, p1, p2, infinite: infinite0 } = dependencies;
            const { makeOrthogonal } = params;

            assertExistsAndNotOptional(p0, p1, p2);


            u = p1.p.clone().sub(p0.p);
            v = p2.p.clone().sub(p0.p);

            // origin is in the center
            origin = p0.p.clone();

            if (makeOrthogonal) {
                const vl = v.length();
                const n = u.clone().cross(v);
                v = n.cross(u);
                v.normalize().multiplyScalar(vl);
            }

            if (!isParamEmpty(infinite0)) {
                assertType(infinite0, alg.TYPE_BOOLEAN);
                infinite = infinite0.value;
            }

        } else if (info.name === "pl") {
            const { plane, ref, minU, maxU, minV, maxV, infinite: infinite0 } = dependencies;
            assertExistsAndNotOptional(plane);
            assertType(plane, TYPE_PLANE);

            const { u: pu, v: pv, origin: po } = plane;
            origin = po.clone();

            let lu = 0;
            let ru = 1;
            let lv = 0;
            let rv = 1;

            if (!isParamEmpty(ref)) {
                assertType(ref, TYPE_POINT3);
                origin = ref.p.clone();
            }

            if (!isParamEmpty(minU)) {
                assertType(minU, TYPE_NUMBER);
                lu = minU.value;
            }
            if (!isParamEmpty(maxU)) {
                assertType(maxU, TYPE_NUMBER);
                ru = maxU.value;
            }
            if (!isParamEmpty(minV)) {
                assertType(minV, TYPE_NUMBER);
                lv = minV.value;
            }
            if (!isParamEmpty(maxV)) {
                assertType(maxV, TYPE_NUMBER);
                rv = maxV.value;
            }

            origin = origin.clone().add(pu.clone().multiplyScalar(lu)).
                add(pv.clone().multiplyScalar(lv));
            u = pu.clone().multiplyScalar(ru - lu);
            v = pv.clone().multiplyScalar(rv - lv);

            if (!isParamEmpty(infinite0)) {
                assertType(infinite0, alg.TYPE_BOOLEAN);
                infinite = infinite0.value;
            }
        } else if (info !== EMPTY_INFO) {
            throw new Error("No suitable constructor");
        }

        return makePlane(origin.clone(), u.clone(), v.clone(), infinite);
    }
}

/**
 * Definition of a mesh
 */
class DefMesh {
    /**
     * Default values
     * Points are obligatory for a mesh, either by default values or dependencies, but normals and uvs are optional. If they are given, they need to have the same size as the points
     * @param {Object} [params] 
     * @param {THREE.Vector3[]} [points] The vertices
     * @param {THREE.Vector3[]} [normals] The normals
     * @param {THREE.Vector3[]} [uvs] The uvs
     */
    constructor({ points = [], normals = [], uvs = [] } = {}) {
        this.points = points;
        this.normals = normals;
        this.uvs = uvs;
    }

    /**
     * Computes a triangle fan mesh.
     * A fan constructs consecutive triangles sharing the first point.
     * @param {Array<Number | Object>} [points] Either the indices or values of TYPE_POINT3. The points
     * 
     * @returns {CreateInfo} The creation info
     */
    static fromTriangleFan(points) {
        return CreateInfo.new("tf", points);
    }

    /**
     * Computes the mesh object
     * @returns {Object} A mesh of type TYPE_MESH
     */
    compute(info) {
        const { dependencies, params } = info;
        let { points, normals, uvs } = this;
        if (info.name === "tf") {

            const inPoints = [];

            for (let p of dependencies) {
                assertExistsAndNotOptional(p);
                assertType(p, TYPE_POINT3);
                inPoints.push(p.p);
            }

            points = [];
            const p0 = inPoints[0];
            for (let i = 0; i < inPoints.length - 2; i++) {
                // create face for each face
                const p1 = inPoints[i + 1];
                const p2 = inPoints[i + 2];

                points.push(p0, p1, p2);
            }

        } else {
            throw new Error("No suitable constructor");
        }

        return makeMesh(points, normals, uvs);
    }
}

/**
 * Definition of a sphere in 3D space
 */
class DefSphere {
    /**
     * Default values of a sphere
     * @param {Object} params
     * @param {Number} [params.r] The sphere radius
     * @param {THREE.Vector3} [params.center] The sphere center
     */
    constructor({ r = 1, center = new V3(0, 0, 0) } = {}) {
        this.r = r;
        this.center = center;
    }

    /**
    * Computes the sphere with the given radius or center.
    * If any value is EMPTY, the default values are used
    * @param {Object} params
    * @param {Number | Object} [params.r] Either the index or value of a TYPE_NUMBER. The point
    * @param {Number | Object} [params.center] Either the index or value of a TYPE_POINT3. The center
    * @returns {CreateInfo} The creation info
    */
    static fromValues({ r = EMPTY, center = EMPTY }) {
        return CreateInfo.new("rc", { r, center });
    }

    /**
     * Creates a sphere object
     * @param {CreateInfo} info The creation info
     * @returns {Object} An object of type TYPE_SPHERE
     */
    compute(info) {
        const { dependencies } = info;
        let { r, center } = this;
        if (info.name === "rc") {
            const { r: r0, center: c0 } = dependencies;
            if (!isParamEmpty(r0)) {
                assertType(r0, TYPE_NUMBER);
                r = r0.value;
            }
            if (!isParamEmpty(c0)) {
                assertType(c0, TYPE_POINT3);
                center = c0.p;
            }
        }
        return makeSphere(r, center);
    }
}

/**
 * Definition of a 3D normal
 * Creates TYPE_VECTOR3
 */
class DefNormal3 {

    /**
     * Default values for the normal
     * @param {Boolean} [normalize] Whether or not to normalize the normal
     */
    constructor(normalize = false) {
        this.normalize = normalize;
    }
    /**
     * Computes the normal at a point for the given sphere
     * Note: This normal will be defined for any point != 0
     * Resulting vector has its referenced point at the given point
     * @param {Number | Object} point Either the index or value of a TYPE_POINT3. The point
     * @param {Number | Object} sphere Either the index or value of a TYPE_SPHERE. The sphere
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromPointSphere(point, sphere, normalize = EMPTY) {
        return CreateInfo.new("ps", { point, sphere, normalize });
    }

    /**
     * Computes the normal at a point for the given plane
     * Note: This normal will be defined for any point
     * Resulting vector has its referenced point at the given point
     * @param {Number | Object} point Either the index or value of a TYPE_POINT3. The point
     * @param {Number | Object} plane Either the index or value of a TYPE_PLANE. The plane
     * @param {Number | Object} [normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromPointPlane(point, plane, normalize = EMPTY) {
        return CreateInfo.new("pp", { point, plane, normalize });
    }

    /**
     * Computes the normal
     * @param {CreateInfo} info The creation info
     * @returns {Object} An object of type TYPE_VECTOR3
     */
    compute(info) {
        const { dependencies } = info;
        let { normalize } = this;
        let n;
        let ref;
        if (info.name === "ps") {
            const { point, sphere, normalize: normalize0 } = dependencies;
            assertExistsAndNotOptional(point, sphere);
            assertType(point, TYPE_POINT3);
            assertType(sphere, TYPE_SPHERE);

            const { center, r } = sphere;
            const { p } = point;

            n = p.clone().sub(center);
            ref = p;

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, alg.TYPE_BOOLEAN);
                normalize = normalize0.value;
            }

        } else if (info.name === "pp") {
            const { point, plane, normalize: normalize0 } = dependencies;
            assertExistsAndNotOptional(point, plane);
            assertType(point, TYPE_POINT3);
            assertType(plane, TYPE_PLANE);

            const { p } = point;
            const { n: n0 } = plane;
            n = n0.clone();
            ref = p.clone();

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, alg.TYPE_BOOLEAN);
                normalize = normalize0.value;
            }

        } else {
            throw new Error("No suitable constructor");
        }

        if (normalize) {
            n.normalize();
        }
        return makeVector3(n, ref);
    }
}

/**
 * Definition of a reflection of a vector at a surface defined by its normal
 */
class DefReflection3 {
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
     * @param {Number | Object} params.v Either the index or value of a TYPE_VECTOR3. The vector to be reflected
     * @param {Number | Object} params.n Either the index or value of a TYPE_VECTOR3. The normal
     * @param {Number | Object} [params.ref] Either the index or value of a TYPE_POINT3. The reference point
     * @param {Number | Object} [params.normalize] Either the index or value of a TYPE_BOOLEAN. Whether the vector should be normalized
     * @returns {CreateInfo} The creation info
     */
    static fromVectorNormal({
        v, n, ref = EMPTY, normalize = EMPTY
    }) {
        return CreateInfo.new("vn", { v, n, ref, normalize });
    }

    /**
     * Computes the reflection
     * @param {CreateInfo} createInfo The creation info
     * @returns {Object} The reflection of type TYPE_VECTOR
     */
    compute(createInfo) {
        const { dependencies } = createInfo;
        let { normalize } = this;

        if (createInfo.name === "vn") {
            const { v, n, ref: ref0, normalize: normalize0 } = dependencies;

            assertExistsAndNotOptional(v, n);
            assertType(v, TYPE_VECTOR3);
            assertType(n, TYPE_VECTOR3);

            let ref = v.ref.clone();

            let r = v.v.clone().reflect(n.v);

            if (!isParamEmpty(normalize0)) {
                assertType(normalize0, TYPE_BOOLEAN);
                normalize = normalize0.value;
            }
            if (normalize) {
                r.normalize();
            }

            if (!isParamEmpty(ref0)) {
                assertType(ref0, TYPE_POINT3);
                ref.copy(ref0.p);
            }
            return makeVector3(r, ref);

        } else {
            throw new Error("No suitable constructor found");
        }
    }
}

/**
 * Computes the intersection of a line and a sphere
 * The line might be open ended either from the first or the second point.
 * @param {{p0: THREE.Vector3, p1: THREE.Vector3, leftOpen: Boolean, rightOpen: Boolean}} line The line
 * @param {{center: THREE.Vector3, r :Number}} sphere The sphere
 * @param {Number} [eps] The epsilon value for comparisons
 * @returns {THREE.Vector3[]} The intersections, if any. A line and a sphere have at most two.
 */
function intersectLine3Sphere(line, sphere, eps = 1E-10) {
    const { p0, p1, leftOpen, rightOpen } = line;
    const { center, r } = sphere;

    const u = p1.clone().sub(p0);
    const o = p0;

    const oc = o.clone().sub(center);
    const udotoc = u.dot(oc);

    const oc2 = oc.lengthSq();
    const u2 = u.lengthSq();

    let discr = udotoc * udotoc - u2 * (oc2 - r * r);

    if (discr < -eps) {
        return [];
    }
    discr = Math.max(0, discr);

    let resultT = [];
    if (discr < eps) {
        // only one solution
        resultT.push(-udotoc / u2);
    } else {
        const root = Math.sqrt(discr);
        resultT.push((-udotoc - root) / u2);
        resultT.push((-udotoc + root) / u2);
    }

    const tMin = leftOpen ? -Infinity : 0;
    const tMax = rightOpen ? Infinity : 1;

    resultT = resultT.filter(t => t >= tMin && t <= tMax);
    return resultT.map(t => o.clone().add(u.clone().multiplyScalar(t)));
}

/**
 * Computes the intersection of a line and a plane
 * The line might be open ended either from the first or the second point.
 * The plane can be infinite or delimited by its spanning vectors.
 * @param {{p0: THREE.Vector3, p1: THREE.Vector3, leftOpen: Boolean, rightOpen: Boolean}} line The line
 * @param {{origin: THREE.Vector3, u: THREE.Vector3, v: THREE.Vector3, n: THREE.Vector3, infinite : Boolean }} plane The plane
 * @param {Number} [eps] The epsilon value for comparisons
 * @returns {THREE.Vector3[]} The intersections, if any. A line and a plane have at most one
 */
function intersectLine3Plane(line, plane, eps = 1E-10) {
    const { p0, p1, leftOpen, rightOpen } = line;
    const { origin, u, v, n, infinite } = plane;

    // direction
    const l = p1.clone().sub(p0);

    const dotNL = n.dot(l);
    if (Math.abs(dotNL) < eps) {
        // parallel (includes containment)
        return [];
    }

    const t = n.dot(origin.clone().sub(p0)) / dotNL;

    // check t
    const tMin = leftOpen ? -Infinity : 0;
    const tMax = rightOpen ? Infinity : 1;
    if (t < tMin || t > tMax) {
        return [];
    }
    const p = p0.clone().add(l.multiplyScalar(t));
    if (!infinite) {
        // check bounds
        // project point onto the axes and test for [0,1]
        // as the axes might be skewed, we compute the contravariant basis vectors
        // if u/v are unit length and orthogonal, this will just return u and v again
        const pr = p.clone().sub(origin);

        const u2 = u.lengthSq();
        const v2 = v.lengthSq();
        const uDotV = u.dot(v);

        const a = 1.0 / (u2 * v2 - uDotV * uDotV);
        const up = u.clone().multiplyScalar(a * v2).add(v.clone().multiplyScalar(-a * uDotV));
        const vp = u.clone().multiplyScalar(-a * uDotV).add(v.clone().multiplyScalar(a * u2));
        const dotU = up.dot(pr);
        if (dotU < 0 || dotU > 1) {
            return [];
        }

        const dotV = vp.dot(pr);
        if (dotV < 0 || dotV > 1) {
            return [];
        }
    }
    return [p];
}

/**
 * Registers intersectors at the algeobra registry
 * Currently supported intersectors are:
 * TYPE_LINE3: TYPE_SPHERE, TYPE_PLANE
 * TYPE_SPHERE: TYPE_LINE3
 * TYPE_PLANE: TYPE_LINE3
 */
function registerAlgeobraIntersectors() {
    alg.IntersectionRegistry.setIntersector(TYPE_LINE3, TYPE_SPHERE, (line, sphere) => {
        const result = intersectLine3Sphere(line, sphere);
        if (result.length === 0) {
            return null;
        }

        return result.map(p => makePoint3(p));
    });

    alg.IntersectionRegistry.setIntersector(TYPE_LINE3, TYPE_PLANE, (line, plane) => {
        const result = intersectLine3Plane(line, plane);
        if (result.length === 0) {
            return null;
        }

        return result.map(p => makePoint3(p));
    });
}


/**
 * Default style definitions of provided objects
 */
const styles = {
    geo: {
        line3: {
            color: new THREE.Color(1, 1, 1),
            transparent: false,
            opacity: 1,
        },
        point3: {
            r: 0.025,
            color: new THREE.Color(1, 0, 0),
            specular: new THREE.Color(0x111111),
            shininess: 30,
            transparent: false,
            opacity: 1,
            extraMaterialParams: {},
        },
        plane: {
            color: new THREE.Color(0.25, 0.5, 1),
            specular: new THREE.Color(0x111111),
            shininess: 30,
            transparent: false,
            opacity: 1,
            extraMaterialParams: {},
        },
        mesh: {
            color: new THREE.Color(0.5, 0.5, 0.5),
            specular: new THREE.Color(0x111111),
            shininess: 30,
            transparent: false,
            opacity: 1,
            extraMaterialParams: {},
        },
        vector3: {
            color: new THREE.Color(0, 1, 0),
            transparent: false,
            opacity: 1,
            extraShaftParams: {},
            extraArrowParams: {},
        },
        sphere: {
            color: new THREE.Color(1, 1, 1),
            specular: new THREE.Color(0x111111),
            shininess: 30,
            transparent: false,
            opacity: 1,
            extraMaterialParams: {},
        },
    }
};

/**
 * Helper function to convert an array of THREE vectors into a typed linear buffer
 * @param {Array} vecs Vector of THREE vectors
 * @param {Object} [params] 
 * @param {Number} [arrayType] The type of the typed Array
 * @returns The typed array
 */
function vecsToTypedArray(vecs, {
    arrayType = Float32Array
} = {}) {
    if (vecs.length === 0) {
        return new arrayType();
    }
    let dim = -1;
    const v0 = vecs[0];
    if (v0 instanceof THREE.Vector2) {
        dim = 2;
    } else if (v0 instanceof THREE.Vector3) {
        dim = 3;
    } else if (v0 instanceof THREE.Vector4) {
        dim = 4;
    }

    if (dim < 0) {
        throw new Error("Unsupported dimension");
    }
    const result = new arrayType(dim * vecs.length);
    for (let i = 0; i < vecs.length; i++) {
        const offset = i * dim;
        vecs[i].toArray(result, offset);
    }
    return result;
}

/**
 * Create handlers for types described in this module
 * The map is organized as: TYPE_NAME -> handler
 * Current map provides: TYPE_POINT3, TYPE_LINE3, TYPE_SPHERE, TYPE_VECTOR3, TYPE_PLANE,TYPE_MESH 
 * @returns {Object} A map of handlers
 */
function createDefaultGeometryHandlers() {
    const handlers = {};


    const lineUniforms = {
        color: new THREE.Uniform(new THREE.Color(1, 1, 1)),
    };
    const lineShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: `
        attribute vec4 ws;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,ws);
        }`,
        fragmentShader: `
        uniform vec3 color;

        void main() {
            gl_FragColor = vec4(color, 1.0 );
        }`,
        depthTest: true,
        uniforms: lineUniforms,
    });

    const applyMaterial = (material, style) => {
        material.color = style.color;
        material.specular = style.specular;
        material.shininess = style.shininess;
        material.transparent = style.transparent;
        material.opacity = style.opacity;
        Object.assign(material, style.extraMaterialParams);
    };

    handlers[TYPE_POINT3] = {
        create: (object, props) => {

            const geometry = new THREE.SphereGeometry(1, 32, 16);
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(object.p);
            handlers[TYPE_POINT3].updateProps(sphere, object, props);
            return sphere;
        },
        update: (current, object, props) => {
            current.position.copy(object.p);
            return current;
        },

        updateProps: (current, object, props) => {
            let { style } = props;
            style = alg.createFromTemplate(styles.geo.point3, style);
            current.scale.copy(new THREE.Vector3(style.r, style.r, style.r));
            applyMaterial(current.material, style);


        },
    };

    handlers[TYPE_LINE3] = {
        create: (object, props) => {
            const { p0, p1, leftOpen, rightOpen } = object;
            const delta = p1.clone().sub(p0);

            const data = [p0.x, p0.y, p0.z];
            const dataW = [1];
            if (rightOpen) {
                data.push(delta.x, delta.y, delta.z);
                dataW.push(0);
            } else {
                data.push(p1.x, p1.y, p1.z);
                dataW.push(1);
            }
            let drawRange = 2;
            if (leftOpen) {
                data.push(p0.x, p0.y, p0.z);
                data.push(-delta.x, -delta.y, -delta.z);
                dataW.push(1);
                dataW.push(0);

                drawRange = 4;
            } else {
                data.push(
                    0, 0, 0,
                    0, 0, 0);
                dataW.push(0, 0);
            }

            const vertices = new Float32Array(data);
            const ws = new Float32Array(dataW);
            const geometry = new THREE.BufferGeometry();
            // as THREE has a fixed vec3 position, we add w values as additional attribute
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setAttribute('ws', new THREE.BufferAttribute(ws, 1));
            geometry.setDrawRange(0, drawRange);

            const material = lineShaderMaterial.clone();

            const line = new THREE.Line(geometry, material);
            line.frustumCulled = false;
            handlers[TYPE_LINE3].updateProps(line, object, props);
            return line;
        },
        update: (current, object, props) => {

            const { p0, p1, leftOpen, rightOpen } = object;
            const delta = p1.clone().sub(p0);

            const data = [p0.x, p0.y, p0.z];
            const dataW = [1];
            if (rightOpen) {
                data.push(delta.x, delta.y, delta.z);
                dataW.push(0);
            } else {
                data.push(p1.x, p1.y, p1.z);
                dataW.push(1);
            }
            let drawRange = 2;
            if (leftOpen) {
                data.push(p0.x, p0.y, p0.z);
                data.push(-delta.x, -delta.y, -delta.z);
                dataW.push(1);
                dataW.push(0);

                drawRange = 4;
            } else {
                data.push(
                    0, 0, 0,
                    0, 0, 0);
                dataW.push(0, 0);
            }
            const vertices = new Float32Array(data);
            const ws = new Float32Array(dataW);
            current.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            current.geometry.setAttribute('ws', new THREE.BufferAttribute(ws, 1));
            current.geometry.setDrawRange(0, drawRange);

            current.geometry.attributes.position.needsUpdate = true;
            current.geometry.attributes.ws.needsUpdate = true;

            return current;
        },

        updateProps: (current, object, props) => {
            let { style } = props;
            style = alg.createFromTemplate(styles.geo.line3, style);
            const uniforms = current.material.uniforms;
            const { color } = uniforms;
            color.value.copy(style.color);
        },
    }

    handlers[TYPE_SPHERE] = {
        create: (object, props) => {
            const geometry = new THREE.SphereGeometry(1, 32, 16);
            const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
            const sphere = new THREE.Mesh(geometry, material);

            sphere.position.copy(object.center);
            sphere.scale.copy(new V3(object.r, object.r, object.r));
            handlers[TYPE_SPHERE].updateProps(sphere, object, props);
            return sphere;
        },
        update: (current, object, props) => {
            current.position.copy(object.center);
            current.scale.copy(new V3(object.r, object.r, object.r));
            return current;
        },
        updateProps: (current, object, props) => {
            let { style } = props;
            style = alg.createFromTemplate(styles.geo.sphere, style);
            applyMaterial(current.material, style);

        },
    };


    handlers[TYPE_VECTOR3] = {
        create: (object, props) => {
            const { v, ref } = object;
            const arrow = new THREE.ArrowHelper(v.clone().normalize(), ref, v.length());

            arrow.position.copy(ref);
            arrow.setDirection(v.clone().normalize());
            arrow.setLength(v.length());
            handlers[TYPE_VECTOR3].updateProps(arrow, object, props);
            return arrow;
        },
        update: (current, object, props) => {
            const { v, ref } = object;

            current.position.copy(ref);
            current.setDirection(v.clone().normalize());
            current.setLength(v.length());
            return current;
        },
        updateProps: (current, object, props) => {
            let { style } = props;
            style = alg.createFromTemplate(styles.geo.vector3, style);
            current.setColor(style.color);

            current.line.material.transparent = style.transparent;
            current.line.material.opacity = style.opacity;

            Object.assign(current.line.material, style.extraShaftParams);

            current.cone.material.transparent = style.transparent;
            current.cone.material.opacity = style.opacity;
            Object.assign(current.cone.material, style.extraArrowParams);

        },
    };

    handlers[TYPE_PLANE] = {
        create: (object, props) => {
            const { origin, u, v, n, dist } = object;
            // const geom = new THREE.PlaneGeometry(1, 1);

            const p0 = origin;
            const p1 = origin.clone().add(u);
            const p2 = origin.clone().add(u).add(v);
            const p3 = origin.clone().add(v);
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                // face0 -> 0,1,2
                p0.x, p0.y, p0.z,
                p1.x, p1.y, p1.z,
                p2.x, p2.y, p2.z,
                // face1 -> 0,2,3
                p0.x, p0.y, p0.z,
                p2.x, p2.y, p2.z,
                p3.x, p3.y, p3.z,
            ]);
            const normals = new Float32Array([
                // each vertex has the same normal
                n.x, n.y, n.z,
                n.x, n.y, n.z,
                n.x, n.y, n.z,

                n.x, n.y, n.z,
                n.x, n.y, n.z,
                n.x, n.y, n.z,
            ]);

            const uvs = new Float32Array([
                // face0 -> 0,1,2
                0, 0,
                1, 0,
                1, 1,
                // face1 -> 0,2,3
                0, 0,
                1, 1,
                0, 1,
            ]);
            geometry.setAttribute(
                'position', new THREE.BufferAttribute(vertices, 3));
            geometry.setAttribute(
                'normal', new THREE.BufferAttribute(normals, 3));
            geometry.setAttribute(
                'uv', new THREE.BufferAttribute(uvs, 2));
            const material = new THREE.MeshPhongMaterial({ color: 0xffff00, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometry, material);

            handlers[TYPE_PLANE].updateProps(plane, object, props);
            return plane;
        },
        update: (current, object, props) => {
            const { origin, u, v, n, dist } = object;
            const p0 = origin;
            const p1 = origin.clone().add(u);
            const p2 = origin.clone().add(u).add(v);
            const p3 = origin.clone().add(v);
            // using a transform would have been nicer, but three.js doesn't seem to like skew-matrices that much...
            const vertices = new Float32Array([
                // face0 -> 0,1,2
                p0.x, p0.y, p0.z,
                p1.x, p1.y, p1.z,
                p2.x, p2.y, p2.z,
                // face1 -> 0,2,3
                p0.x, p0.y, p0.z,
                p2.x, p2.y, p2.z,
                p3.x, p3.y, p3.z,
            ]);
            const normals = new Float32Array([
                // each vertex has the same normal
                n.x, n.y, n.z,
                n.x, n.y, n.z,
                n.x, n.y, n.z,

                n.x, n.y, n.z,
                n.x, n.y, n.z,
                n.x, n.y, n.z,
            ]);

            current.geometry.setAttribute(
                'position', new THREE.BufferAttribute(vertices, 3));
            current.geometry.setAttribute(
                'normal', new THREE.BufferAttribute(normals, 3));
            current.geometry.getAttribute('position').needsUpdate = true;
            current.geometry.getAttribute('normal').needsUpdate = true;
            return current;
        },

        updateProps: (current, object, props) => {
            let { style } = props;
            style = alg.createFromTemplate(styles.geo.plane, style);
            applyMaterial(current.material, style);
        },
    };

    handlers[TYPE_MESH] = {
        create: (object, props) => {

            const geometry = new THREE.BufferGeometry();

            const { points, normals, uvs } = object;

            geometry.setAttribute('position',
                new THREE.BufferAttribute(vecsToTypedArray(points), 3));

            if (normals && normals.length === points.length) {
                const buffer = vecsToTypedArray(normals);
                current.geometry.setAttribute('normal', new THREE.BufferAttribute(buffer, 3));
            } else {
                geometry.computeVertexNormals();
                geometry.normalizeNormals();
            }

            if (uvs && uvs.length === points.length) {
                const buffer = vecsToTypedArray(uvs);
                current.geometry.setAttribute('uv', new THREE.BufferAttribute(buffer, 2));
            }

            geometry.computeBoundingSphere();
            const material = new THREE.MeshPhongMaterial({ color: styles.geo.mesh.color, side: THREE.DoubleSide });

            const plane = new THREE.Mesh(geometry, material);

            handlers[TYPE_MESH].updateProps(plane, object, props);
            return plane;
        },
        update: (current, object, props) => {
            const { points, normals, uvs } = object;

            current.geometry.setAttribute('position',
                new THREE.BufferAttribute(vecsToTypedArray(points), 3));
            if (normals && normals.length === points.length) {
                const buffer = vecsToTypedArray(normals);
                current.geometry.setAttribute('normal', new THREE.BufferAttribute(buffer, 3));
                current.geometry.getAttribute('normal').needsUpdate = true;

            } else {
                current.geometry.computeVertexNormals();
                current.geometry.normalizeNormals();
                current.geometry.getAttribute('normal').needsUpdate = true;
            }

            if (uvs && uvs.length === points.length) {
                const buffer = vecsToTypedArray(uvs);
                current.geometry.setAttribute('uv', new THREE.BufferAttribute(buffer, 2));
                current.geometry.getAttribute('uv').needsUpdate = true;
            }

            current.geometry.getAttribute('position').needsUpdate = true;
            current.geometry.computeBoundingSphere();
            return current;
        },

        updateProps: (current, object, props) => {
            let { style } = props;
            style = alg.createFromTemplate(styles.geo.mesh, style);
            applyMaterial(current.material, style);
        },
    };
    return handlers;
}

/**
 * Disposes a three object with its children
 * @param {THREE.Object3D} obj 
 */
function disposeThreeObjectTree(obj) {
    // me might also use traverse
    if (obj.children) {
        for (let c of obj.children) {
            disposeThreeObjectTree(c);
        }
    }
    if (obj.geometry) {
        obj.geometry.dispose();
    }

    if (obj.material) {
        obj.material.dispose();
    }

    if (obj.dispose) {
        obj.dispose();
    }
}

/**
 * A class to keep track and synchronize an algeobra scene with a three.js scene
 */
class AlgeobraThreeScene {

    #objectRegistry;

    #algeobraScene;
    #threeScene;

    #callbacks;
    /**
     * 
     * @param {GeometryScene} algeobraScene The algeobra scene
     * @param {THREE.Scene} threeScene The three scene
     * @param {Object} geometryHandlers Handlers to create and update the geometry and materials for objects
     */
    constructor(algeobraScene, threeScene, geometryHandlers = createDefaultGeometryHandlers()) {
        this.#objectRegistry = {};
        this.#algeobraScene = algeobraScene;
        this.#threeScene = threeScene;


        this.geometryHandlers = geometryHandlers;
        this.#callbacks = [];
        this.#callbacks.push(algeobraScene.registerCallback(GeometryScene.EVENT_UPDATE, (e) => this.#updateObject(e.index)));
        this.#callbacks.push(algeobraScene.registerCallback(GeometryScene.EVENT_REMOVE, (e) => this.#removeObject(e.index)));
        this.#callbacks.push(algeobraScene.registerCallback(GeometryScene.EVENT_PROPERTY, (e) => this.#updateProps(e.index)));

        // update each object in the beginning
        for (const obj of algeobraScene.view({ skipInvalidValues: true })) {
            this.#updateObject(obj.index);
        }

    }

    #updateObject(id) {
        const geometries = this.#objectRegistry;
        const threeScene = this.#threeScene;
        const scene = this.#algeobraScene;

        const { value, properties: props } = scene.get(id);

        // this allows us to handle single valued and array valued arguments the same way
        let object = Array.isArray(value) ? value : [value];

        if (!geometries[id]) {
            geometries[id] = new Array(object.length);
        }

        // the current entry for the id
        const geomId = geometries[id];

        // if there are more objects than in the current value of the object, remove the ones that are  too much
        for (let i = object.length; i < geomId.length; i++) {
            if (geomId[i]) {
                geomId[i].obj.removeFromParent();

                disposeThreeObjectTree(geomId[i].obj);
                geomId[i] = null;
            }
        }
        // resize
        if (geomId.length != object.length) {
            geomId.length = object.length;
        }
        for (let i = 0; i < object.length; i++) {
            const oi = object[i];
            // types of currently stored object and actual one differ, so we remove the old one
            if (geomId[i] && geomId[i].type !== oi.type) {
                geomId[i].obj.removeFromParent();

                disposeThreeObjectTree(geomId[i].obj);

                geomId[i] = null;
            }

            // handler that takes care of the object type
            const handler = this.geometryHandlers[oi.type];

            if (!handler) {
                continue;
            }
            // if the object at the given index does not exist, create it
            if (!geomId[i]) {
                const object3 = handler.create(oi, props);
                object3.visible = props.visible ?? true;
                threeScene.add(object3);
                geomId[i] = { obj: object3, type: oi.type };
            } else {
                // update existing objects
                const newObject = handler.update(geomId[i].obj, oi, props);
                // optionally returned objects can replace the current one
                // this might be helpful for switching between certain meshes or something similar
                if (newObject) {
                    geomId[i].obj = newObject;
                }

            }
        }

    }
    #removeObject(id) {
        // remove all objects
        const geomId = this.#objectRegistry[id];

        // this could happen, if the type is not associated with a handler
        if (!geomId) {
            return;
        }
        for (let g of geomId) {
            if (g) {
                g.obj.removeFromParent();
                g.obj.geometry.dispose();
                g.obj.material.dispose();
            }
        }
        this.#objectRegistry[id] = null;

    }


    #updateProps(id) {

        // if only properties change, it is usually cheaper than when other values change, so it is a special function
        const { value, properties: props } = scene.get(id);
        const geomId = this.#objectRegistry[id];

        if (!geomId) {
            return;
        }

        let object = Array.isArray(value) ? value : [value];

        // object and geomId must have same length
        // sanity check
        if (object.length !== geomId.length) {
            throw new Error("Geometry and object state out of synch");
        }
        for (let i = 0; i < object.length; i++) {
            let oi = object[i];
            let current = geomId[i];
            const handler = this.geometryHandlers[oi.type];

            if (!handler) {
                continue;
            }
            const newObject = handler.updateProps(current.obj, oi, props);
            if (newObject) {
                geomId[i].obj = newObject;
            }

            geomId[i].obj.visible = props.visible ?? true;

        }
    }
}

export {
    TYPE_SPHERICAL,
    TYPE_POINT3,
    TYPE_VECTOR3,
    TYPE_PLANE,
    TYPE_LINE3,
    TYPE_SPHERE,
    TYPE_MESH,

    DefPoint3,
    DefVector3,
    DefLine3,
    DefPlane,
    DefSphere,
    DefSpherical,
    DefNormal3,
    DefReflection3,
    DefMesh,

    AlgeobraThreeScene,

    makeSpherical,
    makePoint3,
    makeLine3,
    makeSphere,
    makeVector3,
    makePlane,

    registerAlgeobraIntersectors,
    intersectLine3Plane,
}