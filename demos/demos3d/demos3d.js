import * as alg from "../../algeobra.js";
import * as alg3 from "../../algeobra3d.js";

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {
} from "../common.js";


function showFrustum(container) {
    // get some fields for easier writing 
    const {
        EMPTY_INFO,
        GeometryScene,

        DefNumber,
        DefFunc,
    } = alg;

    const {
        DefPoint3,
        DefMesh,
    } = alg3;

    const {
    } = THREE;

    // in this demo we will display how the common perspective matrix transforms a view frustum to a cube and squishes distances

    alg3.registerAlgeobraIntersectors();

    // create a new scene
    const scene = new GeometryScene();

    const width = 720;
    const height = 480;

    const threeScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    camera.position.copy(new THREE.Vector3(2, 4, 0));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 0, -2);
    controls.saveState()


    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 1;
    controls.maxDistance = 50;

    controls.maxPolarAngle = Math.PI;


    // lights

    const dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(1, 2, 0.5);
    threeScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288);
    dirLight2.position.set(- 1, - 1, - 1);
    threeScene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x222222);
    threeScene.add(ambientLight);


    const algeoThree = new alg3.AlgeobraThreeScene(scene, threeScene);

    // create the side points of a slice of a cube in a z range
    const makeCubeSide = (z0, z1, pointProps = {}) => {

        const tlf = scene.add(new DefPoint3(new THREE.Vector3(-1, 1, z0)), EMPTY_INFO, pointProps);
        const trf = scene.add(new DefPoint3(new THREE.Vector3(1, 1, z0)), EMPTY_INFO, pointProps);
        const trb = scene.add(new DefPoint3(new THREE.Vector3(1, 1, z1)), EMPTY_INFO, pointProps);
        const tlb = scene.add(new DefPoint3(new THREE.Vector3(-1, 1, z1)), EMPTY_INFO, pointProps);

        const blf = scene.add(new DefPoint3(new THREE.Vector3(-1, -1, z0)), EMPTY_INFO, pointProps);
        const brf = scene.add(new DefPoint3(new THREE.Vector3(1, -1, z0)), EMPTY_INFO, pointProps);
        const brb = scene.add(new DefPoint3(new THREE.Vector3(1, -1, z1)), EMPTY_INFO, pointProps);
        const blb = scene.add(new DefPoint3(new THREE.Vector3(-1, -1, z1)), EMPTY_INFO, pointProps);

        return [tlf, trf, trb, tlb, blf, brf, brb, blb];
    };

    // make sides for the given points
    const makePointSides = (points, sideProps = {}) => {
        const [tlf, trf, trb, tlb, blf, brf, brb, blb] = points;
        const sides = [];
        // top
        sides.push(scene.add(new DefMesh(),
            DefMesh.fromTriangleFan([tlf, trf, trb, tlb]), sideProps));
        // right
        sides.push(scene.add(new DefMesh(),
            DefMesh.fromTriangleFan([trf, brf, brb, trb]), sideProps));
        // left
        sides.push(scene.add(new DefMesh(),
            DefMesh.fromTriangleFan([tlb, blb, blf, tlf]), sideProps));
        // bottom
        sides.push(scene.add(new DefMesh(),
            DefMesh.fromTriangleFan([blb, brb, brf, blf]), sideProps));
        return sides;
    };

    // define our example projection
    const near = 0.5;
    const far = 4;
    const exCam = new THREE.PerspectiveCamera(40, 16 / 9, near, far);
    exCam.updateMatrix();
    const P = exCam.projectionMatrix.clone();

    // reset z inverse, so the the final animation doesn't "flip" around
    const S = new THREE.Matrix4().makeScale(1, 1, -1);
    P.multiplyMatrices(S, P);

    // inverse
    const Pi = P.clone().invert();

    // project equal side
    // we want to show what happens to lengths in the z-direction
    // so we want equal spacing in the frustum
    // but it's easier to make cubes than to make a frustum
    // so we will calculate the projected z-values and then unproject the points to get a frustum!
    let zP = [];
    const n = 4;
    for (let i = 0; i <= n; i++) {
        let t = i / n;
        const z = t * (far - near) + near;
        const v = new THREE.Vector4(0, 0, -z, 1);
        v.applyMatrix4(P);
        v.multiplyScalar(1 / v.w);
        zP.push(v.z);
    }
    // we need to revert this
    zP = zP.reverse();

    // some colors
    const colors = [
        new THREE.Color("yellow"),
        new THREE.Color("red"),
        new THREE.Color("white"),
        new THREE.Color("blue"),
    ];


    // very basic kind of ease-in/-out
    const tin = scene.add(new DefNumber(0));
    const ts = [2, 6, 2, 6];
    const tAcc = [];
    let tTotal = 0;
    for (let x of ts) {
        tTotal += x;
        tAcc.push(tTotal);
    }
    const t = scene.add(new DefNumber(), DefNumber.fromFunc(x => {
        x = x % tAcc[tAcc.length - 1];
        if (x < tAcc[0]) {
            return 0;
        } else if (x < tAcc[1]) {
            x = x - tAcc[0];
            x = x / (tAcc[1] - tAcc[0]);
            return Math.sin(x * Math.PI / 2);
        } else if (x < tAcc[2]) {
            return 1;
        } else if (x < tAcc[3]) {
            x = x - tAcc[2];
            x = x / (tAcc[3] - tAcc[2]);
            return Math.cos(x * Math.PI / 2);
        }
        return 0;

    }, tin));
    for (let i = 0; i < n; i++) {
        const points0 = makeCubeSide(zP[i], zP[i + 1], { visible: false });
        const points1 = points0.map(o => scene.add(new DefFunc(deps => {
            const { p } = deps.o;
            const p4 = new THREE.Vector4(p.x, p.y, p.z, 1);
            p4.applyMatrix4(Pi);
            p4.multiplyScalar(1 / p4.w);
            return alg3.makePoint3(new THREE.Vector3(p4.x, p4.y, p4.z));
        }), DefFunc.from({ o }), { visible: false }));

        const pointsInter = points1.map((o, i) => scene.add(new DefFunc(deps => {
            const { p } = deps.a;
            const { p: q } = deps.b;
            const { t } = deps;
            return alg3.makePoint3(p.clone().lerp(q, t.value));
        }), DefFunc.from({ a: o, b: points0[i], t }), { visible: false }));
        const col = colors[i % colors.length];
        const sides0 = makePointSides(pointsInter, {
            style: {
                color: col,
                specular: new THREE.Color(1, 1, 1),
                transparent: true,
                opacity: 0.75,
                extraMaterialParams: {
                },
            }
        });
    }

    const clock = new THREE.Clock();

    function animate() {
        const dt = clock.getDelta();
        controls.update();
        scene.update(tin, new DefNumber(scene.get(tin).value.value + dt));
        renderer.render(threeScene, camera);
        requestAnimationFrame(animate);

    }
    animate();
}

export {
    showFrustum,
};