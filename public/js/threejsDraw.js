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
        this.camera.position.set(0, 0, 5);

        // lighting
        this.light = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.light.position.set(0, 0, 5);
        this.scene.add(this.light);

        // cube
        const texture = new THREE.TextureLoader().load("assets/images/texture.jpg");
        const geometry = new THREE.BoxGeometry(8, 8, 8);
        const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.BackSide });
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.set(0, 0, 5);
        this.scene.add(this.cube);

        // events
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    animate(time) {
        time *= 0.001; //convert to seconds
        this.cube.rotation.y = time;
        this.renderer.render(this.scene, this.camera);
    }
}