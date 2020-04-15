class ThreejsDraw {
    constructor(rendererWidth, rendererHeight, backgroundColor) {
        this.backgroundColor = backgroundColor;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.001, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(rendererWidth, rendererHeight);
        this.renderer.setClearColor(backgroundColor);
        document.body.appendChild(this.renderer.domElement);
    }

    init() {
        // camera
        this.initCameraPosition = [0, 0, 5];
        this.camera.position.set(this.initCameraPosition);

        // lighting
        this.light = new THREE.PointLight(0xFFFFFF, 1);
        this.light.position.set(0, 10, 10);
        this.scene.add(this.light);

        // desk plane
        const geometry = new THREE.PlaneGeometry(200, 80);
        const material = new THREE.MeshPhongMaterial({ color: 0xb88f6c});
        this.plane = new THREE.Mesh(geometry, material);
        this.plane.position.set(0, -15, -50);
        this.plane.rotation.set(THREE.Math.degToRad(-90), 0, 0);
        this.scene.add(this.plane);

        // stereo model
        const scene = this.scene;
        const modelPath = 'assets/models/stereo/';
        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.setCrossOrigin(true);
        mtlLoader.setPath(modelPath);
        mtlLoader.load("1281_HIFI_Stereo.mtl", function (materials) {
            materials.preload();
            const objLoader = new THREE.OBJLoader();
            objLoader.setCrossOrigin(true);
            objLoader.setMaterials(materials);
            objLoader.setPath(modelPath);
            objLoader.load("1281_HIFI_Stereo.obj", function (object) {
                object.name = "stereo";
                object.position.set(0, -15, -60);
                object.rotation.set(0, THREE.Math.degToRad(-90), 0);
                scene.add(object);
            });
        });

        // events
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    animate(time, data) {
        // change camera position
        const cameraPostionXRange = 16;
        const cameraPostionYRange = 16;
        const cameraPostionZRange = 32;
        const cameraPostionX = this.initCameraPosition[0] + data.nomalizedCenterPoint[0] * cameraPostionXRange - (cameraPostionXRange / 2);
        const cameraPostionY = this.initCameraPosition[1] + (1 - data.nomalizedCenterPoint[1]) * cameraPostionYRange - (cameraPostionYRange / 2);
        const cameraPostionZ = this.initCameraPosition[2] + (1 - data.volume) * cameraPostionZRange - (cameraPostionZRange / 2);
        this.camera.position.set(cameraPostionX, cameraPostionY, cameraPostionZ);

        // change camera rotation
        const cameraRotationXDegRange = 45;
        const cameraRotationYDegRange = 45;
        const cameraRotationXDeg = data.cutoff * cameraRotationXDegRange - (cameraRotationXDegRange / 2);
        const cameraRotationYDeg = data.panning * cameraRotationYDegRange - (cameraRotationYDegRange / 2);
        this.camera.rotation.set(THREE.Math.degToRad(cameraRotationXDeg), THREE.Math.degToRad(cameraRotationYDeg), 0);

        // change light position
        this.light.position.set(0, 10 + (data.resonance * 100), 10 + (data.resonance * 100));

        const object = this.scene.getObjectByName("stereo");
        if (object) {
            
        }
        this.renderer.render(this.scene, this.camera);
    }
}